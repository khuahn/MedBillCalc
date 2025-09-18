/*
 * mbc.js - Medical Bill Calculator with Row Locking
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

  function calculateMissingValue(row) {
    const chargesInput = row.querySelector(".charges-input");
    const paymentsInput = row.querySelector(".payments-input");
    const adjustmentsInput = row.querySelector(".adjustments-input");
    const balanceInput = row.querySelector(".balance-input");

    const charges = parseFloat(normalizeInput(chargesInput.value)) || 0;
    const payments = parseFloat(normalizeInput(paymentsInput.value)) || 0;
    const adjustments = parseFloat(normalizeInput(adjustmentsInput.value)) || 0;
    const balance = parseFloat(normalizeInput(balanceInput.value)) || 0;

    let calculatedValue = 0;
    let fieldToSet = null;

    // Determine which field is missing and calculate it
    if (charges > 0) {
      if (payments === 0 && adjustments > 0 && balance > 0) {
        // Calculate Payments: Charges - Adjustments - Balance
        calculatedValue = charges - adjustments - balance;
        fieldToSet = paymentsInput;
      } else if (adjustments === 0 && payments > 0 && balance > 0) {
        // Calculate Adjustments: Charges - Payments - Balance
        calculatedValue = charges - payments - balance;
        fieldToSet = adjustmentsInput;
      } else if (balance === 0 && payments > 0 && adjustments > 0) {
        // Calculate Balance: Charges - Payments - Adjustments
        calculatedValue = charges - payments - adjustments;
        fieldToSet = balanceInput;
      }
    }

    return { calculatedValue, fieldToSet };
  }

  function lockRow(row) {
    const { calculatedValue, fieldToSet } = calculateMissingValue(row);
    
    // If there's a missing value, calculate and set it
    if (fieldToSet && !isNaN(calculatedValue)) {
      fieldToSet.value = calculatedValue.toFixed(2);
    }

    // Lock all inputs in the row
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
      input.readOnly = true;
      input.classList.add('locked-input');
    });

    // Add lock status indicator
    const statusCell = row.querySelector('.row-status') || row.insertCell(-1);
    statusCell.className = 'row-status';
    statusCell.innerHTML = '<span class="lock-icon"><i class="fas fa-lock"></i></span><span class="lock-status">Locked</span>';
    
    // Add locked class to row
    row.classList.add('locked-row');
  }

  function unlockRow(row) {
    // Unlock all inputs in the row
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
      input.readOnly = false;
      input.classList.remove('locked-input');
    });

    // Remove lock status indicator
    const statusCell = row.querySelector('.row-status');
    if (statusCell) {
      statusCell.innerHTML = '';
    }
    
    // Remove locked class from row
    row.classList.remove('locked-row');
  }

  function addRow() {
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    // Lock the current row if it has data
    const rows = tbody.querySelectorAll('tr');
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      const hasData = Array.from(lastRow.querySelectorAll('input')).some(input => {
        return parseFloat(normalizeInput(input.value)) > 0;
      });
      
      if (hasData && !lastRow.classList.contains('locked-row')) {
        lockRow(lastRow);
      }
    }

    // Add new row
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="number" step="any" class="charges-input" placeholder="Enter Amount"></td>
      <td><input type="number" step="any" class="payments-input" placeholder="Enter Amount"></td>
      <td><input type="number" step="any" class="adjustments-input" placeholder="Enter Amount"></td>
      <td><input type="number" step="any" class="balance-input" placeholder="Enter Amount"></td>
      <td class="row-status"></td>
    `;
    tbody.appendChild(tr);
    saveTableData();
  }

  function deleteLastRow() {
    const rows = document.querySelectorAll("#tableBody tr");
    if (rows.length > 1) {
      const rowToRemove = rows[rows.length - 1];
      
      // Unlock the previous row before removing current one
      if (rows.length > 1) {
        const previousRow = rows[rows.length - 2];
        if (previousRow.classList.contains('locked-row')) {
          unlockRow(previousRow);
        }
      }
      
      rowToRemove.remove();
      calculateTotals();
      saveTableData();
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
      const isLocked = row.classList.contains('locked-row');
      data.push({ charges, payments, adjustments, balance, isLocked });
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
        <td class="row-status"></td>
      `;
      
      if (rowData.isLocked) {
        lockRow(tr);
      }
      
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
      addRow(); // Add just one row instead of five
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
    const delRowBtn = document.getElementById("delRowBtn");
    const printPDFBtn = document.getElementById("printPDFBtn");
    const themeToggle = document.getElementById("themeToggle");
    const clearTableBtn = document.getElementById("clearTableBtn");
    const tbody = document.getElementById("tableBody");

    if (addRowBtn) addRowBtn.addEventListener("click", addRow);
    if (delRowBtn) delRowBtn.addEventListener("click", deleteLastRow);
    if (printPDFBtn) printPDFBtn.addEventListener("click", printPDF);
    if (themeToggle) themeToggle.addEventListener("click", toggleDarkMode);
    if (clearTableBtn) clearTableBtn.addEventListener("click", clearTable);
    
    if (tbody) {
      loadTableData();
      if (tbody.children.length === 0) {
        addRow(); // Start with just one row instead of five
      }

      // Calculate totals when any input changes
      tbody.addEventListener("input", () => {
        calculateTotals();
        saveTableData();
      });
      
      calculateTotals();
    }
  });

})();
