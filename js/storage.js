// ==========================================
// FIRESTORE STORAGE MODULE
// ==========================================
// Uses Cloud Firestore for real-time sync across devices
// ALL devices read/write to: expenseTracker/sharedData
// NO localStorage usage
//

// Global state (synced from Firestore in real-time)
let appData = {
  banks: { A: { bank1: 0, bank2: 0 }, B: { bank1: 0, bank2: 0 } },
  entries: { A: [], B: [] },
  savings: []
};

let isInitialized = false;
let unsubscribeListener = null;

// ==========================================
// FIRESTORE REFERENCE
// ==========================================
// Shared document - all devices read/write here
const sharedDocRef = db.collection("expenseTracker").doc("sharedData");

// ==========================================
// SAVE DATA TO FIRESTORE
// ==========================================
/**
 * Save entire data object to Firestore
 * Called after ANY data change (add entry, delete entry, etc.)
 */
function saveData(data) {
  if (!data) {
    console.error("❌ Cannot save null/undefined data");
    return Promise.reject("No data to save");
  }

  console.log("⬆️ Saving to Firestore:", data);
  
  return sharedDocRef.set(data)
    .then(() => {
      console.log("✅ Data saved to Firestore successfully");
    })
    .catch((error) => {
      console.error("❌ Error saving to Firestore:", error);
      alert("Failed to save. Check console for details.\n\nError: " + error.message);
    });
}

// ==========================================
// REAL-TIME LISTENER (onSnapshot)
// ==========================================
/**
 * Listen to Firestore for real-time updates
 * This is called ONCE on page load
 * All changes on ANY device trigger this callback
 */
function initializeRealtimeSync() {
  if (isInitialized) {
    console.log("✅ Real-time sync already initialized");
    return;
  }

  console.log("🔄 Setting up real-time Firestore listener...");

  // unsubscribe = function that stops listening
  unsubscribeListener = sharedDocRef.onSnapshot(
    (doc) => {
      // Success callback
      if (doc.exists) {
        const data = doc.data();
        console.log("📱 Data synced from Firestore:", data);
        
        // Update global state
        appData = data;

        // Dispatch event so UI components can refresh
        document.dispatchEvent(new CustomEvent('firestoreUpdated', { detail: data }));
      } else {
        console.log("⚠️ No document found in Firestore yet");
        // Initialize with empty data
        saveData(appData);
      }
    },
    (error) => {
      // Error callback
      console.error("❌ Error in Firestore listener:", error);
      alert("Real-time sync error: " + error.message);
    }
  );

  isInitialized = true;
  console.log("✅ Real-time sync initialized successfully");
}

// ==========================================
// STOP LISTENING (for logout)
// ==========================================
function stopRealtimeSync() {
  if (unsubscribeListener) {
    console.log("🛑 Stopping real-time sync listener");
    unsubscribeListener();
    unsubscribeListener = null;
    isInitialized = false;
  }
}

// ==========================================
// BANK MANAGEMENT
// ==========================================
function getBankData(person) {
  const banks = appData.banks[person] || { bank1: 0, bank2: 0 };
  return {
    bank1: parseInt(banks.bank1) || 0,
    bank2: parseInt(banks.bank2) || 0
  };
}

function saveBankData(person, bank1, bank2) {
  bank1 = parseInt(bank1) || 0;
  bank2 = parseInt(bank2) || 0;

  console.log(`⬆️ Updating banks for ${person}:`, { bank1, bank2 });
  
  appData.banks[person] = { bank1, bank2 };
  return saveData(appData);
}

function getTotalBank(person) {
  const bank = getBankData(person);
  return bank.bank1 + bank.bank2;
}

// ==========================================
// ENTRIES MANAGEMENT
// ==========================================
function getEntries(person) {
  const entries = appData.entries[person] || [];
  return Array.isArray(entries) ? entries : Object.values(entries);
}

function saveEntries(person, entries) {
  console.log(`⬆️ Updating entries for ${person}:`, entries);
  
  appData.entries[person] = entries;
  return saveData(appData);
}

function addEntry(person, entry) {
  const entries = getEntries(person);
  entries.push(entry);
  return saveEntries(person, entries);
}

function updateEntry(person, index, entry) {
  const entries = getEntries(person);
  entries[index] = entry;
  return saveEntries(person, entries);
}

function deleteEntry(person, index) {
  const entries = getEntries(person);
  entries.splice(index, 1);
  return saveEntries(person, entries);
}

// ==========================================
// SAVINGS MANAGEMENT
// =========================================
function getSavings() {
  const savings = appData.savings || [];
  return Array.isArray(savings) ? savings : Object.values(savings);
}

function saveSavings(savings) {
  console.log("⬆️ Updating savings:", savings);
  
  appData.savings = savings;
  return saveData(appData);
}

function addSaving(saving) {
  const savings = getSavings();
  savings.push(saving);
  return saveSavings(savings);
}

function updateSaving(index, saving) {
  const savings = getSavings();
  savings[index] = saving;
  return saveSavings(savings);
}

function deleteSaving(index) {
  const savings = getSavings();
  savings.splice(index, 1);
  return saveSavings(savings);
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
// AUTHENTICATION (sessionStorage for tab-specific persistence)
// ==========================================
// Using sessionStorage instead of localStorage:
// - sessionStorage persists across page reloads (same tab)
// - sessionStorage is cleared when tab closes
// - NOT the same as localStorage (which persists across browser restarts)

function isLoggedIn() {
  const status = sessionStorage.getItem('isLoggedIn') === 'true';
  console.log("🔐 Check isLoggedIn():", status);
  return status;
}

function setLoggedIn(status) {
  // Default to true if not specified (for backward compatibility with auth.js)
  if (status === undefined) {
    status = true;
  }
  status = !!status;
  console.log("🔐 Setting login status to:", status);
  
  if (status) {
    sessionStorage.setItem('isLoggedIn', 'true');
    console.log("✅ Login saved in sessionStorage");
    // Note: Real-time sync will be initialized when dashboard loads
  } else {
    sessionStorage.removeItem('isLoggedIn');
    console.log("✅ Login cleared from sessionStorage");
    // Stop sync when user logs out
    stopRealtimeSync();
  }
}

function logout() {
  setLoggedIn(false);
}

// ==========================================
// INITIALIZATION
// ==========================================
console.log("✅ Storage module loaded (Firestore)");
