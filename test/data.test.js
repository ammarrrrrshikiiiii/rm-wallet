import { describe, expect, test } from 'bun:test';
import { TRANSACTIONS, BUDGETS } from '../js/data.js';

describe('sample data integrity', () => {
  test('every transaction has the required fields with valid types', () => {
    for (const t of TRANSACTIONS) {
      expect(typeof t.id).toBe('number');
      expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof t.desc).toBe('string');
      expect(t.desc.length).toBeGreaterThan(0);
      expect(typeof t.cat).toBe('string');
      expect(['income', 'expense']).toContain(t.type);
      expect(Number.isFinite(t.amount)).toBe(true);
      expect(t.amount).toBeGreaterThan(0);
    }
  });

  test('every budget category appears in the transactions', () => {
    const cats = new Set(TRANSACTIONS.map((t) => t.cat));
    for (const b of BUDGETS) {
      expect(cats.has(b.cat)).toBe(true);
    }
  });

  test('budget limits are positive numbers', () => {
    for (const b of BUDGETS) {
      expect(Number.isFinite(b.limit)).toBe(true);
      expect(b.limit).toBeGreaterThan(0);
    }
  });
});
