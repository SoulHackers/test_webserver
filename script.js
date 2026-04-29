// Googleカレンダー登録リンクを生成して開く
function addToCalendar(startDate, endDate) {
  const title = encodeURIComponent("芝刈り当番");
  const details = encodeURIComponent("保育園の芝刈り当番です");

  // Googleカレンダー用の日時形式（YYYYMMDDTHHMMSSZ）
  const start = new Date(startDate).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const end = new Date(endDate).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");

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

  const response = await fetch("data.json");
  const data = await response.json();

  if (data[id]) {
    const info = data[id];
    result.innerHTML =
      `${info.name}、あなたの当番は <strong>${formatDate(info.date)}</strong> です。<br><br>` +
      `<button onclick="addToCalendar('${info.date}', '${info.end}')">Googleカレンダーに登録</button>`;
  } else {
    result.innerHTML = "該当するIDが見つかりません。";
  }
}

// 全体スケジュール表示
async function showAllSchedule() {
  const response = await fetch("data.json");
  const data = await response.json();

  let html = "<table border='1' cellpadding='5'><tr><th>ID</th><th>当番日</th></tr>";
  for (const id in data) {
    html += `<tr><td>${id}</td><td>${formatDate(data[id].date)}</td></tr>`;
  }
  html += "</table>";

  document.getElementById("allSchedule").innerHTML = html;
}

// 日付表示を見やすくする
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}時`;
}

// ページ読み込み時に全体表を表示
window.onload = showAllSchedule;
