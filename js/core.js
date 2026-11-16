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
export function filterTransactions(transactions, { q = '', type = '', cat = '' } = {}) {
  const query = String(q).toLowerCase();
  return (Array.isArray(transactions) ? transactions : [])
    .filter((t) => {
      const matchesQuery = !query || String(t.desc).toLowerCase().includes(query);
      const matchesType = !type || t.type === type;
      const matchesCat = !cat || t.cat === cat;
      return matchesQuery && matchesType && matchesCat;
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
