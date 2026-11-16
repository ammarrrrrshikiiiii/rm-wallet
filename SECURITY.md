# Security Policy

## Security considerations

RM Wallet is a **demo and teaching project**, not a production financial application. Please keep the following in mind:

- **Authentication is simulated and client-side only.** The demo credentials are `demo` / `Finance@123`, and any accounts you "register" are stored in your browser's `localStorage` as plaintext. This provides **no real access control** and **no protection of your data** — anyone with access to the browser can read or modify the stored values.
- **There is no backend and no database.** Nothing is sent to a server; the app runs entirely in your browser.
- **The data is sample data.** All figures (sample data for Jun–Nov 2026) live in `js/data.js` and are public by design.
- **Do not store real financial data.** Never enter real account numbers, credentials, or personally sensitive financial information into this application.

In short, the "security" features here exist to demonstrate good front-end hygiene — not to actually secure anything.

## Reporting a vulnerability

If you believe you have found a security issue, please report it privately rather than opening a public issue.

- **Contact:** email the maintainers at `conduct@rm-wallet.dev` with "Security" in the subject line.
- **What to include:** a clear description of the issue, steps to reproduce it, the affected version, and any suggested fix if you have one.
- **What to expect:** we will acknowledge your report as soon as we can and aim to respond with an initial assessment within a reasonable timeframe. We ask that you give us a chance to address the issue before disclosing it publicly.

Given the demo nature of this project, vulnerabilities that depend on the intentional limitations above (for example, that `localStorage` data is readable in the browser) are not considered in scope.

## Supported versions

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |

Only the current `0.1.x` release line receives fixes.

## Front-end hardening

Although the app has no real security boundary, several front-end hardening measures **are** in place:

- A **Content-Security-Policy** is applied.
- All CDN assets are loaded with **Subresource Integrity** (SRI) hashes.
- HTML output is **escaped**, which fixes a stored-XSS issue via the displayed username.
- There are **no inline scripts**.

These measures are part of the project's teaching goals and are not a substitute for real, server-side security.
