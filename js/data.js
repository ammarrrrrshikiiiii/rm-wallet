// ===== RM Wallet – sample data (expenses-only model) =====

// Expense categories shown as quick-add chips and used for budgets.
export const CATEGORIES = ['Food & Drink', 'Groceries', 'Transport', 'Housing', 'Bills', 'Education', 'Entertainment', 'Other'];

// Payment sources (multi-wallet).
export const PAYMENT_METHODS = ['Cash', 'Bank/MAE', 'E-Wallet/TnG'];

// Keyword -> category rules for the quick-add auto-suggestion. First match wins.
export const KEYWORD_RULES = [
  [/mamak|nasi|teh|kopi|roti|makan|meal|lunch|dinner|breakfast|cafe|mcd|kfc|food|drink|snack/i, 'Food & Drink'],
  [/grocery|groceries|supermarket|mydin|jaya|tesco|aeon|pasar|vege|bahan/i, 'Groceries'],
  [/grab|lrt|mrt|bus|petrol|minyak|parking|tol|taxi|train|ride|touch|tn.?go/i, 'Transport'],
  [/rent|sewa|hostel|rumah|bilik/i, 'Housing'],
  [/bill|tnb|electric|aircond|internet|unifi|maxis|celcom|digi|umobile|astro|water|phone|broadband|insurans|loan/i, 'Bills'],
  [/book|textbook|print|stationery|course|tuition|class|notes|fee|yuran|study/i, 'Education'],
  [/netflix|spotify|cinema|movie|game|steam|gaming|youtube|concert|entertainment/i, 'Entertainment'],
];

// Every entry is an expense. Tuple: [id, date, description, category, amount, source].
export const TRANSACTIONS = [
  [1, '2026-06-05', 'Hostel & rent', 'Housing', 450, 'Bank/MAE'],
  [2, '2026-06-12', 'Mamak & cafeteria meals', 'Food & Drink', 320, 'Cash'],
  [3, '2026-06-18', 'Bus & LRT pass', 'Transport', 110, 'E-Wallet/TnG'],
  [4, '2026-07-04', 'Hostel & rent', 'Housing', 450, 'Bank/MAE'],
  [5, '2026-07-10', "Grab rides & Touch 'n Go", 'Transport', 130, 'E-Wallet/TnG'],
  [6, '2026-07-18', 'Textbooks', 'Education', 210, 'Cash'],
  [7, '2026-07-22', 'Cinema & Netflix', 'Entertainment', 95, 'E-Wallet/TnG'],
  [8, '2026-08-05', 'Hostel & rent', 'Housing', 450, 'Bank/MAE'],
  [9, '2026-08-09', 'Groceries & meals', 'Food & Drink', 360, 'Cash'],
  [10, '2026-08-25', 'Cinema & Netflix', 'Entertainment', 95, 'E-Wallet/TnG'],
  [11, '2026-08-28', 'Printing & stationery', 'Education', 45, 'Cash'],
  [12, '2026-09-04', 'Hostel & rent', 'Housing', 450, 'Bank/MAE'],
  [13, '2026-09-11', 'Groceries & meals', 'Food & Drink', 340, 'Cash'],
  [14, '2026-09-19', 'Bus & LRT pass', 'Transport', 110, 'E-Wallet/TnG'],
  [15, '2026-09-26', 'Gaming & streaming', 'Entertainment', 120, 'E-Wallet/TnG'],
  [16, '2026-10-04', 'Hostel & rent', 'Housing', 450, 'Bank/MAE'],
  [17, '2026-10-13', 'Groceries & meals', 'Food & Drink', 380, 'Cash'],
  [18, '2026-10-21', 'Course materials', 'Education', 150, 'Cash'],
  [19, '2026-10-25', 'Grab rides', 'Transport', 85, 'E-Wallet/TnG'],
  [20, '2026-11-03', 'Hostel & rent', 'Housing', 450, 'Bank/MAE'],
  [21, '2026-11-07', 'Groceries & meals', 'Food & Drink', 290, 'Cash'],
  [22, '2026-11-10', 'Grab rides', 'Transport', 85, 'E-Wallet/TnG'],
  [23, '2026-11-12', 'Gaming & streaming', 'Entertainment', 120, 'E-Wallet/TnG'],
  [24, '2026-11-14', 'Printing & stationery', 'Education', 45, 'Cash'],
].map(([id, date, desc, cat, amount, source]) => ({ id, date, desc, cat, type: 'expense', amount, source }));

// Monthly budget limits (RM) per expense category.
export const BUDGETS = [
  { cat: 'Housing', limit: 450 },
  { cat: 'Food & Drink', limit: 350 },
  { cat: 'Groceries', limit: 150 },
  { cat: 'Transport', limit: 120 },
  { cat: 'Bills', limit: 120 },
  { cat: 'Education', limit: 150 },
  { cat: 'Entertainment', limit: 100 },
  { cat: 'Other', limit: 80 },
];

// Icon + colour per category (used by the expense breakdown view).
export const CATEGORY_META = {
  'Food & Drink': { icon: 'bi-cup-straw', color: '#1f7a6d' },
  'Groceries': { icon: 'bi-basket', color: '#7fb77e' },
  'Transport': { icon: 'bi-bus-front', color: '#4f8fba' },
  'Housing': { icon: 'bi-house-door', color: '#8a6fb0' },
  'Bills': { icon: 'bi-receipt', color: '#e9a23b' },
  'Education': { icon: 'bi-book', color: '#5b8a5c' },
  'Entertainment': { icon: 'bi-controller', color: '#e0604a' },
  'Other': { icon: 'bi-three-dots', color: '#9aa7a3' },
};

// Demo account: the realistic sample set above, with a monthly budget.
export const DEMO_TRANSACTIONS = TRANSACTIONS;
export const DEMO_BUDGETS = BUDGETS;
export const DEMO_MONTHLY_BUDGET = 1200;

// "Student Allowance Starter" preset: a lightweight budget + a few expenses so
// charts and metrics are visible immediately.
export const STARTER_BUDGETS = [
  { cat: 'Food & Drink', limit: 300 },
  { cat: 'Transport', limit: 100 },
  { cat: 'Groceries', limit: 150 },
  { cat: 'Bills', limit: 80 },
  { cat: 'Entertainment', limit: 80 },
  { cat: 'Other', limit: 100 },
];

export const STARTER_TRANSACTIONS = [
  { id: 1, date: '2026-11-02', desc: 'Mamak dinner', cat: 'Food & Drink', type: 'expense', amount: 24, source: 'Cash' },
  { id: 2, date: '2026-11-03', desc: 'Grab to campus', cat: 'Transport', type: 'expense', amount: 12, source: 'E-Wallet/TnG' },
  { id: 3, date: '2026-11-05', desc: 'Groceries (Mydin)', cat: 'Groceries', type: 'expense', amount: 46, source: 'Cash' },
  { id: 4, date: '2026-11-08', desc: 'Netflix subscription', cat: 'Entertainment', type: 'expense', amount: 18, source: 'E-Wallet/TnG' },
];

export const STARTER_MONTHLY_BUDGET = 800;

export const STARTER_GOALS = [
  { id: 1, name: 'Emergency fund', target: 500, saved: 100 },
];
