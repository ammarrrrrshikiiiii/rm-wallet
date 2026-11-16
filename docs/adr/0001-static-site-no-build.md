# ADR-0001: Static, zero-build site with no runtime npm dependencies

- Status: Accepted
- Date: 2026-11-16

## Context

RM Wallet is a personal finance tracker for students (Malaysian Ringgit). The project must be instantly runnable, easy to contribute to, and cheap to host. A student-facing tool of this scope does not need a server or a database: all features (transactions, budgets, dashboard charts) can be delivered as static files. We also want the project to be deployable to any static host, such as GitHub Pages, without a build pipeline or server-side configuration.

## Decision

Ship the application as a **static, zero-build site**:

- Plain HTML, CSS, and vanilla JavaScript ES modules with no bundler, transpiler, or minification step.
- **Zero npm runtime dependencies.** Third-party libraries are loaded from a CDN (jsDelivr) rather than installed locally; Bootstrap 5.3.3, Bootstrap Icons 1.11.3, and Chart.js 4.4.3 are pinned with Subresource Integrity (SRI).
- Bun (>= 1.0) is used only as a local development convenience: a zero-dependency static server (`serve.js`), the test runner (`bun test`), and integrity checks (`scripts/check.mjs`). It is not required to host the site.

## Consequences

**Positive**

- The site runs by opening the files or pointing any static server at the directory; no install step is required.
- Deploys trivially to GitHub Pages or similar static hosts.
- No build tooling to maintain, so contribution friction is minimal.
- The CDN assets are version-pinned and SRI-verified, so there is no dependency drift and no local `node_modules` to manage for the runtime.

**Negative**

- Every page loads third-party assets over the network, so the app depends on the CDN being reachable and the browser supporting SRI.
- Without a bundler, we manually manage the script/link tags in each HTML page (mitigated by `scripts/check.mjs`).
- Any future build-oriented need (e.g. TypeScript, tree-shaking, code splitting) would require revisiting this decision.
