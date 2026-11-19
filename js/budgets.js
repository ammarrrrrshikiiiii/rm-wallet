// ===== Budgets page =====
import { CATEGORIES } from './data.js';
import { renderShell } from './app.js';
import { getTransactions, getBudgets, setBudgets } from './store.js';
import { rm, monthName, deriveCurrentMonth, computeBudgets, escapeHtml, budgetTier } from './core.js';

const TIER_BG = { green: 'bg-success', amber: 'bg-warning', red: 'bg-danger' };
const TIER_HEX = { green: '#1f7a6d', amber: '#e9a23b', red: '#e0604a' };

let cBud = null;

if (renderShell('budgets')) {
  const $ = (id) => document.getElementById(id);
  const budgetModal = new bootstrap.Modal($('budgetModal'));

  function openEditor() {
    const map = Object.fromEntries(getBudgets().map((b) => [b.cat, b.limit]));
    $('budgetEditor').innerHTML = CATEGORIES.map((c, i) => `<div class="d-flex align-items-center gap-2 mb-2">
      <label class="flex-grow-1" for="b_${i}">${escapeHtml(c)}</label>
      <input id="b_${i}" class="form-control form-control-sm" style="max-width:150px" type="number" min="0" inputmode="decimal" value="${map[c] || ''}" placeholder="RM">
    </div>`).join('');
    budgetModal.show();
  }

  function render() {
    const month = deriveCurrentMonth(getTransactions());
    const label = month ? `${monthName(month)} ${month.slice(0, 4)}` : 'This month';
    $('budgetSub').textContent = `${label}: spending against your monthly limits.`;

    const data = computeBudgets(getTransactions(), getBudgets(), month);

    if (data.length === 0) {
      $('cards').innerHTML = `<div class="col-12"><div class="panel text-center py-5">
        <p class="text-secondary mb-3">No budget limits yet. Set limits to get spending guardrails.</p>
        <button id="setupBudgets" class="btn btn-teal" type="button"><i class="bi bi-plus-lg me-1"></i>Set up budgets</button>
      </div></div>`;
      document.getElementById('setupBudgets').addEventListener('click', openEditor);
      $('tb').innerHTML = '<tr><td colspan="4" class="text-center text-secondary py-4">No budget limits yet.</td></tr>';
      $('chartWrap').hidden = true;
      if (cBud) { cBud.destroy(); cBud = null; }
      return;
    }

    $('chartWrap').hidden = false;

    $('cards').innerHTML = data.map((d) => {
      const tier = budgetTier(d.pct);
      return `<div class="col-sm-6 col-lg-3"><div class="panel h-100">
        <div class="d-flex justify-content-between"><h3 class="h6 mb-2">${escapeHtml(d.cat)}</h3><span class="small ${d.pct >= 90 ? 'amt-out' : 'text-secondary'}">${d.pct}%</span></div>
        <div class="progress mb-2" role="progressbar" aria-label="${escapeHtml(d.cat)} budget" aria-valuenow="${Math.min(d.pct, 100)}" aria-valuemin="0" aria-valuemax="100" aria-valuetext="${d.pct}%"><div class="progress-bar ${TIER_BG[tier]}" style="width:${Math.min(d.pct, 100)}%"></div></div>
        <div class="small text-secondary">${rm(d.spent)} of ${rm(d.limit)}${d.pct >= 90 ? ' \u00b7 over by ' + rm(d.spent - d.limit) : ''}</div>
      </div></div>`;
    }).join('');

    $('tb').innerHTML = data.map((d) => `<tr>
      <td>${escapeHtml(d.cat)}</td>
      <td class="text-end">${rm(d.limit)}</td>
      <td class="text-end">${rm(d.spent)}</td>
      <td class="text-end ${d.left < 0 ? 'amt-out' : 'amt-in'}">${rm(d.left)}</td>
    </tr>`).join('');

    if (cBud) cBud.destroy();
    cBud = new Chart('cBud', {
      type: 'bar',
      data: {
        labels: data.map((d) => d.cat),
        datasets: [
          { label: 'Limit', backgroundColor: '#d9efe8', data: data.map((d) => d.limit) },
          { label: 'Spent', backgroundColor: data.map((d) => TIER_HEX[budgetTier(d.pct)]), data: data.map((d) => d.spent) },
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

  $('editBudgets').addEventListener('click', openEditor);

  $('budgetSave').addEventListener('click', () => {
    const list = CATEGORIES.map((c, i) => ({ cat: c, limit: Number($('b_' + i).value) || 0 }));
    setBudgets(list);
    budgetModal.hide();
    render();
  });

  render();
}
