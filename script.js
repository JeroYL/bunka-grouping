// 頁面載入時讀取資料
window.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room');
  if (!roomId) return;

  const roomRef = db.collection("rooms").doc(roomId);
  const doc = await roomRef.get();

  if (!doc.exists) {
    document.getElementById("roomInfo").innerText = "找不到這個活動房間";
  } else {
    const data = doc.data();
    document.getElementById("roomInfo").innerText = `房間代碼：${roomId}`;
    showGroups(data.members || [], data.groupCount);
  }
});

async function joinRoom() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room');
  const userName = document.getElementById("userName").value.trim();

  if (!roomId || !userName) {
    alert("請輸入名字！");
    return;
  }

  const roomRef = db.collection("rooms").doc(roomId);
  const roomDoc = await roomRef.get();

  if (!roomDoc.exists) {
    alert("找不到此房間！");
    return;
  }

  const data = roomDoc.data();
  const members = data.members || [];

  if (members.find(m => m.name === userName)) {
    alert("你已經參加過了！");
    return;
  }

  // ✅ 真正隨機（不考慮目前組別人數）
  const assignedGroup = Math.floor(Math.random() * data.groupCount);
  members.push({ name: userName, group: assignedGroup });

  await roomRef.update({ members });
  showGroups(members, data.groupCount);
}

function showGroups(members, groupCount) {
  const groups = Array.from({ length: groupCount }, () => []);
  members.forEach(m => {
    groups[m.group].push(m.name);
  });

  const groupList = document.getElementById("groupList");
  groupList.innerHTML = "";
  groups.forEach((group, i) => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>第 ${i + 1} 組：</strong> ${group.join(", ")}`;
    groupList.appendChild(div);
  });
}
