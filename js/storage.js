// ============================================
// STORAGE.JS - LocalStorage Management
// All data is stored here - frontend only
// ============================================

const STORAGE_KEYS = {
  PERSON_A_BANK: "personA_bank",
  PERSON_A_ENTRIES: "personA_entries",
  PERSON_B_BANK: "personB_bank",
  PERSON_B_ENTRIES: "personB_entries",
  SAVINGS: "savings_entries",
  LOGGED_IN: "isLoggedIn"
};

// ============================================
// BANK MANAGEMENT (Each person can have 2 banks)
// ============================================

function getBankData(person) {
  const key = person === "A" ? STORAGE_KEYS.PERSON_A_BANK : STORAGE_KEYS.PERSON_B_BANK;
  return JSON.parse(localStorage.getItem(key)) || {
    bank1: 0,
    bank2: 0
  };
}

function saveBankData(person, bank1, bank2) {
  const key = person === "A" ? STORAGE_KEYS.PERSON_A_BANK : STORAGE_KEYS.PERSON_B_BANK;
  localStorage.setItem(key, JSON.stringify({ bank1, bank2 }));
}

function getTotalBank(person) {
  const bank = getBankData(person);
  return bank.bank1 + bank.bank2;
}

// ============================================
// DAILY ENTRIES MANAGEMENT
// ============================================

function getEntries(person) {
  const key = person === "A" ? STORAGE_KEYS.PERSON_A_ENTRIES : STORAGE_KEYS.PERSON_B_ENTRIES;
  return JSON.parse(localStorage.getItem(key)) || [];
}

function saveEntries(person, entries) {
  const key = person === "A" ? STORAGE_KEYS.PERSON_A_ENTRIES : STORAGE_KEYS.PERSON_B_ENTRIES;
  localStorage.setItem(key, JSON.stringify(entries));
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

// ============================================
// SAVINGS MANAGEMENT
// ============================================

function getSavings() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS)) || [];
}

function saveSavings(savings) {
  localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savings));
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

// ============================================
// CALCULATIONS
// ============================================

function getTotalAdded(person) {
  const entries = getEntries(person);
  return entries.reduce((sum, e) => sum + (e.added || 0), 0);
}

function getTotalUsed(person) {
  const entries = getEntries(person);
  return entries.reduce((sum, e) => sum + (e.used || 0), 0);
}

function getBalance(person) {
  return getTotalAdded(person) - getTotalUsed(person);
}

function getTotalSavings() {
  const savings = getSavings();
  return savings.reduce((sum, s) => sum + (s.amount || 0), 0);
}

function getMonthlyData(person, month, year) {
  const entries = getEntries(person);
  return entries.filter(e => {
    if (!e.date) return false;
    const [y, m] = e.date.split("-");
    return parseInt(y) === year && parseInt(m) === month;
  });
}

// ============================================
// AUTHENTICATION
// ============================================

function isLoggedIn() {
  return localStorage.getItem(STORAGE_KEYS.LOGGED_IN) === "true";
}

function setLoggedIn() {
  localStorage.setItem(STORAGE_KEYS.LOGGED_IN, "true");
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.LOGGED_IN);
}
