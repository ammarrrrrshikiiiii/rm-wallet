// ===== Per-user persistence layer =====
// Every user's transactions, budgets, goals and settings live in their own
// localStorage profile keyed by username. The demo account is seeded with the
// realistic sample data; new accounts start from a chosen preset.
import {
  DEMO_TRANSACTIONS, DEMO_BUDGETS, DEMO_MONTHLY_BUDGET,
  STARTER_TRANSACTIONS, STARTER_BUDGETS, STARTER_GOALS, STARTER_MONTHLY_BUDGET,
} from './data.js';
import { toISODate, transactionsToCSV, parseCSV, toJSON, parseJSON } from './core.js';

const LEGACY_KEYS = ['rm.txns', 'rm.goals', 'rm.settings'];

// Currently signed-in username (from the session), or null on the login page.
export function currentUser() {
  return sessionStorage.getItem('rmUser') || null;
}

function profileKey(user) {
  return 'rm.profile.' + (user || 'demo');
}

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

export function emptyProfile() {
  return { transactions: [], budgets: [], goals: [], settings: { allowanceDate: null, monthlyBudget: 0 } };
}

export function demoProfile() {
  return {
    transactions: DEMO_TRANSACTIONS.map((t) => ({ ...t })),
    budgets: DEMO_BUDGETS.map((b) => ({ ...b })),
    goals: [],
    settings: { allowanceDate: null, monthlyBudget: DEMO_MONTHLY_BUDGET },
  };
}

export function starterProfile() {
  return {
    transactions: STARTER_TRANSACTIONS.map((t) => ({ ...t })),
    budgets: STARTER_BUDGETS.map((b) => ({ ...b })),
    goals: STARTER_GOALS.map((g) => ({ ...g })),
    settings: { allowanceDate: null, monthlyBudget: STARTER_MONTHLY_BUDGET },
  };
}

function normalizeProfile(p) {
  const base = emptyProfile();
  return {
    transactions: Array.isArray(p && p.transactions) ? p.transactions : base.transactions,
    budgets: Array.isArray(p && p.budgets) ? p.budgets : base.budgets,
    goals: Array.isArray(p && p.goals) ? p.goals : base.goals,
    settings: { ...base.settings, ...((p && p.settings) || {}) },
  };
}

export function getProfile(user = currentUser()) {
  const p = readJSON(profileKey(user), null);
  return p ? normalizeProfile(p) : null;
}

export function writeProfile(user, profile) {
  writeJSON(profileKey(user), normalizeProfile(profile));
}

export function ensureProfile(user = currentUser()) {
  const u = user || 'demo';
  let p = getProfile(u);
  if (!p) {
    p = emptyProfile();
    writeProfile(u, p);
  }
  return p;
}

// One-time migration: fold the old shared/global keys into the demo account, then
// remove them. New accounts are unaffected and start isolated.
function migrate() {
  const hasLegacy = LEGACY_KEYS.some((k) => localStorage.getItem(k) != null);
  if (hasLegacy) {
    const dp = demoProfile();
    const txns = readJSON('rm.txns', []);
    if (txns.length) dp.transactions = [...dp.transactions, ...txns];
    const goals = readJSON('rm.goals', []);
    if (goals.length) dp.goals = goals;
    dp.settings = { ...dp.settings, ...readJSON('rm.settings', {}) };
    writeProfile('demo', dp);
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  }
  if (!getProfile('demo')) writeProfile('demo', demoProfile());
}
migrate();

// Create a new user profile from a preset ('starter' or 'fresh').
export function createProfile(username, preset) {
  const p = preset === 'starter' ? starterProfile() : emptyProfile();
  writeProfile(username, p);
  return p;
}

// --- Scoped data access (current user) ---
export function getTransactions() { return ensureProfile().transactions; }
export function getBudgets() { return ensureProfile().budgets; }
export function getGoals() { return ensureProfile().goals; }
export function getSettings() { return ensureProfile().settings; }

export function addTransaction({ date, desc, cat, type = 'expense', amount, source = 'Cash' }) {
  const p = ensureProfile();
  p.transactions.push({ id: Date.now(), date: date || todayISO(), desc, cat, type, amount: Number(amount), source });
  writeProfile(currentUser(), p);
  return p.transactions[p.transactions.length - 1];
}

export function updateTransaction(id, patch) {
  const p = ensureProfile();
  p.transactions = p.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t));
  writeProfile(currentUser(), p);
  return p.transactions.find((t) => t.id === id);
}

export function removeTransaction(id) {
  const p = ensureProfile();
  p.transactions = p.transactions.filter((t) => t.id !== id);
  writeProfile(currentUser(), p);
}

export function topUpBudget(amount) {
  const p = ensureProfile();
  const cur = Number(p.settings.monthlyBudget) || 0;
  p.settings.monthlyBudget = cur + Number(amount);
  writeProfile(currentUser(), p);
  return p.settings.monthlyBudget;
}

export function saveSettings(patch) {
  const p = ensureProfile();
  p.settings = { ...p.settings, ...patch };
  writeProfile(currentUser(), p);
  return p.settings;
}

export function setBudgets(budgets) {
  const p = ensureProfile();
  p.budgets = (budgets || [])
    .filter((b) => b && Number(b.limit) > 0)
    .map((b) => ({ cat: b.cat, limit: Number(b.limit) }));
  writeProfile(currentUser(), p);
  return p.budgets;
}

export function addGoal({ name, target }) {
  const p = ensureProfile();
  const goal = { id: Date.now(), name, target: Number(target) || 0, saved: 0 };
  p.goals.push(goal);
  writeProfile(currentUser(), p);
  return goal;
}

export function updateGoal(id, patch) {
  const p = ensureProfile();
  p.goals = p.goals.map((g) => (g.id === id ? { ...g, ...patch } : g));
  writeProfile(currentUser(), p);
  return p.goals;
}

export function removeGoal(id) {
  const p = ensureProfile();
  p.goals = p.goals.filter((g) => g.id !== id);
  writeProfile(currentUser(), p);
  return p.goals;
}

// --- Whole-data actions ---
export function isDemo() {
  return currentUser() === 'demo';
}

export function loadSampleData() {
  const p = ensureProfile();
  p.transactions = DEMO_TRANSACTIONS.map((t) => ({ ...t }));
  p.budgets = DEMO_BUDGETS.map((b) => ({ ...b }));
  p.settings = { ...p.settings, monthlyBudget: DEMO_MONTHLY_BUDGET };
  writeProfile(currentUser(), p);
}

export function clearAllData() {
  writeProfile(currentUser(), emptyProfile());
}

export function resetDemo() {
  writeProfile('demo', demoProfile());
}

// --- Backup / restore (current user) ---
export function exportBackupJSON() {
  return toJSON({ app: 'rm-wallet', version: 3, user: currentUser(), profile: getProfile() });
}

export function importBackupJSON(text) {
  const data = parseJSON(text);
  const profile = data && data.profile && typeof data.profile === 'object' ? data.profile : data;
  if (!profile || typeof profile !== 'object') throw new Error('Not a valid RM Wallet backup.');
  writeProfile(currentUser(), profile);
}

export function exportTransactionsCSV() {
  return transactionsToCSV(getTransactions());
}

export function importTransactionsCSV(text) {
  const p = ensureProfile();
  p.transactions = parseCSV(text);
  writeProfile(currentUser(), p);
}
