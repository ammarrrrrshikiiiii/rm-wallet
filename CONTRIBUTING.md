# Contributing to RM Wallet

Welcome, and thank you for your interest in contributing to RM Wallet — a personal finance tracker for students (Malaysian Ringgit, RM). We appreciate every contribution, whether it is a bug report, a documentation fix, or a new feature.

This document explains how to get set up and how to contribute in a way that is easy for maintainers to review and merge.

## Prerequisites

RM Wallet is a static web app with no build step, no backend, and no database. The only runtime you need is [Bun](https://bun.sh/) version 1.0 or newer.

To check that Bun is installed:

```bash
bun --version
```

## Getting started

Clone the repository and run the three standard commands to confirm everything works before you change anything:

```bash
# Start the local development server (http://localhost:8080)
bun start

# Run the automated unit tests
bun test

# Run the static-site integrity checks
bun run check
```

The same commands are also available through the Makefile: `make start`, `make test`, and `make check`.

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` | Login / register page |
| `dashboard.html` | Dashboard page |
| `transactions.html` | Transactions page |
| `budgets.html` | Budgets page |
| `js/core.js` | Pure domain logic (no DOM access) |
| `js/data.js` | Sample data |
| `js/app.js` | Navigation, footer, and auth shell |
| `js/login.js` | Login page logic |
| `js/dashboard.js` | Dashboard page logic |
| `js/transactions.js` | Transactions page logic |
| `js/budgets.js` | Budgets page logic |
| `scripts/check.mjs` | Static-site integrity checks |
| `serve.js` | Zero-dependency development server |

## How to make a change

1. Create a branch off `main` with a short, descriptive name (for example, `fix/login-autocomplete` or `feat/budget-alerts`).
2. Make your change, keeping commits small and focused.
3. Run `bun test` and `bun run check` and make sure both pass.
4. Open a pull request. Describe what you changed and why, and reference any related issue.

Maintainers will review your pull request and may ask for changes before merging.

## Commit message convention

We use [Conventional Commits](https://www.conventionalcommits.org/). Prefix each commit message with one of:

- `feat:` — a new feature
- `fix:` — a bug fix
- `docs:` — documentation changes
- `chore:` — maintenance, tooling, or housekeeping
- `refactor:` — code changes that do not fix a bug or add a feature
- `test:` — adding or updating tests

For example: `feat: add "use demo account" shortcut to the login screen`.

Commits must be authored as yourself. Do **not** include automated `Co-Authored-By:` trailers in your commit messages.

## Coding style

- Use 2-space indentation.
- Use ES modules (`import` / `export`); do not reintroduce inline scripts.
- Keep pure, DOM-free logic in `js/core.js` so it remains unit-testable. Page modules (`js/dashboard.js`, `js/transactions.js`, `js/budgets.js`, `js/login.js`) should handle DOM and UI concerns and delegate computation to `js/core.js`.

## Testing expectations

- New or changed logic in `js/core.js` should have corresponding unit tests.
- Run `bun test` before submitting; all tests must pass.
- Run `bun run check` to confirm static-site integrity (asset integrity, security headers, and structure checks) still passes.

Thank you for contributing!
