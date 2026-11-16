# RM Wallet — Roadmap

This roadmap is deliberately conservative: the app is a static, zero-build, demo project, and each phase keeps that reality in mind.

## Short term

- **Transaction CRUD with localStorage persistence** — add create/edit/delete for transactions, persisted in `localStorage`, instead of the read-only static sample data. Keep `js/data.js` as the initial seed and `js/core.js` as the pure logic layer.
- **Export to CSV** — a download button on the Transactions page that serializes the current (filtered) list to a CSV file using the existing pure functions.
- **Dark mode** — a theme toggle persisted in `localStorage`, with a Bootstrap-compatible dark theme in `css/style.css`.
- **More test coverage** — expand `test/` to cover the new CRUD and persistence helpers.

## Medium term

- **Real backend with authentication and a database** — replace the simulated client-side auth (ADR-0003) with a server (e.g. a small Bun/Node API and a database), hashed passwords, and server-enforced sessions. This supersedes ADR-0003 and moves the security boundary off the client.
- **Currency multi-select** — support currencies beyond Malaysian Ringgit while keeping RM as the default and the `rm()` formatter as the RM-specific case.

## Long term

- **PWA / offline support** — a service worker and manifest so the app is installable and usable offline, with cached assets (respecting the existing CSP/SRI posture).
- **Bank import** — import transactions from bank/CSV/OFX exports with category mapping, building on the CSV export work.
- **Collaboration & sharing** — shared budgets or household accounts, only after the real backend exists.
