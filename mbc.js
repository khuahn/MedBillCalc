/*
 * mbc.js - Medical Bill Calculator with Manual Calculation
 * Version: 2.3 - Removed auto-lock, added calculate button, improved validation
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
      
      setTimeout(() => feedback.remove(), 1000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }

  function addRow() {
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    // Add new row
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="number" step="any" class="charges-input"></td>
      <td><input type="number" step="any" class="payments-input"></td>
      <td><input type="number" step="any" class="adjustments-input"></td>
      <td><input type="number" step="any" class="balance-input"></td>
    `;
    tbody.appendChild(tr);
    
    // Save data
    saveTableData();
  }

  function deleteLastRow() {
    const rows = document.querySelectorAll("#tableBody tr");
    if (rows.length > 1) {
      if (confirm("Are you sure you want to delete the last row?")) {
        const rowToRemove = rows[rows.length - 1];
        rowToRemove.remove();
        calculateTotals();
        saveTableData();
      }
    } else {
      alert("You need to keep at least one row in the calculator.");
    }
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
      const balance = parseFloat(normalizeInput(balanceInput.value)) || 0;

      totalCharges += charges;
      totalPayments += payments;
      totalAdjustments += adjustments;
      totalBalance += balance;
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
        <td><input type="number" step="any" class="charges-input" value="${rowData.charges}"></td>
        <td><input type="number" step="any" class="payments-input" value="${rowData.payments}"></td>
        <td><input type="number" step="any" class="adjustments-input" value="${rowData.adjustments}"></td>
        <td><input type="number" step="any" class="balance-input" value="${rowData.balance}"></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function clearTable() {
    if (!confirm("Are you sure you want to reset the calculator?\n\nAll entered data will be permanently lost!")) {
      return;
    }
    
    const tbody = document.getElementById("tableBody");
    if (tbody) {
      tbody.innerHTML = "";
      addRow();
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

  function validateInputs() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
      const value = parseFloat(input.value);
      if (isNaN(value) || value < 0) {
        input.value = '';
      }
    });
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

    const calculateBtn = document.getElementById("calculateBtn");
    const addRowBtn = document.getElementById("addRowBtn");
    const delRowBtn = document.getElementById("delRowBtn");
    const printPDFBtn = document.getElementById("printPDFBtn");
    const themeToggle = document.getElementById("themeToggle");
    const clearTableBtn = document.getElementById("clearTableBtn");
    const tbody = document.getElementById("tableBody");

    if (calculateBtn) calculateBtn.addEventListener("click", calculateTotals);
    if (addRowBtn) addRowBtn.addEventListener("click", addRow);
    if (delRowBtn) delRowBtn.addEventListener("click", deleteLastRow);
    if (printPDFBtn) printPDFBtn.addEventListener("click", printPDF);
    if (themeToggle) themeToggle.addEventListener("click", toggleDarkMode);
    if (clearTableBtn) clearTableBtn.addEventListener("click", clearTable);
    
    if (tbody) {
      loadTableData();
      if (tbody.children.length === 0) {
        addRow();
      }

      // Validate inputs and calculate totals when any input changes
      tbody.addEventListener("input", () => {
        validateInputs();
        saveTableData();
      });
      
      calculateTotals();
    }
  });

})();
