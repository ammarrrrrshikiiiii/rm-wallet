// ===== RM Wallet – sample data (static, simulates a database) =====

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

// Transaction: [id, date, description, category, type, amount, source]
export const TRANSACTIONS = [
  [1, '2026-06-01', 'Monthly allowance', 'Allowance', 'income', 1200, 'Bank/MAE'],
  [2, '2026-06-05', 'Hostel & rent', 'Housing', 'expense', 450, 'Bank/MAE'],
  [3, '2026-06-12', 'Mamak & cafeteria meals', 'Food & Drink', 'expense', 320, 'Cash'],
  [4, '2026-06-20', 'Part-time tutoring', 'Part-time', 'income', 400, 'Bank/MAE'],
  [5, '2026-07-01', 'Monthly allowance', 'Allowance', 'income', 1200, 'Bank/MAE'],
  [6, '2026-07-04', 'Hostel & rent', 'Housing', 'expense', 450, 'Bank/MAE'],
  [7, '2026-07-10', "Grab rides & Touch 'n Go", 'Transport', 'expense', 130, 'E-Wallet/TnG'],
  [8, '2026-07-18', 'Textbooks', 'Education', 'expense', 210, 'Cash'],
  [9, '2026-07-25', 'Part-time tutoring', 'Part-time', 'income', 500, 'Bank/MAE'],
  [10, '2026-08-01', 'Monthly allowance', 'Allowance', 'income', 1200, 'Bank/MAE'],
  [11, '2026-08-05', 'Hostel & rent', 'Housing', 'expense', 450, 'Bank/MAE'],
  [12, '2026-08-09', 'Groceries & meals', 'Food & Drink', 'expense', 360, 'Cash'],
  [13, '2026-08-22', 'Cinema & Netflix', 'Entertainment', 'expense', 95, 'E-Wallet/TnG'],
  [14, '2026-08-28', 'Freelance poster design', 'Part-time', 'income', 350, 'Bank/MAE'],
  [15, '2026-09-01', 'Monthly allowance', 'Allowance', 'income', 1200, 'Bank/MAE'],
  [16, '2026-09-04', 'Hostel & rent', 'Housing', 'expense', 450, 'Bank/MAE'],
  [17, '2026-09-11', 'Groceries & meals', 'Food & Drink', 'expense', 340, 'Cash'],
  [18, '2026-09-19', 'Bus & LRT pass', 'Transport', 'expense', 110, 'E-Wallet/TnG'],
  [19, '2026-09-27', 'Part-time tutoring', 'Part-time', 'income', 450, 'Bank/MAE'],
  [20, '2026-10-01', 'Monthly allowance', 'Allowance', 'income', 1200, 'Bank/MAE'],
  [21, '2026-10-04', 'Hostel & rent', 'Housing', 'expense', 450, 'Bank/MAE'],
  [22, '2026-10-13', 'Groceries & meals', 'Food & Drink', 'expense', 380, 'Cash'],
  [23, '2026-10-21', 'Course materials', 'Education', 'expense', 150, 'Cash'],
  [24, '2026-10-30', 'Part-time tutoring', 'Part-time', 'income', 420, 'Bank/MAE'],
  [25, '2026-11-01', 'Monthly allowance', 'Allowance', 'income', 1200, 'Bank/MAE'],
  [26, '2026-11-03', 'Hostel & rent', 'Housing', 'expense', 450, 'Bank/MAE'],
  [27, '2026-11-07', 'Groceries & meals', 'Food & Drink', 'expense', 290, 'Cash'],
  [28, '2026-11-10', 'Grab rides', 'Transport', 'expense', 85, 'E-Wallet/TnG'],
  [29, '2026-11-12', 'Gaming & streaming', 'Entertainment', 'expense', 120, 'E-Wallet/TnG'],
  [30, '2026-11-14', 'Printing & stationery', 'Education', 'expense', 45, 'Cash'],
].map(([id, date, desc, cat, type, amount, source]) => ({ id, date, desc, cat, type, amount, source }));

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
