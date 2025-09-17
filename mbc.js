/*
 * mbc.js - Medical Bill Calculator Core Functionality
 * REVISED: All columns editable, smart auto-calculation with manual override
 */

(() => {
  "use strict";

  const STORAGE_KEY = 'mbcData';

  function normalizeInput(s) {
    return (s || "").normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  }

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

  function calculateRow(row) {
    const chargesInput = row.querySelector(".charges-input");
    const paymentsInput = row.querySelector(".payments-input");
    const adjustmentsInput = row.querySelector(".adjustments-input");
    const balanceInput = row.querySelector(".balance-input");

    const charges = parseFloat(normalizeInput(chargesInput.value)) || 0;
    let payments = parseFloat(normalizeInput(paymentsInput.value)) || 0;
    let adjustments = parseFloat(normalizeInput(adjustmentsInput.value)) || 0;
    let balance = parseFloat(normalizeInput(balanceInput.value)) || 0;

    // Store original values before any calculation
    const originalPayments = payments;
    const originalAdjustments = adjustments;
    const originalBalance = balance;

    // Only auto-calculate if we have a Charges value to work with
    if (charges > 0) {
      // Count how many values we have (excluding charges)
      const valuesEntered = [payments, adjustments, balance].filter(val => val > 0).length;
      
      // If we have exactly 2 values entered (plus charges), calculate the missing one
      if (valuesEntered === 2) {
        if (payments > 0 && balance > 0 && adjustments === 0) {
          // Calculate Adjustments: Charges - Payments - Balance
          adjustments = charges - payments - balance;
          if (adjustmentsInput.value !== adjustments.toFixed(2) && adjustmentsInput !== document.activeElement) {
            adjustmentsInput.value = adjustments.toFixed(2);
          }
        }
        else if (payments > 0 && adjustments > 0 && balance === 0) {
          // Calculate Balance: Charges - Payments - Adjustments
          balance = charges - payments - adjustments;
          if (balanceInput.value !== balance.toFixed(2) && balanceInput !== document.activeElement) {
            balanceInput.value = balance.toFixed(2);
          }
        }
        else if (adjustments > 0 && balance > 0 && payments === 0) {
          // Calculate Payments: Charges - Adjustments - Balance
          payments = charges - adjustments - balance;
          if (paymentsInput.value !== payments.toFixed(2) && paymentsInput !== document.activeElement) {
            paymentsInput.value = payments.toFixed(2);
          }
        }
      }
      // If we have only 1 value entered (plus charges), calculate balance as default
      else if (valuesEntered === 1) {
        if (payments > 0) {
          balance = charges - payments;
          if (balanceInput.value !== balance.toFixed(2) && balanceInput !== document.activeElement) {
            balanceInput.value = balance.toFixed(2);
          }
        }
        else if (adjustments > 0) {
          balance = charges - adjustments;
          if (balanceInput.value !== balance.toFixed(2) && balanceInput !== document.activeElement) {
            balanceInput.value = balance.toFixed(2);
          }
        }
        else if (balance > 0) {
          adjustments = charges - balance;
          if (adjustmentsInput.value !== adjustments.toFixed(2) && adjustmentsInput !== document.activeElement) {
            adjustmentsInput.value = adjustments.toFixed(2);
          }
        }
      }
    }

    return { 
      charges, 
      payments: originalPayments > 0 ? originalPayments : payments,
      adjustments: originalAdjustments > 0 ? originalAdjustments : adjustments,
      balance: originalBalance > 0 ? originalBalance : balance
    };
  }

  function calculateTotals() {
    const rows = document.querySelectorAll("#tableBody tr");
    let totalCharges = 0,
      totalPayments = 0,
      totalAdjustments = 0,
      totalBalance = 0;

    rows.forEach((row) => {
      const result = calculateRow(row);
      
      totalCharges += result.charges;
      totalPayments += result.payments;
      totalAdjustments += result.adjustments;
      totalBalance += result.balance;
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
        <td><input type="number" step="any" class="charges-input" placeholder="Enter Amount" value="${rowData.charges}"></td>
        <td><input type="number" step="any" class="payments-input" placeholder="Enter Amount" value="${rowData.payments}"></td>
        <td><input type="number" step="any" class="adjustments-input" placeholder="Enter Amount" value="${rowData.adjustments}"></td>
        <td><input type="number" step="any" class="balance-input" placeholder="Enter Amount" value="${rowData.balance}"></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function addRow() {
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="number" step="any" class="charges-input" placeholder="Enter Amount"></td>
      <td><input type="number" step="any" class="payments-input" placeholder="Enter Amount"></td>
      <td><input type="number" step="any" class="adjustments-input" placeholder="Enter Amount"></td>
      <td><input type="number" step="any" class="balance-input" placeholder="Enter Amount"></td>
    `;
    tbody.appendChild(tr);
    saveTableData();
  }

  function clearTable() {
    if (!confirm("Are you sure you want to reset the calculator?\n\nAll entered data will be permanently lost!")) {
      return;
    }
    
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
    document.addEventListener('click', (event) => {
      if (event.target.id === 'totalCharges' || 
          event.target.id === 'totalPayments' ||
          event.target.id === 'totalAdjustments' || 
          event.target.id === 'totalBalance' ||
          event.target.id === 'incurredTotal') {
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
      if (tbody.children.length === 0) {
        for (let i = 0; i < 5; i++) addRow();
      }

      tbody.addEventListener("input", (e) => {
        // Recalculate when any input changes, but don't interfere with currently focused field
        calculateTotals();
        saveTableData();
      });
      
      calculateTotals();
    }
  });

})();
