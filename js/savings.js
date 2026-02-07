// ============================================
// SAVINGS - Common Savings Management
// Savings Options: ₹20, ₹30, Holiday (₹0)
// ============================================

const SAVINGS_OPTIONS = {
  "₹20": 20,
  "₹30": 30,
  "Holiday": 0
};

// Initialize savings on page load
document.addEventListener("DOMContentLoaded", function() {
  if (!isLoggedIn()) {
    window.location.href = "index.html";
    return;
  }
  
  loadSavingsEntries();
  updateSavingsTotal();
  updateSavingsInEntries();
});

// ============================================
// ADD SAVINGS ENTRY
// ============================================

function addSavingsEntry() {
  const tbody = document.getElementById("savingsBody");
  const rowIndex = tbody.children.length;

  const row = document.createElement("tr");
  row.dataset.index = rowIndex;

  row.innerHTML = `
    <td><input type="date" class="savings-date" value="${new Date().toISOString().split('T')[0]}"></td>
    <td>
      <select class="savings-type">
        <option value="₹20">₹20</option>
        <option value="₹30">₹30</option>
        <option value="Holiday">Holiday (₹0)</option>
      </select>
    </td>
    <td><input type="number" class="savings-amount" min="0" placeholder="0" readonly></td>
    <td><button onclick="deleteSavingsEntry(${rowIndex})" class="delete-btn">❌</button></td>
  `;

  tbody.appendChild(row);

  // Set initial amount based on selected type
  const typeSelect = row.querySelector(".savings-type");
  const amountInput = row.querySelector(".savings-amount");
  
  const initialType = typeSelect.value;
  amountInput.value = SAVINGS_OPTIONS[initialType];

  // Update amount when type changes
  typeSelect.addEventListener("change", () => {
    const selectedType = typeSelect.value;
    amountInput.value = SAVINGS_OPTIONS[selectedType];
    saveSavingsEntry(rowIndex);
  });

  // Save on date change
  row.querySelector(".savings-date").addEventListener("input", () => {
    saveSavingsEntry(rowIndex);
  });

  // Save this entry
  saveSavingsEntry(rowIndex);

  // Update savings amount in person tables
  updateSavingsInEntries();

  // Focus on date input
  row.querySelector(".savings-date").focus();
}

// ============================================
// SAVE SAVINGS ENTRY
// ============================================

function saveSavingsEntry(index) {
  const tbody = document.getElementById("savingsBody");
  const rows = tbody.querySelectorAll("tr");

  if (index < rows.length) {
    const row = rows[index];
    const saving = {
      date: row.querySelector(".savings-date").value,
      type: row.querySelector(".savings-type").value,
      amount: parseFloat(row.querySelector(".savings-amount").value) || 0
    };

    const savings = getSavings();
    savings[index] = saving;
    saveSavings(savings);
    updateSavingsTotal();
  }
}

// ============================================
// DELETE SAVINGS ENTRY
// ============================================

function deleteSavingsEntry(index) {
  if (confirm("Are you sure you want to delete this saving entry?")) {
    deleteSaving(index);
    loadSavingsEntries();
    updateSavingsTotal();
    updateSavingsInEntries();
  }
}

// ============================================
// LOAD ALL SAVINGS ENTRIES
// ============================================

function loadSavingsEntries() {
  const tbody = document.getElementById("savingsBody");
  tbody.innerHTML = "";

  const savings = getSavings();

  savings.forEach((saving, index) => {
    const row = document.createElement("tr");
    row.dataset.index = index;

    row.innerHTML = `
      <td><input type="date" class="savings-date" value="${saving.date || ''}"></td>
      <td>
        <select class="savings-type">
          <option value="₹20" ${saving.type === "₹20" ? "selected" : ""}>₹20</option>
          <option value="₹30" ${saving.type === "₹30" ? "selected" : ""}>₹30</option>
          <option value="Holiday" ${saving.type === "Holiday" ? "selected" : ""}>Holiday (₹0)</option>
        </select>
      </td>
      <td><input type="number" class="savings-amount" min="0" value="${saving.amount || 0}" readonly></td>
      <td><button onclick="deleteSavingsEntry(${index})" class="delete-btn">❌</button></td>
    `;

    tbody.appendChild(row);

    // Add event listeners
    const typeSelect = row.querySelector(".savings-type");
    const amountInput = row.querySelector(".savings-amount");

    typeSelect.addEventListener("change", () => {
      const selectedType = typeSelect.value;
      amountInput.value = SAVINGS_OPTIONS[selectedType];
      saveSavingsEntry(index);
      updateSavingsInEntries();
    });

    row.querySelector(".savings-date").addEventListener("input", () => {
      saveSavingsEntry(index);
    });
  });
}

// ============================================
// UPDATE TOTAL SAVINGS
// ============================================

function updateSavingsTotal() {
  const savings = getSavings();
  let totalSavings = 0;

  savings.forEach(saving => {
    totalSavings += saving.amount || 0;
  });

  document.getElementById("total_savings_amount").textContent = totalSavings.toFixed(2);
}

// ============================================
// UPDATE SAVINGS IN PERSON ENTRIES
// NOTE: Savings column in person tables is NOT USED
// Daily Savings are completely separate from bank balance
// This tracking is just for SIP (Systematic Investment Plan) only
// ============================================

function updateSavingsInEntries() {
  // Savings are completely independent from bank balance
  // Daily Savings do NOT affect bank balance
  // They are tracked separately for SIP purposes only
  console.log("Daily Savings tracked separately - not linked to bank balance");
}