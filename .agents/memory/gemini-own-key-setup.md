---
name: Gemini via own API key, not Replit AI Integrations
description: This SCMS project uses @google/genai directly with a user-supplied GEMINI_API_KEY secret because the Replit AI Integrations proxy setup returned "awaiting_account_upgrade" and the user declined to upgrade.
---

When `setupReplitAIIntegrations({ providerSlug: "gemini", ... })` returns `{"success":false,"status":"awaiting_account_upgrade"}` and the user does not want to upgrade, do NOT retry the integration setup. Instead:

1. Use `requestEnvVar({ requestType: "secret", keys: ["GEMINI_API_KEY"] })` to collect the user's own key safely (never ask for it in chat).
2. Use the `@google/genai` npm package directly: `new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })`.
3. Model used: `gemini-2.5-flash` with `responseMimeType: "application/json"` for structured output, validated with Zod after parsing (Gemini can still return slightly malformed JSON).

**Why:** The AI Decision Dashboard feature (backend: `artifacts/api-server/src/lib/gemini.ts`, `src/lib/ai-analytics.ts`, `src/routes/ai.ts`; frontend: `artifacts/scms/src/pages/admin/ai-dashboard.tsx`) needed Gemini access but the account-level AI Integrations proxy wasn't available for this Replit account tier.

**How to apply:** If a future Gemini/OpenAI AI integration request in this project hits the same `awaiting_account_upgrade` status, skip straight to the own-API-key path instead of re-attempting `setupReplitAIIntegrations`.

Design pattern used for grounding/avoiding hallucination: all Gemini prompts embed the actual DB-derived JSON digest (aggregated stats or a capped list of real complaint rows) and explicitly instruct the model to only reference IDs/values present in that data; API responses additionally post-filter any complaintId not present in the DB result set before returning to the client. Deterministic computations (hotspot risk level, priority heuristic, department mapping, trend forecast) are done in plain JS/SQL — Gemini is only called for narrative summary/recommendations/predictions and for severity/pattern/similarity classification over a capped sample, keeping API calls to 2 per dashboard load (cached 5 min) plus 1 per Ask AI question.
