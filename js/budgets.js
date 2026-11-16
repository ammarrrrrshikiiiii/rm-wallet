// ===== Budgets page =====
import { TRANSACTIONS, BUDGETS } from './data.js';
import { renderShell } from './app.js';
import { rm, monthName, deriveCurrentMonth, computeBudgets, escapeHtml } from './core.js';

if (renderShell('budgets')) {
  const CURRENT_MONTH = deriveCurrentMonth(TRANSACTIONS);
  const label = CURRENT_MONTH ? `${monthName(CURRENT_MONTH)} ${CURRENT_MONTH.slice(0, 4)}` : 'This month';
  document.getElementById('budgetSub').textContent = `${label}: spending against your monthly limits.`;

  const data = computeBudgets(TRANSACTIONS, BUDGETS, CURRENT_MONTH);
  const barColor = (p) => (p > 100 ? 'bg-danger' : p >= 80 ? 'bg-warning' : 'bg-success');

  document.getElementById('cards').innerHTML = data.map((d) => `<div class="col-sm-6 col-lg-4"><div class="panel h-100">
    <div class="d-flex justify-content-between"><h3 class="h6 mb-2">${escapeHtml(d.cat)}</h3><span class="small ${d.pct > 100 ? 'amt-out' : 'text-secondary'}">${d.pct}%</span></div>
    <div class="progress mb-2" role="progressbar" aria-label="${escapeHtml(d.cat)} budget" aria-valuenow="${Math.min(d.pct, 100)}" aria-valuemin="0" aria-valuemax="100" aria-valuetext="${d.pct}%"><div class="progress-bar ${barColor(d.pct)}" style="width:${Math.min(d.pct, 100)}%"></div></div>
    <div class="small text-secondary">${rm(d.spent)} of ${rm(d.limit)}${d.pct > 100 ? ' \u00b7 over by ' + rm(d.spent - d.limit) : ''}</div>
  </div></div>`).join('');

  document.getElementById('tb').innerHTML = data.map((d) => `<tr>
    <td>${escapeHtml(d.cat)}</td>
    <td class="text-end">${rm(d.limit)}</td>
    <td class="text-end">${rm(d.spent)}</td>
    <td class="text-end ${d.left < 0 ? 'amt-out' : 'amt-in'}">${rm(d.left)}</td>
  </tr>`).join('');

  new Chart('cBud', {
    type: 'bar',
    data: {
      labels: data.map((d) => d.cat),
      datasets: [
        { label: 'Limit', backgroundColor: '#d9efe8', data: data.map((d) => d.limit) },
        { label: 'Spent', backgroundColor: data.map((d) => (d.pct > 100 ? '#e0604a' : '#1f7a6d')), data: data.map((d) => d.spent) },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { ticks: { callback: (v) => 'RM ' + v } } },
      plugins: { tooltip: { callbacks: { label: (c) => c.dataset.label + ': ' + rm(c.raw) } } },
    },
  });
}
