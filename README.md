# RM Wallet

**Know where your allowance goes — one ringgit at a time.** RM Wallet is a fast, dependency-free personal expense tracker for students: track spending and monthly budgets in Malaysian Ringgit, with charts that make your money obvious in seconds.

[![CI](https://github.com/ammarrrrrshikiiiii/rm-wallet/actions/workflows/ci.yml/badge.svg)](https://github.com/ammarrrrrshikiiiii/rm-wallet/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-1f7a6d.svg)](LICENSE)
[![Version](https://img.shields.io/github/v/release/ammarrrrrshikiiiii/rm-wallet?label=version&color=1f7a6d)](https://github.com/ammarrrrrshikiiiii/rm-wallet/releases)

![RM Wallet dashboard](docs/screenshot-dashboard.png)

## Why RM Wallet

A student's money is a small number of ringgit moving between a handful of buckets — a monthly budget in, food, rent and transport out. You don't need a spreadsheet or a banking app to understand it; you need a clear answer to one question: *where did it go?* RM Wallet answers that question with a clean dashboard, a searchable expense log and per-category budgets that turn red the moment you go over.

- ⚡ **Zero dependencies, zero build.** It's plain HTML, CSS and ES modules. Nothing to install or compile.
- 📊 **Charts that mean something.** Spending by month, spending by category, budget vs actual.
- 💸 **Budgets that warn you.** Colour-coded guardrails: green under 70%, amber 70–89%, red 90%+.
- 🔒 **Hardened by default.** Content-Security-Policy, Subresource Integrity, and XSS-safe rendering.
- 🧪 **Actually tested.** A unit-test suite and static-integrity checks that run in CI.

## Quickstart

You only need [Bun](https://bun.sh) (≥ 1.0).

```bash
# 1. Start the dev server (serves the static site at http://localhost:8080)
bun start

# 2. Open the printed URL in your browser
#    http://localhost:8080

# 3. Click "Try Demo Instantly"
```

That's it — you're looking at the dashboard in under a minute.

> **No Bun?** Serve the folder with any static server: `npx serve .` or `python -m http.server 8080`. Everything runs client-side, so any static host (including GitHub Pages) works.

### Demo credentials

| Username | Password       |
| -------- | -------------- |
| `demo`   | `Finance@123`  |

You can also register a new account — it's stored in your browser's `localStorage`. **This is simulated, client-side auth for demonstration only** (see [SECURITY.md](SECURITY.md)).

## Features

- **One-click demo** — "Try Demo Instantly" signs you in with sample data kept only in your browser.
- **Per-account isolation** — every user's budget, transactions, goals and settings are stored separately; the demo account stays pre-populated with a one-tap reset.
- **Starter presets** — sign up with the "Student Allowance Starter" (sample data ready to explore) or "Start Fresh (RM 0)".
- **Data controls** — load sample data or clear all data for your account anytime.
- **Safe-to-spend hero** — remaining monthly budget divided by days until your allowance date, colour-coded green/amber/red with a customisable reset date.
- **Quick-add expense bar** — amount, note and payment source with one-tap category chips and keyword auto-suggestion.
- **Multi-wallet** — tag every transaction by payment source (Cash, Bank/MAE, E-Wallet/TnG) and filter by it.
- **Tabung (savings goals)** — visual savings jars with progress fills and top-ups.
- **Budget guardrails** — colour-coded progress bars: green <70%, amber 70–89%, red 90%+.
- **MAE-style expense breakdown** — month selector tabs, a "Spent so far" donut with month-over-month pill, and Latest / Categories / Merchants views with a tap-to-filter category strip.
- **Backup & portability** — export/import your data as JSON or CSV.
- **Installable (PWA)** — add RM Wallet to your home screen with a manifest, icons and an offline service worker.
- **Responsive & accessible** — mobile-first, with `aria-live` status, labelled charts and WCAG-AA contrast.
- **Security basics** — CSP, SRI-pinned CDN assets, HTML output escaping, and a traversal-guarded dev server.

## Commands

| Command           | What it does                                        |
| ----------------- | --------------------------------------------------- |
| `bun start`       | Start the zero-dependency dev server on `:8080`     |
| `bun test`        | Run the unit tests (`bun test`)                     |
| `bun run check`   | Verify assets, SRI, CSP, and that core logic is DOM-free |
| `bun run screenshot` | Regenerate the README screenshots (needs Playwright) |

Or via `make`: `make start`, `make test`, `make check`.

## Project structure

```
.
├── index.html            login / register
├── dashboard.html        overview with charts
├── transactions.html     MAE-style expense breakdown
├── budgets.html          limits vs actual spending
├── css/style.css         global styles
├── js/
│   ├── core.js           pure domain logic (unit-tested, DOM-free)
│   ├── data.js           sample data (Jun–Nov 2026)
│   ├── store.js          localStorage persistence layer
│   ├── app.js            auth guard + navbar/footer shell
│   ├── pwa.js            service-worker registration
│   └── *.js              one module per page
├── assets/               favicon + PWA icons
├── manifest.json         PWA manifest
├── sw.js                 offline service worker
├── test/                 bun test suites
├── scripts/              check.mjs, screenshot.mjs
├── docs/                 architecture, ADRs, roadmap, screenshots
├── serve.js              zero-dependency static dev server
├── .github/              CI + Dependabot + issue/PR templates
└── Makefile              convenience targets
```

## Architecture

```mermaid
flowchart LR
    subgraph Pages["HTML pages"]
        I[index.html]
        D[dashboard.html]
        T[transactions.html]
        B[budgets.html]
    end

    subgraph Modules["ES modules"]
        L[js/login.js]
        DA[js/dashboard.js]
        TR[js/transactions.js]
        BU[js/budgets.js]
        SH[js/app.js<br/>auth + shell]
        CORE[js/core.js<br/>pure logic]
        DATA[js/data.js<br/>sample data]
    end

    subgraph CDN["CDN (SRI-pinned)"]
        BS[Bootstrap 5]
        CJ[Chart.js 4]
    end

    I --> L
    D --> DA
    T --> TR
    B --> BU
    L --> SH
    DA --> SH
    TR --> SH
    BU --> SH
    DA & TR & BU --> CORE
    DA & TR & BU --> DATA
    DA & BU --> CJ
    Pages --> BS
    SH --> CORE

    subgraph Browser["Browser storage"]
        SS[sessionStorage<br/>auth session]
        LS[localStorage<br/>registered users]
    end
    SH --> SS
    L --> LS
```

Data flows one way: static sample data (`js/data.js`) → pure functions (`js/core.js`) → page modules render escaped HTML. There is no server state; see the [ADRs](docs/adr) for the reasoning behind each key decision.

## Testing & CI

- **Unit tests** (`bun test`) cover the currency formatter, expense totals, month/budget math, filtering, safe-to-spend, guardrail tiers, keyword suggestion, CSV round-trips and HTML escaping.
- **Integrity checks** (`bun run check`) verify that every local asset resolves, no inline scripts remain, all CDN assets carry SRI, and the core modules stay DOM-free.
- **GitHub Actions** runs both on every push and pull request; **Dependabot** keeps Actions and the dev dependency current.

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**, set *Source* to **Deploy from a branch**, choose `main` and `/ (root)`, then save.
3. Your site is live at `https://ammarrrrrshikiiiii.github.io/rm-wallet/`.

## Roadmap

See [docs/roadmap.md](docs/roadmap.md) — next up: edit/delete transactions and editable budget limits; then a real backend with authentication.

## Contributing & license

Contributions are welcome — read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). RM Wallet is MIT licensed; see [LICENSE](LICENSE).

Built with ❤️ for students, one ringgit at a time.
