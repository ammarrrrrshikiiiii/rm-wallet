// ===== Dashboard page (expenses-only) =====
import { CATEGORIES, PAYMENT_METHODS, KEYWORD_RULES } from './data.js';
import { renderShell } from './app.js';
import {
  getTransactions, addTransaction, getBudgets, getGoals, addGoal, updateGoal, removeGoal,
  getSettings, saveSettings, topUpBudget, resetBudget, todayISO, isDemo, loadSampleData, clearAllData, resetDemo,
} from './store.js';
import {
  rm, monthName, deriveCurrentMonth, monthsIn, latestTransactions, escapeHtml, PALETTE,
  safeToSpendToday, firstDayOfMonth, lastDayOfMonth, inclusiveDaysBetween, remainingDaysInPeriod,
  dailyAllowance, expensesBetween, expensesOnDate, expensesBeforeDate, suggestCategory, totalExpenses,
} from './core.js';

const $ = (id) => document.getElementById(id);
const STATUS_LABEL = { green: 'On track', amber: 'Low &mdash; be careful', red: 'Over today\u2019s limit' };
const shortDate = (iso) => (iso ? `${Number(iso.slice(8, 10))} ${monthName(iso.slice(0, 7))}` : '');
let charts = [];
let selectedCat = CATEGORIES[0];

function destroyCharts() {
  charts.forEach((c) => c.destroy());
  charts = [];
}

function effectiveBudget() {
  // The monthly budget is the single source of truth for remaining/allowance math.
  // Per-category limits are a separate guardrail feature, not part of this total.
  return Number(getSettings().monthlyBudget) || 0;
}

// Resolve the active budget period from settings, defaulting to the data month.
function budgetPeriod(month) {
  const settings = getSettings();
  const monthStart = month ? (firstDayOfMonth(month) || todayISO()) : todayISO();
  const monthEnd = month ? (lastDayOfMonth(month) || todayISO()) : todayISO();
  const start = settings.budgetStart || monthStart;
  const end = settings.budgetEnd || settings.allowanceDate || monthEnd;
  return { start, end };
}

function renderCharts(txns, month, cur) {
  const months = monthsIn(txns);

  charts.push(new Chart('cMonth', {
    type: 'bar',
    data: {
      labels: months.map(monthName),
      datasets: [{ label: 'Spent', backgroundColor: '#1f7a6d', data: months.map((x) => totalExpenses(txns, x)) }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { ticks: { callback: (v) => 'RM ' + v } } },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => 'Spent: ' + rm(c.raw) } } },
    },
  }));

  const cats = {};
  cur.forEach((t) => { cats[t.cat] = (cats[t.cat] || 0) + t.amount; });
  charts.push(new Chart('cCat', {
    type: 'doughnut',
    data: { labels: Object.keys(cats), datasets: [{ data: Object.values(cats), backgroundColor: PALETTE }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: (c) => c.label + ': ' + rm(c.raw) } } },
    },
  }));
}

function renderDailyAllowance(txns, budgetTotal, spent, period) {
  const { start, end } = period;
  const periodDays = inclusiveDaysBetween(start, end);
  const today = todayISO();
  const spentToday = expensesOnDate(txns, today);
  const spentBeforeToday = expensesBeforeDate(txns, start, end, today);
  const remDays = remainingDaysInPeriod(today, start, end);
  const m = safeToSpendToday(budgetTotal, spentBeforeToday, spentToday, remDays);
  const baselineDaily = dailyAllowance(budgetTotal, periodDays);
  const remaining = budgetTotal - spent;

  const card = $('safeCard');
  if (budgetTotal <= 0) {
    card.className = 'hero-safe green';
    $('safeValue').textContent = 'Set a budget';
    $('safeBadge').innerHTML = 'Getting started';
    $('safeSub').textContent = 'Set your budget amount and period to unlock safe-to-spend.';
    $('dailyNow').textContent = '';
    return;
  }

  card.className = 'hero-safe ' + m.status;
  $('safeValue').textContent = rm(m.todayLeft);
  $('safeBadge').innerHTML = STATUS_LABEL[m.status];
  $('safeSub').textContent = `${rm(spentToday)} spent today \u00b7 limit ${rm(m.todayAllowance)}`;
  $('dailyNow').textContent = `${rm(baselineDaily)}/day \u00b7 ${rm(remaining)} remaining \u00b7 ${periodDays}-day period`;
}

