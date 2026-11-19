// ===== Persistence layer: merges sample data with the user's localStorage data =====
import { TRANSACTIONS as SAMPLE, BUDGETS as DEFAULT_BUDGETS } from './data.js';
import { toISODate, transactionsToCSV, parseCSV, toJSON, parseJSON } from './core.js';

const K = { txns: 'rm.txns', goals: 'rm.goals', settings: 'rm.settings' };

export function readJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function todayISO() {
  return toISODate(new Date());
}

// All transactions: user-added first, then the demo sample data.
export function getTransactions() {
  return [...readJSON(K.txns, []), ...SAMPLE];
}

export function addTransaction({ date, desc, cat, type = 'expense', amount, source = 'Cash' }) {
  const txns = readJSON(K.txns, []);
  const txn = { id: Date.now(), date: date || todayISO(), desc, cat, type, amount: Number(amount), source };
  txns.push(txn);
  writeJSON(K.txns, txns);
  return txn;
}

export function getBudgets() {
  return DEFAULT_BUDGETS;
}

// --- Savings goals ("Tabung") ---
export function getGoals() {
  return readJSON(K.goals, []);
}

export function addGoal({ name, target }) {
  const goals = getGoals();
  const goal = { id: Date.now(), name, target: Number(target) || 0, saved: 0 };
  goals.push(goal);
  writeJSON(K.goals, goals);
  return goal;
}

export function updateGoal(id, patch) {
  const goals = getGoals().map((g) => (g.id === id ? { ...g, ...patch } : g));
  writeJSON(K.goals, goals);
  return goals;
}

export function removeGoal(id) {
  const goals = getGoals().filter((g) => g.id !== id);
  writeJSON(K.goals, goals);
  return goals;
}

// --- Settings (allowance/reset date) ---
export function getSettings() {
  return readJSON(K.settings, { allowanceDate: null });
}

export function saveSettings(patch) {
  const merged = { ...getSettings(), ...patch };
  writeJSON(K.settings, merged);
  return merged;
}

// --- Backup / restore ---
export function exportBackupJSON() {
  return toJSON({
    app: 'rm-wallet',
    version: 2,
    exportedAt: new Date().toISOString(),
    transactions: readJSON(K.txns, []),
    goals: getGoals(),
    settings: getSettings(),
  });
}

export function importBackupJSON(text) {
  const data = parseJSON(text);
  if (!data || typeof data !== 'object') throw new Error('Not a valid RM Wallet backup.');
  if (Array.isArray(data.transactions)) writeJSON(K.txns, data.transactions);
  if (Array.isArray(data.goals)) writeJSON(K.goals, data.goals);
  if (data.settings && typeof data.settings === 'object') writeJSON(K.settings, data.settings);
}

export function exportTransactionsCSV() {
  return transactionsToCSV(getTransactions());
}

export function importTransactionsCSV(text) {
  const rows = parseCSV(text);
  writeJSON(K.txns, rows);
}
