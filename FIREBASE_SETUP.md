# Firebase Setup Guide - Cross-Device Real-Time Sync

## Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `expense-tracker` (or any name)
4. Click **Continue**
5. Enable Google Analytics (optional) → Click **Create project**
6. Wait for project to initialize (1-2 minutes)

## Step 2: Set Up Realtime Database
1. In Firebase Console, go to **Build** → **Realtime Database**
2. Click **"Create Database"**
3. Choose location: `asia-south1` (India, closest to your region) OR any other region
4. Start in **Test mode** (allows reads/writes without authentication - perfect for frontend)
5. Click **Enable**
6. Wait for database to initialize

## Step 3: Get Firebase Configuration
1. Click the **Settings Gear Icon** (⚙️) in top-left
2. Go to **Project Settings**
3. Scroll down to **"Your apps"** section
4. Click **Web App** (</> icon)
5. Follow the registration flow
6. Copy the config object (looks like below):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "expense-tracker-xxxxx.firebaseapp.com",
  databaseURL: "https://expense-tracker-xxxxx.firebaseio.com",
  projectId: "expense-tracker-xxxxx",
  storageBucket: "expense-tracker-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

## Step 4: Update Your Project
1. **Open** `js/firebaseConfig.js`
2. **Paste** your Firebase config into the file (replace the placeholder)
3. Save the file

That's it! The code is already prepared to use Firebase.

## Database Structure Used
```
/
├── banks/
│   ├── A/
│   │   ├── bank1: 10000
│   │   └── bank2: 0
│   └── B/
│       ├── bank1: 15000
│       └── bank2: 0
├── entries/
│   ├── A/
│   │   ├── entry1: {date, added, used, savings, balance}
│   │   └── entry2: {...}
│   └── B/
│       └── ...
└── savings/
    ├── saving1: {date, type, amount}
    └── saving2: {...}
```

## Testing on Two Devices

### Option 1: Same Computer (Different Browsers)
1. Open Chrome and login with password `1234`
2. Open Firefox and login with password `1234`
3. Add an entry in Chrome → You'll see it appear instantly in Firefox
4. Add an entry in Firefox → You'll see it appear instantly in Chrome

### Option 2: Two Different Phones
1. Phone A: Visit `https://Tarunvenkata143.github.io/Amount-Notice-/`
2. Phone B: Visit same URL
3. Both enter password `1234`
4. Phone A adds entry → Phone B sees it in real-time
5. Phone B adds entry → Phone A sees it in real-time

## Troubleshooting

### Issue: "Cannot find module 'firebase'"
**Solution:** The Firebase SDK is loaded via CDN (from HTML), no npm install needed

### Issue: "databaseURL is undefined"
**Solution:** Check `js/firebaseConfig.js` has correct values copied from Firebase Console

### Issue: "PERMISSION_DENIED"
**Solution:** Go to Firebase Console → Database → Rules tab, ensure "Test mode" is enabled:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Issue: Data not syncing between devices
**Solution:** 
- Check both devices are logged in
- Check internet connection is active
- Open browser DevTools (F12) → Console for errors
- Make sure `databaseURL` is correct in config

## Production Security (Optional - Later)
When deploying permanently, consider adding user authentication:
1. Firebase Console → Build → Authentication
2. Enable "Anonymous" sign-in
3. Each user gets unique ID, data isolation is automatic

**For now, Test mode is fine for development!**

## Next Steps
1. Copy your Firebase config to `js/firebaseConfig.js`
2. Test on two browsers/devices
3. Commit changes: `git add . && git commit -m "Firebase integration complete"`
4. Deploy: GitHub Pages automatically serves latest code

---

**Questions?** Check Firebase docs: https://firebase.google.com/docs/database
