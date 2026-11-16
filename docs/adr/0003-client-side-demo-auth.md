# ADR-0003: Client-side simulated authentication (demo only)

- Status: Accepted
- Date: 2026-11-16

## Context

RM Wallet is a teaching/demo project. A real backend with a database and secure authentication would add significant complexity and hosting requirements that conflict with the "static, zero-build, no server" goals (ADR-0001). At the same time, the app benefits from a login screen and per-user behavior to demonstrate a realistic product flow. We must be honest about the fact that this is not real security.

## Decision

**Simulate authentication entirely on the client:**

- A hardcoded demo account (`demo` / `Finance@123`) is accepted by `js/login.js`.
- Users can also "register"; registered credentials (username/password) are stored in `localStorage` under `rmUsers`, and registration success requires a minimum password length and a matching confirmation field.
- A successful login stores the username in `sessionStorage` under `rmUser`; `js/app.js` `requireAuth()` redirects to `index.html` when this key is absent, and `logout()` removes it.
- The login page and docs clearly state that this is sample/demo authentication and provides no real security.

## Consequences

**Positive**

- Keeps the app fully static and hostable anywhere (consistent with ADR-0001).
- Demonstrates a realistic sign-in/register/logout UX without a server.
- Simple to understand and modify.

**Negative**

- **No real security.** Credentials are checked in the browser, and registered passwords are stored in plaintext in `localStorage`, visible to anyone with DevTools.
- The auth guard is trivially bypassable (e.g. by setting `sessionStorage.rmUser` manually or opening `dashboard.html` directly and clearing storage); it is a UX gate, not an access control.
- Storing passwords client-side (even plaintext, for a demo) is a poor security habit to model; a real deployment must move to server-side authentication (see the roadmap's medium-term item).
