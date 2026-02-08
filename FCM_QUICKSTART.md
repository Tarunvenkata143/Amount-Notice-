# 🔔 Firebase Cloud Messaging - Quick Start

## What Just Got Added

Your expense tracker now supports **push notifications** when the app is closed or locked! 

### New Files
- `firebase-messaging-sw.js` - Service worker for background notifications
- `js/messaging.js` - FCM token and permission handling
- `settings.html` - User settings page to view FCM token

### How to Test Right Now

#### Step 1: Open Settings Page
```
http://localhost:port/settings.html
```
(Or your GitHub Pages URL when deployed)

#### Step 2: Grant Permission
Click **"🔔 Request Permission"** and allow notifications in browser.

#### Step 3: See Your FCM Token
The token appears in the text area. This token is stored in Firestore and identifies your device.

#### Step 4: Send Test Notification
Click **"📬 Send Test Notification"** — you should see a notification immediately!

#### Step 5: Close App and Test Again
Close the browser/app, then:
1. Open Firebase Console → Cloud Messaging
2. Create a test message
3. Send to your FCM token
4. Even with app closed, you'll get a notification!

---

## What's Working Now (Frontend) ✅

```
User opens app
    ↓
Browser asks for notification permission
    ↓
FCM token generated automatically
    ↓
When notification arrives:
  - App OPEN    → Notification appears in-app
  - App CLOSED  → Service worker shows notification
  - User clicks → App opens to dashboard
```

---

## What Needs Backend Work (Next Step) ⏳

To enable **daily automatic reminders**, you need:
1. A Cloud Function that runs every day at 6 PM
2. Gets all FCM tokens from Firestore
3. Sends notification to all tokens

**Good news**: We have a template ready in [FCM_CHECKLIST.md](FCM_CHECKLIST.md) — just copy-paste and deploy!

---

## Full Documentation

📖 **See [FCM_IMPLEMENTATION.md](FCM_IMPLEMENTATION.md) for:**
- Complete technical details
- How service workers work
- VAPID key explanation
- Firestore data structure
- Detailed troubleshooting

📋 **See [FCM_CHECKLIST.md](FCM_CHECKLIST.md) for:**
- Step-by-step deployment
- Cloud Function template
- Testing procedures
- Success criteria
- Common issues

---

## Deployment Steps

### Option A: Keep Testing Locally (Now)
✅ Test the frontend with `settings.html`
✅ Verify tokens appear in Firestore
⏳ Deploy Cloud Function when ready for daily reminders

### Option B: Deploy to GitHub Pages (Now)
```bash
git add .
git commit -m "Add Firebase Cloud Messaging"
git push origin main
```
Your site updates automatically. Test on your phone with the GitHub Pages URL.

### Option C: Deploy Backend (After Testing)
```bash
# Copy the Cloud Function code from FCM_CHECKLIST.md
# Deploy to Firebase
firebase deploy --only functions
```
Daily reminders will start automatically at 6 PM IST.

---

## Key Features

| Feature | Status | Notes |
|---------|--------|-------|
| Request notification permission | ✅ Ready | Users grant in browser |
| Generate FCM token | ✅ Ready | Auto-stored in Firestore |
| Show notifications (app open) | ✅ Ready | Test with settings.html button |
| Show notifications (app closed) | ✅ Ready | Service worker handles this |
| Open app from notification | ✅ Ready | Clicking notification opens dashboard |
| Daily automatic reminders | ⏳ Need backend | Cloud Function template provided |
| SMS reminders (optional) | ⏳ Future | Needs Twilio integration |

---

## Security Notes

✅ **Safe for GitHub**
- Only PUBLIC VAPID key in frontend
- No private credentials exposed
- Works with GitHub Pages HTTPS

❌ **Never add to GitHub**
- `.env` files with secrets
- `functions/.runtimeconfig.json` (if using Twilio)

---

## Quick FAQ

**Q: Does my phone need to be plugged in to receive notifications?**  
A: No, service workers work even when app is completely closed.

**Q: Do both Phone A and B get notifications?**  
A: Yes! Each stores its own token. Cloud Function sends to all tokens.

**Q: Can I test without deploying to GitHub?**  
A: Yes, test locally with localhost URL. Then deploy when ready.

**Q: How do I add SMS instead of push?**  
A: Modify Cloud Function to use Twilio API instead of messaging().send().

---

## Next Steps Pick One:

1. **Test Now**: Open `settings.html`, grant permission, click test button
2. **Deploy Now**: Push to GitHub, test on your phone
3. **Automate Now**: Deploy Cloud Function for daily reminders

---

## Need Help?

- 🔍 Technical details → Read [FCM_IMPLEMENTATION.md](FCM_IMPLEMENTATION.md)
- ✅ Deployment steps → Follow [FCM_CHECKLIST.md](FCM_CHECKLIST.md)
- 🐛 Troubleshooting → See "Common Issues" section in checklist
- 📚 Official docs → [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

---

**Ready to test? Open `settings.html` in your browser!** 🚀
