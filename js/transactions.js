// ===== Expenses page (MAE-style monthly breakdown) =====
import { CATEGORIES, PAYMENT_METHODS, KEYWORD_RULES, CATEGORY_META } from './data.js';
import { renderShell } from './app.js';
import {
  getTransactions, addTransaction, getBudgets, todayISO,
  exportBackupJSON, importBackupJSON, exportTransactionsCSV, importTransactionsCSV,
} from './store.js';
import {
  rm, escapeHtml, monthName, monthsIn, deriveCurrentMonth, filterTransactions,
  spendingByCategory, spendingByMerchant, monthOverMonthChange, suggestCategory, budgetTier,
} from './core.js';

const TIER_BG = { green: 'bg-success', amber: 'bg-warning', red: 'bg-danger' };

function download(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

if (renderShell('transactions')) {
  const $ = (id) => document.getElementById(id);
  const meta = (cat) => CATEGORY_META[cat] || { icon: 'bi-tag', color: '#9aa7a3' };

  // Populate selects.
  CATEGORIES.forEach((c) => {
    $('fCat').insertAdjacentHTML('beforeend', `<option>${escapeHtml(c)}</option>`);
    $('aeCat').insertAdjacentHTML('beforeend', `<option>${escapeHtml(c)}</option>`);
  });
  PAYMENT_METHODS.forEach((s) => {
    $('fSource').insertAdjacentHTML('beforeend', `<option>${escapeHtml(s)}</option>`);
    $('aeSource').insertAdjacentHTML('beforeend', `<option>${escapeHtml(s)}</option>`);
  });

  let selectedMonth = deriveCurrentMonth(getTransactions());
  let activeTab = 'latest';
  let expenseCharts = [];
  const addModal = new bootstrap.Modal($('addExpenseModal'));

  const expenseList = () => getTransactions().filter((t) => t.type === 'expense' && String(t.date).startsWith(selectedMonth));

  function destroyCharts() {
    expenseCharts.forEach((c) => c.destroy());
    expenseCharts = [];
  }

  function renderMonthTabs(months) {
    $('monthTabs').innerHTML = months.map((m) =>
      `<button type="button" class="month-tab ${m === selectedMonth ? 'active' : ''}" data-month="${m}">${monthName(m).toUpperCase()}</button>`
    ).join('');
    $('monthTabs').querySelectorAll('.month-tab').forEach((el) => el.addEventListener('click', () => {
      selectedMonth = el.dataset.month;
      renderAll();
    }));
  }

  function renderDonut(months) {
    const byCat = spendingByCategory(getTransactions(), selectedMonth);
    const spent = byCat.reduce((s, c) => s + c.total, 0);
    $('spentTotal').textContent = rm(spent);

    // Month-over-month pill (falls back to share of budget).
    const idx = months.indexOf(selectedMonth);
    const prev = idx > 0 ? months[idx - 1] : null;
    const pill = $('momPill');
    const mom = prev == null ? null : monthOverMonthChange(spent, spendingByCategory(getTransactions(), prev).reduce((s, c) => s + c.total, 0));
    if (mom === null) {
      const totalBudget = getBudgets().reduce((s, b) => s + b.limit, 0);
      const share = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;
      pill.textContent = `${share}% of budget`;
      pill.className = 'badge rounded-pill badge-source';
    } else if (mom > 0) {
      pill.textContent = `\u25B2 ${mom}% vs ${monthName(prev)}`;
      pill.className = 'badge rounded-pill badge-expense';
    } else if (mom < 0) {
      pill.textContent = `\u25BC ${-mom}% vs ${monthName(prev)}`;
      pill.className = 'badge rounded-pill badge-income';
    } else {
      pill.textContent = `Same as ${monthName(prev)}`;
      pill.className = 'badge rounded-pill badge-source';
    }

    const has = byCat.length > 0;
    destroyCharts();
    expenseCharts.push(new Chart('cExpense', {
      type: 'doughnut',
      data: {
        labels: has ? byCat.map((c) => c.cat) : ['No expenses'],
        datasets: [{
          data: has ? byCat.map((c) => c.total) : [1],
          backgroundColor: has ? byCat.map((c) => meta(c.cat).color) : ['#e6ebe8'],
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => `${c.label}: ${rm(c.raw)}` } },
        },
      },
    }));
  }

  function renderCatStrip() {
    const byCat = spendingByCategory(getTransactions(), selectedMonth);
    $('catStrip').innerHTML = byCat.map((c) => {
      const m = meta(c.cat);
      const active = $('fCat').value === c.cat ? ' active' : '';
      return `<button type="button" class="cat-item${active}" data-cat="${escapeHtml(c.cat)}">
        <span class="cat-orb" style="background:${m.color}"><i class="bi ${m.icon}"></i></span>
        <span class="cat-name">${escapeHtml(c.cat)}</span>
        <span class="cat-amt">-${rm(c.total)}</span>
      </button>`;
    }).join('') || '<div class="text-secondary small">No expenses this month.</div>';

    $('catStrip').querySelectorAll('.cat-item').forEach((el) => el.addEventListener('click', () => {
      $('fCat').value = el.dataset.cat;
      switchTab('latest');
      renderCatStrip();
      renderLatest();
    }));
  }

  function renderLatest() {
    const list = filterTransactions(expenseList(), {
      q: $('q').value,
      cat: $('fCat').value,
      source: $('fSource').value,
    });
    $('rows').innerHTML = list.length
      ? list.map((t) => `<tr>
          <td>${escapeHtml(t.date)}</td>
          <td>${escapeHtml(t.desc)}</td>
          <td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${meta(t.cat).color};margin-right:.4rem"></span>${escapeHtml(t.cat)}</td>
          <td><span class="badge rounded-pill badge-source">${escapeHtml(t.source || '')}</span></td>
          <td class="text-end amt-out">-${rm(t.amount)}</td>
        </tr>`).join('')
      : '<tr><td colspan="5" class="text-center text-secondary py-4">No expenses this month. Try another month or clear the filters.</td></tr>';
    $('count').textContent = `${list.length} expense${list.length === 1 ? '' : 's'} in ${monthName(selectedMonth)}`;
  }

  function renderCategories() {
    const budgets = getBudgets();
    const byCat = spendingByCategory(getTransactions(), selectedMonth);
    $('catBreakdown').innerHTML = byCat.map((c) => {
      const m = meta(c.cat);
      const budget = budgets.find((b) => b.cat === c.cat);
      const limit = budget ? budget.limit : null;
      const pct = limit ? Math.min(100, Math.round((c.total / limit) * 100)) : null;
      const tier = limit ? TIER_BG[budgetTier(pct)] : '';
      return `<div class="breakdown-row" data-cat="${escapeHtml(c.cat)}" role="button" tabindex="0">
        <span class="br-icon" style="background:${m.color}"><i class="bi ${m.icon}"></i></span>
        <span class="br-main"><div class="br-name">${escapeHtml(c.cat)}</div>
          <div class="br-sub">${limit ? `${rm(c.total)} of ${rm(limit)} budget` : 'No budget set'}</div>
          ${pct !== null ? `<div class="progress mt-1" style="height:6px"><div class="progress-bar ${tier}" style="width:${pct}%"></div></div>` : ''}
        </span>
        <span class="br-amt">-${rm(c.total)}</span>
      </div>`;
    }).join('') || '<div class="text-secondary">No expenses this month.</div>';

    $('catBreakdown').querySelectorAll('.breakdown-row').forEach((el) => el.addEventListener('click', () => {
      $('fCat').value = el.dataset.cat;
      switchTab('latest');
      renderCatStrip();
      renderLatest();
    }));
  }

  function renderMerchants() {
    const byMerchant = spendingByMerchant(getTransactions(), selectedMonth);
    $('merchantBreakdown').innerHTML = byMerchant.map((m) => `<div class="breakdown-row" data-q="${escapeHtml(m.merchant)}" role="button" tabindex="0">
      <span class="br-icon" style="background:var(--ink)"><i class="bi bi-shop"></i></span>
      <span class="br-main"><div class="br-name">${escapeHtml(m.merchant)}</div><div class="br-sub">${m.count} transaction${m.count === 1 ? '' : 's'}</div></span>
      <span class="br-amt">-${rm(m.total)}</span>
    </div>`).join('') || '<div class="text-secondary">No expenses this month.</div>';

    $('merchantBreakdown').querySelectorAll('.breakdown-row').forEach((el) => el.addEventListener('click', () => {
      $('q').value = el.dataset.q;
      switchTab('latest');
      renderLatest();
    }));
  }

  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.subnav button').forEach((b) => {
      const on = b.dataset.tab === tab;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $('pane-latest').classList.toggle('d-none', tab !== 'latest');
    $('pane-categories').classList.toggle('d-none', tab !== 'categories');
    $('pane-merchants').classList.toggle('d-none', tab !== 'merchants');
    if (tab === 'latest') renderLatest();
    else if (tab === 'categories') renderCategories();
    else renderMerchants();
  }

  function renderAll() {
    const months = monthsIn(getTransactions());
    if (months.length === 0) return;
    if (!months.includes(selectedMonth)) selectedMonth = months[months.length - 1];
    $('sub').textContent = `Where your money went in ${monthName(selectedMonth)} ${selectedMonth.slice(0, 4)}.`;
    renderMonthTabs(months);
    renderDonut(months);
    renderCatStrip();
    switchTab(activeTab);
  }

  // Sub-navigation.
  document.querySelectorAll('.subnav button').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));

  // Quick actions.
  $('addExpenseBtn').addEventListener('click', () => {
    $('aeAmount').value = '';
    $('aeNote').value = '';
    $('aeCat').value = CATEGORIES[0];
    $('aeHint').textContent = '';
    addModal.show();
  });

  $('filterBtn').addEventListener('click', () => {
    $('filterRow').classList.toggle('d-none');
    if (activeTab !== 'latest') switchTab('latest');
  });

  // Add-expense modal: keyword auto-suggestion + save.
  $('aeNote').addEventListener('input', () => {
    const suggested = suggestCategory($('aeNote').value, KEYWORD_RULES);
    if (suggested) {
      $('aeCat').value = suggested;
      $('aeHint').textContent = `Suggested category: ${suggested}`;
    } else {
      $('aeHint').textContent = '';
    }
  });

  $('aeSave').addEventListener('click', () => {
    const amount = Number($('aeAmount').value);
    const desc = $('aeNote').value.trim();
    if (!Number.isFinite(amount) || amount <= 0) { $('aeHint').textContent = 'Enter an amount greater than zero.'; return; }
    if (!desc) { $('aeHint').textContent = 'Add a short note so the entry is easy to find.'; return; }
    addTransaction({ date: todayISO(), desc, cat: $('aeCat').value, type: 'expense', amount, source: $('aeSource').value });
    addModal.hide();
    if ($('fCat').value) { $('fCat').value = ''; }
    renderAll();
  });

  // Filters.
  $('q').addEventListener('input', renderLatest);
  $('fCat').addEventListener('input', () => { renderCatStrip(); renderLatest(); });
  $('fSource').addEventListener('input', renderLatest);

  // Backup.
  $('expJSON').addEventListener('click', () => { download('rm-wallet-backup.json', exportBackupJSON(), 'application/json'); $('backupMsg').textContent = 'Backup exported as JSON.'; });
  $('expCSV').addEventListener('click', () => { download('rm-wallet-transactions.csv', exportTransactionsCSV(), 'text/csv'); $('backupMsg').textContent = 'Transactions exported as CSV.'; });
  $('impBtn').addEventListener('click', () => $('impFile').click());
  $('impFile').addEventListener('change', async () => {
    const file = $('impFile').files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const isJSON = text.trim().startsWith('{');
      if (isJSON) importBackupJSON(text); else importTransactionsCSV(text);
      $('backupMsg').textContent = 'Imported. Reloading\u2026';
      setTimeout(() => location.reload(), 600);
    } catch (err) {
      $('backupMsg').textContent = 'Import failed: ' + (err && err.message ? err.message : 'unknown error');
    } finally {
      $('impFile').value = '';
    }
  });

  renderAll();
}
