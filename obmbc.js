/* v1.8-jac */
(() => {
  "use strict";

  function normalizeInput(s) {
    return (s || "").normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  }

  function calculateTotals() {
    const rows = document.querySelectorAll("#tableBody tr");
    let totalTotal = 0,
      totalPayments = 0,
      totalAdjustments = 0,
      totalBalance = 0;

    rows.forEach((row) => {
      const totalInput = row.querySelector(".total");
      const payments = parseFloat(normalizeInput(row.querySelector(".payments")?.value)) || 0;
      const adjustments = parseFloat(normalizeInput(row.querySelector(".adjustments")?.value)) || 0;
      const balance = parseFloat(normalizeInput(row.querySelector(".balance-input")?.value)) || 0;

      // New logic: Total Incurred = Payments + Balance
      const totalIncurred = payments + balance;
      if (totalInput) {
        totalInput.value = totalIncurred.toFixed(2);
      }

      // Sum up all the new totals for the summary fields
      totalTotal += totalIncurred;
      totalPayments += payments;
      totalAdjustments += adjustments;
      totalBalance += balance;
    });

    const update = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val.toFixed(2);
    };

    update("totalTotal", totalTotal);
    update("totalPayments", totalPayments);
    update("totalAdjustments", totalAdjustments);
    update("totalBalance", totalBalance);
    update("incurredTotal", totalTotal);
  }

  function addRow() {
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="number" step="any" class="total" readonly></td>
      <td><input type="number" step="any" class="payments" oninput="calculateTotals()"></td>
      <td><input type="number" step="any" class="adjustments" oninput="calculateTotals()"></td>
      <td><input type="number" step="any" class="balance-input" oninput="calculateTotals()" value="0"></td>
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
    const button = document.getElementById("themeToggle");
    const icon = button?.querySelector("i");
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    if (button) {
      button.innerHTML = `<i class="${isDark ? "fas fa-sun" : "fas fa-moon"}"></i> ${isDark ? "Light Mode" : "Dark Mode"}`;
    }
  }

  function initTheme() {
    const saved = localStorage.getItem("theme");
    const button = document.getElementById("themeToggle");
    if (saved === "dark") {
      document.body.classList.add("dark-mode");
      if (button) button.innerHTML = `<i class="fas fa-sun"></i> Light Mode`;
    } else {
      if (button) button.innerHTML = `<i class="fas fa-moon"></i> Dark Mode`;
    }
  }
  
  function initLogin() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    const pwd = document.getElementById("password");
    const errorMsg = document.getElementById("errorMsg");
    const toggleBtn = document.getElementById("togglePwd");
    const eyeIcon = toggleBtn?.querySelector("i");
    const ALLOWED_PASSWORD = "M3d1c4l00!";

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

    const addRowBtn = document.getElementById("addRowBtn");
    const clearTableBtn = document.getElementById("clearTableBtn");
    const printPDFBtn = document.getElementById("printPDFBtn");
    const themeToggle = document.getElementById("themeToggle");

    if (addRowBtn) addRowBtn.addEventListener("click", addRow);
    if (clearTableBtn) clearTableBtn.addEventListener("click", clearTable);
    if (printPDFBtn) printPDFBtn.addEventListener("click", printPDF);
    if (themeToggle) themeToggle.addEventListener("click", toggleDarkMode);

    const tbody = document.getElementById("tableBody");
    if (tbody) {
      for (let i = 0; i < 10; i++) addRow();

      tbody.addEventListener("input", (e) => {
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
