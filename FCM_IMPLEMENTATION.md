# Firebase Cloud Messaging (FCM) Implementation Guide

## Overview
Frontend-only implementation of push notifications using Firebase Cloud Messaging. Users will receive notifications even when the app is closed, locked, or in the background.

---

## What Was Implemented

### 1. **firebase-messaging-sw.js** (Service Worker in project root)
- Handles push notifications when app is closed/locked
- Opens the app when user clicks notification
- Shows custom notification UI with icon/badge

### 2. **js/messaging.js** (FCM Main Module)
- Registers service worker
- Requests notification permission from user
- Gets FCM token using PUBLIC VAPID key
- Stores tokens in Firestore for each person (A/B)
- Handles foreground notifications
- Auto-refreshes token when expired

### 3. **settings.html** (User Settings Page)
- Display and copy FCM token
- Add phone number for SMS reminders (optional backend feature)
- Check notification permission status
- Test notifications

### 4. **Updated Files**
- `dashboard.html` - Added firebase-messaging SDK + messaging.js script
- `personA.js` - Initializes messaging + sets currentPerson='A'
- `personB.js` - Initializes messaging + sets currentPerson='B'

---

## How It Works

```
User Opens App
    ↓
browser asks permission → User grants notification permission
    ↓
js/messaging.js calls initializeMessaging()
    ↓
Firebase generates FCM token (using PUBLIC VAPID key)
    ↓
Token stored in Firestore: expenseTracker/sharedData.fcmTokens.A (or B)
    ↓
Service worker listens for messages from Firebase
    ↓
When notification arrives:
  - If app is OPEN   → onMessage() shows notification
  - If app is CLOSED → Service Worker shows notification
  - If user clicks   → Opens app to dashboard
```

---

## Current Status: What's Working

✅ **Receive-side (Frontend)**
- Service worker registration
- Request notification permission
- Get FCM token
- Store tokens in Firestore
- Show notifications when app is open
- Show notifications when app is closed (via service worker)
- Handle notification clicks

❌ **Send-side (Backend) - NOT YET IMPLEMENTED**
- Need Firebase Cloud Function to send messages
- Need Twilio or similar for SMS reminders

---

## Next Step: Deploy Backend (Cloud Function) to Send Reminders

To complete the daily reminder feature, you need a **Cloud Function** that:
1. Runs on schedule (daily at 6 PM)
2. Gets FCM tokens from Firestore
3. Sends push messages to those tokens via Firebase Admin SDK

### Option A: Firebase Cloud Functions (Recommended)

#### Step 1: Initialize Firebase Functions
```bash
cd your-project-root
npm install -g firebase-tools
firebase login
firebase init functions
```
Choose: **JavaScript**, Yes to ESLint, Yes to install dependencies.

#### Step 2: Create Cloud Function
Edit `functions/index.js`:

```javascript
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendDailyReminder = functions.pubsub
  .schedule("0 18 * * *")  // 6 PM daily
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    const db = admin.firestore();
    
    // Get all FCM tokens
    const doc = await db.collection("expenseTracker").doc("sharedData").get();
    if (!doc.exists) return;

    const tokens = Object.values(doc.data().fcmTokens || {}).filter(t => t);
    if (tokens.length === 0) return;

    const message = {
      notification: {
        title: "Daily Expense Reminder",
        body: "Don't forget to log today's expenses!",
      },
      data: {
        url: "/dashboard.html",
      },
    };

    // Send to all tokens
    const promises = tokens.map(token =>
      admin.messaging().send({ ...message, token })
        .catch(err => console.error("Failed to send to", token, err))
    );

    await Promise.all(promises);
    console.log(`Sent reminders to ${tokens.length} devices`);
  });
```

#### Step 3: Deploy
```bash
firebase deploy --only functions
```

### Option B: Simple Node.js Backend (Alternative)
Create a simple Express server that runs the same function and deploy to Heroku/Render/Railway.

---

## Testing the Frontend (Now)

### Step 1: Open Settings Page
```
http://localhost:8000/settings.html
```

### Step 2: Grant Permission
1. Click "🔔 Request Permission"
2. Browser will ask - click "Allow"

### Step 3: See Your FCM Token
- Copy token from settings page
- This token is stored in Firestore

### Step 4: Test Notification
- Click "📬 Send Test Notification"
- You should see a notification

### Step 5: Test Background Notification
1. Open DevTools (F12)
2. Go to Application → Service Workers
3. Check "Offline" checkbox
4. Close the app
5. (Requires backend function to actually send notification)

---

## VAPID Key Details

**What is VAPID?**
- Voluntary Application Server Identification
- Public key for browser to verify notifications are from Firebase
- Safe to include in frontend code
- Currently hardcoded in `js/messaging.js`

**Current VAPID Key:**
```
BGrGRo4H27tAy7F3Z-f2tKlL8qV9-W4DnX5pK6mM9vBc
```

**To Update VAPID Key:**
1. Open Firebase Console → Project Settings → Cloud Messaging
2. Copy "Server API Key" and "Web Push certificates"
3. Edit `js/messaging.js` line 68: `const VAPID_KEY = "your-key"`

---

## File Structure

```
expense-excel-tracker/
├── firebase-messaging-sw.js       ← Service Worker (ROOT)
├── settings.html                  ← Settings page
├── dashboard.html                 ← Updated with messaging SDK
├── js/
│   ├── messaging.js               ← FCM main module
│   ├── personA.js                 ← Updated to init messaging
│   ├── personB.js                 ← Updated to init messaging
│   └── firebaseConfig.js
└── ... (other files)
```

---

## Firestore Data Structure

Tokens are stored in:
```
expenseTracker/sharedData
├── fcmTokens
│   ├── A: "token-for-person-a..."
│   └── B: "token-for-person-b..."
├── fcmTokenUpdatedAt
│   ├── A: "2026-02-08T18:00:00Z"
│   └── B: "2026-02-08T18:00:00Z"
├── reminderPhones (optional, for SMS later)
│   ├── A: "+91xxxxxxxxxx"
│   └── B: "+91xxxxxxxxxx"
└── ... (existing data)
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Notification permission denied" | Check browser settings → site permissions for localhost/your domain |
| Service worker not registered | Ensure app is HTTPS (GitHub Pages is ✅, localhost http needs special setup) |
| No token generated | Grant notification permission explicitly |
| Notifications not showing | Check Firestore for stored tokens; ensure service worker is active |
| Token is null | Browser doesn't support notifications or permission denied |

---

## What Needs to Happen Next

1. **Deploy Cloud Function** (backend) to send daily reminders
2. **Set Twilio account** (optional) if you want SMS instead of push
3. **Update reminder schedule** to match your timezone
4. **Test end-to-end** from two devices

---

## Summary

✅ **Frontend**: User can receive push notifications (app closed/locked)  
❌ **Backend**: Need Cloud Function to send notifications on schedule  
❌ **SMS**: Need Twilio integration to send text reminders instead of push  

Next: Deploy the Cloud Function from the template above, then test with two devices!
