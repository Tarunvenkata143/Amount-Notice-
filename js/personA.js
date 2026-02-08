// ============================================
// PERSON A - Daily Expense Management
// ============================================

// Prevent redirect loops - add timestamp to prevent rapid re-redirects
window.lastRedirectTime = 0;

function safeRedirect(url) {
  const now = Date.now();
  if (now - window.lastRedirectTime < 2000) {
    console.error("⚠️ Preventing rapid redirect loop!");
    return;
  }
  window.lastRedirectTime = now;
  window.location.href = url;
}

// Check authentication on page load
document.addEventListener("DOMContentLoaded", function() {
  try {
    console.log("🔍 Dashboard page loaded, checking authentication...");
    
    if (!isLoggedIn()) {
      console.log("❌ User not logged in, redirecting to login...");
      safeRedirect("index.html");
      return;
    }
    
    console.log("✅ User authenticated, initializing dashboard...");
    
    initializePersonA();
    
    // Listen for Firestore real-time updates
    document.addEventListener("firestoreUpdated", function(event) {
      console.log("📱 Firestore data updated - refreshing UI");
      try {
        loadEntries();
        loadBankData();
        updatePersonATotals();
      } catch (e) {
        console.error("❌ Error in firestoreUpdated handler:", e);
      }
    });
  } catch (error) {
    console.error("❌ CRITICAL ERROR during PersonA initialization:", error);
    console.error("Stack trace:", error.stack);
    alert("Fatal error: " + error.message + "\nCheck browser console for details.");
  }
});

function initializePersonA() {
  try {
    console.log("🔄 Initializing Firestore real-time sync...");
    initializeRealtimeSync(); // Set up Firestore listener NOW, not later
    
    console.log("Loading bank data...");
    loadBankData();
    console.log("Loading entries...");
    loadEntries();
    console.log("Updating totals...");
    updatePersonATotals();
    console.log("✅ PersonA initialization complete");
  } catch (error) {
    console.error("❌ Error in initializePersonA:", error);
  }
}

// ============================================
// BANK MANAGEMENT
// ============================================

function loadBankData() {
  const bank = getBankData("A");
  document.getElementById("personA_bank1").value = bank.bank1 || 0;
  const bank2Elem = document.getElementById("personA_bank2");
  if (bank2Elem) {
    bank2Elem.value = bank.bank2 || 0;
  }
  updatePersonABankTotal();
  
  // Add real-time event listener for bank updates
  document.getElementById("personA_bank1").addEventListener("input", updatePersonABankTotal);
  if (bank2Elem) {
    bank2Elem.addEventListener("input", updatePersonABankTotal);
  }
}

function updatePersonABankTotal() {
  const bank1 = parseFloat(document.getElementById("personA_bank1").value) || 0;
  const bank2Elem = document.getElementById("personA_bank2");
  const bank2 = bank2Elem ? (parseFloat(bank2Elem.value) || 0) : 0;
  const total = bank1 + bank2;
  document.getElementById("personA_bankTotal").textContent = total.toFixed(2);
}

function updatePersonABank() {
  const bank1 = parseFloat(document.getElementById("personA_bank1").value) || 0;
  const bank2Elem = document.getElementById("personA_bank2");
  const bank2 = bank2Elem ? (parseFloat(bank2Elem.value) || 0) : 0;
  saveBankData("A", bank1, bank2);
  updatePersonABankTotal();
  alert("Banks updated for Person A!");
}

// ============================================
// ADD ENTRY
// ============================================

