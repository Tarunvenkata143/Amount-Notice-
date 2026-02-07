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
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "1:YOUR_SENDER_ID:web:YOUR_APP_ID"
};

// Initialize Firebase (DO NOT MODIFY THIS PART)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

console.log("✅ Firebase initialized with project:", firebaseConfig.projectId);
