---
name: Priority and email DB columns
description: Two new columns added to complaintsTable in a live migration; backwards-compatible defaults.
---

**Rule:** `email` is nullable (text, no default) — existing rows have null. `priority` is NOT NULL with default "Medium" — existing rows got "Medium" at migration time.

**Why:** Nullable email prevents migration failures for existing rows. Priority default avoids the same issue.

**How to apply:** When querying, always handle `c.email ?? ""` for CSV/display. Priority filter uses `eq(complaintsTable.priority, priority)` in the complaints list route.
