/*
 * mbc.js - Medical Bill Calculator Core Functionality
 * Version 1.0 Stable
 * - Click-to-copy totals
 * - Balance auto-update with manual override
 * - Input placeholders
 * - Dark mode toggle
 * - Print-ready
 */

(() => {
  "use strict";

  const STORAGE_KEY = 'mbcData';
  const BALANCE_KEY = 'manualBalanceRows';

  function normalizeInput(s) {
    return (s || "").normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  }

  // Copy to clipboard with visual feedback
  function copyToClipboard(text, event) {
    navigator.clipboard.writeText(text).then(() => {
      const feedback = document.createElement('div');
      feedback.className = 'copied-feedback';
      feedback.textContent = 'Copied!';
      document.body.appendChild(feedback);
      feedback.style.top = (event.clientY - 30) + 'px';
      feedback.style.left = event.clientX + 'px';
      setTimeout(() => feedback.remove(), 1000);
    }).catch(err => console.error('Failed to copy: ', err));
  }

  // Calculate totals and update summary
  function calculateTotals() {
    const rows = document.querySelectorAll("#tableBody tr");
    let totalCharges = 0, totalPayments = 0, totalAdjustments = 0, totalBalance = 0;

    rows.forEach((row) => {
      const chargesInput = row.querySelector(".charges-input");
      const paymentsInput = row.querySelector(".payments-input");
      const adjustmentsInput = row.querySelector(".adjustments-input");
      const balanceInput = row.querySelector(".balance-input");

      const charges = parseFloat(normalizeInput(chargesInput.value)) || 0;
      const payments = parseFloat(normalizeInput(paymentsInput.value)) || 0;
      const adjustments = parseFloat(normalizeInput(adjustmentsInput.value)) || 0;

      // Auto-update balance
      if (!balanceInput.dataset.manual) {
        const calcBalance = charges - payments - adjustments;
        balanceInput.value = calcBalance.toFixed(2);
      }

      totalCharges += charges;
      totalPayments += payments;
      totalAdjustments += adjustments;
      totalBalance += parseFloat(normalizeInput(balanceInput.value)) || 0;
    });

    const update = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val.toFixed(2);
    };

    update("totalCharges", totalCharges);
    update("totalPayments", totalPayments);
    update("totalAdjustments", totalAdjustments);
    update("totalBalance", totalBalance);
    update("incurredTotal", totalPayments + totalBalance);
  }

  // Save table data and manual balance flags
  function saveTableData() {
    const rows = document.querySelectorAll("#tableBody tr");
    const data = [];
    const manualRows = [];

    rows.forEach((row, index) => {
      const charges = row.querySelector(".charges-input").value;
      const payments = row.querySelector(".payments-input").value;
      const adjustments = row.querySelector(".adjustments-input").value;
      const balance = row.querySelector(".balance-input").value;

      data.push({ charges, payments, adjustments, balance });
      if (row.querySelector(".balance-input").dataset.manual === "true") {
        manualRows.push(index);
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(BALANCE_KEY, JSON.stringify(manualRows));
  }

  // Load saved table data
  function loadTableData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const manualData = JSON.parse(localStorage.getItem(BALANCE_KEY) || "[]");
    if (!savedData) return;

    const data = JSON.parse(savedData);
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    tbody.innerHTML = '';
    data.forEach((rowData, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="number" step="any" class="charges-input" placeholder="Enter amount" value="${rowData.charges}"></td>
        <td><input type="number" step="any" class="payments-input" placeholder="Enter amount" value="${rowData.payments}"></td>
        <td><input type="number" step="any" class="adjustments-input" placeholder="Enter amount" value="${rowData.adjustments}"></td>
        <td><input type="number" step="any" class="balance-input" placeholder="0.00" value="${rowData.balance}"></td>
      `;
      if (manualData.includes(idx)) {
        tr.querySelector(".balance-input").dataset.manual = "true";
      }
      tbody.appendChild(tr);
    });
  }

  function addRow() {
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="number" step="any" class="charges-input" placeholder="Enter amount"></td>
      <td><input type="number" step="any" class="payments-input" placeholder="Enter amount"></td>
      <td><input type="number" step="any" class="adjustments-input" placeholder="Enter amount"></td>
      <td><input type="number" step="any" class="balance-input" placeholder="0.00"></td>
    `;
    tbody.appendChild(tr);
    saveTableData();
  }

  function clearTable() {
    if (!confirm("Are you sure you want to reset the calculator?\nAll entered data will be permanently lost!")) return;

    const tbody = document.getElementById("tableBody");
    if (tbody) {
      tbody.innerHTML = "";
      for (let i = 0; i < 5; i++) addRow();
      calculateTotals();
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BALANCE_KEY);
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
    if (label) label.textContent = isDark ? 'Light' : 'Dark';
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

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();

    // Click-to-copy totals
    document.addEventListener('click', (event) => {
      const ids = ['totalCharges','totalPayments','totalAdjustments','totalBalance','incurredTotal'];
      if (ids.includes(event.target.id)) copyToClipboard(event.target.textContent, event);
    });

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
      loadTableData();
      if (tbody.children.length === 0) for (let i = 0; i < 5; i++) addRow();

      tbody.addEventListener("input", (e) => {
        const row = e.target.closest('tr');
        const charges = parseFloat(normalizeInput(row.querySelector(".charges-input").value)) || 0;
        const payments = parseFloat(normalizeInput(row.querySelector(".payments-input").value)) || 0;
        const adjustments = parseFloat(normalizeInput(row.querySelector(".adjustments-input").value)) || 0;
        const balanceInput = row.querySelector(".balance-input");

        // If user manually edits balance
        if (e.target.classList.contains("balance-input")) {
          balanceInput.dataset.manual = "true";
        } else {
          // Auto-update balance but keep manual edits possible
          const calcBalance = charges - payments - adjustments;
          balanceInput.value = calcBalance.toFixed(2);
        }

        calculateTotals();
        saveTableData();
      });
      calculateTotals();
    }
  });

})();
