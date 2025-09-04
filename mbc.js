/*
 * mbc.js - Medical Bill Calculator Core Functionality
 * Version v1.1 - 2025-09-04
 * Features:
 * - Auto-calculate Balance
 * - Editable Balance column
 * - Click-to-copy summary amounts & Total Incurred
 * - Dark mode toggle
 * - Add / Reset / Save buttons
 * - Number input placeholders & spinner removed
 */

(() => {
  "use strict";

  const ALLOWED_PASSWORD = "M3d1c4l00!";
  const STORAGE_KEY = 'mbcData';

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
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
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

      // Auto-calculate balance if edited by user
      if (charges > 0 && (payments > 0 || adjustments > 0)) {
        const calculatedBalance = charges - payments - adjustments;
        if (!balanceInput.dataset.manual || balanceInput.dataset.manual === "false") {
          balanceInput.value = calculatedBalance.toFixed(2);
        }
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

    // Update Total Incurred
    const incurredTotalEl = document.getElementById("incurredTotal");
    if (incurredTotalEl) incurredTotalEl.textContent = (totalPayments + totalBalance).toFixed(2);
  }

  function saveTableData() {
    const rows = document.querySelectorAll("#tableBody tr");
    const data = [];
    rows.forEach(row => {
      const charges = row.querySelector(".charges-input").value;
      const payments = row.querySelector(".payments-input").value;
      const adjustments = row.querySelector(".adjustments-input").value;
      const balance = row.querySelector(".balance-input").value;
      data.push({ charges, payments, adjustments, balance });
    });
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
        <td><input type="number" step="any" class="balance-input" placeholder="0.00" value="${rowData.balance}" data-manual="false"></td>
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
      <td><input type="number" step="any" class="balance-input" placeholder="0.00" data-manual="false"></td>
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
    const tbody = document.getElementById("tableBody");
    const addRowBtn = document.getElementById("addRowBtn");
    const clearTableBtn = document.getElementById("clearTableBtn");
    const printPDFBtn = document.getElementById("printPDFBtn");
    const themeToggle = document.getElementById("themeToggle");

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

        // Mark manual edits on Balance
        if (e.target.classList.contains("balance-input")) {
          balanceInput.dataset.manual = "true";
        }

        calculateTotals();
        saveTableData();
      });

      calculateTotals();
    }

    // Click-to-copy summary
    document.querySelectorAll(".summary-row td, #incurredTotal").forEach(el => {
      el.classList.add("copyable");
      el.addEventListener("click", (event) => {
        copyToClipboard(el.textContent, event);
      });
    });

    initTheme();
  });

})();
