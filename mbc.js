(() => {
  "use strict";

  const ALLOWED_PASSWORD = "M3d1c4l00!";
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
    }).catch(err => console.error('Failed to copy: ', err));
  }

  function calculateTotals() {
    const rows = document.querySelectorAll("#tableBody tr");
    let totalCharges = 0, totalPayments = 0, totalAdjustments = 0, totalBalance = 0;

    rows.forEach(row => {
      const charges = parseFloat(normalizeInput(row.querySelector(".charges-input").value)) || 0;
      const payments = parseFloat(normalizeInput(row.querySelector(".payments-input").value)) || 0;
      const adjustments = parseFloat(normalizeInput(row.querySelector(".adjustments-input").value)) || 0;
      const balanceInput = row.querySelector(".balance-input");

      if (charges > 0 && (payments > 0 || adjustments > 0) && balanceInput.dataset.manual !== "true") {
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
    const data = [];
    rows.forEach(row => {
      data.push({
        charges: row.querySelector(".charges-input").value,
        payments: row.querySelector(".payments-input").value,
        adjustments: row.querySelector(".adjustments-input").value,
        balance: row.querySelector(".balance-input").value
      });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function loadTableData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return [];

    return JSON.parse(savedData);
  }

  function addRow() {
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="number" step="any" class="charges-input"></td>
      <td><input type="number" step="any" class="payments-input"></td>
      <td><input type="number" step="any" class="adjustments-input"></td>
      <td><input type="number" step="any" class="balance-input"></td>
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
    } else updateThemeToggleUI(false);
  }

  function initLogin() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    const pwd = document.getElementById("password");
    const errorMsg = document.getElementById("errorMsg");
    const toggleBtn = document.getElementById("togglePwd");

    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      if (pwd.value === ALLOWED_PASSWORD) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("savedPassword", ALLOWED_PASSWORD);
        window.location.href = "index.html";
      } else if (errorMsg) {
        errorMsg.textContent = "Incorrect password.";
        errorMsg.classList.add("shake");
        setTimeout(() => errorMsg.classList.remove("shake"), 300);
      }
    });

    if (toggleBtn && pwd) {
      toggleBtn.addEventListener("click", () => {
        pwd.type = pwd.type === "password" ? "text" : "password";
        const eyeIcon = toggleBtn.querySelector("i");
        if (eyeIcon) {
          eyeIcon.classList.toggle("fa-eye");
          eyeIcon.classList.toggle("fa-eye-slash");
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Click-to-copy
    document.addEventListener('click', (event) => {
      if (['totalCharges','totalPayments','totalAdjustments','totalBalance','incurredTotal'].includes(event.target.id)) {
        copyToClipboard(event.target.textContent, event);
      }
    });

    initTheme();
    initLogin();

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
      const savedData = loadTableData();
      tbody.innerHTML = '';
      if (savedData.length > 0) {
        savedData.forEach(rowData => {
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
      if (tbody.children.length === 0) {
        for (let i = 0; i < 5; i++) addRow();
      }

      tbody.addEventListener("input", (e) => {
        const row = e.target.closest('tr');
        const charges = parseFloat(normalizeInput(row.querySelector(".charges-input").value)) || 0;
        const payments = parseFloat(normalizeInput(row.querySelector(".payments-input").value)) || 0;
        const adjustments = parseFloat(normalizeInput(row.querySelector(".adjustments-input").value)) || 0;
        const balanceInput = row.querySelector(".balance-input");

        if (e.target.classList.contains("balance-input")) {
          balanceInput.dataset.manual = "true";
        }

        if (charges > 0 && (payments > 0 || adjustments > 0) && balanceInput.dataset.manual !== "true") {
          balanceInput.value = (charges - payments - adjustments).toFixed(2);
        }

        calculateTotals();
        saveTableData();
      });

      calculateTotals();
    }
  });
})();
