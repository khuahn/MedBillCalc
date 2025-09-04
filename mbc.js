/*
 * mbc.js - Medical Bill Calculator Core Functionality
 * Version 1.0 Stable
 */

(() => {
  "use strict";

  const STORAGE_KEY = 'mbcData';
  const SESSION_KEY = 'mbcSession';

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
    }).catch(err => console.error('Failed to copy: ', err));
  }

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

      // Auto-calc balance unless manual input temporarily overridden
      if (charges > 0 && (payments > 0 || adjustments > 0)) {
        const calculatedBalance = charges - payments - adjustments;
        balanceInput.value = calculatedBalance.toFixed(2);
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
        <td><input type="number" step="any" class="balance-input" placeholder="0.00" value="${rowData.balance}"></td>
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
  }

  function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.body.classList.add("dark-mode");
  }

  function initSessionLogin() {
    const loginForm = document.getElementById("loginForm");
    const nameInput = document.getElementById("username");
    const errorMsg = document.getElementById("errorMsg");

    if (!loginForm || !nameInput) return;

    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const name = nameInput.value.trim();
      if (!name) {
        errorMsg.textContent = "Please enter your name.";
        return;
      }
      const sessionObj = {
        name,
        timestamp: Date.now()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionObj));
      window.location.href = "index.html";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initSessionLogin();

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
        const row = e.target.closest('tr');
        calculateTotals();
        saveTableData();
      });
    }

    // Click-to-copy
    document.addEventListener('click', (event) => {
      if (["totalCharges","totalPayments","totalAdjustments","totalBalance","incurredTotal"].includes(event.target.id)) {
        copyToClipboard(event.target.textContent, event);
      }
    });
  });

})();
