// ============================================
// SUMMARY - Monthly Summary & Calculations
// ============================================

// Initialize summary on page load
document.addEventListener("DOMContentLoaded", function() {
  if (!isLoggedIn()) {
    window.location.href = "index.html";
    return;
  }

  // Set the month selector to current month
  const today = new Date();
  const monthStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0");
  document.getElementById("summaryMonth").value = monthStr;

  // Calculate initial summary
  updateMonthlySummary();
});

// ============================================
// UPDATE MONTHLY SUMMARY
// ============================================

function updateMonthlySummary() {
  const monthInput = document.getElementById("summaryMonth").value;

  if (!monthInput) {
    alert("Please select a month");
    return;
  }

  const [year, month] = monthInput.split("-").map(Number);

  // Get monthly data for both persons
  const personAEntries = getMonthlyData("A", month, year);
  const personBEntries = getMonthlyData("B", month, year);

  // Starting banks for each person
  const bankA = getBankData("A");
  const bankB = getBankData("B");
  const startingBankA = (bankA.bank1 || 0) + (bankA.bank2 || 0);
  const startingBankB = (bankB.bank1 || 0) + (bankB.bank2 || 0);

  // Calculate Person A totals
  const personA_totalAdded = personAEntries.reduce((sum, e) => sum + (e.added || 0), 0);
  const personA_totalUsed = personAEntries.reduce((sum, e) => sum + (e.used || 0), 0);
  const personA_totalSavings = personAEntries.reduce((sum, e) => sum + (e.savings || 0), 0);
  // Include starting bank in monthly balance
  const personA_balance = startingBankA + personA_totalAdded - personA_totalUsed;

  // Calculate Person B totals
  const personB_totalAdded = personBEntries.reduce((sum, e) => sum + (e.added || 0), 0);
  const personB_totalUsed = personBEntries.reduce((sum, e) => sum + (e.used || 0), 0);
  const personB_totalSavings = personBEntries.reduce((sum, e) => sum + (e.savings || 0), 0);
  // Include starting bank in monthly balance
  const personB_balance = startingBankB + personB_totalAdded - personB_totalUsed;

  // Calculate combined totals (include both starting banks)
  const totalAdded = personA_totalAdded + personB_totalAdded;
  const totalUsed = personA_totalUsed + personB_totalUsed;
  const commonSavings = getTotalSavings(); // All savings
  const finalBalance = (startingBankA + startingBankB) + totalAdded - totalUsed;

  // Update Person A Summary
  document.getElementById("summaryA_added").textContent = personA_totalAdded.toFixed(2);
  document.getElementById("summaryA_used").textContent = personA_totalUsed.toFixed(2);
  document.getElementById("summaryA_savings").textContent = personA_totalSavings.toFixed(2);
  document.getElementById("summaryA_balance").textContent = personA_balance.toFixed(2);

  // Update Person B Summary
  document.getElementById("summaryB_added").textContent = personB_totalAdded.toFixed(2);
  document.getElementById("summaryB_used").textContent = personB_totalUsed.toFixed(2);
  document.getElementById("summaryB_savings").textContent = personB_totalSavings.toFixed(2);
  document.getElementById("summaryB_balance").textContent = personB_balance.toFixed(2);

  // Update Combined Summary
  document.getElementById("summary_totalAdded").textContent = totalAdded.toFixed(2);
  document.getElementById("summary_totalUsed").textContent = totalUsed.toFixed(2);
  document.getElementById("summary_savings").textContent = commonSavings.toFixed(2);
  document.getElementById("summary_finalBalance").textContent = finalBalance.toFixed(2);
}

// ============================================
// UTILITY: Get data for a specific month
// ============================================

function getMonthlyData(person, month, year) {
  const entries = getEntries(person);
  return entries.filter(e => {
    if (!e.date) return false;
    const [y, m] = e.date.split("-").map(Number);
    return y === year && m === month;
  });
}