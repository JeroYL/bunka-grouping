// 初始化 Firebase（使用 CDN 方式，不使用 import）
const firebaseConfig = {
  apiKey: "AIzaSyAjxreGJsaRAlthumoH4_cJND3nBkHQMXw",
  authDomain: "bunka-grouping.firebaseapp.com",
  projectId: "bunka-grouping",
  storageBucket: "bunka-grouping.firebasestorage.app",
  messagingSenderId: "447342019373",
  appId: "1:447342019373:web:41556fcb8eab037ec289a4",
  measurementId: "G-GJ9QKH3S0Z"
};

// 初始化 Firebase 與 Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 把 db 設成全域變數，讓其他 script.js 檔案也能用
window.db = db;