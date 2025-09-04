// ====== Variables ======
const mbcTable = document.getElementById("mbcTable").getElementsByTagName("tbody")[0];
const totalChargesEl = document.getElementById("totalCharges");
const totalPaymentsEl = document.getElementById("totalPayments");
const totalAdjustmentsEl = document.getElementById("totalAdjustments");
const totalBalanceEl = document.getElementById("totalBalance");
const incurredTotalEl = document.getElementById("incurredTotal");

const addRowBtn = document.getElementById("addRow");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const themeToggle = document.getElementById("themeToggle");

let darkMode = false;

// ====== Helper Functions ======
function formatNumber(num) {
    return parseFloat(num).toFixed(2);
}

function createInputCell(type = "number", placeholder = "Enter amount") {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = type;
    input.placeholder = placeholder;
    input.value = "";
    input.addEventListener("input", calculateTotals);
    td.appendChild(input);
    return td;
}

function createBalanceCell() {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = "0.00";
    input.value = "";
    input.addEventListener("input", calculateTotals);
    td.appendChild(input);
    return td;
}

function createTrashCell() {
    const td = document.createElement("td");
    const btn = document.createElement("button");
    btn.innerHTML = "🗑";
    btn.className = "danger-btn";
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        td.parentElement.remove();
        calculateTotals();
    });
    td.appendChild(btn);
    return td;
}

function calculateTotals() {
    let totalCharges = 0, totalPayments = 0, totalAdjustments = 0, totalBalance = 0;

    Array.from(mbcTable.rows).forEach(row => {
        const cells = row.getElementsByTagName("input");
        let charges = parseFloat(cells[0].value) || 0;
        let payments = parseFloat(cells[1].value) || 0;
        let adjustments = parseFloat(cells[2].value) || 0;
        let balanceInput = cells[3];

        const autoBalance = charges - payments - adjustments;

        // Only override if user hasn't changed balance
        if (document.activeElement !== balanceInput) {
            balanceInput.value = formatNumber(autoBalance);
        }

        totalCharges += charges;
        totalPayments += payments;
        totalAdjustments += adjustments;
        totalBalance += parseFloat(balanceInput.value) || 0;
    });

    totalChargesEl.textContent = formatNumber(totalCharges);
    totalPaymentsEl.textContent = formatNumber(totalPayments);
    totalAdjustmentsEl.textContent = formatNumber(totalAdjustments);
    totalBalanceEl.textContent = formatNumber(totalBalance);

    incurredTotalEl.textContent = formatNumber(totalCharges - totalPayments - totalAdjustments);
}

// ====== Add Row ======
function addRow() {
    const row = document.createElement("tr");
    row.appendChild(createInputCell("number", "Enter amount")); // Charges
    row.appendChild(createInputCell("number", "Enter amount")); // Payments
    row.appendChild(createInputCell("number", "Enter amount")); // Adjustments
    row.appendChild(createBalanceCell()); // Balance
    row.appendChild(createTrashCell()); // Trash
    mbcTable.appendChild(row);
}

// ====== Clear Table ======
function clearTable() {
    mbcTable.innerHTML = "";
    calculateTotals();
}

// ====== Dark Mode Toggle ======
function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle("dark-mode", darkMode);
}

// ====== Save / Print ======
function saveTable() {
    window.print();
}

// ====== Click-to-Copy ======
function copyText(e) {
    const text = e.target.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const feedback = document.createElement("div");
        feedback.className = "copied-feedback";
        feedback.textContent = "Copied!";
        document.body.appendChild(feedback);
        const rect = e.target.getBoundingClientRect();
        feedback.style.top = rect.top + window.scrollY - 30 + "px";
        feedback.style.left = rect.left + window.scrollX + "px";
        setTimeout(() => feedback.remove(), 1000);
    });
}

// ====== Event Listeners ======
addRowBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addRow();
});

clearBtn.addEventListener("click", (e) => {
    e.preventDefault();
    clearTable();
});

saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    saveTable();
});

themeToggle.addEventListener("click", (e) => {
    e.preventDefault();
    toggleDarkMode();
});

// Attach copy-to-clipboard
[totalChargesEl, totalPaymentsEl, totalAdjustmentsEl, totalBalanceEl, incurredTotalEl].forEach(el => {
    el.addEventListener("click", copyText);
});

// ====== Initialize ======
addRow(); // Start with one row
calculateTotals();
