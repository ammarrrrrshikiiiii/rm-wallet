import { describe, expect, test } from 'bun:test';
import {
  rm, totalExpenses, monthName, deriveCurrentMonth, monthsIn, spentInMonth,
  computeBudgets, filterTransactions, latestTransactions, escapeHtml,
  safeToSpend, budgetTier, daysUntil, lastDayOfMonth, firstDayOfMonth, suggestCategory, toISODate,
  inclusiveDaysBetween, remainingDaysInPeriod, dailyAllowance, expensesBetween,
  transactionsToCSV, parseCSV, DAILY_LOW,
  spendingByCategory, spendingByMerchant, monthOverMonthChange,
} from '../js/core.js';
import { TRANSACTIONS, BUDGETS, KEYWORD_RULES } from '../js/data.js';

describe('rm currency formatter', () => {
  test('formats whole ringgit with two decimals', () => {
    expect(rm(1200)).toBe('RM 1,200.00');
    expect(rm(0)).toBe('RM 0.00');
  });
  test('groups thousands and rounds cents', () => {
    expect(rm(1234567.8)).toBe('RM 1,234,567.80');
    expect(rm(85)).toBe('RM 85.00');
  });
  test('handles negatives and non-finite values', () => {
    expect(rm(-50)).toBe('-RM 50.00');
    expect(rm(NaN)).toBe('RM 0.00');
    expect(rm(undefined)).toBe('RM 0.00');
  });
});

describe('totalExpenses', () => {
  test('returns zero for empty input', () => {
    expect(totalExpenses([])).toBe(0);
  });
  test('sums expenses only', () => {
    const list = [
      { type: 'expense', amount: 250 },
      { type: 'expense', amount: 50 },
      { type: 'expense', amount: 'oops' },
    ];
    expect(totalExpenses(list)).toBe(300);
  });
  test('scopes to a month', () => {
    const list = [
      { date: '2026-11-01', type: 'expense', amount: 100 },
      { date: '2026-10-01', type: 'expense', amount: 200 },
    ];
    expect(totalExpenses(list, '2026-11')).toBe(100);
  });
});

describe('month helpers', () => {
  test('monthName maps YYYY-MM to a short month', () => {
    expect(monthName('2026-11')).toBe('Nov');
    expect(monthName('2026-01')).toBe('Jan');
    expect(monthName('garbage')).toBe('garbage');
  });
  test('deriveCurrentMonth returns the latest month in the data', () => {
    expect(deriveCurrentMonth(TRANSACTIONS)).toBe('2026-11');
    expect(deriveCurrentMonth([])).toBeNull();
  });
  test('monthsIn returns sorted unique months', () => {
    expect(monthsIn(TRANSACTIONS)).toEqual(['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11']);
  });
});

describe('budget computations', () => {
  test('spentInMonth sums only expenses of the given category and month', () => {
    expect(spentInMonth(TRANSACTIONS, 'Food & Drink', '2026-11')).toBe(290);
    expect(spentInMonth(TRANSACTIONS, 'Housing', '2026-11')).toBe(450);
    expect(spentInMonth(TRANSACTIONS, 'Food & Drink', '1999-01')).toBe(0);
  });
  test('computeBudgets joins limits with spending', () => {
    const rows = computeBudgets(TRANSACTIONS, BUDGETS, '2026-11');
    const housing = rows.find((r) => r.cat === 'Housing');
    const food = rows.find((r) => r.cat === 'Food & Drink');
    const entertainment = rows.find((r) => r.cat === 'Entertainment');
    expect(housing).toEqual({ cat: 'Housing', limit: 450, spent: 450, pct: 100, left: 0 });
    expect(food.pct).toBe(83);
    expect(food.left).toBe(60);
    expect(entertainment.pct).toBe(120);
    expect(entertainment.left).toBe(-20);
  });
});

describe('filtering and sorting', () => {
  test('search matches descriptions case-insensitively', () => {
    expect(filterTransactions(TRANSACTIONS, { q: 'grab' })).toHaveLength(3);
    expect(filterTransactions(TRANSACTIONS, { q: 'GROCERIES' })).toHaveLength(4);
  });
  test('filters by type and category', () => {
    const expenses = filterTransactions(TRANSACTIONS, { type: 'expense' });
    expect(expenses.every((t) => t.type === 'expense')).toBe(true);
    const food = filterTransactions(TRANSACTIONS, { cat: 'Food & Drink' });
    expect(food.every((t) => t.cat === 'Food & Drink')).toBe(true);
  });
  test('sorts newest first', () => {
    const list = filterTransactions(TRANSACTIONS);
    expect(list[0].date).toBe('2026-11-14');
  });
  test('latestTransactions returns the newest n', () => {
    const top = latestTransactions(TRANSACTIONS, 5);
    expect(top).toHaveLength(5);
    expect(top[0].date).toBe('2026-11-14');
  });
});

