/* This code is for educational purposes ONLY. It is NOT secure. */
(() => {
  "use strict";

  const ALLOWED_PASSWORD = "M3d1c4l00!";

  function normalizeInput(s) {
    return (s || "").normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  }

  function calculateTotals() {
    const rows = document.querySelectorAll("#tableBody tr");
    let totalCharges = 0,
      totalPayments = 0,
      totalAdjustments = 0,
      totalBalance = 0;

    rows.forEach((row) => {
      const chargesInput = row.querySelector(".charges-input");
      const paymentsInput = row.querySelector(".payments-input");
      const adjustmentsInput = row.querySelector(".adjustments-input");
      const balanceInput = row.querySelector(".balance-input");

      const charges = parseFloat(normalizeInput(chargesInput.value)) || 0;
      const payments = parseFloat(normalizeInput(paymentsInput.value)) || 0;
      const adjustments = parseFloat(normalizeInput(adjustmentsInput.value)) || 0;

      // Autocalculate balance if conditions are met
      if (charges > 0 && (payments > 0 || adjustments > 0)) {
        const calculatedBalance = charges - payments - adjustments;
        balanceInput.value = calculatedBalance.toFixed(2);
        balanceInput.dataset.manual = "false";
      }

      // Summing up for the final totals
      totalCharges += charges;
      totalPayments += payments;
      totalAdjustments += payments;
      totalBalance += parseFloat(normalizeInput(balanceInput.value)) || 0;
    });

    // Update summary section
    const update = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val.toFixed(2);
    };

    update("totalCharges", totalCharges);
    update("totalPayments", totalPayments);
    update("totalAdjustments", totalAdjustments);
    update("totalBalance", totalBalance);
    // "Total Incurred" is the sum of all payments and balances
    update("incurredTotal", totalPayments + totalBalance);
  }

  function addRow() {
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="number" step="any" class="charges-input"></td>
      <td><input type="number" step="any" class="payments-input"></td>
      <td><input type="number" step="any" class="adjustments-input"></td>
      <td><input type="number" step="any" class="balance-input"></td>
    `;
    tbody.appendChild(tr);
  }

  function clearTable() {
    const tbody = document.getElementById("tableBody");
    if (tbody) {
      tbody.innerHTML = "";
      for (let i = 0; i < 10; i++) addRow();
      calculateTotals();
    }
  }

  function printPDF() {
    window.print();
  }

  function toggleDarkMode() {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeToggleUI(isDark);
  }

  function updateThemeToggleUI(isDark) {
    const btn = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');
    if (label) label.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    if (icon) {
      icon.classList.toggle('fa-moon', !isDark);
      icon.classList.toggle('fa-sun', isDark);
    }
    if (btn) btn.setAttribute('aria-pressed', String(isDark));
  }

  function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.body.classList.add("dark-mode");
      updateThemeToggleUI(true);
    } else {
      updateThemeToggleUI(false);
    }
  }

  function initLogin() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    const pwd = document.getElementById("password");
    const errorMsg = document.getElementById("errorMsg");
    const toggleBtn = document.getElementById("togglePwd");

    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const input = pwd ? pwd.value : "";
      if (ALLOWED_PASSWORD === normalizeInput(input)) {
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

    if (toggleBtn && pwd) {
      toggleBtn.addEventListener("click", () => {
        const isHidden = pwd.type === "password";
        pwd.type = isHidden ? "text" : "password";
        const eyeIcon = toggleBtn.querySelector("i");
        if (eyeIcon) {
          eyeIcon.classList.toggle("fa-eye");
          eyeIcon.classList.toggle("fa-eye-slash");
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initLogin();

    const addRowBtn = document.getElementById("addRowBtn");
    const clearTableBtn = document.getElementById("clearTableBtn");
    const printPDFBtn = document.getElementById("printPDFBtn");
    const themeToggle = document.getElementById("themeToggle");
    const tbody = document.getElementById("tableBody");

    if (addRowBtn) addRowBtn.addEventListener("click", addRow);
    if (clearTableBtn) clearTableBtn.addEventListener("click", clearTable);
    if (printPDFBtn) printPDFBtn.addEventListener("click", printPDF);
    if (themeToggle) themeToggle.addEventListener("click", toggleDarkMode);
    
    if (tbody) {
      for (let i = 0; i < 10; i++) addRow();

      tbody.addEventListener("input", (e) => {
        // Only run calculations on input from specific fields
        if (e.target.classList.contains("charges-input") || 
            e.target.classList.contains("payments-input") || 
            e.target.classList.contains("adjustments-input")) {
          const row = e.target.closest('tr');
          const charges = parseFloat(normalizeInput(row.querySelector(".charges-input").value)) || 0;
          const payments = parseFloat(normalizeInput(row.querySelector(".payments-input").value)) || 0;
          const adjustments = parseFloat(normalizeInput(row.querySelector(".adjustments-input").value)) || 0;
          const balanceInput = row.querySelector(".balance-input");

          // Autocalculate based on requested conditions
          if (charges > 0 && (payments > 0 || adjustments > 0)) {
            const calculatedBalance = charges - payments - adjustments;
            balanceInput.value = calculatedBalance.toFixed(2);
            balanceInput.dataset.manual = "false";
          }
        }
        calculateTotals();
      });
      calculateTotals();
    }
  });

})();
