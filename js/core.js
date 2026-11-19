// ===== RM Wallet – pure domain logic (no DOM, runs in browser and bun test) =====

// Deterministic Malaysian Ringgit formatter: RM 1,234.56
export function rm(value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return 'RM 0.00';
  const neg = v < 0;
  const abs = Math.abs(v);
  const [int, frac] = abs.toFixed(2).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${neg ? '-' : ''}RM ${grouped}.${frac}`;
}

// Sum income / expense / balance for a list of transactions.
export function totals(list) {
  const safe = Array.isArray(list) ? list : [];
  let income = 0;
  let expense = 0;
  for (const t of safe) {
    const amount = Number(t.amount);
    if (!Number.isFinite(amount)) continue;
    if (t.type === 'income') income += amount;
    else if (t.type === 'expense') expense += amount;
  }
  return { income, expense, balance: income - expense };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// '2026-11' -> 'Nov' (falls back to the raw string if malformed).
export function monthName(ym) {
  if (typeof ym !== 'string') return '';
  const m = Number(ym.split('-')[1]);
  return MONTHS[m - 1] || ym;
}

// Latest 'YYYY-MM' present in the data (used as the "current" tracking month).
export function deriveCurrentMonth(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return null;
  const dates = transactions.map((t) => String(t.date)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  if (dates.length === 0) return null;
  dates.sort().reverse();
  return dates[0].slice(0, 7);
}

// Unique, chronologically sorted 'YYYY-MM' values.
export function monthsIn(transactions) {
  const set = new Set((Array.isArray(transactions) ? transactions : []).map((t) => String(t.date).slice(0, 7)));
  return [...set].filter((ym) => /^\d{4}-\d{2}$/.test(ym)).sort();
}

// Total spent in one category during one month.
export function spentInMonth(transactions, category, month) {
  return (Array.isArray(transactions) ? transactions : [])
    .filter((t) => t.type === 'expense' && t.cat === category && String(t.date).startsWith(month))
    .reduce((sum, t) => sum + (Number.isFinite(Number(t.amount)) ? Number(t.amount) : 0), 0);
}

// Join budget limits with actual spending for a month.
export function computeBudgets(transactions, budgets, month) {
  return (Array.isArray(budgets) ? budgets : []).map((b) => {
    const limit = Number(b.limit) || 0;
    const spent = spentInMonth(transactions, b.cat, month);
    const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    return { cat: b.cat, limit, spent, pct, left: limit - spent };
  });
}

// Search + filter transactions, newest first.
export function filterTransactions(transactions, { q = '', type = '', cat = '', source = '' } = {}) {
  const query = String(q).toLowerCase();
  return (Array.isArray(transactions) ? transactions : [])
    .filter((t) => {
      const matchesQuery = !query || String(t.desc).toLowerCase().includes(query);
      const matchesType = !type || t.type === type;
      const matchesCat = !cat || t.cat === cat;
      const matchesSource = !source || t.source === source;
      return matchesQuery && matchesType && matchesCat && matchesSource;
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

// Newest n transactions.
export function latestTransactions(transactions, n) {
  return [...(Array.isArray(transactions) ? transactions : [])]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, n);
}

// Savings rate for a month as a whole percentage, or null when undefined (no income).
export function savingsRate(income, expense) {
  const i = Number(income);
  const e = Number(expense);
  if (!Number.isFinite(i) || i <= 0) return null;
  return Math.round(((i - e) / i) * 100);
}

// Chart colour palette used by dashboard and budgets.
export const PALETTE = ['#1f7a6d', '#e9a23b', '#e0604a', '#4f8fba', '#8a6fb0', '#7fb77e'];

// Escape text before injecting into innerHTML. Prevents stored/reflected XSS.
export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// ===== v0.2: safe-to-spend, guardrails, suggestions, backup =====

// 'YYYY-MM-DD' from a Date object (local time).
export function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Last calendar day of a 'YYYY-MM' month, as 'YYYY-MM-DD' (or null if malformed).
export function lastDayOfMonth(ym) {
  const m = /^(\d{4})-(\d{2})$/.exec(ym || '');
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const day = new Date(y, mo, 0).getDate();
  return `${y}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Whole days from today to a target date, clamped to 0 (both 'YYYY-MM-DD').
export function daysUntil(todayISO, targetISO) {
  const t = new Date(`${todayISO}T00:00:00`);
  const g = new Date(`${targetISO}T00:00:00`);
  if (Number.isNaN(t.getTime()) || Number.isNaN(g.getTime())) return 0;
  return Math.max(0, Math.ceil((g - t) / 86400000));
}

// Daily amount below which the safe-to-spend indicator turns amber.
export const DAILY_LOW = 15;

// Remaining budget divided by days left, with a green/amber/red status.
export function safeToSpend(remainingBudget, daysRemaining) {
  const left = Number.isFinite(Number(remainingBudget)) ? Number(remainingBudget) : 0;
  const days = Math.max(1, Math.floor(Number(daysRemaining) || 0));
  const perDay = left / days;
  let status = 'green';
  if (left <= 0) status = 'red';
  else if (perDay < DAILY_LOW) status = 'amber';
  return { perDay, days, status };
}

// Budget guardrail tier: green <70%, amber 70-89%, red >=90%.
export function budgetTier(pct) {
  const p = Number(pct);
  if (!Number.isFinite(p) || p < 70) return 'green';
  if (p < 90) return 'amber';
  return 'red';
}

// First matching category for a note, or null. `rules` is [[RegExp, category], ...].
export function suggestCategory(note, rules) {
  const n = String(note || '').toLowerCase();
  for (const [pattern, cat] of rules || []) {
    if (pattern.test(n)) return cat;
  }
  return null;
}

// Serialise transactions to CSV (header: date,description,category,type,amount,source).
export function transactionsToCSV(list) {
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  const rows = (Array.isArray(list) ? list : []).map((t) =>
    [t.date, t.desc, t.cat, t.type, t.amount, t.source || ''].map(esc).join(','));
  return ['date,description,category,type,amount,source', ...rows].join('\n');
}

// Parse CSV (handles quoted fields and embedded commas/newlines) back into transactions.
export function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const src = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); field = ''; rows.push(row); row = []; }
    else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (n) => header.indexOf(n);
  const get = (cols, n) => { const i = idx(n); return i >= 0 ? (cols[i] || '').trim() : ''; };
  return rows.slice(1)
    .map((cols) => ({
      date: get(cols, 'date'),
      desc: get(cols, 'description'),
      cat: get(cols, 'category'),
      type: get(cols, 'type') || 'expense',
      amount: Number(get(cols, 'amount')),
      source: get(cols, 'source') || 'Cash',
    }))
    .filter((t) => t.date && t.desc && Number.isFinite(t.amount));
}

