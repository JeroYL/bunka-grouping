// 頁面載入時，自動從 Firebase 載入分組資料
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

// 當使用者點「參加」按鈕時執行
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

  // 如果這個名字已經參加過，禁止重複加入
  if (members.find(m => m.name === userName)) {
    alert("你已經參加過了！");
    return;
  }

  // 計算每個組目前人數
  const groupCounts = Array.from({ length: data.groupCount }, () => 0);
  members.forEach(m => {
    groupCounts[m.group]++;
  });

  const groupSizeLimit = data.groupSize || Infinity;

  // 找出所有還沒滿的組別
  const availableGroups = groupCounts
    .map((count, index) => count < groupSizeLimit ? index : -1)
    .filter(index => index !== -1);

  // 如果所有組都滿了，拒絕加入
  if (availableGroups.length === 0) {
    alert("所有組別都已滿！");
    return;
  }

  // 從可以加入的組別中隨機抽一個
  const assignedGroup = availableGroups[Math.floor(Math.random() * availableGroups.length)];

  // 加入成員資料並更新到 Firebase
  members.push({ name: userName, group: assignedGroup });
  await roomRef.update({ members });

  showGroups(members, data.groupCount);
}

// 顯示目前所有的分組情況
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