function addPersonAEntry() {
  const tbody = document.getElementById("personABody");
  const rowIndex = tbody.children.length;

  const row = document.createElement("tr");
  row.dataset.index = rowIndex;

  row.innerHTML = `
    <td><input type="date" class="date-input" value="${new Date().toISOString().split('T')[0]}"></td>
    <td><input type="number" class="added-input" min="0" placeholder="0"></td>
    <td><input type="number" class="used-input" min="0" placeholder="0"></td>
    <td><input type="number" class="savings-input" min="0" placeholder="0" readonly></td>
    <td><input type="number" class="balance-input" min="0" placeholder="0" readonly></td>
    <td><button onclick="deletePersonAEntry(${rowIndex})" class="delete-btn">❌</button></td>
  `;

  tbody.appendChild(row);

  // Auto-calculate savings and balance on input change
  const addedInput = row.querySelector(".added-input");
  const usedInput = row.querySelector(".used-input");
  const savingsInput = row.querySelector(".savings-input");
  const balanceInput = row.querySelector(".balance-input");

  addedInput.addEventListener("input", () => calculatePersonARowBalance(row));
  usedInput.addEventListener("input", () => calculatePersonARowBalance(row));

  // Trigger save on any input change
  row.addEventListener("input", () => savePersonAEntry(rowIndex));

  // Focus on date input
  row.querySelector(".date-input").focus();
}

// ============================================
// CALCULATE ROW BALANCE
// ============================================

function calculatePersonARowBalance(row) {
  const added = parseFloat(row.querySelector(".added-input").value) || 0;
  const used = parseFloat(row.querySelector(".used-input").value) || 0;
  const balance = added - used;

  row.querySelector(".balance-input").value = balance.toFixed(2);
}

// ============================================
// SAVE ENTRY (Updates Firestore)
// ============================================

function savePersonAEntry(index) {
  try {
    const tbody = document.getElementById("personABody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    
    // Find the row at this index
    const targetRow = rows[index];
    if (!targetRow) {
      console.warn(`❌ Row ${index} not found`);
      return;
    }

    const entry = {
      date: targetRow.querySelector(".date-input").value,
      added: parseFloat(targetRow.querySelector(".added-input").value) || 0,
      used: parseFloat(targetRow.querySelector(".used-input").value) || 0,
      savings: parseFloat(targetRow.querySelector(".savings-input").value) || 0,
      balance: parseFloat(targetRow.querySelector(".balance-input").value) || 0
    };

    // Get current entries for Person A
    const entries = getEntries("A");
    
    // Update or add the entry
    if (index < entries.length) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }
    
    // Save to Firestore
    return saveEntries("A", entries)
      .then(() => {
        console.log(`✅ Entry ${index} saved for Person A`);
      })
      .catch((error) => {
        console.error(`❌ Failed to save entry ${index}:`, error);
      });
  } catch (error) {
    console.error("❌ Error in savePersonAEntry:", error);
  }
}

// ============================================
// DELETE ENTRY
// ============================================

function deletePersonAEntry(index) {
  if (confirm("Are you sure you want to delete this entry?")) {
    const entries = getEntries("A");
    entries.splice(index, 1);
    saveEntries("A", entries)
      .then(() => {
        console.log("✅ Entry deleted");
        loadEntries();
        updatePersonATotals();
      })
      .catch((error) => {
        console.error("❌ Failed to delete entry:", error);
      });
  }
}

// ============================================
// LOAD ALL ENTRIES (BOTH PERSON A & B)
// ============================================

