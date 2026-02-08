// ==========================================
// FIREBASE CLOUD MESSAGING MODULE
// ==========================================
// Handles:
// - Service worker registration
// - Request notification permission from user
// - Get and store FCM token in Firestore
// - Handle foreground notifications
// 
// Load AFTER firebaseConfig.js
//

// ==========================================
// 1. REGISTER SERVICE WORKER
// ==========================================
async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.error("❌ Service Workers not supported in this browser");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );
    console.log("✅ Service Worker registered:", registration);
    return registration;
  } catch (error) {
    console.error("❌ Service Worker registration failed:", error);
    return null;
  }
}

// ==========================================
// 2. REQUEST NOTIFICATION PERMISSION
// ==========================================
async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.warn("⚠️ Notifications not supported in this browser");
    return false;
  }

  if (Notification.permission === "granted") {
    console.log("✅ Notification permission already granted");
    return true;
  }

  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission();
      console.log("🔔 Notification permission:", permission);
      return permission === "granted";
    } catch (error) {
      console.error("❌ Error requesting notification permission:", error);
      return false;
    }
  }

  console.warn("⚠️ User denied notification permission");
  return false;
}

// ==========================================
// 3. INITIALIZE FCM AND GET TOKEN
// ==========================================
const VAPID_KEY = "BMaQiL-DZSBXy43PF7sKddpXczKONkVNv4P7FIFGbfGgAzJjhApE5_cC4WbNeNCpupnaqdp-WIIQaMUmUVtl-So"; // Replace with your PUBLIC VAPID key

let fcmToken = null;
let fcmMessaging = null;

async function initializeFCM() {
  try {
    // Check if Firebase is ready
    if (typeof firebase === "undefined" || !firebase.apps.length) {
      console.error("❌ Firebase not initialized");
      return null;
    }

    // Register service worker first
    const swRegistration = await registerServiceWorker();
    if (!swRegistration) {
      console.error("❌ Service Worker registration failed");
      return null;
    }

    // Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn("⚠️ Notification permission not granted, FCM won't work");
      return null;
    }

    // Get Firebase Messaging instance
    fcmMessaging = firebase.messaging();

    // Get FCM token with VAPID key
    try {
      fcmToken = await fcmMessaging.getToken({
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      if (fcmToken) {
        console.log("✅ FCM Token obtained:", fcmToken);
        return fcmToken;
      } else {
        console.error("❌ Failed to get FCM token");
        return null;
      }
    } catch (error) {
      console.error("❌ Error getting FCM token:", error);
      return null;
    }
  } catch (error) {
    console.error("❌ Error initializing FCM:", error);
    return null;
  }
}

// ==========================================
// 4. STORE FCM TOKEN IN FIRESTORE
// ==========================================
async function storeFCMToken(personId, token) {
  try {
    if (!token) {
      console.warn("⚠️ No token provided");
      return false;
    }

    const sharedDocRef = db.collection("expenseTracker").doc("sharedData");
    
    // Add or update FCM tokens in Firestore
    await sharedDocRef.update({
      [`fcmTokens.${personId}`]: token,
      [`fcmTokenUpdatedAt.${personId}`]: new Date().toISOString(),
    });

    console.log(`✅ FCM token stored for ${personId}:`, token);
    return true;
  } catch (error) {
    console.error(`❌ Error storing FCM token for ${personId}:`, error);
    // If document doesn't exist, create it
    if (error.code === "not-found") {
      try {
        await sharedDocRef.set({
          fcmTokens: { [personId]: token },
          fcmTokenUpdatedAt: { [personId]: new Date().toISOString() },
        }, { merge: true });
        console.log(`✅ FCM token created for ${personId}`);
        return true;
      } catch (e) {
        console.error("❌ Error creating FCM token document:", e);
        return false;
      }
    }
    return false;
  }
}

// ==========================================
// 5. HANDLE FOREGROUND MESSAGES
// ==========================================
function setupForegroundMessageHandler() {
  if (!fcmMessaging) {
    console.warn("⚠️ FCM not initialized");
    return;
  }

  fcmMessaging.onMessage((payload) => {
    console.log("📬 Foreground message received:", payload);

    // Show a visible notification even when app is open
    const notificationTitle = payload.notification?.title || "Daily Expense Reminder";
    const notificationOptions = {
      body: payload.notification?.body || "Please log your daily expenses",
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><circle cx='96' cy='96' r='96' fill='%2300AA00'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='100' fill='white' font-weight='bold'>₹</text></svg>",
      tag: "expense-tracker-fg",
      requireInteraction: true,
      data: payload.data,
    };

    // Show using service worker registration
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SHOW_NOTIFICATION",
        title: notificationTitle,
        options: notificationOptions,
      });
    }

    // Dispatch custom event so app can react
    document.dispatchEvent(
      new CustomEvent("fcmMessageReceived", { detail: payload })
    );
  });

  console.log("✅ Foreground message handler set up");
}

// ==========================================
// 6. TOKEN REFRESH
// ==========================================
// FCM token can expire, listen for refresh events
function setupTokenRefreshListener() {
  if (!fcmMessaging) {
    console.warn("⚠️ FCM not initialized");
    return;
  }

  fcmMessaging.onTokenRefresh(async () => {
    console.log("🔄 FCM token refreshed");
    
    try {
      const swRegistration = await navigator.serviceWorker.ready;
      const newToken = await fcmMessaging.getToken({
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      if (newToken) {
        fcmToken = newToken;
        console.log("✅ New FCM token obtained:", newToken);

        // Re-store the new token for current person
        const currentPerson = sessionStorage.getItem('currentPerson') || 'A';
        await storeFCMToken(currentPerson, newToken);
      }
    } catch (error) {
      console.error("❌ Error refreshing FCM token:", error);
    }
  });

  console.log("✅ Token refresh listener set up");
}

// ==========================================
// 7. COMPLETE SETUP: Call this on dashboard load
// ==========================================
async function initializeMessaging() {
  console.log("🔄 Initializing Firebase Cloud Messaging...");

  try {
    // Initialize FCM
    const token = await initializeFCM();
    if (!token) {
      console.warn("⚠️ FCM initialization failed or permission denied");
      return false;
    }

    // Store token
    const currentPerson = sessionStorage.getItem('currentPerson') || 'A';
    await storeFCMToken(currentPerson, token);

    // Set up handlers
    setupForegroundMessageHandler();
    setupTokenRefreshListener();

    console.log("✅ Firebase Cloud Messaging initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing messaging:", error);
    return false;
  }
}

// ==========================================
// 8. GET CURRENT FCM TOKEN
// ==========================================
function getCurrentFCMToken() {
  return fcmToken;
}

// ==========================================
// 9. LISTEN FOR MESSAGES IN APP
// ==========================================
// Call this in personA.js or personB.js to react to messages
function onFCMMessageReceived(callback) {
  document.addEventListener("fcmMessageReceived", (event) => {
    callback(event.detail);
  });
}

console.log("✅ Messaging module loaded (FCM)");
