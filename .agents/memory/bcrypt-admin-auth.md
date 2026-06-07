---
name: Bcrypt admin auth
description: Admin login uses bcrypt.compare(); hash of "admin123" is the default; env var override available.
---

Password comparison in `artifacts/api-server/src/routes/admin.ts` uses `bcryptjs`.

**Rule:** Never revert to plaintext comparison. The stored hash `$2b$10$h7Uu.fPsFo9L9XGug8Hf/.X7gckDZDCcFuVsfYH9BAo8LJItnOo7C` is `bcrypt("admin123", 10)`.

**Why:** Plain `=== "admin123"` was replaced to meet the secure auth requirement.

**How to apply:** To change the admin password, compute a new bcrypt hash and set `ADMIN_PASSWORD_HASH` env var (or update the constant). Username is controlled by `ADMIN_USERNAME` env var (default: "admin").
