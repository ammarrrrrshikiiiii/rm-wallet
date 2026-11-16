# ADR-0004: Content-Security-Policy and Subresource Integrity

- Status: Accepted
- Date: 2026-11-16

## Context

The application loads third-party code (Bootstrap, Bootstrap Icons, Chart.js) from a CDN and renders user-influenced strings into the DOM. This creates two risk areas for a static app: (1) a compromised or tampered CDN response could execute arbitrary JavaScript in the browser, and (2) injected markup could lead to XSS if output is not escaped. Because there is no server to set security headers on static hosts such as GitHub Pages, we need in-document and in-browser hardening.

## Decision

Enforce defense-in-depth for supply-chain and XSS risks:

- **Content-Security-Policy** — every HTML page includes a `<meta http-equiv="Content-Security-Policy">` that restricts `default-src` to `'self'`, permits scripts only from `'self'` and `https://cdn.jsdelivr.net`, and pins `style-src`, `font-src`, `img-src`, `connect-src`, `base-uri`, and `form-action`.
- **Subresource Integrity (SRI)** — all CDN `<script>` and `<link>` assets (Bootstrap CSS/JS, Bootstrap Icons, Chart.js) carry `integrity` and `crossorigin` attributes so the browser refuses to run a file that does not match the pinned hash. Google Fonts stylesheets are the documented exception because they are dynamic and cannot carry SRI.
- **Output escaping** — `js/core.js` provides `escapeHtml()`, applied before injecting strings into `innerHTML`; messages use `textContent`. `scripts/check.mjs` enforces that scripts are external modules (no inline scripts) and that CDN assets are SRI-pinned.
- The dev server (`serve.js`) additionally sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: no-referrer`.

## Consequences

**Positive**

- A tampered CDN file that no longer matches its SRI hash will be blocked by the browser.
- CSP limits where scripts and other resources can be loaded from, reducing the blast radius of an injection.
- The checks in `scripts/check.mjs` and the CI workflow keep these properties from regressing.

**Negative**

- The `style-src 'unsafe-inline'` allowance (needed for inline styles and some Bootstrap behavior) weakens the style-src directive and must be kept in mind during review.
- Upgrading a CDN library requires updating the version and its SRI hash together, otherwise the page breaks.
- A `meta` CSP cannot express every directive a response header could (e.g. `frame-ancestors`), so it is a partial substitute for server-side headers.
