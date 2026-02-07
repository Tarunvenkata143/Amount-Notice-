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

function savePersonAEntry(index) {
  const tbody = document.getElementById("personABody");
  const rows = tbody.querySelectorAll("tr");

  if (index < rows.length) {
    const row = rows[index];
    const entry = {
      date: row.querySelector(".date-input").value,
      added: parseFloat(row.querySelector(".added-input").value) || 0,
      used: parseFloat(row.querySelector(".used-input").value) || 0,
      savings: parseFloat(row.querySelector(".savings-input").value) || 0,
      balance: parseFloat(row.querySelector(".balance-input").value) || 0
    };

    const entries = getEntries("A");
    entries[index] = entry;
    saveEntries("A", entries);
    updatePersonATotals();
  }
}

// ============================================
// DELETE ENTRY
// ============================================

function deletePersonAEntry(index) {
  if (confirm("Are you sure you want to delete this entry?")) {
    deleteEntry("A", index);
    loadEntries();
    updatePersonATotals();
  }
}

// ============================================
// LOAD ALL ENTRIES
// ============================================

function loadEntries() {
  const tbody = document.getElementById("personABody");
  tbody.innerHTML = "";

  const entries = getEntries("A");
  
  entries.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.dataset.index = index;

    row.innerHTML = `
      <td><input type="date" class="date-input" value="${entry.date || ''}"></td>
      <td><input type="number" class="added-input" min="0" value="${entry.added || 0}"></td>
      <td><input type="number" class="used-input" min="0" value="${entry.used || 0}"></td>
      <td><input type="number" class="savings-input" min="0" value="${entry.savings || 0}" readonly></td>
      <td><input type="number" class="balance-input" min="0" value="${entry.balance || 0}" readonly></td>
      <td><button onclick="deletePersonAEntry(${index})" class="delete-btn">❌</button></td>
    `;

    tbody.appendChild(row);

    // Add event listeners
    const addedInput = row.querySelector(".added-input");
    const usedInput = row.querySelector(".used-input");

    addedInput.addEventListener("input", () => {
      calculatePersonARowBalance(row);
      savePersonAEntry(index);
    });
    usedInput.addEventListener("input", () => {
      calculatePersonARowBalance(row);
      savePersonAEntry(index);
    });

    row.querySelector(".date-input").addEventListener("input", () => savePersonAEntry(index));
  });
}

// ============================================
// UPDATE TOTALS
// ============================================

function updatePersonATotals() {
  const entries = getEntries("A");

  const bankData = getBankData("A");
  const startingBank = bankData.bank1 + bankData.bank2;

  let totalAdded = 0;
  let totalUsed = 0;

  entries.forEach(entry => {
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