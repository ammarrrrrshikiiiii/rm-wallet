// ===== Dashboard page =====
import { TRANSACTIONS } from './data.js';
import { renderShell } from './app.js';
import {
  rm, totals, monthName, deriveCurrentMonth, monthsIn, savingsRate, latestTransactions, escapeHtml, PALETTE,
} from './core.js';

if (renderShell('dashboard')) {
  const CURRENT_MONTH = deriveCurrentMonth(TRANSACTIONS);
  const cur = TRANSACTIONS.filter((t) => String(t.date).startsWith(CURRENT_MONTH));
  const all = totals(TRANSACTIONS);
  const m = totals(cur);
  const months = monthsIn(TRANSACTIONS);

  const year = CURRENT_MONTH ? CURRENT_MONTH.slice(0, 4) : '';
  document.getElementById('sub').textContent = CURRENT_MONTH
    ? `Welcome back, ${sessionStorage.getItem('rmUser') || 'guest'}. Here is your ${monthName(CURRENT_MONTH)} ${year} snapshot.`
    : `Welcome back, ${sessionStorage.getItem('rmUser') || 'guest'}.`;

  document.getElementById('sBalLabel').textContent = months.length >= 2
    ? `Balance (${monthName(months[0])}\u2013${monthName(months[months.length - 1])})`
    : 'Total balance';

  // Stat labels reference the latest data month, not the wall-clock month.
  const mLabel = CURRENT_MONTH ? ` (${monthName(CURRENT_MONTH)})` : '';
  document.getElementById('sIncLabel').textContent = `Income${mLabel}`;
  document.getElementById('sExpLabel').textContent = `Spent${mLabel}`;
  document.getElementById('sRateLabel').textContent = `Savings rate${mLabel}`;

  document.getElementById('sBal').textContent = rm(all.balance);
  document.getElementById('sInc').textContent = rm(m.income);
  document.getElementById('sExp').textContent = rm(m.expense);
  const rate = savingsRate(m.income, m.expense);
  document.getElementById('sRate').textContent = rate === null ? '\u2014' : `${rate}%`;

  // Chart 1: income vs expense per month (grouped bar).
  new Chart('cMonth', {
    type: 'bar',
    data: {
      labels: months.map(monthName),
      datasets: [
        { label: 'Income', backgroundColor: '#1f7a6d', data: months.map((x) => totals(TRANSACTIONS.filter((t) => String(t.date).startsWith(x))).income) },
        { label: 'Expenses', backgroundColor: '#e0604a', data: months.map((x) => totals(TRANSACTIONS.filter((t) => String(t.date).startsWith(x))).expense) },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { ticks: { callback: (v) => 'RM ' + v } } },
      plugins: { tooltip: { callbacks: { label: (c) => c.dataset.label + ': ' + rm(c.raw) } } },
    },
  });

  // Chart 2: current month spending by category (doughnut).
  const cats = {};
  cur.filter((t) => t.type === 'expense').forEach((t) => { cats[t.cat] = (cats[t.cat] || 0) + t.amount; });
  new Chart('cCat', {
    type: 'doughnut',
    data: { labels: Object.keys(cats), datasets: [{ data: Object.values(cats), backgroundColor: PALETTE }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: (c) => c.label + ': ' + rm(c.raw) } } },
    },
  });

  // Latest 5 transactions.
  document.getElementById('recent').innerHTML = latestTransactions(TRANSACTIONS, 5)
    .map((t) => `<tr><td>${escapeHtml(t.date)}</td><td>${escapeHtml(t.desc)}</td><td>${escapeHtml(t.cat)}</td><td class="text-end ${t.type === 'income' ? 'amt-in' : 'amt-out'}">${t.type === 'income' ? '+' : '-'}${rm(t.amount)}</td></tr>`)
    .join('');
}
