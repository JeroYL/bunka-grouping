function generateRoomId(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ✅ 創建活動（index.html 用）
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

  // ✅ 修改這裡：加入 bunka-grouping 子資料夾
  const link = `${location.origin}/bunka-grouping/join.html?room=${roomId}`;
  document.getElementById("roomLink").innerText = `請複製此連結分享給參與者：\n${link}`;
}

// ✅ 參加活動（join.html 用）
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

  // ✅ 檢查是否已參加過
  if (members.find(m => m.name === userName)) {
    alert("你已經參加過了！");
    return;
  }

  // ✅ 統計目前每組人數
  const groupCounts = Array.from({ length: data.groupCount }, () => 0);
  members.forEach(m => {
    groupCounts[m.group]++;
  });

  // ✅ 找出人數最少的組群
  const min = Math.min(...groupCounts);
  const candidateGroups = groupCounts
    .map((count, i) => count === min ? i : -1)
    .filter(i => i !== -1);

  const assignedGroup = candidateGroups[Math.floor(Math.random() * candidateGroups.length)];

  // ✅ 新增到資料庫
  members.push({ name: userName, group: assignedGroup });
  await roomRef.update({ members });

  showGroups(members, data.groupCount);
}

// ✅ 根據固定分組結果顯示（不洗牌）
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

// ✅ 頁面載入時自動讀取資料
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