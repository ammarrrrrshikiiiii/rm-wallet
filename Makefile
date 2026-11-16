# RM Wallet – developer convenience targets.
# Primary workflow is `bun start` / `bun test` (Bun is the only required runtime).

.PHONY: start dev test check

start: dev

dev:
	bun serve.js

test:
	bun test

check:
	bun scripts/check.mjs
