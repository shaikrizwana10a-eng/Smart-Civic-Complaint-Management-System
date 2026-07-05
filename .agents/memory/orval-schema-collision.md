---
name: Orval schema name collisions
description: Naming an OpenAPI component schema exactly `<OperationId>Response` or `<OperationId>Body` causes a TS2308 ambiguous re-export error after Orval codegen.
---

Orval auto-names generated response/body types as `<OperationId>Response` / `<OperationId>Body` (e.g. operationId `askAi` → `AskAiResponse`, `AskAiBody`) in `lib/api-zod/src/generated/api.ts` (zod consts) and mirrors an interface of the same name in `lib/api-zod/src/generated/types/`. If a component schema in `openapi.yaml` happens to share that exact name, the barrel file `export *` from both generated modules produces two same-named exports and `tsc --build` fails with `TS2308: Module "./generated/api" has already exported a member named 'X'`.

**Why:** Hit this when adding `AskAiRequest`/`AskAiResponse` schemas for a POST `/ai/ask` endpoint with operationId `askAi` — the schema name matched Orval's auto-derived name exactly.

**How to apply:** When naming request/response component schemas in `lib/api-spec/openapi.yaml`, avoid the literal pattern `<OperationId>Request`/`<OperationId>Response`/`<OperationId>Body`. Prefer a distinct schema name (e.g. `AiAskQuestion` / `AiAskAnswer`) and keep the operationId as-is.
