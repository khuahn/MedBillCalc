/*
 * mbc.js - Medical Bill Calculator Core Functionality
 * * Version History:
 * v1.5.0 (2024-03-15) - Current
 * - Added click-to-copy functionality for summary totals
 * - Visual feedback with "Copied!" animation
 * * v1.4.2 - Enhanced authentication with password validation
 * v1.4.1 - Reduced default rows from 10 to 5
 */

(() => {
    "use strict";

    const ALLOWED_PASSWORD = "M3d1c4l00!";
    const STORAGE_KEY = 'mbcData';
    const DEFAULT_ROW_COUNT = 5;

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

            if (charges > 0 && (payments > 0 || adjustments > 0) && balanceInput.dataset.manual !== "true") {
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

        const totalIncurred = totalPayments + totalBalance;
        update("totalCharges", totalCharges);
        update("totalPayments", totalPayments);
        update("totalAdjustments", totalAdjustments);
        update("totalBalance", totalBalance);
        update("incurredTotal", totalIncurred);
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

    function addRow(count = 1) {
        const tbody = document.getElementById("tableBody");
        if (!tbody) return;

        for (let i = 0; i < count; i++) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><input type="number" step="any" class="charges-input"></td>
                <td><input type="number" step="any" class="payments-input"></td>
                <td><input type="number" step="any" class="adjustments-input"></td>
                <td><input type="number" step="any" class="balance-input"></td>
            `;
            tbody.appendChild(tr);
        }
        saveTableData();
    }

    function clearTable() {
        if (!confirm("Are you sure you want to reset the calculator?\n\nAll entered data will be permanently lost!")) {
            return;
        }
        
        const tbody = document.getElementById("tableBody");
        if (tbody) {
            tbody.innerHTML = "";
            addRow(DEFAULT_ROW_COUNT);
            calculateTotals();
        }
        localStorage.removeItem(STORAGE_KEY);
    }

    function loadTableData() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) {
            addRow(DEFAULT_ROW_COUNT);
            return;
        }

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

        if (btn) btn.setAttribute('aria-pressed', String(isDark));
        if (icon) {
            icon.classList.toggle('fa-moon', !isDark);
            icon.classList.toggle('fa-sun', isDark);
        }
        if (label) label.textContent = isDark ? 'Light' : 'Dark';
    }

    function initTheme() {
        const saved = localStorage.getItem("theme");
        const isDark = saved === "dark";
        if (isDark) {
            document.body.classList.add("dark-mode");
        }
        updateThemeToggleUI(isDark);
    }

    function initLogin() {
        const loginForm = document.getElementById("loginForm");
        if (!loginForm) return;

        const pwd = document.getElementById("password");
        const errorMsg = document.getElementById("errorMsg");
        const toggleBtn = document.getElementById("togglePwd");

        loginForm.addEventListener("submit", e => {
            e.preventDefault();
            const input = pwd ? pwd.value : "";
            if (ALLOWED_PASSWORD === input) {
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
                const isHidden = pwd.type === "password";
                pwd.type = isHidden ? "text" : "password";
                const eyeIcon = toggleBtn.querySelector("i");
                if (eyeIcon) {
                    eyeIcon.classList.toggle("fa-eye");
                    eyeIcon.classList.toggle("fa-eye-slash");
                }
            });
        }
    }
    
    function initApp() {
        const addRowBtn = document.getElementById("addRowBtn");
        const clearTableBtn = document.getElementById("clearTableBtn");
        const printPDFBtn = document.getElementById("printPDFBtn");
        const themeToggle = document.getElementById("themeToggle");
        const tbody = document.getElementById("tableBody");

        if (addRowBtn) addRowBtn.addEventListener("click", () => addRow(1));
        if (clearTableBtn) clearTableBtn.addEventListener("click", clearTable);
        if (printPDFBtn) printPDFBtn.addEventListener("click", printPDF);
        if (themeToggle) themeToggle.addEventListener("click", toggleDarkMode);
        
        if (tbody) {
            loadTableData();
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
                    const calculatedBalance = charges - payments - adjustments;
                    balanceInput.value = calculatedBalance.toFixed(2);
                }

                calculateTotals();
                saveTableData();
            });
            calculateTotals();
        }

        document.addEventListener('click', (event) => {
            const targetId = event.target.id;
            if (['totalCharges', 'totalPayments', 'totalAdjustments', 'totalBalance', 'incurredTotal'].includes(targetId)) {
                copyToClipboard(event.target.textContent, event);
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        initTheme();
        initLogin();
        initApp();
    });

})();
