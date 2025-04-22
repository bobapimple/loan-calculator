document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("themeToggle");
  const themeIcon = {
    light: '<i class="fas fa-moon"></i>',
    dark: '<i class="fas fa-sun"></i>'
  };

  // Initialize theme
  const initTheme = () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    themeToggleBtn.innerHTML = themeIcon[savedTheme];
  };

  // Theme toggle
  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    themeToggleBtn.innerHTML = themeIcon[newTheme];
  });

  // Tab switching
  window.switchTab = (tab) => {
    document.getElementById('loan').style.display = tab === 'loan' ? 'block' : 'none';
    document.getElementById('deposit').style.display = tab === 'deposit' ? 'block' : 'none';
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const isActive = btn.getAttribute('data-tab') === tab;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
  };

  // Calculate loan
  window.calculateLoan = () => {
    const P = +document.getElementById('loanAmount').value;
    const i = +document.getElementById('loanRate').value / 100 / 12;
    const n = +document.getElementById('loanMonths').value;
    const income = +document.getElementById('income').value;

    const A = P * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1);
    const total = A * n;
    const overpaid = total - P;
    const advice = A > income / 2
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
      tbody.innerHTML += `<tr><td>${m}</td><td>${date}</td><td>${A.toFixed(2)}</td><td>${int.toFixed(2)}</td><td>${prin.toFixed(2)}</td><td>${remain > 0 ? remain.toFixed(2) : '0.00'}</td></tr>`;
    }

    document.getElementById('loanResult').style.display = 'block';
    setupLoanButtons();
  };

  // Calculate deposit
  window.calculateDeposit = () => {
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
    setupDepositButtons();
  };

  // Setup loan buttons
  function setupLoanButtons() {
    document.getElementById('exportBtn').onclick = () => exportExcel('paymentSchedule', 'loan.xlsx');
    document.getElementById('printBtn').onclick = () => printTable('paymentSchedule');
    document.getElementById('toggleBtn').onclick = () => toggleTable('paymentSchedule', 'toggleBtn');
  }

  // Setup deposit buttons
  function setupDepositButtons() {
    document.getElementById('exportDepositBtn').onclick = () => exportExcel('depositSchedule', 'deposit.xlsx');
    document.getElementById('printDepositBtn').onclick = () => printTable('depositSchedule');
    document.getElementById('toggleDepositBtn').onclick = () => toggleTable('depositSchedule', 'toggleDepositBtn');
  }

  // Excel export
  function exportExcel(tableId, filename) {
    try {
      const table = document.getElementById(tableId);
      if (!table) throw new Error(`Table with id ${tableId} not found`);
      
      const ws = XLSX.utils.table_to_sheet(table);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Export error:", error);
      alert("Excel экспорт қатесі: " + error.message);
    }
  }

  // Print table
  function printTable(id) {
    try {
      const table = document.getElementById(id);
      if (!table) throw new Error(`Table with id ${id} not found`);
      
      const html = table.outerHTML;
      const win = window.open();
      win.document.write(`
        <html>
          <head>
            <title>Кестені басып шығару</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
              th { background-color: #00bfa5; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
          </head>
          <body>${html}</body>
        </html>
      `);
      win.document.close();
      win.print();
    } catch (error) {
      console.error("Print error:", error);
      alert("Басып шығару қатесі: " + error.message);
    }
  }

  // Toggle visibility
  function toggleTable(id, btnId) {
    const table = document.getElementById(id);
    const btn = document.getElementById(btnId);
    
    if (table && btn) {
      const isHidden = table.style.display === "none";
      table.style.display = isHidden ? "table" : "none";
      btn.innerHTML = isHidden 
        ? '<i class="fas fa-chevron-down"></i> Жасыру' 
        : '<i class="fas fa-chevron-up"></i> Көрсету';
    }
  }

  initTheme();
});