// Round-trip-safe JSON helpers (kept pure and injectable for tests).
export function toJSON(value) { return JSON.stringify(value, null, 2); }
export function parseJSON(text) { return JSON.parse(text); }

// Expenses only, grouped by category for a month, sorted highest first.
export function spendingByCategory(transactions, month) {
  const map = {};
  (Array.isArray(transactions) ? transactions : []).forEach((t) => {
    if (t.type !== 'expense' || !String(t.date).startsWith(month)) return;
    const amount = Number(t.amount) || 0;
    map[t.cat] = (map[t.cat] || 0) + amount;
  });
  return Object.entries(map).map(([cat, total]) => ({ cat, total })).sort((a, b) => b.total - a.total);
}

// Expenses only, grouped by merchant (description) for a month, sorted highest first.
export function spendingByMerchant(transactions, month) {
  const map = {};
  (Array.isArray(transactions) ? transactions : []).forEach((t) => {
    if (t.type !== 'expense' || !String(t.date).startsWith(month)) return;
    const amount = Number(t.amount) || 0;
    const merchant = t.desc || 'Unknown';
    map[merchant] = map[merchant] || { total: 0, count: 0 };
    map[merchant].total += amount;
    map[merchant].count += 1;
  });
  return Object.entries(map)
    .map(([merchant, v]) => ({ merchant, total: v.total, count: v.count }))
    .sort((a, b) => b.total - a.total);
}

// Month-over-month percentage change, or null when the base month is zero/missing.
export function monthOverMonthChange(current, previous) {
  const c = Number(current);
  const p = Number(previous);
  if (!Number.isFinite(c) || !Number.isFinite(p) || p === 0) return null;
  return Math.round(((c - p) / p) * 100);
}
