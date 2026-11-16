# ADR-0002: Vanilla JavaScript ES modules with a thin pure-logic core

- Status: Accepted
- Date: 2026-11-16

## Context

The application has a small, well-defined scope: track income/expense transactions, show a dashboard summary, and compare monthly spending against category budgets. A framework (React, Vue, Svelte, etc.) would add a toolchain, build step, and conceptual overhead that this project does not need. We also want the domain logic to be unit-testable without a browser, and we want the project to remain approachable for students learning web development.

## Decision

Use **vanilla JavaScript ES modules** with no framework, and concentrate all domain logic in a **thin, pure core** (`js/core.js`):

- `js/core.js` holds pure functions with no DOM, storage, or network access: currency formatting (`rm`), totals, month helpers, budget computation, filtering, and HTML escaping. It runs identically in the browser and in `bun test`.
- `js/data.js` holds the static sample transactions and budgets and is likewise DOM-free.
- `js/app.js` provides the auth guard and the shared navbar/footer shell.
- Each HTML page loads one page module (`js/login.js`, `js/dashboard.js`, `js/transactions.js`, `js/budgets.js`) that imports the shared modules and renders the DOM.
- `scripts/check.mjs` enforces that `js/core.js` and `js/data.js` stay free of DOM APIs so the "pure core" property does not silently regress.

## Consequences

**Positive**

- No framework or build tooling; the source is readable as-is.
- Domain logic is fully unit-testable with `bun test` because it has no browser dependencies.
- A clear separation of concerns: data → pure functions → DOM rendering, with escaping centralized in `escapeHtml()`.
- Lower cognitive load and a gentler learning curve for contributors.

**Negative**

- Rendering is imperative DOM manipulation (template strings + `innerHTML`), which becomes harder to maintain as pages grow.
- No framework-provided state management or component reuse; any future interactivity must be hand-rolled.
- If the app grows significantly in scope, migrating to a framework would be a larger change than starting with one.
