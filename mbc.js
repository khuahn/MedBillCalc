// mbc.js — MedBillCalc core
// - Robust login with normalization and cache-safe behavior
// - Calculator logic with manual balance override
// - Theme handling safe across pages

(() => {
  "use strict";

  // ========= Utilities =========
  // Normalize strings: trim, NFKC, and strip invisible chars
  function normalizeInput(s) {
    return (s || "")
      .normalize("NFKC")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim();
  }

  // Accept these passwords (current + fallback)
  const ALLOWED_PASSWORDS = [
    "M3d1c4l00!",
    "medcalc2025"
  ];

  function isPasswordValid(input) {
    const v = normalizeInput(input);
    return ALLOWED_PASSWORDS.includes(v);
  }

  // ========= Calculator =========
  function calculateTotals() {
    const rows = document.querySelectorAll("#billTable tbody tr");
    if (!rows.length) return; // Not on index page

    let totalTotal = 0, totalPayments = 0, totalAdjustments = 0, totalBalance = 0;

    rows.forEach(row => {
      const total = parseFloat(normalizeInput(row.querySelector(".total")?.value)) || 0;
      const payments = parseFloat(normalizeInput(row.querySelector(".payments")?.value)) || 0;
      const adjustments = parseFloat(normalizeInput(row.querySelector(".adjustments")?.value)) || 0;
      const balanceInput = row.querySelector(".balance-input");
      const computed = total - payments - adjustments;

      // Manual override: if user edited balance, use it; otherwise, auto-compute
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
      <td><input type="number" step="any" inputmode="decimal" class="total" oninput="calculateTotals()"></td>
      <td><input type="number" step="any" inputmode="decimal" class="payments" oninput="calculateTotals()"></td>
      <td><input type="number" step="any" inputmode="decimal" class="adjustments" oninput="calculateTotals()"></td>
      <td><input type="number" step="any" inputmode="decimal" class="balance-input" value="0"></td>
    `;
    tbody.appendChild(tr);
    calculateTotals();
  }

  function clearTable() {
    const rows = document.querySelectorAll("#billTable tbody tr");
    if (!rows.length) return;
    rows.forEach(row => {
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
    if (!button) return; // Not on index page
    const icon = button.querySelector("i");
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    if (icon) icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
    button.innerHTML = `<i class="${isDark ? "fas fa-sun" : "fas fa-moon"}"></i> ${isDark ? "Light Mode" : "Dark Mode"}`;
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

  function initBillTable() {
    const tbody = document.querySelector("#billTable tbody");
    if (!tbody) return; // Not on index page

    // Mark balance as manually edited
    tbody.addEventListener("input", e => {
      if (e.target.classList.contains("balance-input")) {
        e.target.dataset.manual = "true";
        calculateTotals();
      }
    });

    // Initial compute
    calculateTotals();
  }

  // ========= Login =========
  function initLogin() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return; // Not on login page

    const pwd = document.getElementById("password");
    const errorMsg = document.getElementById("errorMsg");
    const togglePwd = document.getElementById("togglePwd");

    // Show/Hide password toggle if present
    if (togglePwd && pwd) {
      togglePwd.addEventListener("click", () => {
        const isPwd = pwd.type === "password";
        pwd.type = isPwd ? "text" : "password";
        togglePwd.innerHTML = `<i class="fas ${isPwd ? "fa-eye-slash" : "fa-eye"}"></i>`;
        togglePwd.setAttribute("aria-label", isPwd ? "Hide password" : "Show password");
        pwd.focus();
      });
    }

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

  // ========= Init (safe on both pages) =========
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initBillTable();
    initLogin();
  });

  // Expose functions used by inline HTML attributes
  window.calculateTotals = calculateTotals;
  window.addRow = addRow;
  window.clearTable = clearTable;
  window.printPDF = printPDF;
  window.toggleDarkMode = toggleDarkMode;
})();
