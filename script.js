function switchTab(tab) {
    document.getElementById('loan').style.display = tab === 'loan' ? 'block' : 'none';
    document.getElementById('deposit').style.display = tab === 'deposit' ? 'block' : 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`).classList.add('active');
  }
  
  function calculateLoan() {
    const P = +document.getElementById('loanAmount').value;
    const i = +document.getElementById('loanRate').value / 100 / 12;
    const n = +document.getElementById('loanMonths').value;
    const income = +document.getElementById('income').value;
  
    const A = P * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1);
    const total = A * n;
    const overpaid = total - P;
    let advice = A > income / 2
      ? "💡 Ай сайынғы төлем табысыңыздың жартысынан көп."
      : overpaid / P > 0.3
      ? "📉 Пайыздық артық төлем жоғары."
      : "✅ Несиелік шарттар сәйкес келеді.";
  
    document.getElementById('loanSummary').innerHTML = `
      <p>📆 Ай сайынғы төлем: <strong>${A.toFixed(2)} ₸</strong></p>
      <p>💵 Жалпы төлем: <strong>${total.toFixed(2)} ₸</strong></p>
      <p>📈 Артық төлем: <strong>${overpaid.toFixed(2)} ₸</strong></p>
      <div class="advice">${advice}</div>
    `;
    const tbody = document.querySelector("#paymentSchedule tbody");
    tbody.innerHTML = "";
    let remain = P;
    const now = new Date();
    for (let m = 1; m <= n; m++) {
      const int = remain * i;
      const prin = A - int;
      remain -= prin;
      const date = new Date(now.getFullYear(), now.getMonth() + m, now.getDate()).toLocaleDateString('kk-KZ');
      tbody.innerHTML += `<tr><td>${m}</td><td>${date}</td><td>${A.toFixed(2)}</td><td>${int.toFixed(2)}</td><td>${prin.toFixed(2)}</td><td>${remain.toFixed(2)}</td></tr>`;
    }
    document.getElementById('loanResult').style.display = 'block';
    document.getElementById('exportBtn').onclick = exportSchedule;
    document.getElementById('printBtn').onclick = () => printTable('paymentSchedule');
    document.getElementById('toggleBtn').onclick = () => toggleTable('paymentSchedule', 'toggleBtn');
  }
  
  function calculateDeposit() {
    const P = +document.getElementById('depositAmount').value;
    const rate = +document.getElementById('depositRate').value / 100 / 12;
    const months = +document.getElementById('depositMonths').value;
    const monthly = +document.getElementById('monthlyAddition').value;
  
    let balance = P, profit = 0;
    const tbody = document.querySelector("#depositSchedule tbody");
    tbody.innerHTML = "";
    const now = new Date();
    for (let m = 1; m <= months; m++) {
      const int = balance * rate;
      balance += int + monthly;
      profit += int;
      const date = new Date(now.getFullYear(), now.getMonth() + m, now.getDate()).toLocaleDateString('kk-KZ');
      tbody.innerHTML += `<tr><td>${m}</td><td>${date}</td><td>${monthly.toFixed(2)}</td><td>${int.toFixed(2)}</td><td>${balance.toFixed(2)}</td></tr>`;
    }
    document.getElementById('depositSummary').innerHTML = `
      <p>📊 Болашақ сома: <strong>${balance.toFixed(2)} ₸</strong></p>
      <p>💰 Таза табыс: <strong>${profit.toFixed(2)} ₸</strong></p>
    `;
    document.getElementById('depositResult').style.display = 'block';
    document.getElementById('exportDepositBtn').onclick = () => exportExcel("depositSchedule", "deposit.xlsx");
    document.getElementById('printDepositBtn').onclick = () => printTable("depositSchedule");
    document.getElementById('toggleDepositBtn').onclick = () => toggleTable("depositSchedule", "toggleDepositBtn");
  }
  
  function exportSchedule() {
    exportExcel("paymentSchedule", "loan.xlsx");
  }
  
  function exportExcel(tableId, filename) {
    const table = document.getElementById(tableId);
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, filename);
  }
  
  function printTable(id) {
    const html = document.getElementById(id).outerHTML;
    const win = window.open();
    win.document.write(`<html><body>${html}</body></html>`);
    win.document.close();
    win.print();
  }
  
  function toggleTable(id, btnId) {
    const table = document.getElementById(id);
    table.style.display = table.style.display === "none" ? "table" : "none";
    document.getElementById(btnId).innerText = table.style.display === "none" ? "🔼 Показать" : "🔽 Скрыть";
  }
  
  document.getElementById("themeToggle").onclick = () => {
    const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    document.getElementById("themeToggle").innerHTML = theme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  };
  
  document.documentElement.setAttribute("data-theme", localStorage.getItem("theme") || "light");
  