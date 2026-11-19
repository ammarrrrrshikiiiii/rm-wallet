import { describe, expect, test } from 'bun:test';

// Minimal localStorage/sessionStorage shims for bun.
function makeStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    clear: () => { m.clear(); },
  };
}

globalThis.localStorage = makeStorage();
globalThis.sessionStorage = makeStorage();

// Seed the legacy (pre-isolation) global keys to verify migration.
localStorage.setItem('rm.txns', JSON.stringify([{ id: 99, date: '2026-11-19', desc: 'legacy entry', cat: 'Other', type: 'expense', amount: 1, source: 'Cash' }]));
localStorage.setItem('rm.goals', JSON.stringify([{ id: 1, name: 'legacy goal', target: 100, saved: 0 }]));
localStorage.setItem('rm.settings', JSON.stringify({ allowanceDate: '2026-11-25' }));

const store = await import('../js/store.js');

describe('per-user data isolation', () => {
  test('migrates legacy global data into the demo account and removes old keys', () => {
    expect(localStorage.getItem('rm.txns')).toBeNull();
    expect(localStorage.getItem('rm.goals')).toBeNull();
    expect(localStorage.getItem('rm.settings')).toBeNull();

    sessionStorage.setItem('rmUser', 'demo');
    expect(store.getTransactions().some((t) => t.id === 99)).toBe(true);
    expect(store.getGoals().some((g) => g.name === 'legacy goal')).toBe(true);
    expect(store.getSettings().allowanceDate).toBe('2026-11-25');
  });

  test('isolates transactions between accounts', () => {
    sessionStorage.setItem('rmUser', 'alice');
    store.createProfile('alice', 'fresh');
    expect(store.getTransactions()).toHaveLength(0);

    store.addTransaction({ desc: 'alice expense', cat: 'Other', type: 'expense', amount: 10, source: 'Cash' });
    expect(store.getTransactions()).toHaveLength(1);

    sessionStorage.setItem('rmUser', 'bob');
    store.createProfile('bob', 'starter');
    expect(store.getTransactions()).toHaveLength(4);
    expect(store.getTransactions().some((t) => t.desc === 'alice expense')).toBe(false);

    sessionStorage.setItem('rmUser', 'alice');
    expect(store.getTransactions()).toHaveLength(1);
  });

  test('starter preset is populated; fresh preset is empty', () => {
    sessionStorage.setItem('rmUser', 'carol');
    store.createProfile('carol', 'starter');
    expect(store.getTransactions().length).toBeGreaterThan(0);
    expect(store.getBudgets().length).toBeGreaterThan(0);
    expect(store.getGoals().length).toBeGreaterThan(0);

    store.createProfile('carol', 'fresh');
    expect(store.getTransactions()).toHaveLength(0);
    expect(store.getBudgets()).toHaveLength(0);
    expect(store.getGoals()).toHaveLength(0);
  });

  test('reset demo restores pristine sample data', () => {
    sessionStorage.setItem('rmUser', 'demo');
    store.clearAllData();
    expect(store.getTransactions()).toHaveLength(0);
    store.resetDemo();
    expect(store.getTransactions().length).toBeGreaterThan(0);
    expect(store.getBudgets().length).toBeGreaterThan(0);
  });

  test('demo and starter presets carry a monthly budget', () => {
    sessionStorage.setItem('rmUser', 'demo');
    store.resetDemo();
    expect(store.getSettings().monthlyBudget).toBe(1200);

    sessionStorage.setItem('rmUser', 'starter');
    store.createProfile('starter', 'starter');
    expect(store.getSettings().monthlyBudget).toBe(800);
  });

  test('topUpBudget adds to the monthly budget', () => {
    sessionStorage.setItem('rmUser', 'starter');
    store.createProfile('starter', 'starter');
    expect(store.topUpBudget(200)).toBe(1000);
  });
});
