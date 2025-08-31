const setText = (id, val) => {
  const el = document.getElementById(id);
  if (el) el.textContent = val.toFixed(2);
};

const calculate = () => {
  const rows = document.querySelectorAll("#tableBody tr");
  let totalTotal = 0, totalPayments = 0, totalAdjustments = 0, totalBalance = 0;

  rows.forEach(row => {
    const total = parseFloat(row.querySelector(".total").value) || 0;
    const payments = parseFloat(row.querySelector(".payments").value) || 0;
    const adjustments = parseFloat(row.querySelector(".adjustments").value) || 0;
    const balance = total - payments - adjustments;

    row.querySelector(".balance").textContent = balance.toFixed(2);

    totalTotal += total;
    totalPayments += payments;
    totalAdjustments += adjustments;
    totalBalance += balance;
  });

  setText("totalTotal", totalTotal);
  setText("totalPayments", totalPayments);
  setText("totalAdjustments", totalAdjustments);
  setText("totalBalance", totalBalance);
};

const addRow = () => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="number" class="total" value="0" /></td>
    <td><input type="number" class="payments" value="0" /></td>
    <td><input type="number" class="adjustments" value="0" /></td>
    <td><span class="balance">0.00</span></td>
  `;
  document.getElementById("tableBody").appendChild(row);
  bindInputs(row);
  calculate();
};

const clearTable = () => {
  document.getElementById("tableBody").innerHTML = "";
  addRow();
};

const bindInputs = (row) => {
  row.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", calculate);
  });
};

document.querySelectorAll("#tableBody tr").forEach(bindInputs);
calculate();

const toggleMode = () => {
  document.body.classList.toggle("light");
};
