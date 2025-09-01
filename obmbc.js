/* This code is for educational purposes ONLY. It is NOT secure. */
(() => {
  "use strict";

  // The key must be hardcoded here, which is the main vulnerability.
  const ENCRYPTION_KEY = "YourSuperSecretKey123";

  // The password is now encrypted. This is the only "security" layer.
  // This encrypted value was generated from "M3d1c4l00!" using the key above.
  const ENCRYPTED_PASSWORD = "U2FsdGVkX1+vG0h+Y6rL2j9Q+5x8P1j/t3r/iF8kQoM=";

  // Function to decrypt the password
  function decryptPassword(encryptedText) {
    const bytes  = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  function normalizeInput(s) {
    return (s || "").normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  }

  function isPasswordValid(input) {
    const decryptedPassword = decryptPassword(ENCRYPTED_PASSWORD);
    return decryptedPassword === normalizeInput(input);
  }

  // Rest of your functions remain the same
  function calculateTotals() {
    const rows = document.querySelectorAll("#tableBody tr");
    // ... (rest of the code)
  }

  // ... (all other functions: addRow, clearTable, printPDF, etc.)

  function initLogin() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    const pwd = document.getElementById("password");
    const errorMsg = document.getElementById("errorMsg");
    const toggleBtn = document.getElementById("togglePwd");
    const eyeIcon = toggleBtn?.querySelector("i");

    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const input = pwd ? pwd.value : "";
      if (isPasswordValid(input)) {
        sessionStorage.setItem("loggedIn", "true");
        window.location.href = "index.html";
      } else {
        if (errorMsg) {
          errorMsg.textContent = "Incorrect password.";
          errorMsg.classList.add("shake");
          setTimeout(() => errorMsg.classList.remove("shake"), 300);
        }
      }
    });

    if (toggleBtn && pwd && eyeIcon) {
      toggleBtn.addEventListener("click", () => {
        const isHidden = pwd.type === "password";
        pwd.type = isHidden ? "text" : "password";
        eyeIcon.classList.toggle("fa-eye");
        eyeIcon.classList.toggle("fa-eye-slash");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initLogin();

    const tbody = document.getElementById("tableBody");
    if (tbody) {
      for (let i = 0; i < 10; i++) addRow();

      tbody.addEventListener("input", e => {
        if (e.target.classList.contains("balance-input")) {
          e.target.dataset.manual = "true";
        }
        calculateTotals();
      });

      calculateTotals();
    }
  });

  window.calculateTotals = calculateTotals;
  window.addRow = addRow;
  window.clearTable = clearTable;
  window.printPDF = printPDF;
  window.toggleDarkMode = toggleDarkMode;
})();
