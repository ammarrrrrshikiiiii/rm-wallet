// ===== RM Wallet – sample data (static, simulates a database) =====

export const TRANSACTIONS = [
  [1, '2026-06-01', 'Monthly allowance', 'Allowance', 'income', 1200],
  [2, '2026-06-05', 'Hostel & rent', 'Housing', 'expense', 450],
  [3, '2026-06-12', 'Mamak & cafeteria meals', 'Food', 'expense', 320],
  [4, '2026-06-20', 'Part-time tutoring', 'Part-time', 'income', 400],
  [5, '2026-07-01', 'Monthly allowance', 'Allowance', 'income', 1200],
  [6, '2026-07-04', 'Hostel & rent', 'Housing', 'expense', 450],
  [7, '2026-07-10', "Grab rides & Touch 'n Go", 'Transport', 'expense', 130],
  [8, '2026-07-18', 'Textbooks', 'Education', 'expense', 210],
  [9, '2026-07-25', 'Part-time tutoring', 'Part-time', 'income', 500],
  [10, '2026-08-01', 'Monthly allowance', 'Allowance', 'income', 1200],
  [11, '2026-08-05', 'Hostel & rent', 'Housing', 'expense', 450],
  [12, '2026-08-09', 'Groceries & meals', 'Food', 'expense', 360],
  [13, '2026-08-22', 'Cinema & Netflix', 'Entertainment', 'expense', 95],
  [14, '2026-08-28', 'Freelance poster design', 'Part-time', 'income', 350],
  [15, '2026-09-01', 'Monthly allowance', 'Allowance', 'income', 1200],
  [16, '2026-09-04', 'Hostel & rent', 'Housing', 'expense', 450],
  [17, '2026-09-11', 'Groceries & meals', 'Food', 'expense', 340],
  [18, '2026-09-19', 'Bus & LRT pass', 'Transport', 'expense', 110],
  [19, '2026-09-27', 'Part-time tutoring', 'Part-time', 'income', 450],
  [20, '2026-10-01', 'Monthly allowance', 'Allowance', 'income', 1200],
  [21, '2026-10-04', 'Hostel & rent', 'Housing', 'expense', 450],
  [22, '2026-10-13', 'Groceries & meals', 'Food', 'expense', 380],
  [23, '2026-10-21', 'Course materials', 'Education', 'expense', 150],
  [24, '2026-10-30', 'Part-time tutoring', 'Part-time', 'income', 420],
  [25, '2026-11-01', 'Monthly allowance', 'Allowance', 'income', 1200],
  [26, '2026-11-03', 'Hostel & rent', 'Housing', 'expense', 450],
  [27, '2026-11-07', 'Groceries & meals', 'Food', 'expense', 290],
  [28, '2026-11-10', 'Grab rides', 'Transport', 'expense', 85],
  [29, '2026-11-12', 'Gaming & streaming', 'Entertainment', 'expense', 120],
  [30, '2026-11-14', 'Printing & stationery', 'Education', 'expense', 45],
].map(([id, date, desc, cat, type, amount]) => ({ id, date, desc, cat, type, amount }));

// Monthly budget limits (RM) per expense category.
export const BUDGETS = [
  { cat: 'Housing', limit: 450 },
  { cat: 'Food', limit: 350 },
  { cat: 'Transport', limit: 120 },
  { cat: 'Education', limit: 150 },
  { cat: 'Entertainment', limit: 100 },
];
