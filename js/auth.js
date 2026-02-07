// const PASSCODE = "1234";

// function login() {
//   const input = document.getElementById("passcode").value;

//   if (input === PASSCODE) {
//     window.location.href = "dashboard.html";
//   } else {
//     alert("Wrong passcode");
//   }
// }


// ===== COMMON PASSCODE =====
// Change this to your desired passcode
const COMMON_PASSCODE = "2026";

function login() {
  const enteredPasscode = document.getElementById("passcode").value;

  if (enteredPasscode === COMMON_PASSCODE) {
    console.log("✅ Passcode correct! Saving login...");
    setLoggedIn();  // This calls setLoggedIn(true)
    console.log("✅ Login saved, redirecting to dashboard...");
    window.location.href = "dashboard.html";
  } else {
    alert("Wrong passcode! Access denied.");
  }
}

// Prevent direct access to dashboard if not logged in
if (document.currentScript && document.currentScript.src.includes("auth.js")) {
  // This check runs only on login page
}
