// 固定の開催時間（朝9時〜10時）
const START_TIME = "09:00";
const END_TIME = "10:00";

// CSVを読み込んで配列に変換
async function loadCSV() {
  const response = await fetch("data.csv");
  const text = await response.text();

  // CRLF / LF 両対応
  const lines = text.trim().split(/\r?\n/);

  // BOM除去
  lines[0] = lines[0].replace(/^\uFEFF/, "");

  const headers = lines[0].split(",");

  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const cleanLine = lines[i].replace(/^\uFEFF/, "").replace(/\r$/, "");
    const cols = cleanLine.split(",");

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx];
    });

    data.push({
      id: row["ID"],
      date: row["開催日"]
    });
  }

  return data;
}

// Googleカレンダー登録
function addToCalendar(dateStr) {
  const title = encodeURIComponent("芝刈り当番");
  const details = encodeURIComponent("保育園の芝刈り当番です");

  const start = new Date(`${dateStr} ${START_TIME}`).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const end = new Date(`${dateStr} ${END_TIME}`).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");

  const url =
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}` +
    `&dates=${start}/${end}&details=${details}`;

  window.open(url, "_blank");
}

// ID検索
async function search() {
  const id = document.getElementById("inputId").value.trim();
  const result = document.getElementById("result");

  if (!id) {
    result.innerHTML = "IDを入力してください。";
    return;
  }

  const data = await loadCSV();
  const hit = data.find(item => item.id === id);

  if (hit) {
    result.innerHTML =
      `ID「${id}」の当番日は <span class="result-date">${formatDate(hit.date)}</span> です。<br><br>` +
      `<button onclick="addToCalendar('${hit.date}')">Googleカレンダーに登録</button>`;
  } else {
    result.innerHTML = "該当するIDが見つかりません。";
  }
}

// 全体スケジュール表示（日付 → ID一覧）
async function showAllSchedule() {
  const data = await loadCSV();

  // 日付ごとにまとめる
  const grouped = {};
  data.forEach(item => {
    if (!grouped[item.date]) grouped[item.date] = [];
    grouped[item.date].push(item.id);
  });

  // 最大ID数を取得
  const maxIds = Math.max(...Object.values(grouped).map(ids => ids.length));

  // テーブル生成
  let html = "<div class='table-wrapper'><table>";

  // ★ 1行目：当番割り当て（ID）を結合セル風に表示
  html += `<tr>
    <th rowspan="2">日付</th>
    <th colspan="${maxIds}">当番割り当て（ID）</th>
  </tr>`;

  // ★ 2行目：ID列の番号（小さく表示）
  html += "<tr>";
  for (let i = 1; i <= maxIds; i++) {
    html += `<th class="id-header">ID${i}</th>`;
  }
  html += "</tr>";

  // データ行
  Object.keys(grouped)
    .sort()
    .forEach(date => {
      html += `<tr><td>${formatDate(date)}</td>`;

      const ids = grouped[date];

      for (let i = 0; i < maxIds; i++) {
        html += `<td>${ids[i] ? ids[i] : ""}</td>`;
      }

      html += "</tr>";
    });

  html += "</table></div>";

  document.getElementById("allSchedule").innerHTML = html;
}


// 日付整形
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

window.onload = showAllSchedule;
