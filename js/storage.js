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
  if (cacheLoaded) return; // Already initialized

  console.log("🔄 Initializing Firebase real-time sync...");

  // Listen for bank changes
  database.ref('banks').on('value', (snapshot) => {
    if (snapshot.exists()) {
      localCache.banks = snapshot.val();
      console.log("📱 Bank data synced from Firebase");
      // UI updates happen through event listeners
      document.dispatchEvent(new Event('dataUpdated'));
    }
  });

  // Listen for entry changes
  database.ref('entries').on('value', (snapshot) => {
    if (snapshot.exists()) {
      localCache.entries = snapshot.val();
    } else {
      localCache.entries = { A: [], B: [] };
    }
    console.log("📱 Entries synced from Firebase");
    document.dispatchEvent(new Event('dataUpdated'));
  });

  // Listen for savings changes
  database.ref('savings').on('value', (snapshot) => {
    if (snapshot.exists()) {
      localCache.savings = snapshot.val();
    } else {
      localCache.savings = [];
    }
    console.log("📱 Savings synced from Firebase");
    document.dispatchEvent(new Event('dataUpdated'));
  });

  // Load initial data from Firebase
  database.ref().once('value', (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.banks) localCache.banks = data.banks;
      if (data.entries) localCache.entries = data.entries;
      if (data.savings) localCache.savings = data.savings;
    }
    cacheLoaded = true;
    console.log("✅ Firebase cache loaded and listening for changes");
    document.dispatchEvent(new Event('cacheReady'));
  });
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
  database.ref(`banks/${person}`).set({ bank1, bank2 }).catch((error) => {
    console.error("❌ Error saving banks to Firebase:", error);
    alert("Failed to sync bank data. Check your internet connection.");
  });
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
  database.ref(`entries/${person}`).set(entries).catch((error) => {
    console.error("❌ Error saving entries to Firebase:", error);
    alert("Failed to sync entries. Check your internet connection.");
  });
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
  database.ref('savings').set(savings).catch((error) => {
    console.error("❌ Error saving savings to Firebase:", error);
    alert("Failed to sync savings. Check your internet connection.");
  });
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
  return localStorage.getItem('isLoggedIn') === "true";
}

function setLoggedIn(status) {
  if (status) {
    localStorage.setItem('isLoggedIn', 'true');
    // Initialize Firebase sync when login happens
    setTimeout(initializeFirebaseSync, 500);
  } else {
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
