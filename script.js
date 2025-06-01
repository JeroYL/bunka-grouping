function generateRoomId(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function createRoom() {
  const groupCount = parseInt(document.getElementById("groupCount").value);
  const groupSize = parseInt(document.getElementById("groupSize").value);
  if (!groupCount || !groupSize) {
    alert("請輸入組數與每組人數！");
    return;
  }

  const roomId = generateRoomId();

  await db.collection("rooms").doc(roomId).set({
    groupCount,
    groupSize,
    members: [],
    createdAt: Date.now()
  });

  const link = `${location.origin}/join.html?room=${roomId}`;
  document.getElementById("roomLink").innerText = `請複製此連結分享給參與者：\n${link}`;
}

async function joinRoom() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room');
  const userName = document.getElementById("userName").value;

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

  // 已經滿了就不加
  if (members.length >= data.groupCount * data.groupSize) {
    alert("人數已滿！");
    return;
  }

  // 新增參與者
  members.push(userName);
  await roomRef.update({ members });

  showGroups(members, data.groupCount);
}

// 顯示分組結果
function showGroups(members, groupCount) {
  const shuffled = [...members].sort(() => Math.random() - 0.5);
  const groups = Array.from({ length: groupCount }, () => []);

  shuffled.forEach((name, i) => {
    groups[i % groupCount].push(name);
  });

  const groupList = document.getElementById("groupList");
  groupList.innerHTML = "";
  groups.forEach((group, i) => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>第 ${i + 1} 組：</strong> ${group.join(", ")}`;
    groupList.appendChild(div);
  });
}

// 頁面一打開就讀取房間資訊
window.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room');
  if (!roomId) return;

  const roomRef = db.collection("rooms").doc(roomId);
  const doc = await roomRef.get();

  if (!doc.exists) {
    document.getElementById("roomInfo").innerText = "找不到這個活動房間";
  } else {
    document.getElementById("roomInfo").innerText = `房間代碼：${roomId}`;
    showGroups(doc.data().members || [], doc.data().groupCount);
  }
});