describe('escapeHtml', () => {
  test('escapes HTML-significant characters', () => {
    expect(escapeHtml(`<img src=x onerror="alert(1)"> & 'quotes'`))
      .toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;quotes&#39;');
  });
});

describe('edge cases', () => {
  test('computeBudgets handles a zero limit without division by zero', () => {
    const rows = computeBudgets(TRANSACTIONS, [{ cat: 'Food & Drink', limit: 0 }], '2026-11');
    expect(rows[0].pct).toBe(0);
    expect(rows[0].left).toBe(-290);
  });
  test('deriveCurrentMonth returns null when all dates are malformed', () => {
    expect(deriveCurrentMonth([{ date: 'garbage' }, { date: 'also-bad' }])).toBeNull();
  });
  test('monthName falls back to the input for out-of-range months', () => {
    expect(monthName('2026-13')).toBe('2026-13');
    expect(monthName('2026-00')).toBe('2026-00');
  });
});

describe('safe-to-spend', () => {
  test('divides remaining budget by days left', () => {
    expect(safeToSpend(180, 10)).toEqual({ perDay: 18, days: 10, status: 'green' });
  });
  test('flags amber under the daily threshold and red when over budget', () => {
    expect(safeToSpend(100, 10).perDay).toBe(10);
    expect(safeToSpend(100, 10).status).toBe('amber');
    expect(safeToSpend(0, 10).status).toBe('red');
    expect(safeToSpend(-5, 10).status).toBe('red');
  });
  test('clamps days to at least one to avoid division by zero', () => {
    expect(safeToSpend(50, 0).perDay).toBe(50);
  });
});

describe('budgetTier', () => {
  test('green under 70, amber 70-89, red 90+', () => {
    expect(budgetTier(69)).toBe('green');
    expect(budgetTier(70)).toBe('amber');
    expect(budgetTier(89)).toBe('amber');
    expect(budgetTier(90)).toBe('red');
    expect(budgetTier(140)).toBe('red');
  });
});

describe('date helpers', () => {
  test('lastDayOfMonth', () => {
    expect(lastDayOfMonth('2026-11')).toBe('2026-11-30');
    expect(lastDayOfMonth('2026-02')).toBe('2026-02-28');
    expect(lastDayOfMonth('2024-02')).toBe('2024-02-29');
    expect(lastDayOfMonth('bad')).toBeNull();
  });
  test('daysUntil clamps at zero and counts forward', () => {
    expect(daysUntil('2026-11-19', '2026-11-30')).toBe(11);
    expect(daysUntil('2026-11-30', '2026-11-19')).toBe(0);
    expect(daysUntil('2026-11-19', '2026-11-19')).toBe(0);
  });
  test('toISODate formats a Date', () => {
    expect(toISODate(new Date(2026, 10, 19))).toBe('2026-11-19');
  });
});

describe('keyword category suggestion', () => {
  test('suggests from English keywords', () => {
    expect(suggestCategory('mamak nasi lemak', KEYWORD_RULES)).toBe('Food & Drink');
    expect(suggestCategory('grab to campus', KEYWORD_RULES)).toBe('Transport');
    expect(suggestCategory('unifi internet bill', KEYWORD_RULES)).toBe('Bills');
    expect(suggestCategory('mydin groceries', KEYWORD_RULES)).toBe('Groceries');
  });
  test('suggests from Bahasa Melayu keywords', () => {
    expect(suggestCategory('isi minyak', KEYWORD_RULES)).toBe('Transport');
    expect(suggestCategory('minyak masak', KEYWORD_RULES)).toBe('Groceries');
    expect(suggestCategory('sarapan nasi lemak', KEYWORD_RULES)).toBe('Food & Drink');
    expect(suggestCategory('bayar bil elektrik', KEYWORD_RULES)).toBe('Bills');
    expect(suggestCategory('topup data', KEYWORD_RULES)).toBe('Bills');
    expect(suggestCategory('sewa bilik', KEYWORD_RULES)).toBe('Housing');
  });
  test('disambiguates short tokens', () => {
    expect(suggestCategory('beli air mineral', KEYWORD_RULES)).toBe('Food & Drink');
    expect(suggestCategory('bil air', KEYWORD_RULES)).toBe('Bills');
    expect(suggestCategory('tambang bas', KEYWORD_RULES)).toBe('Transport');
    expect(suggestCategory('ron95', KEYWORD_RULES)).toBe('Transport');
    expect(suggestCategory('sabun', KEYWORD_RULES)).toBe('Groceries');
    expect(suggestCategory('ubat', KEYWORD_RULES)).toBe('Groceries');
  });
  test('returns null when nothing matches', () => {
    expect(suggestCategory('xyz', KEYWORD_RULES)).toBeNull();
    expect(suggestCategory('', KEYWORD_RULES)).toBeNull();
  });
});

