// mbc.js — Final version for MedBillCalc
(() => {
  "use strict";

  // Normalize input safely
  function normalizeInput(s) {
    return (s || "").normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  }

  // Passwords allowed
  const ALLOWED_PASSWORDS = ["M3d1c4l00!", "medcalc2025"];

  function isPasswordValid(input) {
    return ALLOWED_PASSWORDS.includes(normalizeInput(input));
  }

  // Calculator logic
  function calculateTotals() {
    const rows = document.querySelectorAll("#billTable tbody tr");
    let totalTotal = 0, totalPayments = 0, totalAdjustments = 0, totalBalance = 0;

    rows.forEach(row => {
      const total = parseFloat(normalizeInput(row.querySelector(".total")?.value)) || 0;
      const payments = parseFloat(normalizeInput(row.querySelector(".payments")?.value)) || 0;
      const adjustments = parseFloat(normalizeInput(row.querySelector(".adjustments")?.value)) || 0;
      const balanceInput = row.querySelector(".balance-input");
      const computed = total - payments - adjustments;

      if (balanceInput) {
        const manualVal = parseFloat(normalizeInput(balanceInput.value));
        if (balanceInput.dataset.manual === "true" && !isNaN(manualVal)) {
          totalBalance += manualVal;
        } else {
          balanceInput.value = computed.toFixed(2);
          balanceInput.dataset.manual = "";
          totalBalance += computed;
        }
      }

      totalTotal += total;
      totalPayments += payments;
      totalAdjustments += adjustments;
    });

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val.toFixed(2);
    };

    setText("totalTotal", totalTotal);
    setText("totalPayments", totalPayments);
    setText("totalAdjustments", totalAdjustments);
    setText("totalBalance", totalBalance);

    const incurredEl = document.getElementById("incurredTotal");
    if (incurredEl) incurredEl.textContent = totalTotal.toFixed(2);
  }

  function addRow() {
    const tbody = document.querySelector("#billTable tbody");
    if (!tbody) return;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="number" step="any" class="total" oninput="calculateTotals()"></td>
      <td><input type="number" step="any" class="payments" oninput="calculateTotals()"></td>
      <td><input type="number" step="any" class="adjustments" oninput="calculateTotals()"></td>
      <td><input type="number" step="any" class="balance-input" value="0"></td>
    `;
    tbody.appendChild(tr);
  }

  function clearTable() {
    document.querySelectorAll("#billTable tbody tr").forEach(row => {
      row.querySelectorAll("input").forEach(input => {
        input.value = "";
        if (input.classList.contains("balance-input")) {
          input.dataset.manual = "";
        }
      });
    });
    calculateTotals();
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
  }

  // Init everything
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initLogin();
    const tbody = document.querySelector("#billTable tbody");
    if (tbody) {
      tbody.addEventListener("input", e => {
        if (e.target.classList.contains("balance-input")) {
          e.target.dataset.manual = "true";
        }
        calculateTotals();
      });
    }
  });

  // Expose functions globally
  window.calculateTotals = calculateTotals;
  window.addRow = addRow;
  window.clearTable = clearTable;
  window.printPDF = printPDF;
  window.toggleDarkMode = toggleDarkMode;
})();