function renderChips() {
  $('qaChips').innerHTML = CATEGORIES.map((c) =>
    `<button type="button" class="chip ${c === selectedCat ? 'active' : ''}" data-cat="${escapeHtml(c)}"><i class="bi bi-tag me-1"></i>${escapeHtml(c)}</button>`
  ).join('');
  $('qaChips').querySelectorAll('.chip').forEach((el) => {
    el.addEventListener('click', () => {
      selectedCat = el.dataset.cat;
      renderChips();
    });
  });
}

function renderGoals() {
  const goals = getGoals();
  const wrap = $('goals');
  if (goals.length === 0) {
    wrap.innerHTML = '<div class="col-12 text-secondary">No savings goals yet. Create one to start a Tabung jar.</div>';
    return;
  }
  wrap.innerHTML = goals.map((g) => {
    const target = Number(g.target) || 0;
    const saved = Number(g.saved) || 0;
    const pct = target > 0 ? Math.round((saved / target) * 100) : 0;
    const fill = Math.min(100, pct);
    return `<div class="col-12 col-sm-6 col-lg-4">
      <div class="jar h-100">
        <div class="jar-fill" style="height:${fill}%"></div>
        <div class="jar-body">
          <div class="d-flex justify-content-between"><span class="jar-name">${escapeHtml(g.name)}</span>
            <button type="button" class="btn btn-sm btn-outline-secondary py-0" data-del="${g.id}" aria-label="Delete ${escapeHtml(g.name)}"><i class="bi bi-trash"></i></button></div>
          <div class="jar-pct">${pct}%</div>
          <div class="jar-meta">${rm(saved)} of ${rm(target)}</div>
          <div class="jar-actions d-flex gap-1 mt-2">
            <input type="number" class="form-control form-control-sm" min="0" step="1" placeholder="RM" data-dep-amt="${g.id}" aria-label="Top up amount">
            <button type="button" class="btn btn-sm btn-teal" data-dep="${g.id}"><i class="bi bi-plus"></i></button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  wrap.querySelectorAll('[data-dep]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const amt = Number(wrap.querySelector(`[data-dep-amt="${btn.dataset.dep}"]`).value) || 0;
      if (amt <= 0) return;
      updateGoal(Number(btn.dataset.dep), { saved: (Number((getGoals().find((g) => g.id === Number(btn.dataset.dep)) || {}).saved) || 0) + amt });
      renderAll();
    });
  });
  wrap.querySelectorAll('[data-del]').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeGoal(Number(btn.dataset.del));
      renderAll();
    });
  });
}

function renderAll() {
  const txns = getTransactions();
  const month = deriveCurrentMonth(txns);
  const cur = txns.filter((t) => String(t.date).startsWith(month));
  const months = monthsIn(txns);

  const year = month ? month.slice(0, 4) : '';
  $('sub').textContent = month
    ? `Welcome back, ${sessionStorage.getItem('rmUser') || 'guest'}. Here is your ${monthName(month)} ${year} snapshot.`
    : `Welcome back, ${sessionStorage.getItem('rmUser') || 'guest'}.`;

  const budgetTotal = effectiveBudget();
  const period = budgetPeriod(month);
  const spent = expensesBetween(txns, period.start, period.end);
  const remaining = budgetTotal - spent;

  $('sBudgetLabel').textContent = 'Monthly Budget';
  $('sSpentLabel').textContent = 'Spent So Far';
  $('sRemainLabel').textContent = 'Remaining Budget';
  $('sBudget').textContent = rm(budgetTotal);
  $('sSpent').textContent = rm(spent);
  const remEl = $('sRemain');
  remEl.textContent = rm(remaining);
  remEl.className = 'stat-value ' + (remaining < 0 ? 'amt-out' : 'amt-in');

  const recent = latestTransactions(txns, 5);
  $('recent').innerHTML = recent.length
    ? recent.map((t) => `<tr><td>${escapeHtml(t.date)}</td><td>${escapeHtml(t.desc)}</td><td>${escapeHtml(t.cat)}</td><td><span class="badge rounded-pill badge-source">${escapeHtml(t.source || '')}</span></td><td class="text-end amt-out">-${rm(t.amount)}</td></tr>`).join('')
    : '<tr><td colspan="5" class="text-center text-secondary py-4">No expenses yet. Add one below or load sample data.</td></tr>';

  renderDailyAllowance(txns, budgetTotal, spent, period);
  renderGoals();
  destroyCharts();
  renderCharts(txns, month, cur);
}

if (renderShell('dashboard')) {
  $('qaSource').innerHTML = PAYMENT_METHODS.map((s) => `<option>${escapeHtml(s)}</option>`).join('');

  const budgetModal = new bootstrap.Modal($('budgetModal'));

  renderChips();
  renderAll();

  // Edit budget modal.
  $('editBudgetBtn').addEventListener('click', () => {
    const settings = getSettings();
    const period = budgetPeriod(deriveCurrentMonth(getTransactions()));
    $('budgetAmount').value = Number(settings.monthlyBudget) > 0 ? Number(settings.monthlyBudget) : '';
    $('budgetStart').value = settings.budgetStart || period.start;
    $('budgetEnd').value = settings.budgetEnd || period.end;
    $('budgetHint').textContent = '';
    budgetModal.show();
  });

  $('budgetSaveBtn').addEventListener('click', () => {
    const amount = Number($('budgetAmount').value);
    const start = $('budgetStart').value;
    const end = $('budgetEnd').value;
    if (!Number.isFinite(amount) || amount <= 0) { $('budgetHint').textContent = 'Enter a budget amount greater than zero.'; return; }
    if (!start || !end) { $('budgetHint').textContent = 'Choose both a start and end date.'; return; }
    if (end < start) { $('budgetHint').textContent = 'End date must be on or after the start date.'; return; }
    saveSettings({ monthlyBudget: amount, budgetStart: start, budgetEnd: end, allowanceDate: end });
    budgetModal.hide();
    renderAll();
  });

  $('resetBudgetBtn').addEventListener('click', () => {
    resetBudget();
    renderAll();
  });

  $('topUpToggle').addEventListener('click', () => {
    $('topUpForm').hidden = !$('topUpForm').hidden;
  });
  $('topUpApply').addEventListener('click', () => {
    const v = Number($('topUpAmount').value);
    if (!Number.isFinite(v) || v <= 0) return;
    topUpBudget(v);
    $('topUpAmount').value = '';
    $('topUpForm').hidden = true;
    renderAll();
  });

  // Auto-category suggestion from the note (bilingual keywords).
  $('qaNote').addEventListener('input', () => {
    const suggested = suggestCategory($('qaNote').value, KEYWORD_RULES);
    if (suggested) {
      selectedCat = suggested;
      renderChips();
      $('qaHint').textContent = `Suggested category: ${suggested}`;
    } else {
      $('qaHint').textContent = '';
    }
  });

  $('qaAdd').addEventListener('click', () => {
    const amount = Number($('qaAmount').value);
    const desc = $('qaNote').value.trim();
    if (!Number.isFinite(amount) || amount <= 0) {
      $('qaHint').textContent = 'Enter an amount greater than zero.';
      return;
    }
    if (!desc) {
      $('qaHint').textContent = 'Add a short note so the entry is easy to find.';
      return;
    }
    addTransaction({ date: todayISO(), desc, cat: selectedCat, type: 'expense', amount, source: $('qaSource').value });
    $('qaAmount').value = '';
    $('qaNote').value = '';
    $('qaHint').textContent = `Added ${rm(amount)} to ${selectedCat}.`;
    renderAll();
  });

  $('goalToggle').addEventListener('click', () => {
    $('goalForm').hidden = !$('goalForm').hidden;
  });
  $('goalSave').addEventListener('click', () => {
    const name = $('goalName').value.trim();
    const target = Number($('goalTarget').value);
    if (!name || !Number.isFinite(target) || target <= 0) return;
    addGoal({ name, target });
    $('goalName').value = '';
    $('goalTarget').value = '';
    $('goalForm').hidden = true;
    renderAll();
  });

  // Data actions (per-account).
  const dataModal = new bootstrap.Modal($('dataModal'));
  $('dataBtn').addEventListener('click', () => {
    $('resetDemoBtn').classList.toggle('d-none', !isDemo());
    dataModal.show();
  });
  $('loadSampleBtn').addEventListener('click', () => { loadSampleData(); location.reload(); });
  $('clearAllBtn').addEventListener('click', () => { clearAllData(); location.reload(); });
  $('resetDemoBtn').addEventListener('click', () => { resetDemo(); location.reload(); });
}
