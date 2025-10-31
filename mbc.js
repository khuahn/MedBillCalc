(() => {
  "use strict";

  const STORAGE_KEY = 'mbcData';

  function normalizeInput(s) {
    return (s || "").normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  }

  function showFeedback(message) {
    const existing = document.querySelector('.copied-feedback');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = 'copied-feedback';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => { if (document.body.contains(el)) el.remove(); }, 1000);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showFeedback('Copied!');
    }).catch(err => console.error('Copy failed:', err));
  }

  function calculateMissingValues() {
    document.querySelectorAll("#tableBody tr").forEach(row => {
      const c = parseFloat(normalizeInput(row.querySelector(".charges-input")?.value)) || 0;
      const p = parseFloat(normalizeInput(row.querySelector(".payments-input")?.value)) || 0;
      const a = parseFloat(normalizeInput(row.querySelector(".adjustments-input")?.value)) || 0;
      const bEl = row.querySelector(".balance-value");
      const calculatedBalance = (c - p - a);
      if (bEl) bEl.textContent = Math.abs(calculatedBalance) < 1e-9 ? "0.00" : calculatedBalance.toFixed(2);
    });
  }

  function addRow() {
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="number" step="any" class="charges-input"></td>
      <td><input type="number" step="any" class="payments-input"></td>
      <td><input type="number" step="any" class="adjustments-input"></td>
      <td><span class="balance-value">0.00</span></td>
    `;
    tbody.appendChild(tr);
    saveTableData();
    showFeedback('Row added!');
  }

  function deleteLastRow() {
    const rows = document.querySelectorAll("#tableBody tr");
    if (rows.length > 1) {
      if (confirm("Are you sure you want to delete the last row?")) {
        rows[rows.length - 1].remove();
        calculateTotals();
        saveTableData();
        showFeedback('Row deleted!');
      }
    } else {
      alert("You need to keep at least one row.");
    }
  }

  function calculateTotals() {
    let tc = 0, tp = 0, ta = 0, tb = 0;
    document.querySelectorAll("#tableBody tr").forEach(row => {
      const c = parseFloat(normalizeInput(row.querySelector(".charges-input")?.value)) || 0;
      const p = parseFloat(normalizeInput(row.querySelector(".payments-input")?.value)) || 0;
      const a = parseFloat(normalizeInput(row.querySelector(".adjustments-input")?.value)) || 0;
      const b = parseFloat(normalizeInput(row.querySelector(".balance-value")?.textContent)) || 0;
      tc += c; tp += p; ta += a; tb += b;
    });
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val.toFixed(2);
    };
    set("totalCharges", tc);
    set("totalPayments", tp);
    set("totalAdjustments", ta);
    set("totalBalance", tb);
    set("incurredTotal", tp + tb);
  }

  function saveTableData() {
    const data = [];
    document.querySelectorAll("#tableBody tr").forEach(row => {
      const balanceText = normalizeInput(row.querySelector(".balance-value")?.textContent);
      data.push({
        charges: row.querySelector(".charges-input").value,
        payments: row.querySelector(".payments-input").value,
        adjustments: row.querySelector(".adjustments-input").value,
        balance: balanceText === '' ? '0.00' : balanceText
      });
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
      showFeedback('Error: Could not save data!');
    }
  }

  function loadTableData() {
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      showFeedback('Error: Could not load saved data!');
      return;
    }
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      const tbody = document.getElementById("tableBody");
      if (!tbody) return;
      tbody.innerHTML = '';
      data.forEach(d => {
        const tr = document.createElement("tr");
        const balanceValue = normalizeInput(d.balance);
        tr.innerHTML = `
          <td><input type="number" step="any" class="charges-input" value="${d.charges}"></td>
          <td><input type="number" step="any" class="payments-input" value="${d.payments}"></td>
          <td><input type="number" step="any" class="adjustments-input" value="${d.adjustments}"></td>
          <td><span class="balance-value">${balanceValue === '' ? '0.00' : balanceValue}</span></td>
        `;
        tbody.appendChild(tr);
      });
    } catch (parseError) {
      console.error('Failed to parse saved data:', parseError);
      showFeedback('Error: Corrupted saved data!');
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function clearTable() {
    if (!confirm("Reset calculator? All data will be lost!")) return;
    const tbody = document.getElementById("tableBody");
    if (tbody) {
      tbody.innerHTML = "";
      addRow();
      calculateTotals();
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove data from localStorage:', error);
      showFeedback('Error: Could not clear saved data!');
    }
    showFeedback('Calculator reset!');
  }

  function printPDF() {
    window.print();
  }

  function toggleDarkMode() {
    const isDark = document.body.classList.toggle("dark-mode");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
      showFeedback('Error: Could not save theme!');
    }
    updateThemeToggleUI(isDark);
    showFeedback(isDark ? 'Dark mode enabled!' : 'Light mode enabled!');
  }

  function updateThemeToggleUI(isDark) {
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = `fas fa-${isDark ? 'sun' : 'moon'}`;
    const btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-pressed', String(isDark));
  }

  function initTheme() {
    let theme = null;
    try {
      theme = localStorage.getItem("theme");
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
      showFeedback('Error: Could not load saved theme!');
      return;
    }
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
      updateThemeToggleUI(true);
    } else {
      updateThemeToggleUI(false);
    }
  }

  function validateInputs() {
    document.querySelectorAll('input[type="number"]').forEach(input => {
      const val = parseFloat(input.value);
      if (isNaN(val)) input.value = '';
    });
  }

  function handleCalculate() {
    calculateMissingValues();
    calculateTotals();
    saveTableData();
    showFeedback('Calculated!');
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCalculate();
      const btn = document.getElementById("calculateBtn");
      if (btn) {
        btn.style.transform = "scale(0.95)";
        setTimeout(() => btn.style.transform = "", 100);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener('click', e => {
      const t = e.target;
      if (t.classList.contains('copy-icon')) {
        const s = t.previousElementSibling;
        if (s) copyToClipboard(s.textContent);
      } else if (['totalCharges','totalPayments','totalAdjustments','totalBalance','incurredTotal'].includes(t.id)) {
        copyToClipboard(t.textContent);
      }
    });

    document.addEventListener('keydown', handleKeyPress);
    initTheme();

    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", fn);
    };

    bind("calculateBtn", handleCalculate);
    bind("addRowBtn", addRow);
    bind("delRowBtn", deleteLastRow);
    bind("printPDFBtn", printPDF);
    bind("themeToggle", toggleDarkMode);
    bind("clearTableBtn", clearTable);

    const tbody = document.getElementById("tableBody");
    if (tbody) {
      loadTableData();
      if (tbody.children.length === 0) addRow();
      tbody.addEventListener("input", () => { validateInputs(); saveTableData(); });
      tbody.addEventListener('click', e => {
        if (e.target.classList.contains('balance-value')) {
          showFeedback("This field is not editable.");
        }
      });
      calculateTotals();
    }
  });

})();