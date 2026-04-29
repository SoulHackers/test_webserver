// 固定の開催時間（朝9時〜10時）
const START_TIME = "09:00";
const END_TIME = "10:00";

// CSVを読み込んで配列に変換
async function loadCSV() {
  const response = await fetch("data.csv");
  const text = await response.text();

  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  const data = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx];
    });

    data[row["ID"]] = {
      date: row["開催日"]
    };
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

  if (data[id]) {
    const info = data[id];
    result.innerHTML =
      `ID「${id}」の当番日は <strong>${formatDate(info.date)}</strong> です。<br><br>` +
      `<button onclick="addToCalendar('${info.date}')">Googleカレンダーに登録</button>`;
  } else {
    result.innerHTML = "該当するIDが見つかりません。";
  }
}

// 全体スケジュール表示
async function showAllSchedule() {
  const data = await loadCSV();

  let html = "<table border='1' cellpadding='5'><tr><th>ID</th><th>当番日</th></tr>";
  for (const id in data) {
    html += `<tr><td>${id}</td><td>${formatDate(data[id].date)}</td></tr>`;
  }
  html += "</table>";

  document.getElementById("allSchedule").innerHTML = html;
}

// 日付整形
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

window.onload = showAllSchedule;
