// Auto-calc totals and balances; respect manual balance edits
function calculateTotals() {
  const rows = document.querySelectorAll("#billTable tbody tr");
  let totalTotal = 0;
  let totalPayments = 0;
  let totalAdjustments = 0;
  let totalBalance = 0;

  rows.forEach(row => {
    const total = parseFloat(row.querySelector(".total")?.value) || 0;
    const payments = parseFloat(row.querySelector(".payments")?.value) || 0;
    const adjustments = parseFloat(row.querySelector(".adjustments")?.value) || 0;
    const balanceInput = row.querySelector(".balance-input");

    const computed = total - payments - adjustments;

    // If user manually edited balance, don't overwrite
    if (balanceInput) {
      if (balanceInput.dataset.manual === "true") {
        const manualVal = parseFloat(balanceInput.value);
        const used = isNaN(manualVal) ? computed : manualVal;
        // If manual is invalid/empty, revert to computed and clear manual flag
        if (isNaN(manualVal)) {
          balanceInput.value = computed.toFixed(2);
          balanceInput.dataset.manual = "";
        }
        totalBalance += used;
      } else {
        balanceInput.value = computed.toFixed(2);
        totalBalance += computed;
      }
    } else {
      totalBalance += computed;
    }

    totalTotal += total;
    totalPayments += payments;
    totalAdjustments += adjustments;
  });

  document.getElementById("totalTotal").textContent = totalTotal.toFixed(2);
  document.getElementById("totalPayments").textContent = totalPayments.toFixed(2);
  document.getElementById("totalAdjustments").textContent = totalAdjustments.toFixed(2);
  document.getElementById("totalBalance").textContent = totalBalance.toFixed(2);
  const incurredEl = document.getElementById("incurredTotal");
  if (incurredEl) incurredEl.textContent = totalTotal.toFixed(2);
}

// Add a new editable row consistent with initial rows
function addRow() {
  const tbody = document.querySelector("#billTable tbody");
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td><input type="number" class="total" oninput="calculateTotals()"></td>
    <td><input type="number" class="payments" oninput="calculateTotals()"></td>
    <td><input type="number" class="adjustments" oninput="calculateTotals()"></td>
    <td><input type="number" class="balance-input" value="0"></td>
  `;
  tbody.appendChild(newRow);
  calculateTotals();
}

// Clear all inputs and manual overrides
function clearTable() {
  document.querySelectorAll("#billTable tbody tr").forEach(row => {
    row.querySelectorAll("input").forEach(input => {
      input.value = "";
      if (input.classList.contains("balance-input")) {
        input.dataset.manual = "";
      }
    });
  });
  calculateTotals();
}

function printPDF() {
  window.print();
}

// Event delegation: mark balance as manual when edited, then refresh totals
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("#billTable tbody");
  if (tbody) {
    tbody.addEventListener("input", (e) => {
      if (e.target.classList.contains("balance-input")) {
        e.target.dataset.manual = "true";
        calculateTotals();
      }
    });
  }
  calculateTotals();
});

function toggleDarkMode() {
  const body = document.body;
  const button = document.getElementById("themeToggle");
  const icon = button.querySelector("i");

  body.classList.toggle("dark-mode");
  const isDark = body.classList.contains("dark-mode");

  localStorage.setItem("theme", isDark ? "dark" : "light");
  icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
  button.innerHTML = `<i class="${icon.className}"></i> ${isDark ? "Light Mode" : "Dark Mode"}`;
}

// Apply saved theme on page load
window.onload = function () {
  const savedTheme = localStorage.getItem("theme");
  const button = document.getElementById("themeToggle");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    button.innerHTML = `<i class="fas fa-sun"></i> Light Mode`;
  } else {
    button.innerHTML = `<i class="fas fa-moon"></i> Dark Mode`;
  }
};

// 🔐 Login validation for MedBillCalc
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const user = document.getElementById("username").value.trim();
      const pass = document.getElementById("password").value.trim();
      const validUser = "nonlop";
      const validPass = "M3d1c4l00!";

      if (user === validUser && pass === validPass) {
        sessionStorage.setItem("loggedIn", "true");
        window.location.href = "index.html";
      } else {
        document.getElementById("errorMsg").textContent = "Invalid credentials.";
      }
    });
  }
});

