---
name: Email notifications
description: Nodemailer-based status change notifications; gracefully no-ops when SMTP env vars are absent.
---

**File:** `artifacts/api-server/src/lib/mailer.ts`

**Rule:** Always use `sendStatusNotification()` — it is safe to call unconditionally; it checks for SMTP config and logs-but-skips if not configured.

**Why:** Citizens need opt-in email updates when status changes. Email field is optional on registration so this is fully backwards-compatible.

**How to apply:** Set env vars `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` to activate. Without them, a pino info log fires but no error is thrown.
