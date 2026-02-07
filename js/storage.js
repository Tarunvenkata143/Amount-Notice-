// ==========================================
// FIREBASE STORAGE MODULE (Hybrid Sync)
// ==========================================
// 
// This module uses Firebase Realtime Database for:
// - Real-time synchronization across devices
// - Cloud backup of all data
// 
// It maintains a local cache for instant reads while syncing with Firebase
// Updates from other devices appear instantly via Firebase listeners
//

// Global error handler - catch all errors to prevent silent redirects
window.addEventListener('error', function(event) {
  console.error("❌ UNCAUGHT ERROR:", event.error);
  console.error("Message:", event.message);
  console.error("File:", event.filename);
  console.error("Line:", event.lineno);
});

window.addEventListener('unhandledrejection', function(event) {
  console.error("❌ UNHANDLED PROMISE REJECTION:", event.reason);
});

// Local cache (synced from Firebase in real-time)
let localCache = {
  banks: { A: { bank1: 0, bank2: 0 }, B: { bank1: 0, bank2: 0 } },
  entries: { A: [], B: [] },
  savings: []
};

let cacheLoaded = false;

// ==========================================
// INITIALIZATION & REAL-TIME LISTENERS
// ==========================================

/**
 * Initialize Firebase listeners for real-time sync
 * Call this once when app loads (from auth.js or dashboard load)
 */
function initializeFirebaseSync() {
  if (cacheLoaded) {
    console.log("✅ Firebase sync already initialized");
    return;
  }

  // Check if Firebase database is available
  if (typeof database === 'undefined' || !database) {
    console.warn("⏳ Firebase database not ready yet, retrying in 500ms...");
    setTimeout(initializeFirebaseSync, 500); // Retry after 500ms
    return;
  }

  if (typeof firebase === 'undefined' || !firebase) {
    console.warn("⏳ Firebase not ready yet, retrying in 500ms...");
    setTimeout(initializeFirebaseSync, 500); // Retry after 500ms
    return;
  }

  console.log("🔄 Initializing Firebase real-time sync...");

  try {
    // Listen for bank changes with error handling
    database.ref('banks').on('value', 
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            localCache.banks = snapshot.val();
            console.log("📱 Bank data synced from Firebase");
          }
          document.dispatchEvent(new Event('dataUpdated'));
        } catch (e) {
          console.error("❌ Error processing bank snapshot:", e);
        }
      }, 
      (error) => {
        console.error("❌ Error reading banks:", error.code, error.message);
      }
    );

    // Listen for entry changes with error handling
    database.ref('entries').on('value',
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            localCache.entries = snapshot.val();
          } else {
            localCache.entries = { A: [], B: [] };
          }
          console.log("📱 Entries synced from Firebase");
          document.dispatchEvent(new Event('dataUpdated'));
        } catch (e) {
          console.error("❌ Error processing entries snapshot:", e);
        }
      },
      (error) => {
        console.error("❌ Error reading entries:", error.code, error.message);
      }
    );

    // Listen for savings changes with error handling
    database.ref('savings').on('value',
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            localCache.savings = snapshot.val();
          } else {
            localCache.savings = [];
          }
          console.log("📱 Savings synced from Firebase");
          document.dispatchEvent(new Event('dataUpdated'));
        } catch (e) {
          console.error("❌ Error processing savings snapshot:", e);
        }
      },
      (error) => {
        console.error("❌ Error reading savings:", error.code, error.message);
      }
    );

    // Load initial data from Firebase
    database.ref().once('value', (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.banks) localCache.banks = data.banks;
          if (data.entries) localCache.entries = data.entries;
          if (data.savings) localCache.savings = data.savings;
        }
        cacheLoaded = true;
        console.log("✅ Firebase cache loaded and listening for changes");
        document.dispatchEvent(new Event('cacheReady'));
      } catch (e) {
        console.error("❌ Error loading initial data:", e);
        cacheLoaded = true; // Mark as loaded anyway
        document.dispatchEvent(new Event('cacheReady'));
      }
    }).catch((error) => {
      console.error("❌ Error in once('value'):", error.code, error.message);
      cacheLoaded = true; // Mark as loaded to prevent stuck state
      document.dispatchEvent(new Event('cacheReady'));
    });

  } catch (error) {
    console.error("❌ Error initializing Firebase sync:", error);
    cacheLoaded = true; // Mark as loaded to prevent stuck state
    document.dispatchEvent(new Event('cacheReady'));
  }
}

// ==========================================
// BANK MANAGEMENT (Get/Save)
// ==========================================

function getBankData(person) {
  // Return from local cache (instantly available)
  const banks = localCache.banks[person] || { bank1: 0, bank2: 0 };
  return {
    bank1: parseInt(banks.bank1) || 0,
    bank2: parseInt(banks.bank2) || 0
  };
}

