const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendDailyReminder = functions.pubsub
  .schedule("0 18 * * *")
  .timeZone("Asia/Kolkata")
  .onRun(async (context) => {
    console.log("⏰ Running daily reminder at 6 PM IST");

    try {
      const db = admin.firestore();
      
      // Get all FCM tokens from Firestore
      const docSnap = await db.collection("expenseTracker").doc("sharedData").get();
      
      if (!docSnap.exists) {
        console.log("⚠️ No data found in Firestore");
        return;
      }

      const tokens = Object.values(docSnap.data().fcmTokens || {})
        .filter(token => token && token.length > 0);

      if (tokens.length === 0) {
        console.log("⚠️ No FCM tokens found");
        return;
      }

      console.log(`📱 Found ${tokens.length} device(s) to notify`);

      // Create notification message
      const message = {
        notification: {
          title: "📊 Daily Expense Reminder",
          body: "Don't forget to log today's expenses!",
        },
        data: {
          url: "/dashboard.html",
          timestamp: new Date().toISOString(),
        },
      };

      // Send to all tokens
      const results = await Promise.allSettled(
        tokens.map(token => {
          console.log(`Sending to token: ${token.substring(0, 20)}...`);
          return admin.messaging().send({ ...message, token });
        })
      );

      // Count successes
      const successCount = results.filter(r => r.status === "fulfilled").length;
      console.log(`✅ Sent to ${successCount}/${tokens.length} devices`);

      return { success: true, sent: successCount };
    } catch (error) {
      console.error("❌ Error sending reminders:", error);
      throw error;
    }
  });
