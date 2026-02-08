// ==========================================
// FIREBASE CLOUD MESSAGING SERVICE WORKER
// ==========================================
// This service worker handles push notifications when:
// - App is closed
// - Phone is locked
// - App is in the background
// 
// Place this file in the project ROOT (/firebase-messaging-sw.js)
// NOT in js/ folder
//

// Importable Firebase Messaging service
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Initialize Firebase in the service worker
// Use the same config as the main app
const firebaseConfig = {
  apiKey: "AIzaSyDniwVkN22bPjqkjNZc-p8CjfEOhL4Zs4Q",
  authDomain: "expense-excel-tracker.firebaseapp.com",
  projectId: "expense-excel-tracker",
  storageBucket: "expense-excel-tracker.appspot.com",
  messagingSenderId: "743437389866",
  appId: "1:743437389866:web:dc8f8b0a7be0e23ad9fcab",
};

firebase.initializeApp(firebaseConfig);

// Get Firebase Messaging instance
const messaging = firebase.messaging();

// ==========================================
// HANDLE BACKGROUND PUSH NOTIFICATIONS
// ==========================================
// Called when notification arrives and app is in BACKGROUND/CLOSED
messaging.onBackgroundMessage((payload) => {
  console.log("📱 Background message received:", payload);

  const notificationTitle = payload.notification?.title || "Daily Expense Reminder";
  const notificationOptions = {
    body: payload.notification?.body || "Please log your daily expenses",
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><circle cx='96' cy='96' r='96' fill='%2300AA00'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='100' fill='white' font-weight='bold'>₹</text></svg>",
    badge: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><circle cx='96' cy='96' r='96' fill='%2300AA00'/></svg>",
    tag: "expense-tracker-reminder", // Used to group similar notifications
    requireInteraction: true, // User must dismiss (don't auto-close)
    data: {
      url: "/dashboard.html", // URL to open when notification is clicked
      personA: payload.data?.personA || "Tejaswini",
      personB: payload.data?.personB || "Tarun",
    },
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ==========================================
// HANDLE NOTIFICATION CLICK
// ==========================================
// Called when user clicks a notification
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Notification clicked:", event.notification);
  
  event.notification.close(); // Close the notification

  // Open the app when notification is clicked
  const urlToOpen = new URL("/", self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus(); // Focus existing window
          }
        }
        // App not open, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ==========================================
// OPTIONAL: Handle notification close
// ==========================================
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed by user");
});

console.log("✅ Firebase Messaging Service Worker registered");
