// ==========================================
// FIREBASE CONFIGURATION (Firestore)
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyA6siLshtYtBSBS4Vk6hDYaA5DM_35gdSI",
  authDomain: "expense-excel-tracker.firebaseapp.com",
  projectId: "expense-excel-tracker",
  storageBucket: "expense-excel-tracker.firebasestorage.app",
  messagingSenderId: "135841374623",
  appId: "1:135841374623:web:5d078784b8fee9ff6fddaa",
  measurementId: "G-7TQ3QQGGRQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log("✅ Firebase initialized with Firestore (project: expense-excel-tracker)");