describe('budget period helpers', () => {
  test('firstDayOfMonth', () => {
    expect(firstDayOfMonth('2026-11')).toBe('2026-11-01');
    expect(firstDayOfMonth('bad')).toBeNull();
  });
  test('inclusiveDaysBetween counts both endpoints', () => {
    expect(inclusiveDaysBetween('2026-11-01', '2026-11-30')).toBe(30);
    expect(inclusiveDaysBetween('2026-11-19', '2026-11-19')).toBe(1);
    expect(inclusiveDaysBetween('2026-11-30', '2026-11-01')).toBe(0);
    expect(inclusiveDaysBetween('2026-02-01', '2026-02-28')).toBe(28);
  });
  test('remainingDaysInPeriod clamps at the period boundaries', () => {
    expect(remainingDaysInPeriod('2026-11-19', '2026-11-01', '2026-11-30')).toBe(12);
    expect(remainingDaysInPeriod('2026-12-15', '2026-11-01', '2026-11-30')).toBe(1);
    expect(remainingDaysInPeriod('2026-11-01', '2026-11-25', '2026-12-24')).toBe(30);
  });
  test('dailyAllowance divides budget by days and avoids zero', () => {
    expect(dailyAllowance(1000, 30)).toBeCloseTo(33.33, 2);
    expect(dailyAllowance(1000, 0)).toBe(1000);
    expect(dailyAllowance(0, 30)).toBe(0);
  });
  test('expensesBetween filters by inclusive date range', () => {
    const list = [
      { date: '2026-11-10', type: 'expense', amount: 100 },
      { date: '2026-11-20', type: 'expense', amount: 50 },
      { date: '2026-12-01', type: 'expense', amount: 200 },
    ];
    expect(expensesBetween(list, '2026-11-01', '2026-11-30')).toBe(150);
  });
});

describe('CSV round-trip', () => {
  test('serialises and parses transactions', () => {
    const back = parseCSV(transactionsToCSV(TRANSACTIONS));
    expect(back).toHaveLength(TRANSACTIONS.length);
    expect(back[0].date).toBe(TRANSACTIONS[0].date);
    expect(back[0].desc).toBe(TRANSACTIONS[0].desc);
    expect(back[0].source).toBe(TRANSACTIONS[0].source);
  });
  test('handles quoted fields with commas', () => {
    const list = [{ date: '2026-11-19', desc: 'Mamak, teh & roti', cat: 'Food & Drink', type: 'expense', amount: 12.5, source: 'Cash' }];
    const back = parseCSV(transactionsToCSV(list));
    expect(back[0].desc).toBe('Mamak, teh & roti');
    expect(back[0].amount).toBe(12.5);
  });
});

describe('expense breakdown', () => {
  test('spendingByCategory sums only expenses for the month, sorted', () => {
    const rows = spendingByCategory(TRANSACTIONS, '2026-11');
    expect(rows[0]).toEqual({ cat: 'Housing', total: 450 });
    expect(rows.map((r) => r.cat)).toEqual(['Housing', 'Food & Drink', 'Entertainment', 'Transport', 'Education']);
  });
  test('spendingByMerchant groups and counts expenses', () => {
    const rows = spendingByMerchant(TRANSACTIONS, '2026-11');
    expect(rows[0]).toEqual({ merchant: 'Hostel & rent', total: 450, count: 1 });
  });
  test('monthOverMonthChange computes a percentage or null', () => {
    expect(monthOverMonthChange(990, 980)).toBe(1);
    expect(monthOverMonthChange(500, 1000)).toBe(-50);
    expect(monthOverMonthChange(500, 0)).toBeNull();
    expect(monthOverMonthChange(500, undefined)).toBeNull();
  });
});
