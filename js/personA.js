// ============================================
// PERSON A - Daily Expense Management
// ============================================

// Check authentication on page load
document.addEventListener("DOMContentLoaded", function() {
  if (!isLoggedIn()) {
    window.location.href = "index.html";
    return;
  }
  
  initializePersonA();
});

function initializePersonA() {
  loadBankData();
  loadEntries();
  updatePersonATotals();
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
// SAVE ENTRY
// ============================================

function savePersonAEntry(person, index) {
  const personLetter = typeof person === "string" ? person : "A";
  const tbody = document.getElementById("personABody");
  const rows = tbody.querySelectorAll(`tr[data-person="${personLetter}"]`);

  // Find the row with matching index
  let targetRow = null;
  rows.forEach(row => {
    if (row.dataset.index === String(index)) {
      targetRow = row;
    }
  });

  if (targetRow) {
    const entry = {
      date: targetRow.querySelector(".date-input").value,
      added: parseFloat(targetRow.querySelector(".added-input").value) || 0,
      used: parseFloat(targetRow.querySelector(".used-input").value) || 0,
      savings: parseFloat(targetRow.querySelector(".savings-input").value) || 0,
      balance: parseFloat(targetRow.querySelector(".balance-input").value) || 0
    };

    const entries = getEntries(personLetter);
    entries[index] = entry;
    saveEntries(personLetter, entries);
    updatePersonATotals();
  }
}

// ============================================
// DELETE ENTRY
// ============================================

function deletePersonAEntry(person, index) {
  if (confirm("Are you sure you want to delete this entry?")) {
    deleteEntry(person, index);
    loadEntries();
    updatePersonATotals();
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
      <td><button onclick="deletePersonAEntry('${entry.personId}', ${entry.originalIndex})" class="delete-btn">❌</button></td>
    `;

    tbody.appendChild(row);

    // Add event listeners
    const addedInput = row.querySelector(".added-input");
    const usedInput = row.querySelector(".used-input");

    addedInput.addEventListener("input", () => {
      calculatePersonARowBalance(row);
      savePersonAEntry(entry.personId, entry.originalIndex);
    });
    usedInput.addEventListener("input", () => {
      calculatePersonARowBalance(row);
      savePersonAEntry(entry.personId, entry.originalIndex);
    });

    row.querySelector(".date-input").addEventListener("input", () => {
      savePersonAEntry(entry.personId, entry.originalIndex);
    });
  });
}

// ============================================
// UPDATE TOTALS
// ============================================

function updatePersonATotals() {
  // Get entries from BOTH Person A and B
  const entriesA = getEntries("A");
  const entriesB = getEntries("B");
  const allEntries = [...entriesA, ...entriesB];
  
  const bankData = getBankData("A");
  const startingBank = bankData.bank1 + bankData.bank2;

  let totalAdded = 0;
  let totalUsed = 0;

  allEntries.forEach(entry => {
    totalAdded += entry.added || 0;
    totalUsed += entry.used || 0;
  });

  // Bank Balance = Starting Bank + Total Added - Total Used
  const bankBalance = startingBank + totalAdded - totalUsed;

  document.getElementById("personA_totalAdded").textContent = totalAdded.toFixed(2);
  document.getElementById("personA_totalUsed").textContent = totalUsed.toFixed(2);
  document.getElementById("personA_totalSavings").textContent = "0.00";
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