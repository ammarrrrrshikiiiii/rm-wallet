# GitHub issue backlog

This release was built issue-by-issue. Since the work was done locally (no GitHub
remote/token in the build environment), this file records the issues so they can be
recreated one-for-one on GitHub — each maps to a commit in the history.

Use these labels and one `v0.1.0` milestone. Create them, then open a PR per issue.

| # | Title | Labels | Status |
|---|-------|--------|--------|
| 1 | Modularize front-end into testable ES modules | `refactor` `enhancement` | ✅ merged |
| 2 | Fix stored XSS and correctness bugs | `security` `bug` | ✅ merged |
| 3 | Add unit tests for domain logic | `tests` | ✅ merged |
| 4 | Add static-site integrity checks | `tests` `ci` | ✅ merged |
| 5 | Add CI and Dependabot | `ci` | ✅ merged |
| 6 | Zero-dependency dev server and one-command setup | `dx` `enhancement` | ✅ merged |
| 7 | README and community files | `documentation` | ✅ merged |
| 8 | Architecture docs and ADRs | `documentation` | ✅ merged |
| 9 | Release v0.1.0 | `release` | ✅ tagged |

## Acceptance criteria

**1. Modularize front-end into testable ES modules**
- Inline `<script>` blocks removed from all four pages.
- Pure logic lives in `js/core.js` (DOM-free) and sample data in `js/data.js`.
- One module per page; shared shell in `js/app.js`.

**2. Fix stored XSS and correctness bugs**
- All interpolated HTML is escaped (`escapeHtml`) or set via `textContent`.
- The "current month" is derived from the data, not hardcoded.
- Savings rate never divides by zero (returns `—` when income is absent).

**3. Add unit tests for domain logic**
- `bun test` passes; coverage includes currency format, totals, months, budgets, filtering, savings rate, escaping, and data integrity.

**4. Add static-site integrity checks**
- `bun run check` verifies local assets resolve, no inline scripts, SRI on CDN assets, document basics, and DOM-free core modules.

**5. Add CI and Dependabot**
- GitHub Actions runs `bun run check` + `bun test` on push and PRs.
- Dependabot updates GitHub Actions and npm dev dependencies weekly.

**6. Zero-dependency dev server and one-command setup**
- `bun start` serves the site at `http://localhost:8080`.
- Server adds security headers and blocks path traversal.

**7. README and community files**
- README with one-line pitch, screenshot, 3-step quickstart, features, Mermaid diagram, roadmap, badges.
- CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, CHANGELOG present.

**8. Architecture docs and ADRs**
- `docs/architecture.md` plus four ADRs record the key decisions.

**9. Release v0.1.0**
- `v0.1.0` tag created with release notes in CHANGELOG.md.
