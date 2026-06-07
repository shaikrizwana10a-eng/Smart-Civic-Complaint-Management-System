# Smart Civic Complaint Management System (SCMS)

A modern SaaS-style civic portal where citizens file and track complaints, and administrators manage, resolve, and analyze them — designed to feel like Linear or Vercel, not a government form.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/scms run dev` — run the frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Poppins font, Recharts, Framer Motion, wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- PDF: pdfkit (externalized from esbuild bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/complaints.ts` — DB schema for complaints and counter
- `artifacts/api-server/src/routes/` — API routes (complaints, admin, analytics)
- `artifacts/api-server/src/lib/pdf.ts` — PDF generation with pdfkit
- `artifacts/scms/src/pages/` — Frontend pages
- `artifacts/scms/src/components/layout/` — PublicLayout and AdminLayout

## Architecture decisions

- pdfkit is marked as `external` in esbuild config (build.mjs) because fontkit (its dep) uses `@swc/helpers` which can't be bundled by esbuild
- Admin auth is cookie-based (httpOnly, `scms_admin` cookie); no JWT complexity for MVP
- Complaint IDs auto-increment per year from a `complaint_counter` table using ON CONFLICT DO UPDATE
- OpenAPI spec drives both Zod schemas (server validation) and React Query hooks (client fetching)
- Analytics routes use PostgreSQL aggregates directly (no separate analytics table)

## Product

- **Public portal**: Landing page with live stats, complaint registration form, complaint tracking by ID
- **Admin portal**: Dashboard with charts (category pie, status pie, monthly trend), complaint table with inline status updates and delete, protected by cookie session
- **PDF receipts**: Downloadable PDF slip per complaint with professional layout
- **Default admin credentials**: `admin` / `admin123`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm run typecheck:libs` after changing `lib/db/src/schema/` before typechecking artifacts
- pdfkit must stay in the `external` list in `artifacts/api-server/build.mjs`
- Complaint counter seeds from year 2026; new year requires a new counter row (auto-created on first complaint)
- The `onConflictDoUpdate` on the counter table uses a SQL expression to atomically increment

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
