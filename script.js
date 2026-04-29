async function search() {
  const id = document.getElementById("inputId").value.trim();
  const result = document.getElementById("result");

  if (!id) {
    result.innerHTML = "IDを入力してください。";
    return;
  }

  // data.json を読み込む
  const response = await fetch("data.json");
  const data = await response.json();

  if (data[id]) {
    result.innerHTML = `${data[id].name}、あなたの当番は <strong>${data[id].date}</strong> です。`;
  } else {
    result.innerHTML = "該当するIDが見つかりません。";
  }
}