function loadEntries() {
  const tbody = document.getElementById("personABody");
  tbody.innerHTML = "";

  // Get entries from both Person A and B
  const entriesA = getEntries("A");
  const entriesB = getEntries("B");
  
  // Combine and add person identifier
  const allEntries = [
    ...entriesA.map((e, i) => ({...e, person: "Tejaswini", personId: "A", originalIndex: i})),
    ...entriesB.map((e, i) => ({...e, person: "Tarun", personId: "B", originalIndex: i}))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
  
  allEntries.forEach((entry, displayIndex) => {
    const row = document.createElement("tr");
    row.dataset.person = entry.personId;
    row.dataset.index = entry.originalIndex;

    row.innerHTML = `
      <td><strong>${entry.person === "Tejaswini" ? "A" : "B"}</strong></td>
      <td><input type="date" class="date-input" value="${entry.date || ''}"></td>
      <td><input type="number" class="added-input" min="0" value="${entry.added || 0}"></td>
      <td><input type="number" class="used-input" min="0" value="${entry.used || 0}"></td>
      <td><input type="number" class="savings-input" min="0" value="${entry.savings || 0}" readonly></td>
      <td><input type="number" class="balance-input" min="0" value="${entry.balance || 0}" readonly></td>
      <td><button onclick="deletePersonBEntry('${entry.personId}', ${entry.originalIndex})" class="delete-btn">❌</button></td>
    `;

    tbody.appendChild(row);

    // Add event listeners
    const addedInput = row.querySelector(".added-input");
    const usedInput = row.querySelector(".used-input");

    addedInput.addEventListener("input", () => {
      calculatePersonARowBalance(row);
      updatePersonAEntryOnOtherPerson(entry.personId, entry.originalIndex);
    });
    usedInput.addEventListener("input", () => {
      calculatePersonARowBalance(row);
      updatePersonAEntryOnOtherPerson(entry.personId, entry.originalIndex);
    });

    row.querySelector(".date-input").addEventListener("input", () => {
      updatePersonAEntryOnOtherPerson(entry.personId, entry.originalIndex);
    });
  });
}

// ============================================
// UPDATE ENTRY (works for both Person A and B)
// ============================================

function updatePersonAEntryOnOtherPerson(personId, index) {
  try {
    const tbody = document.getElementById("personABody");
    const rows = Array.from(tbody.querySelectorAll(`tr[data-person="${personId}"]`));
    
    // Find the row with matching index
    const targetRow = rows.find(row => parseInt(row.dataset.index) === index);
    if (!targetRow) {
      console.warn(`❌ Row for ${personId}[${index}] not found`);
      return;
    }

    const entry = {
      date: targetRow.querySelector(".date-input").value,
      added: parseFloat(targetRow.querySelector(".added-input").value) || 0,
      used: parseFloat(targetRow.querySelector(".used-input").value) || 0,
      savings: parseFloat(targetRow.querySelector(".savings-input").value) || 0,
      balance: parseFloat(targetRow.querySelector(".balance-input").value) || 0
    };

    // Get current entries for the person
    const entries = getEntries(personId);
    entries[index] = entry;
    
    // Save to Firestore
    saveEntries(personId, entries)
      .then(() => {
        console.log(`✅ Entry updated for Person ${personId}[${index}]`);
      })
      .catch((error) => {
        console.error(`❌ Failed to update entry for Person ${personId}[${index}]:`, error);
      });
  } catch (error) {
    console.error("❌ Error in updatePersonAEntryOnOtherPerson:", error);
  }
}

// Note: deletePersonBEntry is defined in personB.js
// This file handles rendering both Person A and B entries in the shared table

// ============================================
// UPDATE TOTALS
// ============================================

function updatePersonATotals() {
  // Only use Person A entries for Person A totals
  const entriesA = getEntries("A");
  const bankData = getBankData("A");
  const startingBank = bankData.bank1 + bankData.bank2;

  let totalAdded = 0;
  let totalUsed = 0;

  entriesA.forEach(entry => {
    totalAdded += entry.added || 0;
    totalUsed += entry.used || 0;
  });

  // Bank Balance = Starting Bank + Total Added - Total Used (for Person A only)
  const bankBalance = startingBank + totalAdded - totalUsed;

  document.getElementById("personA_totalAdded").textContent = totalAdded.toFixed(2);
  document.getElementById("personA_totalUsed").textContent = totalUsed.toFixed(2);
  document.getElementById("personA_totalSavings").textContent = getTotalSavings().toFixed(2);
  document.getElementById("personA_balance").textContent = bankBalance.toFixed(2);
}

// ============================================
// LOGOUT
// ============================================

function logoutUser() {
  if (confirm("Are you sure you want to logout?")) {
    logout();
    window.location.href = "index.html";
  }
}
