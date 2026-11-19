// ===== Dashboard page =====
import { CATEGORIES, PAYMENT_METHODS, KEYWORD_RULES } from './data.js';
import { renderShell } from './app.js';
import {
  getTransactions, addTransaction, getBudgets, getGoals, addGoal, updateGoal, removeGoal,
  getSettings, saveSettings, todayISO,
} from './store.js';
import {
  rm, totals, monthName, deriveCurrentMonth, monthsIn, savingsRate, latestTransactions, escapeHtml, PALETTE,
  safeToSpend, daysUntil, lastDayOfMonth, suggestCategory,
} from './core.js';

const $ = (id) => document.getElementById(id);
const STATUS_LABEL = { green: 'On track', amber: 'Low &mdash; be careful', red: 'Over budget' };
let charts = [];
let selectedCat = CATEGORIES[0];

function destroyCharts() {
  charts.forEach((c) => c.destroy());
  charts = [];
}

function renderCharts(txns, month, cur) {
  const months = monthsIn(txns);
  charts.push(new Chart('cMonth', {
    type: 'bar',
    data: {
      labels: months.map(monthName),
      datasets: [
        { label: 'Income', backgroundColor: '#1f7a6d', data: months.map((x) => totals(txns.filter((t) => String(t.date).startsWith(x))).income) },
        { label: 'Expenses', backgroundColor: '#e0604a', data: months.map((x) => totals(txns.filter((t) => String(t.date).startsWith(x))).expense) },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { ticks: { callback: (v) => 'RM ' + v } } },
      plugins: { tooltip: { callbacks: { label: (c) => c.dataset.label + ': ' + rm(c.raw) } } },
    },
  }));

  const cats = {};
  cur.filter((t) => t.type === 'expense').forEach((t) => { cats[t.cat] = (cats[t.cat] || 0) + t.amount; });
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

function renderSafeToSpend(txns, month) {
  const settings = getSettings();
  const monthEnd = month ? lastDayOfMonth(month) : todayISO();
  const allowance = settings.allowanceDate || monthEnd;
  const spent = totals(txns.filter((t) => t.type === 'expense' && String(t.date).startsWith(month))).expense;
  const totalBudget = getBudgets().reduce((s, b) => s + b.limit, 0);
  const remaining = totalBudget - spent;
  const days = daysUntil(todayISO(), allowance);
  const sts = safeToSpend(remaining, days);

  const card = $('safeCard');
  card.className = 'hero-safe ' + sts.status;
  $('safeValue').textContent = `${rm(sts.perDay)}/day`;
  $('safeBadge').innerHTML = STATUS_LABEL[sts.status];
  $('safeSub').textContent = `${rm(remaining)} left \u00b7 ${days} day${days === 1 ? '' : 's'} until allowance`;
  $('allowanceDate').value = allowance;
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
  const all = totals(txns);
  const m = totals(cur);
  const months = monthsIn(txns);

  const year = month ? month.slice(0, 4) : '';
  $('sub').textContent = month
    ? `Welcome back, ${sessionStorage.getItem('rmUser') || 'guest'}. Here is your ${monthName(month)} ${year} snapshot.`
    : `Welcome back, ${sessionStorage.getItem('rmUser') || 'guest'}.`;

  $('sBalLabel').textContent = months.length >= 2
    ? `Balance (${monthName(months[0])}\u2013${monthName(months[months.length - 1])})`
    : 'Total balance';
  const mLabel = month ? ` (${monthName(month)})` : '';
  $('sIncLabel').textContent = `Income${mLabel}`;
  $('sExpLabel').textContent = `Spent${mLabel}`;
  $('sRateLabel').textContent = `Savings rate${mLabel}`;
  $('sBal').textContent = rm(all.balance);
  $('sInc').textContent = rm(m.income);
  $('sExp').textContent = rm(m.expense);
  const rate = savingsRate(m.income, m.expense);
  $('sRate').textContent = rate === null ? '\u2014' : `${rate}%`;

  $('recent').innerHTML = latestTransactions(txns, 5)
    .map((t) => `<tr><td>${escapeHtml(t.date)}</td><td>${escapeHtml(t.desc)}</td><td>${escapeHtml(t.cat)}</td><td><span class="badge rounded-pill badge-source">${escapeHtml(t.source || '')}</span></td><td class="text-end ${t.type === 'income' ? 'amt-in' : 'amt-out'}">${t.type === 'income' ? '+' : '-'}${rm(t.amount)}</td></tr>`)
    .join('');

  renderSafeToSpend(txns, month);
  renderGoals();
  destroyCharts();
  renderCharts(txns, month, cur);
}

if (renderShell('dashboard')) {
  // Payment source select.
  $('qaSource').innerHTML = PAYMENT_METHODS.map((s) => `<option>${escapeHtml(s)}</option>`).join('');

  renderChips();
  renderAll();

  // Allowance date change.
  $('allowanceDate').addEventListener('change', () => {
    saveSettings({ allowanceDate: $('allowanceDate').value || null });
    renderAll();
  });

  // Auto-category suggestion from the note.
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

  // Quick-add submit.
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

  // Savings goal form.
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
}
