// JS: замените старую функцию calculateLoan() на эту
function calculateLoan() {
    const P = parseFloat(document.getElementById('loanAmount').value);
    const i = parseFloat(document.getElementById('loanRate').value) / 100 / 12;
    const n = parseInt(document.getElementById('loanMonths').value);
    const income = parseFloat(document.getElementById('income').value);
    const expenses = parseFloat(document.getElementById('expenses').value);
  
    const A = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const totalPaid = A * n;
    const overpaid = totalPaid - P;
  
    let advice = "";
    if (A > income / 2) {
      advice += "💡 Ай сайынғы төлем табысыңыздың жартысынан көп. Қысқа мерзімнен аулақ болыңыз. ";
    }
    if ((overpaid / P) > 0.3) {
      advice += "📉 Пайыздық артық төлем жоғары. Басқа ұсыныстарды қарастырған жөн.";
    }
    if (!advice) {
      advice = "✅ Несиелік шарттар сіздің табысыңызға сәйкес келеді.";
    }
  
    // Резюме
    document.getElementById('loanSummary').innerHTML = `
      <p>📆 Ай сайынғы төлем: <strong>${A.toFixed(2)} ₸</strong></p>
      <p>💵 Жалпы төленетін сома: <strong>${totalPaid.toFixed(2)} ₸</strong></p>
      <p>📈 Артық төлем: <strong>${overpaid.toFixed(2)} ₸</strong></p>
      <div class="advice">🧠 Кеңес: ${advice}</div>
    `;
  
    // Заполняем таблицу
    const tbody = document.querySelector("#paymentSchedule tbody");
    tbody.innerHTML = "";
    let remaining = P;
    const today = new Date();
  
    for (let month = 1; month <= n; month++) {
      const interest = remaining * i;
      const principal = A - interest;
      remaining -= principal;
  
      const payDate = new Date(today.getFullYear(), today.getMonth() + month, today.getDate());
      const dateStr = payDate.toLocaleDateString('kk-KZ');
  
      tbody.innerHTML += `
        <tr>
          <td style="padding:4px; border-bottom:1px solid #eee;">${month}</td>
          <td style="padding:4px; border-bottom:1px solid #eee;">${dateStr}</td>
          <td style="padding:4px; border-bottom:1px solid #eee;">${A.toFixed(2)}</td>
          <td style="padding:4px; border-bottom:1px solid #eee;">${interest.toFixed(2)}</td>
          <td style="padding:4px; border-bottom:1px solid #eee;">${principal.toFixed(2)}</td>
          <td style="padding:4px; border-bottom:1px solid #eee;">${remaining>0?remaining.toFixed(2):"0.00"}</td>
        </tr>
      `;
    }
  
    // Показываем блок
    const loanResult = document.getElementById('loanResult');
    loanResult.style.display = 'block';
  
    // Навешиваем контролы (чтобы не дублировались, удаляем старые)
    setupLoanControls();
  }
  
  // Навешиваем действия на кнопки
  function setupLoanControls() {
    // экспорт в CSV/Excel
    document.getElementById('exportBtn').onclick = exportSchedule;
    // печать
    document.getElementById('printBtn').onclick = printSchedule;
    // скрыть/показать
    const toggleBtn = document.getElementById('toggleBtn');
    toggleBtn.onclick = toggleSchedule;
  }
  
  // Функция экспорта в CSV с улучшенным форматированием
  function exportSchedule() {
    const table = document.getElementById('paymentSchedule');
  
    // Преобразуем HTML-таблицу в sheet
    const ws = XLSX.utils.table_to_sheet(table, { raw: false });
  
    const range = XLSX.utils.decode_range(ws['!ref']);
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4CAF50" } },
      alignment: { horizontal: "center", vertical: "center" }
    };
    const cellStyle = {
      alignment: { horizontal: "center" }
    };
  
    // Стили шапки (первая строка)
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = headerStyle;
    }
  
    // Применим стиль выравнивания и формат чисел
    for (let R = 1; R <= range.e.r; ++R) {
      for (let C = 0; C <= range.e.c; ++C) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (!cell) continue;
        cell.s = cellStyle;
  
        // Формат чисел — разделение тысяч
        if (!isNaN(cell.v) && typeof cell.v === "number") {
          cell.z = "#,##0.00";
        }
      }
    }
  
    // Автоширина
    const colWidths = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxLen = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell && cell.v) {
          const len = cell.v.toString().length;
          if (len > maxLen) maxLen = len;
        }
      }
      colWidths.push({ wch: maxLen + 2 });
    }
    ws['!cols'] = colWidths;
  
    // Создание книги и экспорт
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Төлем кестесі');
    XLSX.writeFile(wb, 'Tolem_kestesi.xlsx');
  }
  
   
  
  
  
  // Функция печати только расписания
  function printSchedule() {
    const tableHTML = document.getElementById('paymentSchedule').outerHTML;
    const newWin = window.open('', '', 'width=800,height=600');
    newWin.document.write(`<html><head><title>Печать графика</title></head><body>${tableHTML}</body></html>`);
    newWin.document.close();
    newWin.focus();
    newWin.print();
    newWin.close();
  }
  
  // Функция скрыть/показать расписание
  let scheduleVisible = true;
  function toggleSchedule() {
    const tbody = document.querySelector('#paymentSchedule');
    scheduleVisible = !scheduleVisible;
    tbody.style.display = scheduleVisible ? 'table' : 'none';
    document.getElementById('toggleBtn').innerText = scheduleVisible
      ? '🔽 Скрыть расписание'
      : '🔼 Показать расписание';
  }
  