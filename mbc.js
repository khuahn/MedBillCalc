/*
 * mbc.js - Medical Bill Calculator Core Functionality
 * v1.6.0 (2025-09-04)
 * - Plan 0.5.1: Added placeholders, removed spinner arrows
 * - Plan 0.5.2: Balance auto-calculates but user can still edit
 */

(() => {
  "use strict";

  const STORAGE_KEY = 'mbcData';

  function normalizeInput(s) {
    return (s || "").normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  }

  // Copy to clipboard with feedback
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

  // Calculate totals
  function calculateTotals() {
    const rows = document.querySelectorAll("#tableBody tr");
    let totalCharges = 0, totalPayments = 0, totalAdjustments = 0, totalBalance = 0;

    rows.forEach(row => {
      const chargesInput = row.querySelector(".charges-input");
      const paymentsInput = row.querySelector(".payments-input");
      const adjustmentsInput = row.querySelector(".adjustments-input");
      const balanceInput = row.querySelector(".balance-input");

      const charges = parseFloat(normalizeInput(chargesInput.value)) || 0;
      const payments = parseFloat(normalizeInput(paymentsInput.value)) || 0;
      const adjustments = parseFloat(normalizeInput(adjustmentsInput.value)) || 0;

      // Auto-calculate balance only if input is empty or user hasn't typed yet
      if (!balanceInput.dataset.manual) {
        balanceInput.value = (charges - payments - adjustments).toFixed(2);
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

  function saveTableData() {
    const rows = document.querySelectorAll("#tableBody tr");
    const data = Array.from(rows).map(row => ({
      charges: row.querySelector(".charges-input").value,
      payments: row.querySelector(".payments-input").value,
      adjustments: row.querySelector(".adjustments-input").value,
      balance: row.querySelector(".balance-input").value,
      manual: row.querySelector(".balance-input").dataset.manual || ""
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function loadTableData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;

    const data = JSON.parse(savedData);
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;
    tbody.innerHTML = '';

    data.forEach(rowData => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="number" step="any" class="charges-input" placeholder="Enter amount" value="${rowData.charges}"></td>
        <td><input type="number" step="any" class="payments-input" placeholder="Enter amount" value="${rowData.payments}"></td>
        <td><input type="number" step="any" class="adjustments-input" placeholder="Enter amount" value="${rowData.adjustments}"></td>
        <td><input type="number" step="any" class="balance-input" placeholder="0.00" value="${rowData.balance}" data-manual="${rowData.manual || ""}"></td>
      `;
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
    // Click-to-copy totals
    document.addEventListener('click', (event) => {
      if (['totalCharges','totalPayments','totalAdjustments','totalBalance','incurredTotal'].includes(event.target.id)) {
        copyToClipboard(event.target.textContent, event);
      }
    });

    initTheme();

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
        const chargesInput = row.querySelector(".charges-input");
        const paymentsInput = row.querySelector(".payments-input");
        const adjustmentsInput = row.querySelector(".adjustments-input");
        const balanceInput = row.querySelector(".balance-input");

        // Mark manual only if user types in balance
        if (e.target.classList.contains("balance-input")) {
          balanceInput.dataset.manual = "true";
        } else {
          // Auto-update balance from charges/payments/adjustments
          if (!balanceInput.dataset.manual) {
            const charges = parseFloat(normalizeInput(chargesInput.value)) || 0;
            const payments = parseFloat(normalizeInput(paymentsInput.value)) || 0;
            const adjustments = parseFloat(normalizeInput(adjustmentsInput.value)) || 0;
            balanceInput.value = (charges - payments - adjustments).toFixed(2);
          }
        }

        calculateTotals();
        saveTableData();
      });

      calculateTotals();
    }

    // Remove spinner arrows (Plan 0.5.1)
    const style = document.createElement('style');
    style.innerHTML = `
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type=number] {
        -moz-appearance: textfield;
      }
    `;
    document.head.appendChild(style);
  });
})();
