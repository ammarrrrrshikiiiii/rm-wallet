# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
