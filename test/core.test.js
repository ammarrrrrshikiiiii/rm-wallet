import { describe, expect, test } from 'bun:test';
import {
  rm, totals, monthName, deriveCurrentMonth, monthsIn, spentInMonth,
  computeBudgets, filterTransactions, latestTransactions, savingsRate, escapeHtml,
} from '../js/core.js';
import { TRANSACTIONS, BUDGETS } from '../js/data.js';

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

describe('totals', () => {
  test('returns zeros for empty input', () => {
    expect(totals([])).toEqual({ income: 0, expense: 0, balance: 0 });
  });
  test('sums income and expense and computes balance', () => {
    const list = [
      { type: 'income', amount: 1000 },
      { type: 'income', amount: 400 },
      { type: 'expense', amount: 250 },
      { type: 'expense', amount: 50 },
    ];
    expect(totals(list)).toEqual({ income: 1400, expense: 300, balance: 1100 });
  });
  test('ignores non-finite amounts', () => {
    expect(totals([{ type: 'income', amount: 'oops' }, { type: 'income', amount: 10 }])).toEqual({ income: 10, expense: 0, balance: 10 });
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
    expect(spentInMonth(TRANSACTIONS, 'Food', '2026-11')).toBe(290);
    expect(spentInMonth(TRANSACTIONS, 'Housing', '2026-11')).toBe(450);
    expect(spentInMonth(TRANSACTIONS, 'Food', '1999-01')).toBe(0);
  });
  test('computeBudgets joins limits with spending', () => {
    const rows = computeBudgets(TRANSACTIONS, BUDGETS, '2026-11');
    const housing = rows.find((r) => r.cat === 'Housing');
    const food = rows.find((r) => r.cat === 'Food');
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
    expect(filterTransactions(TRANSACTIONS, { q: 'grab' })).toHaveLength(2);
    expect(filterTransactions(TRANSACTIONS, { q: 'GROCERIES' })).toHaveLength(4);
  });
  test('filters by type and category', () => {
    const income = filterTransactions(TRANSACTIONS, { type: 'income' });
    expect(income.every((t) => t.type === 'income')).toBe(true);
    const food = filterTransactions(TRANSACTIONS, { cat: 'Food' });
    expect(food.every((t) => t.cat === 'Food')).toBe(true);
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

describe('savingsRate', () => {
  test('computes a whole percentage', () => {
    expect(savingsRate(1200, 990)).toBe(18);
    expect(savingsRate(1200, 1200)).toBe(0);
  });
  test('returns null when income is zero or missing', () => {
    expect(savingsRate(0, 100)).toBeNull();
    expect(savingsRate(undefined, 100)).toBeNull();
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
    const rows = computeBudgets(TRANSACTIONS, [{ cat: 'Food', limit: 0 }], '2026-11');
    expect(rows[0].pct).toBe(0);
    expect(rows[0].left).toBe(-290);
  });
  test('savingsRate returns null for negative income', () => {
    expect(savingsRate(-100, 50)).toBeNull();
  });
  test('deriveCurrentMonth returns null when all dates are malformed', () => {
    expect(deriveCurrentMonth([{ date: 'garbage' }, { date: 'also-bad' }])).toBeNull();
  });
  test('monthName falls back to the input for out-of-range months', () => {
    expect(monthName('2026-13')).toBe('2026-13');
    expect(monthName('2026-00')).toBe('2026-00');
  });
});
