(() => {
  "use strict";

  const ALLOWED_PASSWORD = "M3d1c4l00!";
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
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
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

      // Always auto-calculate balance from three columns
      if (charges > 0 || payments > 0 || adjustments > 0) {
        const calculatedBalance = charges - payments - adjustments;
        if (!balanceInput.dataset.manual) {
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
    update("incurredTotal", totalPayments + totalBalance);
  }

  function saveTableData() {
    const rows = document.querySelectorAll("#tableBody tr");
    const data = Array.from(rows).map(row => ({
      charges: row.querySelector(".charges-input").value,
      payments: row.querySelector(".payments-input").value,
      adjustments: row.querySelector(".adjustments-input").value,
      balance: row.querySelector(".balance-input").value
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
      tbody.innerHTML = '';
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

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    loadTableData();

    const tbody = document.getElementById("tableBody");
    if (tbody.children.length === 0) for (let i = 0; i < 5; i++) addRow();

    tbody.addEventListener("input", (e) => {
      const row = e.target.closest('tr');
      const balanceInput = row.querySelector(".balance-input");
      if (e.target.classList.contains("balance-input")) {
        balanceInput.dataset.manual = true;
      } else {
        if (balanceInput.dataset.manual) delete balanceInput.dataset.manual;
      }

      calculateTotals();
      saveTableData();
    });

    document.getElementById("addRowBtn")?.addEventListener("click", addRow);
    document.getElementById("clearTableBtn")?.addEventListener("click", clearTable);
    document.getElementById("printPDFBtn")?.addEventListener("click", printPDF);
    document.getElementById("themeToggle")?.addEventListener("click", toggleDarkMode);

    // Click-to-copy for summary
    document.addEventListener('click', (event) => {
      if (["totalCharges","totalPayments","totalAdjustments","totalBalance","incurredTotal"].includes(event.target.id)) {
        copyToClipboard(event.target.textContent, event);
      }
    });

    calculateTotals();
  });
})();
