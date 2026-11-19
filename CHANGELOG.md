# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.7.0] - 2026-11-19

### Added

- "Today's safe-to-spend left": each day's allowance is computed from the remaining budget across remaining days, then today's spending is deducted.
- Clear hero breakdown separating today's left from the daily rate and period budget.

## [0.6.0] - 2026-11-19

### Fixed

- Phantom daily-allowance drop when previewing upcoming dates: remaining budget now stays fixed unless an expense inside the active period changes.

### Added

- Custom budget period (start date to end date) with inclusive day counting.
- Daily allowance as the primary display (budget ÷ period days) plus current safe-to-spend.
- Edit Budget and Reset Budget controls.
- Bilingual (English + Bahasa Melayu) auto-category detection in quick-add.

## [0.5.0] - 2026-11-19

### Changed

- Switched to an expenses-only model: no manual income entries; remaining budget = monthly budget minus expenses.
- Renamed summary cards and charts to "Monthly Budget", "Spent So Far", "Remaining Budget" and "Spending by month".
- Removed income/savings-rate terminology across the UI, metadata and copy.

### Added

- Expense editing and deletion from the Expenses page.
- "Top up budget" action for mid-month allowance adjustments.

## [0.4.0] - 2026-11-19

### Added

- Per-user data isolation: budget, transactions, goals and settings are keyed by username.
- "Student Allowance Starter" and "Start Fresh (RM 0)" sign-up presets.
- "Reset Demo Data", "Load Sample Data" and "Clear All Data" actions.
- Editable per-account budgets with an empty state.

### Changed

- One-time migration folds the previous shared/global data into the demo account.

## [0.3.0] - 2026-11-19

### Added

- MAE-style expense breakdown view with month selector tabs.
- "Spent so far" donut ring chart with month-over-month comparison pill.
- Latest / Categories / Merchants sub-views and a tap-to-filter category summary strip.
- "Add Expense" modal and collapsible "Filter" quick actions.
- Expense-only grouping helpers (category, merchant, month-over-month) with tests.

### Changed

- Renamed the Transactions view to Expenses with expense-only monthly filtering.

## [0.2.0] - 2026-11-19

### Added

- One-click "Try Demo Instantly" login.
- Daily safe-to-spend hero card with a customisable allowance date.
- Quick-add expense bar with preset category chips and keyword auto-suggestion.
- Multi-wallet payment sources (Cash, Bank/MAE, E-Wallet/TnG).
- Tabung savings goals with visual jars.
- Budget guardrails (green <70%, amber 70-89%, red 90%+).
- JSON and CSV export/import for backup.
- PWA manifest, icons and offline service worker.

### Changed

- Expanded category taxonomy (Food & Drink, Groceries, Bills, Other) and added payment sources to sample data.
- Budgets and transactions now read through a localStorage persistence layer (`js/store.js`).

## [0.1.0] - 2026-11-16

### Added

- Modular ES-module architecture.
- Automated unit tests (`bun test`).
- Static-site integrity checks (`scripts/check.mjs`).
- Zero-dependency dev server (`serve.js`).
- "Use demo account" shortcut on the login screen.
- CI (GitHub Actions) and Dependabot.
- Community docs and ADRs.
- MIT license.

### Changed

- Extracted inline scripts into `js/` modules.
- "Current month" is now derived from the data instead of being hardcoded.
- Savings-rate calculation guarded against division by zero.

### Fixed

- Stored XSS via the displayed username (HTML is now escaped).
- Login form now has required fields, an `aria-live` status region, and autocomplete hints.

### Security

- Added Content-Security-Policy.
- Added Subresource Integrity on all CDN assets.
- Added dev-server security headers (nosniff, frame-deny, referrer policy, path-traversal guard).
