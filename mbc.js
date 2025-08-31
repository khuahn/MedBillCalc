// 🔢 Auto-calculate totals and balances
function calculateTotals() {
  const rows = document.querySelectorAll("#billTable tbody tr");
  let totalTotal = 0, totalPayments = 0, totalAdjustments = 0, totalBalance = 0;

  rows.forEach(row => {
    const total = parseFloat(row.querySelector(".total")?.value) || 0;
    const payments = parseFloat(row.querySelector(".payments")?.value) || 0;
    const adjustments = parseFloat(row.querySelector(".adjustments")?.value) || 0;
    const balanceInput = row.querySelector(".balance-input");
    const computed = total - payments - adjustments;

    if (balanceInput) {
      if (balanceInput.dataset.manual === "true") {
        const manualVal = parseFloat(balanceInput.value);
        const used = isNaN(manualVal) ? computed : manualVal;
        if (isNaN(manualVal)) {
          balanceInput.value = computed.toFixed(2);
          balanceInput.dataset.manual = "";
        }
        totalBalance += used;
      } else {
        balanceInput.value = computed.toFixed(2);
        totalBalance += computed;
      }
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

// ➕ Add a new row to the table
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

// 🧹 Clear all inputs and reset manual flags
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

// 🖨️ Trigger browser print
function printPDF() {
  window.print();
}

// 🌗 Toggle dark/light mode
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

// 🌓 Apply saved theme on page load
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

// 🧠 Mark balance as manually edited
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

// 🔐 Login validation
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const password = document.getElementById("password").value;
      const errorMsg = document.getElementById("errorMsg");

      // Replace with your actual password
      if (password === "medcalc2025") {
        sessionStorage.setItem("loggedIn", "true");
        window.location.href = "index.html";
      } else {
        errorMsg.textContent = "Incorrect password.";
        errorMsg.classList.add("shake");
        setTimeout(() => errorMsg.classList.remove("shake"), 300);
      }
    });
  }
});
