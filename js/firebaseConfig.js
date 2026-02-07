// ==========================================
// FIREBASE CONFIGURATION
// ==========================================
// 
// INSTRUCTIONS:
// 1. Go to Firebase Console: https://console.firebase.google.com/
// 2. Select your project → Settings (⚙️) → Project Settings
// 3. Scroll down to "Your apps" and copy the config object
// 4. Paste it below, replacing the entire firebaseConfig object
//
// DO NOT SHARE THIS CONFIG ONLINE - It's public, but security depends on Database Rules
//

const firebaseConfig = {
  apiKey: "AIzaSyA6siLshtYtBSBS4Vk6hDYaA5DM_35gdSI",
  authDomain: "expense-excel-tracker.firebaseapp.com",
  databaseURL: "https://expense-excel-tracker.firebaseio.com",
  projectId: "expense-excel-tracker",
  storageBucket: "expense-excel-tracker.firebasestorage.app",
  messagingSenderId: "135841374623",
  appId: "1:135841374623:web:5d078784b8fee9ff6fddaa",
  measurementId: "G-7TQ3QQGGRQ"
};

// Initialize Firebase (COMPAT VERSION)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

console.log("✅ Firebase initialized with project:", firebaseConfig.projectId);
console.log("✅ Database URL:", firebaseConfig.databaseURL);
