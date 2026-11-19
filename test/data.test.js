import { describe, expect, test } from 'bun:test';
import { TRANSACTIONS, BUDGETS, CATEGORIES, PAYMENT_METHODS, STARTER_TRANSACTIONS, STARTER_BUDGETS, STARTER_GOALS } from '../js/data.js';

describe('sample data integrity', () => {
  test('every transaction has the required fields with valid types', () => {
    for (const t of TRANSACTIONS) {
      expect(typeof t.id).toBe('number');
      expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof t.desc).toBe('string');
      expect(t.desc.length).toBeGreaterThan(0);
      expect(typeof t.cat).toBe('string');
      expect(t.type).toBe('expense');
      expect(Number.isFinite(t.amount)).toBe(true);
      expect(t.amount).toBeGreaterThan(0);
    }
  });

  test('every transaction has a known payment source', () => {
    for (const t of TRANSACTIONS) {
      expect(PAYMENT_METHODS).toContain(t.source);
    }
  });

  test('expense categories and budget limits are valid', () => {
    const cats = new Set(CATEGORIES);
    for (const t of TRANSACTIONS) {
      if (t.type === 'expense') expect(cats.has(t.cat)).toBe(true);
    }
    for (const b of BUDGETS) {
      expect(cats.has(b.cat)).toBe(true);
      expect(Number.isFinite(b.limit)).toBe(true);
      expect(b.limit).toBeGreaterThan(0);
    }
  });

  test('starter preset data is valid', () => {
    for (const t of STARTER_TRANSACTIONS) {
      expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(t.type).toBe('expense');
      expect(Number.isFinite(t.amount)).toBe(true);
      expect(PAYMENT_METHODS).toContain(t.source);
    }
    const cats = new Set(CATEGORIES);
    for (const b of STARTER_BUDGETS) {
      expect(cats.has(b.cat)).toBe(true);
      expect(b.limit).toBeGreaterThan(0);
    }
    expect(STARTER_GOALS.length).toBeGreaterThan(0);
  });
});
