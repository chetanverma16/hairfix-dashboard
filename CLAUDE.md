# CLAUDE.md — project handover

## What this is
Phase 1 of the management tool for Chetan's non-surgical hair replacement studio (New Gurgaon, Sector 83/84). It started as a research dashboard and now also records go/no-go evidence in Postgres. The roadmap to a full business system (clients, hair-system units, invoices, WhatsApp, payroll, manufacturing) is in `docs/ROADMAP.md`. Read it before adding anything.

Owner: Chetan Verma (indie developer, Delhi NCR). Entity: Stackframe Studios Pvt Ltd. Deployed at https://hairfix-dashboard.vercel.app behind Vercel Authentication.

## Business context
- Service business: install hair systems (₹20–45K) + maintenance visits (₹1.5–3.5K) + replacement by base type (thin skin 1–3 mo, lace 2–6, mono 6–12). Recurring revenue, embarrassment-driven loyalty.
- Constraints: ≤ ₹5L capital, founder part-time, manager runs day-to-day.
- GST on beauty services is 5% without input credit (since Sep 2025). Import IGST is a cost. Open CA question: install billed as service vs goods.
- Validation before any lease: 2-week Google Ads test to WhatsApp (15+ real enquiries) + mystery-shop 4 competitors + 4-week wear test of samples. The Track pages record exactly this.
- Numbers in `insights.ts` are estimates with sources. Treat as editable assumptions.

## Stack
- Next.js 16.3 (App Router), React 19, TypeScript, Tailwind v4 (CSS-first in `globals.css`), shadcn/ui new-york, Recharts 3, `geist` fonts.
- Drizzle ORM + `@neondatabase/serverless` (HTTP driver) on Neon Postgres, provisioned via Vercel Marketplace (resource `neon-claret-river`). One `DATABASE_URL` for all environments. Migrations in `drizzle/`, committed.
- Zod 4 for action input validation. Vitest for unit tests.

## Layout
```
src/
  app/                     # one page.tsx per route; research pages static, Track pages force-dynamic
    model/ ads-test/ mystery-shop/ samples/      # Track
    revenue/ locations/ competitors/ economics/ sourcing/ compliance/ plan/ risks/ manufacturing/
  actions/                 # "use server" files; schemas.ts holds Zod inputs (testable, no "use server")
  db/schema.ts             # all tables + enums     db/index.ts getDb() lazy     db/seed.ts idempotent seed
  lib/model.ts             # pure P&L model         lib/format.ts inr/lakh/pct   lib/auth.ts requireUser() seam
  components/              # app-sidebar, page-shell, charts, model-playground, forms/, ui/
  data/insights.ts         # static research data
drizzle/                   # generated SQL migrations
docs/ROADMAP.md            # phases 1–4, data model, stack choices, WhatsApp vs AI calling, CA questions
docs/superpowers/plans/    # implementation plans
```

## Conventions
- Static research numbers live in `src/data/insights.ts`. Operational data lives in Postgres. Never hard-code either in pages.
- Server components by default. `"use client"` only for state or Recharts.
- Every write is a Server Action that calls `await requireUser()` first and parses input with a schema from `src/actions/schemas.ts`. Schemas treat `""` as absent via `optional()`.
- Money in the DB is integer rupees. Display via `inr()`. Scenario data stays in ₹ lakh.
- Pages that read the DB export `const dynamic = "force-dynamic"`.
- Inline row-edit forms get a `key` built from the row's saved values, otherwise React keeps the stale uncontrolled `<select>` state after the action re-renders.
- Tables: shadcn `Table`. Cells wrap by default; put `whitespace-nowrap` on names, numbers, dates, badges and `min-w-*` on prose columns.
- Plain, short copy. Internal tool.

## Commands
```bash
npm run dev                         # http://localhost:3000
npm test                            # vitest
npm run build && npm run start
npm run db:generate                 # after editing src/db/schema.ts
npm run db:migrate                  # applies to Neon using .env.local
npm run db:seed                     # idempotent
vercel env pull .env.local --yes    # refresh DATABASE_URL locally
rtk proxy npx shadcn@latest add <component>
```

## Gotchas
- `~/.npm` has root-owned files on this machine. Use `npm ... --cache <scratch dir>` or `sudo chown -R 501:20 ~/.npm`.
- A shell hook rewrites `npx`; use `rtk proxy npx` for shadcn.
- The shadcn CLI writes `import { cn } from "cn"` and adds a bogus `cn` dependency. Fix the import to `@/lib/utils` and `npm uninstall cn`.
- Vercel CLI is 54.x. `vercel integration discover <query>` works; `--category` does not.
- Vercel Authentication (project setting) protects every route including Server Actions. `requireUser()` is a placeholder until phase 2 auth.
- `SidebarInset` needs `min-w-0` and `<main>` needs `min-w-0 overflow-x-hidden` or Recharts pushes the page wider than the viewport.
- Google Fonts was unreachable in the original sandbox; the `geist` package is used instead.
- `npm run start` leaves a `next-server` process behind; kill by port (`lsof -tiTCP:3100 -sTCP:LISTEN`) before restarting.

## Next (see docs/ROADMAP.md)
Phase 2 starts when the first install is booked: clients + consents, hair-system spec and units, visits, calendar, GST invoices, Razorpay links, WhatsApp utility templates on Meta Cloud API, manager login. AI calling is phase 3 (lead callback, no-show recovery).

## Do not
- Replace `insights.ts` with a CMS.
- Add auth beyond `requireUser()` before phase 2.
- Restyle to a generic light SaaS theme.
- Inflate numbers. The model is optimistic for New Gurgaon.
