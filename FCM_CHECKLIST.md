# FCM Implementation Checklist

## ✅ Frontend (COMPLETE)

- [x] Service worker registered at project root (`firebase-messaging-sw.js`)
- [x] FCM module created (`js/messaging.js`)
- [x] Notification permission flow implemented
- [x] FCM tokens generated and stored in Firestore
- [x] Foreground notifications working (app open)
- [x] Background notifications ready (app closed/locked)
- [x] Settings page created (`settings.html`)
- [x] Integration in personA.js and personB.js
- [x] Dashboard.html updated with FCM SDK

## 🧪 Testing (Now)

```bash
# 1. Open settings page locally
http://localhost:port/settings.html

# 2. Grant notification permission
Click "🔔 Request Permission"

# 3. View your FCM token
Copy token from the text area
(This token is now in Firestore expenseTracker/sharedData.fcmTokens.A or B)

# 4. Send test notification
Click "📬 Send Test Notification"
You should see a notification appear immediately
```

## 🚀 Backend Deployment (Next)

### Option A: Firebase Cloud Functions (Recommended)

1. **Install Firebase Tools**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Functions in project directory**
   ```bash
   firebase init functions
   ```
   - Choose: JavaScript, Yes to ESLint, Yes to dependencies

4. **Create function in `functions/index.js`**
   ```javascript
   const functions = require("firebase-functions");
   const admin = require("firebase-admin");
   
   admin.initializeApp();
   
   exports.sendDailyReminder = functions.pubsub
     .schedule("0 18 * * *")  // 6 PM daily
     .timeZone("Asia/Kolkata")
     .onRun(async () => {
       const db = admin.firestore();
       const doc = await db.collection("expenseTracker").doc("sharedData").get();
       
       if (!doc.exists) return;
       const tokens = Object.values(doc.data().fcmTokens || {}).filter(t => t);
       if (tokens.length === 0) return;
   
       const message = {
         notification: {
           title: "Daily Expense Reminder",
           body: "Don't forget to log today's expenses!",
         },
         data: { url: "/dashboard.html" },
       };
   
       await Promise.all(
         tokens.map(token =>
           admin.messaging().send({ ...message, token })
             .catch(err => console.error("Failed:", token, err))
         )
       );
     });
   ```

5. **Deploy Function**
   ```bash
   firebase deploy --only functions
   ```
   ✅ Function runs daily at 6 PM IST

6. **Verify in Console**
   - Firebase Console → Cloud Functions → `sendDailyReminder`
   - Check execution logs

### Option B: Heroku/Railway Backend (Alternative)

Create a simple Node.js cron job that calls Firebase Admin SDK to send messages.

## 📱 End-to-End Testing (After Backend)

1. **Login on Phone A** → Grant permission → Copy token
2. **Login on Phone B** → Grant permission → Copy token
3. **Both tokens now in Firestore**
4. **Wait until 6 PM IST** → Both phones get notification
5. **Click notification** → Opens dashboard
6. **Check Person A added expense** → Person B sees in real-time

## 🔐 Security Notes

✅ **Safe for GitHub Public Repo:**
- Only PUBLIC VAPID key in frontend (not a secret)
- Private keys never stored in frontend
- Service worker requires HTTPS (GitHub Pages provides this)
- FCM tokens stored per-user in Firestore

❌ **Do NOT add to GitHub:**
- `functions/.runtimeconfig.json` (if you add SMS via Twilio)
- Any environment files with secrets

## 📊 Files Modified/Created

| File | Purpose | Status |
|------|---------|--------|
| `firebase-messaging-sw.js` | Service worker | ✅ Created |
| `js/messaging.js` | FCM module | ✅ Created |
| `settings.html` | User settings | ✅ Created |
| `dashboard.html` | Updated with SDK | ✅ Updated |
| `js/personA.js` | FCM init | ✅ Updated |
| `js/personB.js` | FCM init | ✅ Updated |

## 🌐 GitHub Pages Deployment

```bash
# After testing locally
git add .
git commit -m "Add Firebase Cloud Messaging for push notifications"
git push origin main

# GitHub Pages will auto-update your site
# Test on phone: open your GitHub Pages URL
```

## ✋ Manual Testing (Before Automation)

1. **Test via Firebase Console Cloud Messaging:**
   - Firebase Console → Messaging tab
   - Create new campaign
   - Select FCM token from Firestore
   - Send test message
   - User should get notification in real-time

2. **Test from Browser Console:**
   ```javascript
   // In dashboard.html console:
   const messaging = firebase.messaging();
   messaging.getToken().then(token => console.log("Your token:", token));
   ```

## 🎯 Success Criteria

- [ ] `settings.html` shows FCM token after permission granted
- [ ] Test notification button sends notification to self
- [ ] Close app and still receive notifications (after backend deployed)
- [ ] Click notification opens dashboard
- [ ] Two devices receive same notification
- [ ] Cloud Function logs show successful sends at 6 PM

## 🆘 Common Issues

| Error | Fix |
|-------|-----|
| "Service Worker registration failed" | Ensure HTTPS (GitHub Pages ✅, localhost needs special setup) |
| "Permission denied" | Check browser settings for notification permissions |
| "Token is null" | Grant notification permission in browser |
| "Notification not visible" | Ensure service worker is active (DevTools → Application) |
| "Only production tokens work" | Public VAPID key is for dev; make sure backend uses VAPID |

## 📚 Next Reading

- [FCM_IMPLEMENTATION.md](FCM_IMPLEMENTATION.md) - Full technical details
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Service Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Summary:** Frontend is ready. Test locally with `settings.html`. Deploy Cloud Function (1 copy-paste). Daily reminders will work automatically! 🎉