function saveBankData(person, bank1, bank2) {
  // Convert to numbers
  bank1 = parseInt(bank1) || 0;
  bank2 = parseInt(bank2) || 0;

  // Update local cache immediately
  localCache.banks[person] = { bank1, bank2 };

  // Write to Firebase (async, but don't wait)
  if (typeof database !== 'undefined' && database) {
    database.ref(`banks/${person}`).set({ bank1, bank2 }).catch((error) => {
      console.error("❌ Error saving banks to Firebase:", error);
    });
  } else {
    console.log("⚠️ Firebase not available, data saved locally only");
  }
}

function getTotalBank(person) {
  const bank = getBankData(person);
  return bank.bank1 + bank.bank2;
}

// ==========================================
// DAILY ENTRIES MANAGEMENT
// ==========================================

function getEntries(person) {
  // Return from local cache (instantly available)
  const entries = localCache.entries[person] || [];
  
  // Ensure it's an array (Firebase sometimes stores as object)
  if (Array.isArray(entries)) {
    return entries;
  } else {
    return Object.values(entries); // Convert object to array if needed
  }
}

function saveEntries(person, entries) {
  // Update local cache immediately
  localCache.entries[person] = entries;

  // Write to Firebase (async)
  if (typeof database !== 'undefined' && database) {
    database.ref(`entries/${person}`).set(entries).catch((error) => {
      console.error("❌ Error saving entries to Firebase:", error);
    });
  } else {
    console.log("⚠️ Firebase not available, data saved locally only");
  }
}

function addEntry(person, entry) {
  const entries = getEntries(person);
  entries.push(entry);
  saveEntries(person, entries);
}

function updateEntry(person, index, entry) {
  const entries = getEntries(person);
  entries[index] = entry;
  saveEntries(person, entries);
}

function deleteEntry(person, index) {
  const entries = getEntries(person);
  entries.splice(index, 1);
  saveEntries(person, entries);
}

// ==========================================
// SAVINGS MANAGEMENT
// ==========================================

function getSavings() {
  // Return from local cache (instantly available)
  const savings = localCache.savings || [];
  
  // Ensure it's an array
  if (Array.isArray(savings)) {
    return savings;
  } else {
    return Object.values(savings);
  }
}

function saveSavings(savings) {
  // Update local cache immediately
  localCache.savings = savings;

  // Write to Firebase (async)
  if (typeof database !== 'undefined' && database) {
    database.ref('savings').set(savings).catch((error) => {
      console.error("❌ Error saving savings to Firebase:", error);
    });
  } else {
    console.log("⚠️ Firebase not available, data saved locally only");
  }
}

function addSaving(saving) {
  const savings = getSavings();
  savings.push(saving);
  saveSavings(savings);
}

function updateSaving(index, saving) {
  const savings = getSavings();
  savings[index] = saving;
  saveSavings(savings);
}

function deleteSaving(index) {
  const savings = getSavings();
  savings.splice(index, 1);
  saveSavings(savings);
}

// ==========================================
// CALCULATIONS
// ==========================================

function getTotalAdded(person) {
  const entries = getEntries(person);
  return entries.reduce((sum, e) => sum + (parseInt(e.added) || 0), 0);
}

function getTotalUsed(person) {
  const entries = getEntries(person);
  return entries.reduce((sum, e) => sum + (parseInt(e.used) || 0), 0);
}

function getTotalSavings() {
  const savings = getSavings();
  return savings.reduce((sum, s) => sum + (parseInt(s.amount) || 0), 0);
}

function getBalance(person) {
  const banks = getBankData(person);
  const totalBank = banks.bank1 + banks.bank2;
  const added = getTotalAdded(person);
  const used = getTotalUsed(person);
  return totalBank + added - used;
}

function getMonthlyData(person, month, year) {
  const entries = getEntries(person);
  return entries.filter(e => {
    if (!e.date) return false;
    const [y, m] = e.date.split("-");
    return parseInt(y) === year && parseInt(m) === month;
  });
}

// ==========================================
// AUTHENTICATION
// ==========================================

function isLoggedIn() {
  const loggedIn = localStorage.getItem('isLoggedIn') === "true";
  console.log("🔍 Check isLoggedIn() =", loggedIn, "(localStorage =", localStorage.getItem('isLoggedIn'), ")");
  return loggedIn;
}

function setLoggedIn(status) {
  // Default to true if no parameter passed (for backward compatibility with auth.js)
  if (status === undefined) {
    status = true;
  }
  
  if (status) {
    console.log("✅ Setting logged in status to TRUE");
    localStorage.setItem('isLoggedIn', 'true');
    console.log("✅ localStorage.isLoggedIn =", localStorage.getItem('isLoggedIn'));
    // Initialize Firebase sync when login happens
    setTimeout(initializeFirebaseSync, 500);
  } else {
    console.log("✅ Logging out - setting logged in status to FALSE");
    localStorage.removeItem('isLoggedIn');
  }
}

function logout() {
  localStorage.removeItem('isLoggedIn');
}

// ==========================================
// HELPER: Wait for cache to load
// ==========================================

async function waitForCacheReady() {
  return new Promise((resolve) => {
    if (cacheLoaded) {
      resolve();
    } else {
      document.addEventListener('cacheReady', () => resolve(), { once: true });
    }
  });
}

console.log("✅ Storage module loaded (Firebase + Local Cache hybrid)");
