# Phase 1 "Validate" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the static decision dashboard into a tool that records the go/no-go evidence (ads leads, mystery-shop visits, supplier samples) in Postgres and lets the founder stress-test the revenue model with sliders.

**Architecture:** Next.js 16 App Router stays as is. New domain layer: Drizzle schema in `src/db`, Server Actions in `src/actions`, pure business math in `src/lib/model.ts`. Tracker pages are dynamic server components that read from Neon and write through Server Actions; the existing research pages stay static. One `requireUser()` seam stands in for auth until phase 2.

**Tech Stack:** Next.js 16.3, React 19, TypeScript, Tailwind v4, shadcn/ui, Recharts 3, Drizzle ORM 0.45 + drizzle-kit 0.31, `@neondatabase/serverless` 1.1 (HTTP driver), Zod 4, Vitest 5, dotenv-cli, tsx. Neon Postgres provisioned via Vercel Marketplace (resource `neon-claret-river`, one `DATABASE_URL` shared by Development, Preview and Production).

**Spec:** `docs/ROADMAP.md`, sections 0 and "Phase 1: Validate".

## Global Constraints

- Money is stored as integer rupees in the database. Display with `inr()` from `src/lib/format.ts`. The scenario data in `insights.ts` stays in ₹ lakh.
- Pages are server components. Only files that need state or Recharts carry `"use client"`.
- Every page wraps content in `<PageShell title subtitle>` and uses `Card` sections. Keep the dark sidebar and teal/amber palette.
- Never hard-code numbers in pages. Static research numbers live in `src/data/insights.ts`; operational data lives in the database.
- Server Actions validate with Zod schemas that live in `src/actions/schemas.ts` (no `"use server"` there) so they are unit-testable.
- Every Server Action calls `await requireUser()` first.
- Pages that read the database export `const dynamic = "force-dynamic"`.
- Copy is plain and short. No marketing tone.
- npm on this machine needs `--cache /private/tmp/claude-501/-Users-chetanverma-main-hairfix-dashboard/4aaa8a55-341c-4922-a80d-a0dc4bfbabdd/scratchpad/npm-cache` because `~/.npm` has root-owned files. `npx` is rewritten by a shell hook; use `rtk proxy npx ...` for shadcn.
- The shadcn CLI writes `import { cn } from "cn"` and adds a bogus `cn` dependency. After any `shadcn add`, rewrite the import to `@/lib/utils` and run `npm uninstall cn`.
- Commit after every task. Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

## File structure

| File | Responsibility |
|---|---|
| `vitest.config.ts` | Test runner config, path alias `@/` |
| `src/lib/format.ts` | `inr()`, `lakh()`, `pct()` display helpers |
| `src/lib/model.ts` | Pure 24-month P&L model: `runModel(inputs)`, `defaultInputs` |
| `src/lib/model.test.ts` | Model unit tests |
| `src/components/model-playground.tsx` | Client component: sliders, chart, month table, localStorage |
| `src/app/model/page.tsx` | Model page |
| `drizzle.config.ts` | drizzle-kit config |
| `src/db/schema.ts` | All phase 1 tables and enums |
| `src/db/index.ts` | `getDb()` lazy client |
| `drizzle/*.sql` | Generated migrations, committed |
| `src/db/seed.ts` | Idempotent seed from `insights.ts` |
| `src/lib/auth.ts` | `requireUser()` fixed owner |
| `src/actions/schemas.ts` | Zod input schemas for all actions |
| `src/actions/schemas.test.ts` | Schema tests |
| `src/actions/leads.ts` | Campaign day and lead actions |
| `src/actions/competitors.ts` | Competitor visit actions |
| `src/actions/suppliers.ts` | Supplier sample actions |
| `src/components/forms/field.tsx` | Small labelled field wrappers used by all forms |
| `src/components/forms/delete-button.tsx` | Delete form button |
| `src/app/ads-test/page.tsx` | Funnel summary, campaign days, leads |
| `src/app/mystery-shop/page.tsx` | Visit log and comparison grid |
| `src/app/samples/page.tsx` | Supplier sample tracker |
| `src/components/app-sidebar.tsx` | Add "Track" group |
| `src/data/insights.ts` | Data corrections and new arrays |
| `src/app/competitors/page.tsx`, `compliance/page.tsx`, `sourcing/page.tsx`, `economics/page.tsx` | Render corrected data |
| `CLAUDE.md` | Rewrite for the new stack and roadmap |

---

### Task 1: Vitest and the pure revenue model

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/format.ts`
- Create: `src/lib/model.ts`
- Create: `src/lib/model.test.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces:
  ```ts
  // src/lib/model.ts
  export type ModelInputs = {
    installPrice: number          // ₹ gross to client
    maintenancePrice: number      // ₹ per visit, gross
    replacementPrice: number      // ₹ gross
    gstRate: number               // 0.05
    visitsPerClientMonth: number  // 0.8
    monthlyChurn: number          // 0.05
    replacementMonths: number     // 9
    installsStart: number         // installs in month 1
    installsPeak: number          // installs per month at plateau
    peakMonth: number             // month the plateau is reached (1..24)
    systemCost: number            // ₹ landed per system, taxes included
    consumablesPerInstall: number // ₹
    consumablesPerVisit: number   // ₹
    rent: number; technician: number; manager: number; marketing: number // ₹ per month
    capital: number               // ₹ opening cash
    months: number                // 24
  }
  export type MonthRow = {
    month: number; installs: number; activeClients: number; visits: number; replacements: number
    revenue: number; cogs: number; fixed: number; profit: number; cash: number
  }
  export type ModelResult = {
    rows: MonthRow[]
    breakEvenMonth: number | null   // first month with profit >= 0
    lowestCash: number
    lowestCashMonth: number
    year1Revenue: number; year1Profit: number; clientsM12: number
  }
  export const defaultInputs: ModelInputs
  export function runModel(i: ModelInputs): ModelResult
  ```
  ```ts
  // src/lib/format.ts
  export function inr(n: number): string      // "₹12,345"
  export function lakh(n: number): string     // "₹1.2L" from rupees
  export function pct(n: number): string      // "5%" from 0.05
  ```

- [ ] **Step 1: Add Vitest config and scripts**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: { include: ["src/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
})
```

In `package.json` `scripts` add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Write format helpers**

`src/lib/format.ts`:
```ts
const inrFmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })

export function inr(n: number): string {
  return inrFmt.format(Math.round(n))
}

export function lakh(n: number): string {
  const l = n / 100_000
  const s = Math.abs(l) >= 10 ? l.toFixed(0) : l.toFixed(1)
  return `₹${s}L`
}

export function pct(n: number): string {
  return `${Math.round(n * 100)}%`
}
```

- [ ] **Step 3: Write the failing model tests**

`src/lib/model.test.ts`:
```ts
import { describe, expect, it } from "vitest"
import { defaultInputs, runModel, type ModelInputs } from "./model"

const base: ModelInputs = {
  ...defaultInputs,
  gstRate: 0,
  installsStart: 10, installsPeak: 10, peakMonth: 1,
  monthlyChurn: 0,
  rent: 0, technician: 0, manager: 0, marketing: 0,
  systemCost: 0, consumablesPerInstall: 0, consumablesPerVisit: 0,
  replacementMonths: 1000,
  capital: 0,
  months: 12,
}

describe("runModel", () => {
  it("accumulates active clients with zero churn", () => {
    const r = runModel(base)
    expect(r.rows[0].activeClients).toBe(10)
    expect(r.rows[11].activeClients).toBe(120)
    expect(r.clientsM12).toBe(120)
  })

  it("computes install and maintenance revenue net of GST", () => {
    const r = runModel({ ...base, gstRate: 0.05, installPrice: 21_000, maintenancePrice: 2_100, visitsPerClientMonth: 1 })
    // month 1: 10 installs at 20,000 net + 10 clients * 1 visit * 2,000 net
    expect(r.rows[0].revenue).toBeCloseTo(220_000, 0)
  })

  it("applies churn before counting visits", () => {
    const r = runModel({ ...base, monthlyChurn: 0.5, months: 2 })
    // month 1: 10 new. month 2: 10 * 0.5 survive + 10 new = 15
    expect(r.rows[1].activeClients).toBe(15)
  })

  it("ramps installs linearly to the peak month then holds", () => {
    const r = runModel({ ...base, installsStart: 2, installsPeak: 10, peakMonth: 5, months: 6 })
    expect(r.rows.map((m) => m.installs)).toEqual([2, 4, 6, 8, 10, 10])
  })

  it("reports break-even, lowest cash and year-1 totals", () => {
    const r = runModel({ ...base, rent: 150_000, installPrice: 20_000, maintenancePrice: 0, capital: 100_000 })
    // month 1: 10*20,000 = 200,000 revenue, 150,000 fixed → profit 50,000 → break-even month 1
    expect(r.breakEvenMonth).toBe(1)
    expect(r.rows[0].cash).toBe(150_000)
    expect(r.lowestCash).toBe(150_000)
    expect(r.year1Revenue).toBe(2_400_000)
    expect(r.year1Profit).toBe(600_000)
  })

  it("returns null break-even when never profitable", () => {
    const r = runModel({ ...base, installPrice: 0, maintenancePrice: 0, rent: 1 })
    expect(r.breakEvenMonth).toBeNull()
  })

  it("charges system cost and consumables per install, replacement and visit", () => {
    const r = runModel({ ...base, months: 1, systemCost: 5_000, consumablesPerInstall: 500, consumablesPerVisit: 100, visitsPerClientMonth: 1 })
    // 10 installs * (5,000 + 500) + 10 visits * 100
    expect(r.rows[0].cogs).toBe(56_000)
  })

  it("adds replacements at the cycle rate", () => {
    const r = runModel({ ...base, months: 1, replacementMonths: 10, replacementPrice: 10_000 })
    // 10 active / 10 months = 1 replacement → 10,000 revenue
    expect(r.rows[0].replacements).toBeCloseTo(1)
    expect(r.rows[0].revenue).toBeCloseTo(10 * base.installPrice + 10_000)
  })
})
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL, cannot find module `./model`.

- [ ] **Step 5: Implement the model**

`src/lib/model.ts`:
```ts
export type ModelInputs = {
  installPrice: number
  maintenancePrice: number
  replacementPrice: number
  gstRate: number
  visitsPerClientMonth: number
  monthlyChurn: number
  replacementMonths: number
  installsStart: number
  installsPeak: number
  peakMonth: number
  systemCost: number
  consumablesPerInstall: number
  consumablesPerVisit: number
  rent: number
  technician: number
  manager: number
  marketing: number
  capital: number
  months: number
}

export type MonthRow = {
  month: number
  installs: number
  activeClients: number
  visits: number
  replacements: number
  revenue: number
  cogs: number
  fixed: number
  profit: number
  cash: number
}

export type ModelResult = {
  rows: MonthRow[]
  breakEvenMonth: number | null
  lowestCash: number
  lowestCashMonth: number
  year1Revenue: number
  year1Profit: number
  clientsM12: number
}

// New Gurgaon base case, taxes included where they are a cost (5% GST regime, no ITC).
export const defaultInputs: ModelInputs = {
  installPrice: 24_000,
  maintenancePrice: 2_000,
  replacementPrice: 15_000,
  gstRate: 0.05,
  visitsPerClientMonth: 0.8,
  monthlyChurn: 0.05,
  replacementMonths: 9,
  installsStart: 3,
  installsPeak: 10,
  peakMonth: 7,
  systemCost: 7_500,
  consumablesPerInstall: 900,
  consumablesPerVisit: 250,
  rent: 30_000,
  technician: 30_000,
  manager: 25_000,
  marketing: 25_000,
  capital: 500_000,
  months: 24,
}

function installsFor(month: number, i: ModelInputs): number {
  if (i.peakMonth <= 1 || month >= i.peakMonth) return i.installsPeak
  const step = (i.installsPeak - i.installsStart) / (i.peakMonth - 1)
  return i.installsStart + step * (month - 1)
}

export function runModel(i: ModelInputs): ModelResult {
  const net = 1 / (1 + i.gstRate)
  const fixed = i.rent + i.technician + i.manager + i.marketing
  const rows: MonthRow[] = []
  let active = 0
  let cash = i.capital
  let breakEvenMonth: number | null = null
  let lowestCash = cash
  let lowestCashMonth = 0

  for (let m = 1; m <= i.months; m++) {
    const installs = installsFor(m, i)
    active = active * (1 - i.monthlyChurn) + installs
    const visits = active * i.visitsPerClientMonth
    const replacements = active / i.replacementMonths
    const revenue =
      installs * i.installPrice * net +
      visits * i.maintenancePrice * net +
      replacements * i.replacementPrice * net
    const cogs =
      (installs + replacements) * i.systemCost +
      installs * i.consumablesPerInstall +
      visits * i.consumablesPerVisit
    const profit = revenue - cogs - fixed
    cash += profit
    if (breakEvenMonth === null && profit >= 0) breakEvenMonth = m
    if (cash < lowestCash) { lowestCash = cash; lowestCashMonth = m }
    rows.push({ month: m, installs, activeClients: active, visits, replacements, revenue, cogs, fixed, profit, cash })
  }

  const y1 = rows.slice(0, 12)
  return {
    rows,
    breakEvenMonth,
    lowestCash,
    lowestCashMonth,
    year1Revenue: y1.reduce((s, r) => s + r.revenue, 0),
    year1Profit: y1.reduce((s, r) => s + r.profit, 0),
    clientsM12: rows[Math.min(11, rows.length - 1)]?.activeClients ?? 0,
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test`
Expected: 8 passed. If the "lowest cash" test fails because `lowestCash` was initialised to opening capital, that is intended: opening cash counts. Check the expectation (150,000 after month 1 profit of 50,000 on 100,000 capital) and fix the implementation, not the test.

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts package.json package-lock.json src/lib/format.ts src/lib/model.ts src/lib/model.test.ts
git commit -m "Add pure revenue model with Vitest tests

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Interactive model page

**Files:**
- Create: `src/components/model-playground.tsx`
- Create: `src/app/model/page.tsx`
- Modify: `src/components/app-sidebar.tsx`

**Interfaces:**
- Consumes: `runModel`, `defaultInputs`, `ModelInputs` from `@/lib/model`; `inr`, `lakh` from `@/lib/format`; `scenarios` from `@/data/insights`; shadcn `Slider`, `Card`, `Table`, `Button`.
- Produces: route `/model`.

- [ ] **Step 1: Write the playground client component**

`src/components/model-playground.tsx`:
```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { defaultInputs, runModel, type ModelInputs } from "@/lib/model"
import { inr, lakh, pct } from "@/lib/format"
import { scenarios } from "@/data/insights"

const STORAGE_KEY = "hairfix.model.v1"

type Control = { key: keyof ModelInputs; label: string; min: number; max: number; step: number; fmt: (n: number) => string }

const groups: { title: string; controls: Control[] }[] = [
  { title: "Pricing", controls: [
    { key: "installPrice", label: "Install price", min: 10_000, max: 60_000, step: 1_000, fmt: inr },
    { key: "maintenancePrice", label: "Maintenance visit", min: 500, max: 5_000, step: 100, fmt: inr },
    { key: "replacementPrice", label: "Replacement", min: 5_000, max: 40_000, step: 1_000, fmt: inr },
    { key: "gstRate", label: "GST on services (no ITC)", min: 0, max: 0.18, step: 0.01, fmt: pct },
  ]},
  { title: "Clients", controls: [
    { key: "installsStart", label: "Installs, month 1", min: 0, max: 20, step: 1, fmt: String },
    { key: "installsPeak", label: "Installs at plateau", min: 0, max: 30, step: 1, fmt: String },
    { key: "peakMonth", label: "Plateau reached in month", min: 1, max: 24, step: 1, fmt: String },
    { key: "visitsPerClientMonth", label: "Visits per client per month", min: 0.2, max: 1.5, step: 0.1, fmt: (n) => n.toFixed(1) },
    { key: "monthlyChurn", label: "Monthly churn", min: 0, max: 0.25, step: 0.01, fmt: pct },
    { key: "replacementMonths", label: "Replacement cycle, months", min: 2, max: 18, step: 1, fmt: String },
  ]},
  { title: "Costs", controls: [
    { key: "systemCost", label: "Landed cost per system", min: 2_000, max: 20_000, step: 500, fmt: inr },
    { key: "consumablesPerInstall", label: "Consumables per install", min: 0, max: 3_000, step: 100, fmt: inr },
    { key: "consumablesPerVisit", label: "Consumables per visit", min: 0, max: 1_000, step: 50, fmt: inr },
    { key: "rent", label: "Rent per month", min: 0, max: 100_000, step: 5_000, fmt: inr },
    { key: "technician", label: "Technician per month", min: 0, max: 80_000, step: 5_000, fmt: inr },
    { key: "manager", label: "Manager per month", min: 0, max: 60_000, step: 5_000, fmt: inr },
    { key: "marketing", label: "Marketing per month", min: 0, max: 100_000, step: 5_000, fmt: inr },
    { key: "capital", label: "Opening capital", min: 100_000, max: 1_500_000, step: 50_000, fmt: inr },
  ]},
]

function load(): ModelInputs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaultInputs, ...JSON.parse(raw) }
  } catch {}
  return defaultInputs
}

export function ModelPlayground() {
  const [inputs, setInputs] = useState<ModelInputs>(defaultInputs)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setInputs(load()); setHydrated(true) }, [])
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs)) } catch {}
  }, [inputs, hydrated])

  const result = useMemo(() => runModel(inputs), [inputs])
  const chartData = result.rows.map((r) => ({ month: `M${r.month}`, revenue: r.revenue / 1e5, profit: r.profit / 1e5, cash: r.cash / 1e5 }))
  const baseScenario = scenarios.find((s) => s.name === "Base")

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Break-even month" value={result.breakEvenMonth ? `M${result.breakEvenMonth}` : "Never"} />
        <Stat label="Lowest cash" value={lakh(result.lowestCash)} hint={result.lowestCashMonth ? `in M${result.lowestCashMonth}` : "opening"} warn={result.lowestCash < 0} />
        <Stat label="Year-1 revenue" value={lakh(result.year1Revenue)} hint={baseScenario ? `base case ₹${baseScenario.revenue}L` : undefined} />
        <Stat label="Year-1 profit" value={lakh(result.year1Profit)} hint={`${Math.round(result.clientsM12)} clients in M12`} warn={result.year1Profit < 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Assumptions</CardTitle>
            <CardDescription>Prices are what the client pays; GST is stripped before it counts as revenue. Saved in this browser.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {groups.map((g) => (
              <div key={g.title} className="grid gap-4">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{g.title}</h3>
                {g.controls.map((c) => (
                  <div key={c.key} className="grid gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{c.label}</span>
                      <span className="tabular-nums font-medium">{c.fmt(inputs[c.key])}</span>
                    </div>
                    <Slider min={c.min} max={c.max} step={c.step} value={[inputs[c.key]]}
                      onValueChange={([v]) => setInputs((s) => ({ ...s, [c.key]: v }))} />
                  </div>
                ))}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setInputs(defaultInputs)}>Reset to defaults</Button>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader><CardTitle>Cash, revenue and profit</CardTitle><CardDescription>₹ lakh per month. Cash starts at opening capital.</CardDescription></CardHeader>
            <CardContent>
              <div className="h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `${v}L`} />
                    <Tooltip formatter={(v) => `₹${Number(v).toFixed(1)}L`} />
                    <ReferenceLine y={0} stroke="var(--border)" />
                    <Line type="monotone" dataKey="cash" stroke="var(--chart-1)" strokeWidth={2} dot={false} name="Cash" />
                    <Line type="monotone" dataKey="revenue" stroke="var(--chart-2)" strokeWidth={2} dot={false} name="Revenue" />
                    <Line type="monotone" dataKey="profit" stroke="var(--chart-5)" strokeWidth={2} dot={false} name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Month by month</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Month</TableHead><TableHead className="text-right">Installs</TableHead><TableHead className="text-right">Clients</TableHead>
                  <TableHead className="text-right">Visits</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">Profit</TableHead><TableHead className="text-right">Cash</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {result.rows.map((r) => (
                    <TableRow key={r.month} className={r.month === 12 ? "font-medium" : ""}>
                      <TableCell className="whitespace-nowrap">M{r.month}</TableCell>
                      <TableCell className="text-right tabular-nums">{Math.round(r.installs)}</TableCell>
                      <TableCell className="text-right tabular-nums">{Math.round(r.activeClients)}</TableCell>
                      <TableCell className="text-right tabular-nums">{Math.round(r.visits)}</TableCell>
                      <TableCell className="text-right tabular-nums">{lakh(r.revenue)}</TableCell>
                      <TableCell className={`text-right tabular-nums ${r.profit < 0 ? "text-destructive" : ""}`}>{lakh(r.profit)}</TableCell>
                      <TableCell className={`text-right tabular-nums ${r.cash < 0 ? "text-destructive" : ""}`}>{lakh(r.cash)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function Stat({ label, value, hint, warn }: { label: string; value: string; hint?: string; warn?: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardDescription>{label}</CardDescription></CardHeader>
      <CardContent>
        <div className={`text-2xl font-semibold tabular-nums ${warn ? "text-destructive" : ""}`}>{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Write the page**

`src/app/model/page.tsx`:
```tsx
import { PageShell } from "@/components/page-shell"
import { ModelPlayground } from "@/components/model-playground"

export default function Model() {
  return (
    <PageShell title="Model" subtitle="Move the sliders. Break-even, lowest cash and year-1 P&L update live.">
      <ModelPlayground />
    </PageShell>
  )
}
```

- [ ] **Step 3: Add the Track group to the sidebar**

In `src/components/app-sidebar.tsx`, extend the lucide import with `SlidersHorizontal, Megaphone, Eye, FlaskConical` and add after the "Build" group:
```ts
  { group: "Track", items: [
    { title: "Model", href: "/model", icon: SlidersHorizontal },
    { title: "Ads test", href: "/ads-test", icon: Megaphone },
    { title: "Mystery shop", href: "/mystery-shop", icon: Eye },
    { title: "Samples", href: "/samples", icon: FlaskConical },
  ]},
```
The three tracker routes 404 until Tasks 5 to 7. That is acceptable for this commit.

- [ ] **Step 4: Build and eyeball**

Run: `npm run build`
Expected: compiles, `/model` listed as static (○).
Run: `npm run start -- -p 3100` in the background, open http://localhost:3100/model in Chrome, move a slider, reload, confirm the value persisted. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add src/components/model-playground.tsx src/app/model/page.tsx src/components/app-sidebar.tsx
git commit -m "Add interactive model page with sliders and Track nav group

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Database schema, client, migration and auth seam

**Files:**
- Create: `drizzle.config.ts`
- Create: `src/db/schema.ts`
- Create: `src/db/index.ts`
- Create: `src/lib/auth.ts`
- Create: `drizzle/` (generated)
- Modify: `package.json` (scripts, tsx dev dep)

**Interfaces:**
- Produces:
  ```ts
  // src/db/index.ts
  export function getDb(): NeonHttpDatabase<typeof schema>
  // src/db/schema.ts exports: campaigns, campaignDays, leads, competitors, competitorVisits, suppliers, supplierSamples
  //   and enums channelEnum, leadStatusEnum, cabinPrivacyEnum, upsellEnum, countryEnum, verdictEnum
  //   and types: Lead, Campaign, CampaignDay, Competitor, CompetitorVisit, Supplier, SupplierSample (select types)
  // src/lib/auth.ts
  export type User = { id: string; name: string; role: "owner" | "manager" }
  export async function requireUser(): Promise<User>
  ```

- [ ] **Step 1: Install tsx and add scripts**

```bash
npm install -D tsx --cache /private/tmp/claude-501/-Users-chetanverma-main-hairfix-dashboard/4aaa8a55-341c-4922-a80d-a0dc4bfbabdd/scratchpad/npm-cache
```
Add to `package.json` scripts:
```json
"db:generate": "drizzle-kit generate",
"db:migrate": "dotenv -e .env.local -- drizzle-kit migrate",
"db:studio": "dotenv -e .env.local -- drizzle-kit studio",
"db:seed": "dotenv -e .env.local -- tsx src/db/seed.ts"
```

- [ ] **Step 2: Write drizzle config**

`drizzle.config.ts`:
```ts
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL! },
})
```

- [ ] **Step 3: Write the schema**

`src/db/schema.ts`:
```ts
import { date, integer, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}
const id = () => integer().primaryKey().generatedAlwaysAsIdentity()

export const channelEnum = pgEnum("channel", ["google_ads", "justdial", "instagram", "referral", "walk_in", "other"])
export const leadStatusEnum = pgEnum("lead_status", ["new", "replied", "consulted", "installed", "lost"])
export const cabinPrivacyEnum = pgEnum("cabin_privacy", ["private_cabin", "curtain", "open", "unknown"])
export const upsellEnum = pgEnum("upsell_pressure", ["none", "low", "medium", "high", "unknown"])
export const countryEnum = pgEnum("supplier_country", ["india", "china"])
export const verdictEnum = pgEnum("sample_verdict", ["pending", "pass", "fail", "reorder"])

export const campaigns = pgTable("campaigns", {
  id: id(),
  name: text().notNull(),
  channel: channelEnum().notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  budget: integer().notNull().default(0),
  targetEnquiries: integer("target_enquiries").notNull().default(0),
  notes: text(),
  ...timestamps,
})

export const campaignDays = pgTable("campaign_days", {
  id: id(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  day: date().notNull(),
  spend: integer().notNull().default(0),
  impressions: integer().notNull().default(0),
  clicks: integer().notNull().default(0),
  notes: text(),
  ...timestamps,
}, (t) => [uniqueIndex("campaign_days_campaign_day").on(t.campaignId, t.day)])

export const leads = pgTable("leads", {
  id: id(),
  campaignId: integer("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  name: text(),
  phone: text().notNull(),
  area: text(),
  status: leadStatusEnum().notNull().default("new"),
  firstContactAt: timestamp("first_contact_at", { withTimezone: true }).defaultNow().notNull(),
  nextFollowUp: date("next_follow_up"),
  notes: text(),
  ...timestamps,
})

export const competitors = pgTable("competitors", {
  id: id(),
  name: text().notNull(),
  area: text(),
  phone: text(),
  rating: numeric({ precision: 2, scale: 1 }),
  reviews: integer(),
  note: text(),
  sourceUrl: text("source_url"),
  ...timestamps,
}, (t) => [uniqueIndex("competitors_name").on(t.name)])

export const competitorVisits = pgTable("competitor_visits", {
  id: id(),
  competitorId: integer("competitor_id").notNull().references(() => competitors.id, { onDelete: "cascade" }),
  visitedOn: date("visited_on").notNull(),
  visitedBy: text("visited_by"),
  installPriceMin: integer("install_price_min"),
  installPriceMax: integer("install_price_max"),
  maintenancePrice: integer("maintenance_price"),
  basesOffered: text("bases_offered"),
  cabinPrivacy: cabinPrivacyEnum("cabin_privacy").notNull().default("unknown"),
  upsellPressure: upsellEnum("upsell_pressure").notNull().default("unknown"),
  productsUsed: text("products_used"),
  leadTimeDays: integer("lead_time_days"),
  packages: text(),
  notes: text(),
  ...timestamps,
})

export const suppliers = pgTable("suppliers", {
  id: id(),
  name: text().notNull(),
  country: countryEnum().notNull(),
  city: text(),
  product: text(),
  priceNote: text("price_note"),
  note: text(),
  ...timestamps,
}, (t) => [uniqueIndex("suppliers_name").on(t.name)])

export const supplierSamples = pgTable("supplier_samples", {
  id: id(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id, { onDelete: "cascade" }),
  item: text().notNull(),
  spec: text(),
  orderedOn: date("ordered_on"),
  receivedOn: date("received_on"),
  landedCost: integer("landed_cost"),
  wearTestDays: integer("wear_test_days"),
  verdict: verdictEnum().notNull().default("pending"),
  notes: text(),
  ...timestamps,
})

export type Campaign = typeof campaigns.$inferSelect
export type CampaignDay = typeof campaignDays.$inferSelect
export type Lead = typeof leads.$inferSelect
export type Competitor = typeof competitors.$inferSelect
export type CompetitorVisit = typeof competitorVisits.$inferSelect
export type Supplier = typeof suppliers.$inferSelect
export type SupplierSample = typeof supplierSamples.$inferSelect
```

- [ ] **Step 4: Write the lazy client and auth seam**

`src/db/index.ts`:
```ts
import { neon } from "@neondatabase/serverless"
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http"
import * as schema from "./schema"

let _db: NeonHttpDatabase<typeof schema> | null = null

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error("DATABASE_URL is not set")
    _db = drizzle({ client: neon(url), schema })
  }
  return _db
}
```

`src/lib/auth.ts`:
```ts
// Phase 1: Vercel Authentication gates every request, so the only user is the owner.
// Phase 2 replaces this with a real session lookup. Every Server Action calls it first.
export type User = { id: string; name: string; role: "owner" | "manager" }

export async function requireUser(): Promise<User> {
  return { id: "owner", name: "Chetan", role: "owner" }
}
```

- [ ] **Step 5: Generate and apply the migration**

Run: `npm run db:generate`
Expected: `drizzle/0000_<name>.sql` and `drizzle/meta/` created. Open the SQL and confirm seven `CREATE TABLE` statements and six `CREATE TYPE`.

Run: `npm run db:migrate`
Expected: "migrations applied successfully" (wording varies). If it fails with a TLS or connection error, confirm `.env.local` has `DATABASE_URL` (run `vercel env pull .env.local --yes`).

Verify: `dotenv -e .env.local -- npx drizzle-kit studio` is optional. Faster check:
```bash
npx dotenv -e .env.local -- node -e "const {neon}=require('@neondatabase/serverless');neon(process.env.DATABASE_URL)('select table_name from information_schema.tables where table_schema=\'public\' order by 1').then(r=>console.log(r.map(x=>x.table_name).join(', ')))"
```
Expected: `__drizzle_migrations` is in the `drizzle` schema, so the public list shows `campaign_days, campaigns, competitor_visits, competitors, leads, supplier_samples, suppliers`.

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add drizzle.config.ts drizzle src/db/schema.ts src/db/index.ts src/lib/auth.ts package.json package-lock.json
git commit -m "Add Drizzle schema for campaigns, leads, competitors, suppliers; first migration

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Seed competitors, suppliers and the ads campaign

**Files:**
- Create: `src/db/seed.ts`

**Interfaces:**
- Consumes: `getDb`, schema tables, `competitorsNearby`, `suppliersIndia`, `suppliersChina` from `@/data/insights`.
- Produces: rows in `competitors` (8), `suppliers` (12), `campaigns` (1: "Google Ads test, Sep 2026"). Idempotent via `onConflictDoNothing`.

- [ ] **Step 1: Write the seed**

`src/db/seed.ts`:
```ts
import { getDb } from "@/db"
import { campaigns, competitors, suppliers } from "@/db/schema"
import { competitorsNearby, suppliersChina, suppliersIndia } from "@/data/insights"

async function main() {
  const db = getDb()

  await db.insert(competitors).values(
    competitorsNearby.map((c) => ({
      name: c.name, area: c.area, phone: c.phone, rating: c.rating.toFixed(1), reviews: c.reviews, note: c.note,
      sourceUrl: "Google Places, Sep 2026",
    })),
  ).onConflictDoNothing()

  await db.insert(suppliers).values([
    ...suppliersIndia.map((s) => ({ name: s.name, country: "india" as const, city: s.city, product: s.product, priceNote: s.price, note: s.note })),
    ...suppliersChina.map((s) => ({
      name: s.name, country: "china" as const, city: s.city, product: `Stock ${s.stock} · Custom ${s.custom} · MOQ ${s.moq}`,
      priceNote: s.lead, note: s.note,
    })),
  ]).onConflictDoNothing()

  const existing = await db.select({ id: campaigns.id }).from(campaigns)
  if (existing.length === 0) {
    await db.insert(campaigns).values({
      name: "Google Ads test, Sep 2026",
      channel: "google_ads",
      startDate: new Date().toISOString().slice(0, 10),
      budget: 8_000,
      targetEnquiries: 15,
      notes: "Search ads for 'hair patch New Gurgaon / Sector 83 / Manesar' to a WhatsApp landing page. Go/no-go: 15+ real enquiries in 2 weeks.",
    })
  }

  const counts = await Promise.all([
    db.select({ id: competitors.id }).from(competitors),
    db.select({ id: suppliers.id }).from(suppliers),
    db.select({ id: campaigns.id }).from(campaigns),
  ])
  console.log(`competitors=${counts[0].length} suppliers=${counts[1].length} campaigns=${counts[2].length}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
```

- [ ] **Step 2: Run the seed twice**

Run: `npm run db:seed`
Expected: `competitors=8 suppliers=12 campaigns=1`
Run again: same output, no duplicate errors.

- [ ] **Step 3: Commit**

```bash
git add src/db/seed.ts
git commit -m "Seed competitors, suppliers and the ads-test campaign from research data

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Ads test page with leads

**Files:**
- Create: `src/actions/schemas.ts`
- Create: `src/actions/schemas.test.ts`
- Create: `src/actions/leads.ts`
- Create: `src/components/forms/field.tsx`
- Create: `src/components/forms/delete-button.tsx`
- Create: `src/app/ads-test/page.tsx`

**Interfaces:**
- Produces:
  ```ts
  // src/actions/schemas.ts
  export const optional: <T extends z.ZodTypeAny>(s: T) => z.ZodOptional<T>  // "" → undefined
  export const CampaignDayInput, LeadInput, LeadStatusInput, CompetitorVisitInput, SupplierSampleInput
  // src/actions/leads.ts ("use server")
  export async function addCampaignDay(formData: FormData): Promise<void>
  export async function addLead(formData: FormData): Promise<void>
  export async function setLeadStatus(formData: FormData): Promise<void>
  export async function deleteLead(id: number): Promise<void>
  export async function deleteCampaignDay(id: number): Promise<void>
  // src/components/forms/field.tsx
  export function Field(props: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; defaultValue?: string | number; step?: string | number; min?: number })
  export function SelectField(props: { label: string; name: string; options: { value: string; label: string }[]; defaultValue?: string })
  export function TextareaField(props: { label: string; name: string; placeholder?: string })
  // src/components/forms/delete-button.tsx
  export function DeleteButton(props: { action: () => Promise<void> })
  ```

- [ ] **Step 1: Write the failing schema tests**

`src/actions/schemas.test.ts`:
```ts
import { describe, expect, it } from "vitest"
import { CampaignDayInput, CompetitorVisitInput, LeadInput, LeadStatusInput, SupplierSampleInput } from "./schemas"

const form = (o: Record<string, string>) => o

describe("LeadInput", () => {
  it("requires a phone and defaults status to new", () => {
    const r = LeadInput.parse(form({ phone: "+91 98765 43210", campaignId: "1", name: "", area: "", notes: "" }))
    expect(r.phone).toBe("+91 98765 43210")
    expect(r.status).toBe("new")
    expect(r.campaignId).toBe(1)
    expect(r.name).toBeUndefined()
  })
  it("rejects an empty phone", () => {
    expect(() => LeadInput.parse(form({ phone: "", campaignId: "1" }))).toThrow()
  })
})

describe("LeadStatusInput", () => {
  it("coerces id and validates status", () => {
    expect(LeadStatusInput.parse(form({ id: "7", status: "consulted" }))).toEqual({ id: 7, status: "consulted", nextFollowUp: undefined })
    expect(() => LeadStatusInput.parse(form({ id: "7", status: "maybe" }))).toThrow()
  })
})

describe("CampaignDayInput", () => {
  it("coerces numbers and requires a day", () => {
    const r = CampaignDayInput.parse(form({ campaignId: "1", day: "2026-09-15", spend: "450", impressions: "1200", clicks: "38", notes: "" }))
    expect(r).toMatchObject({ campaignId: 1, day: "2026-09-15", spend: 450, impressions: 1200, clicks: 38 })
    expect(() => CampaignDayInput.parse(form({ campaignId: "1", day: "", spend: "0" }))).toThrow()
  })
})

describe("CompetitorVisitInput", () => {
  it("accepts a partial visit", () => {
    const r = CompetitorVisitInput.parse(form({ competitorId: "2", visitedOn: "2026-09-16", installPriceMin: "18000", installPriceMax: "", cabinPrivacy: "curtain", upsellPressure: "high" }))
    expect(r.installPriceMin).toBe(18000)
    expect(r.installPriceMax).toBeUndefined()
    expect(r.cabinPrivacy).toBe("curtain")
  })
})

describe("SupplierSampleInput", () => {
  it("defaults verdict to pending", () => {
    const r = SupplierSampleInput.parse(form({ supplierId: "3", item: "8x6 French lace #1B", spec: "", orderedOn: "2026-09-20", landedCost: "4200" }))
    expect(r.verdict).toBe("pending")
    expect(r.landedCost).toBe(4200)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL, cannot find module `./schemas`.

- [ ] **Step 3: Write the schemas**

`src/actions/schemas.ts`:
```ts
import { z } from "zod"

// FormData gives "" for blank inputs. Treat "" as absent.
export const optional = <T extends z.ZodTypeAny>(s: T) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), s.optional())

const int = z.coerce.number().int()
const money = z.coerce.number().int().min(0)
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
const text = z.string().trim().min(1)

export const CampaignDayInput = z.object({
  campaignId: int,
  day: isoDate,
  spend: money.default(0),
  impressions: optional(z.coerce.number().int().min(0)).default(0),
  clicks: optional(z.coerce.number().int().min(0)).default(0),
  notes: optional(text),
})

export const LeadInput = z.object({
  campaignId: optional(int),
  name: optional(text),
  phone: text,
  area: optional(text),
  status: z.enum(["new", "replied", "consulted", "installed", "lost"]).default("new"),
  nextFollowUp: optional(isoDate),
  notes: optional(text),
})

export const LeadStatusInput = z.object({
  id: int,
  status: z.enum(["new", "replied", "consulted", "installed", "lost"]),
  nextFollowUp: optional(isoDate),
})

export const CompetitorVisitInput = z.object({
  competitorId: int,
  visitedOn: isoDate,
  visitedBy: optional(text),
  installPriceMin: optional(money),
  installPriceMax: optional(money),
  maintenancePrice: optional(money),
  basesOffered: optional(text),
  cabinPrivacy: z.enum(["private_cabin", "curtain", "open", "unknown"]).default("unknown"),
  upsellPressure: z.enum(["none", "low", "medium", "high", "unknown"]).default("unknown"),
  productsUsed: optional(text),
  leadTimeDays: optional(int.min(0)),
  packages: optional(text),
  notes: optional(text),
})

export const SupplierSampleInput = z.object({
  supplierId: int,
  item: text,
  spec: optional(text),
  orderedOn: optional(isoDate),
  receivedOn: optional(isoDate),
  landedCost: optional(money),
  wearTestDays: optional(int.min(0)),
  verdict: z.enum(["pending", "pass", "fail", "reorder"]).default("pending"),
  notes: optional(text),
})

export const SampleVerdictInput = z.object({
  id: int,
  verdict: z.enum(["pending", "pass", "fail", "reorder"]),
  wearTestDays: optional(int.min(0)),
  receivedOn: optional(isoDate),
})
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all pass (8 model + 6 schema). If `LeadStatusInput` equality fails because `nextFollowUp` is missing rather than `undefined`, change the test to `toMatchObject({ id: 7, status: "consulted" })`.

- [ ] **Step 5: Write the lead actions**

`src/actions/leads.ts`:
```ts
"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getDb } from "@/db"
import { campaignDays, leads } from "@/db/schema"
import { requireUser } from "@/lib/auth"
import { CampaignDayInput, LeadInput, LeadStatusInput } from "./schemas"

const PATH = "/ads-test"

export async function addCampaignDay(formData: FormData): Promise<void> {
  await requireUser()
  const v = CampaignDayInput.parse(Object.fromEntries(formData))
  await getDb().insert(campaignDays).values(v)
    .onConflictDoUpdate({ target: [campaignDays.campaignId, campaignDays.day], set: { spend: v.spend, impressions: v.impressions, clicks: v.clicks, notes: v.notes } })
  revalidatePath(PATH)
}

export async function deleteCampaignDay(id: number): Promise<void> {
  await requireUser()
  await getDb().delete(campaignDays).where(eq(campaignDays.id, id))
  revalidatePath(PATH)
}

export async function addLead(formData: FormData): Promise<void> {
  await requireUser()
  const v = LeadInput.parse(Object.fromEntries(formData))
  await getDb().insert(leads).values(v)
  revalidatePath(PATH)
}

export async function setLeadStatus(formData: FormData): Promise<void> {
  await requireUser()
  const v = LeadStatusInput.parse(Object.fromEntries(formData))
  await getDb().update(leads).set({ status: v.status, nextFollowUp: v.nextFollowUp ?? null }).where(eq(leads.id, v.id))
  revalidatePath(PATH)
}

export async function deleteLead(id: number): Promise<void> {
  await requireUser()
  await getDb().delete(leads).where(eq(leads.id, id))
  revalidatePath(PATH)
}
```

- [ ] **Step 6: Write the shared form helpers**

`src/components/forms/field.tsx`:
```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Base = { label: string; name: string }

export function Field({ label, name, type = "text", placeholder, required, defaultValue, step, min }: Base & {
  type?: string; placeholder?: string; required?: boolean; defaultValue?: string | number; step?: string | number; min?: number
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name} className="text-xs text-muted-foreground">{label}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} required={required} defaultValue={defaultValue} step={step} min={min} />
    </div>
  )
}

// Native select keeps the form a plain server-rendered <form>; the shadcn Select needs client state.
export function SelectField({ label, name, options, defaultValue }: Base & { options: { value: string; label: string }[]; defaultValue?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name} className="text-xs text-muted-foreground">{label}</Label>
      <select id={name} name={name} defaultValue={defaultValue}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

export function TextareaField({ label, name, placeholder }: Base & { placeholder?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name} className="text-xs text-muted-foreground">{label}</Label>
      <Textarea id={name} name={name} placeholder={placeholder} rows={2} />
    </div>
  )
}
```

`src/components/forms/delete-button.tsx`:
```tsx
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DeleteButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action}>
      <Button type="submit" variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" aria-label="Delete">
        <Trash2 className="size-3.5" />
      </Button>
    </form>
  )
}
```

- [ ] **Step 7: Write the Ads test page**

`src/app/ads-test/page.tsx`:
```tsx
import { desc, eq } from "drizzle-orm"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Field, SelectField, TextareaField } from "@/components/forms/field"
import { DeleteButton } from "@/components/forms/delete-button"
import { getDb } from "@/db"
import { campaignDays, campaigns, leads } from "@/db/schema"
import { inr } from "@/lib/format"
import { addCampaignDay, addLead, deleteCampaignDay, deleteLead, setLeadStatus } from "@/actions/leads"

export const dynamic = "force-dynamic"

const statuses = ["new", "replied", "consulted", "installed", "lost"] as const
const statusLabel: Record<(typeof statuses)[number], string> = { new: "New", replied: "Replied", consulted: "Consulted", installed: "Installed", lost: "Lost" }

export default async function AdsTest() {
  const db = getDb()
  const [campaign] = await db.select().from(campaigns).orderBy(desc(campaigns.startDate)).limit(1)
  if (!campaign) {
    return <PageShell title="Ads test" subtitle="No campaign yet"><Card><CardContent className="py-6 text-sm text-muted-foreground">Run <code>npm run db:seed</code> to create the first campaign.</CardContent></Card></PageShell>
  }
  const [days, allLeads] = await Promise.all([
    db.select().from(campaignDays).where(eq(campaignDays.campaignId, campaign.id)).orderBy(desc(campaignDays.day)),
    db.select().from(leads).where(eq(leads.campaignId, campaign.id)).orderBy(desc(leads.firstContactAt)),
  ])

  const spend = days.reduce((s, d) => s + d.spend, 0)
  const clicks = days.reduce((s, d) => s + d.clicks, 0)
  const count = (s: (typeof statuses)[number]) => allLeads.filter((l) => l.status === s).length
  const enquiries = allLeads.filter((l) => l.status !== "lost").length
  const consulted = count("consulted") + count("installed")
  const installed = count("installed")
  const target = campaign.targetEnquiries || 1
  const today = new Date().toISOString().slice(0, 10)

  return (
    <PageShell title="Ads test" subtitle={`${campaign.name}. Go/no-go: ${campaign.targetEnquiries} real enquiries in two weeks.`}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Spend" value={inr(spend)} hint={`budget ${inr(campaign.budget)}`} />
        <Stat label="Enquiries" value={`${enquiries} / ${campaign.targetEnquiries}`} hint={spend && enquiries ? `${inr(spend / enquiries)} per enquiry` : "no spend yet"} />
        <Stat label="Consultations" value={String(consulted)} hint={enquiries ? `${Math.round((consulted / enquiries) * 100)}% of enquiries` : ""} />
        <Stat label="Installs" value={String(installed)} hint={spend && installed ? `${inr(spend / installed)} per install` : ""} />
      </div>

      <Card>
        <CardHeader><CardTitle>Progress to go/no-go</CardTitle><CardDescription>Leads not marked lost count as enquiries. Clicks so far: {clicks}.</CardDescription></CardHeader>
        <CardContent className="grid gap-3">
          <Progress value={Math.min(100, (enquiries / target) * 100)} />
          <div className="grid gap-2 text-sm sm:grid-cols-5">
            {statuses.map((s) => <div key={s} className="flex items-center justify-between rounded-md border px-3 py-2"><span className="text-muted-foreground">{statusLabel[s]}</span><span className="font-medium tabular-nums">{count(s)}</span></div>)}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card>
          <CardHeader><CardTitle>Daily spend</CardTitle><CardDescription>From the Google Ads dashboard. Re-entering a day overwrites it.</CardDescription></CardHeader>
          <CardContent className="grid gap-4">
            <form action={addCampaignDay} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="campaignId" value={campaign.id} />
              <Field label="Day" name="day" type="date" required defaultValue={today} />
              <Field label="Spend ₹" name="spend" type="number" min={0} required />
              <Field label="Impressions" name="impressions" type="number" min={0} />
              <Field label="Clicks" name="clicks" type="number" min={0} />
              <div className="sm:col-span-2"><Button type="submit" size="sm">Save day</Button></div>
            </form>
            <Table>
              <TableHeader><TableRow><TableHead>Day</TableHead><TableHead className="text-right">Spend</TableHead><TableHead className="text-right">Impr.</TableHead><TableHead className="text-right">Clicks</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {days.length === 0 && <TableRow><TableCell colSpan={5} className="text-muted-foreground">No days logged.</TableCell></TableRow>}
                {days.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="whitespace-nowrap">{d.day}</TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums">{inr(d.spend)}</TableCell>
                    <TableCell className="text-right tabular-nums">{d.impressions}</TableCell>
                    <TableCell className="text-right tabular-nums">{d.clicks}</TableCell>
                    <TableCell className="w-8"><DeleteButton action={deleteCampaignDay.bind(null, d.id)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Leads</CardTitle><CardDescription>One row per WhatsApp enquiry. Phone is the identity; these become clients later.</CardDescription></CardHeader>
          <CardContent className="grid gap-4">
            <form action={addLead} className="grid gap-3 sm:grid-cols-3">
              <input type="hidden" name="campaignId" value={campaign.id} />
              <Field label="Phone" name="phone" placeholder="+91 …" required />
              <Field label="Name" name="name" />
              <Field label="Area / sector" name="area" placeholder="Sector 84" />
              <div className="sm:col-span-3"><TextareaField label="Notes" name="notes" placeholder="What they asked, budget hints, base preference" /></div>
              <div className="sm:col-span-3"><Button type="submit" size="sm">Add lead</Button></div>
            </form>
            <Table>
              <TableHeader><TableRow><TableHead>Lead</TableHead><TableHead>Area</TableHead><TableHead>Status</TableHead><TableHead>Follow-up</TableHead><TableHead>Notes</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {allLeads.length === 0 && <TableRow><TableCell colSpan={6} className="text-muted-foreground">No leads yet.</TableCell></TableRow>}
                {allLeads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium">{l.name ?? "—"}</div>
                      <div className="font-mono text-xs text-muted-foreground">{l.phone}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{l.area ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <form action={setLeadStatus} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={l.id} />
                        <select name="status" defaultValue={l.status} className="h-7 rounded-md border border-input bg-transparent px-2 text-xs">
                          {statuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                        </select>
                        <input type="date" name="nextFollowUp" defaultValue={l.nextFollowUp ?? ""} className="h-7 rounded-md border border-input bg-transparent px-2 text-xs" />
                        <Button type="submit" size="sm" variant="outline" className="h-7 px-2 text-xs">Save</Button>
                      </form>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{l.nextFollowUp ? (l.nextFollowUp < today ? <Badge variant="destructive">{l.nextFollowUp}</Badge> : l.nextFollowUp) : "—"}</TableCell>
                    <TableCell className="min-w-56 text-sm text-muted-foreground">{l.notes ?? ""}</TableCell>
                    <TableCell className="w-8"><DeleteButton action={deleteLead.bind(null, l.id)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardDescription>{label}</CardDescription></CardHeader>
      <CardContent><div className="text-2xl font-semibold tabular-nums">{value}</div>{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}</CardContent>
    </Card>
  )
}
```

- [ ] **Step 8: Build and smoke test**

Run: `npm run build`
Expected: compiles, `/ads-test` listed as dynamic (ƒ), others static.
Run: `npm run start -- -p 3100` in background. In Chrome open http://localhost:3100/ads-test. Add a day (today, spend 450, clicks 30). Add a lead (phone +91 99999 00001, area Sector 84). Change its status to Consulted and save. Confirm counts update, delete the lead, delete the day. Stop the server.

If `Object.fromEntries(formData)` includes `$ACTION_ID_…` keys, Zod strips unknown keys by default, so no change is needed.

- [ ] **Step 9: Commit**

```bash
git add src/actions src/components/forms src/app/ads-test
git commit -m "Add ads-test page: campaign days, leads funnel, go/no-go progress

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Mystery shop page

**Files:**
- Create: `src/actions/competitors.ts`
- Create: `src/app/mystery-shop/page.tsx`

**Interfaces:**
- Consumes: `CompetitorVisitInput` (Task 5), `Field`, `SelectField`, `TextareaField`, `DeleteButton`, `getDb`, `competitors`, `competitorVisits`.
- Produces:
  ```ts
  export async function addCompetitorVisit(formData: FormData): Promise<void>
  export async function deleteCompetitorVisit(id: number): Promise<void>
  ```

- [ ] **Step 1: Write the actions**

`src/actions/competitors.ts`:
```ts
"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getDb } from "@/db"
import { competitorVisits } from "@/db/schema"
import { requireUser } from "@/lib/auth"
import { CompetitorVisitInput } from "./schemas"

const PATH = "/mystery-shop"

export async function addCompetitorVisit(formData: FormData): Promise<void> {
  await requireUser()
  const v = CompetitorVisitInput.parse(Object.fromEntries(formData))
  await getDb().insert(competitorVisits).values(v)
  revalidatePath(PATH)
}

export async function deleteCompetitorVisit(id: number): Promise<void> {
  await requireUser()
  await getDb().delete(competitorVisits).where(eq(competitorVisits.id, id))
  revalidatePath(PATH)
}
```

- [ ] **Step 2: Write the page**

`src/app/mystery-shop/page.tsx`:
```tsx
import { asc, desc } from "drizzle-orm"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Field, SelectField, TextareaField } from "@/components/forms/field"
import { DeleteButton } from "@/components/forms/delete-button"
import { getDb } from "@/db"
import { competitors, competitorVisits } from "@/db/schema"
import { inr } from "@/lib/format"
import { addCompetitorVisit, deleteCompetitorVisit } from "@/actions/competitors"

export const dynamic = "force-dynamic"

const privacyLabel = { private_cabin: "Private cabin", curtain: "Curtain", open: "Open floor", unknown: "—" } as const
const upsellLabel = { none: "None", low: "Low", medium: "Medium", high: "High", unknown: "—" } as const
const priorityNames = ["Lynx Hair Wig Studio", "Hair Zone", "New Look Hair Fixing", "Reline Hair World"]

function price(min: number | null, max: number | null) {
  if (min == null && max == null) return "—"
  if (min != null && max != null && min !== max) return `${inr(min)}–${inr(max)}`
  return inr((min ?? max)!)
}

export default async function MysteryShop() {
  const db = getDb()
  const [comps, visits] = await Promise.all([
    db.select().from(competitors).orderBy(asc(competitors.name)),
    db.select().from(competitorVisits).orderBy(desc(competitorVisits.visitedOn)),
  ])
  const byId = new Map(comps.map((c) => [c.id, c]))
  const latestByCompetitor = new Map<number, (typeof visits)[number]>()
  for (const v of visits) if (!latestByCompetitor.has(v.competitorId)) latestByCompetitor.set(v.competitorId, v)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <PageShell title="Mystery shop" subtitle="One row per visit. Compare install price, maintenance price, bases, privacy and upsell before setting our prices.">
      <Card>
        <CardHeader><CardTitle>Coverage</CardTitle><CardDescription>Visit the first four before pricing anything.</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {comps.map((c) => {
            const done = latestByCompetitor.has(c.id)
            const priority = priorityNames.includes(c.name)
            return <Badge key={c.id} variant={done ? "default" : priority ? "destructive" : "outline"}>{c.name}{done ? " ✓" : priority ? " · visit first" : ""}</Badge>
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Comparison</CardTitle><CardDescription>Latest visit per competitor.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Studio</TableHead><TableHead>Install</TableHead><TableHead>Maintenance</TableHead><TableHead>Bases</TableHead>
              <TableHead>Privacy</TableHead><TableHead>Upsell</TableHead><TableHead>Products</TableHead><TableHead>Lead time</TableHead><TableHead>Packages</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {latestByCompetitor.size === 0 && <TableRow><TableCell colSpan={9} className="text-muted-foreground">No visits logged.</TableCell></TableRow>}
              {[...latestByCompetitor.values()].map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="whitespace-nowrap font-medium">{byId.get(v.competitorId)?.name}</TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">{price(v.installPriceMin, v.installPriceMax)}</TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">{v.maintenancePrice != null ? inr(v.maintenancePrice) : "—"}</TableCell>
                  <TableCell className="min-w-40 text-muted-foreground">{v.basesOffered ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{privacyLabel[v.cabinPrivacy]}</TableCell>
                  <TableCell className="whitespace-nowrap">{upsellLabel[v.upsellPressure]}</TableCell>
                  <TableCell className="min-w-40 text-muted-foreground">{v.productsUsed ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{v.leadTimeDays != null ? `${v.leadTimeDays} d` : "—"}</TableCell>
                  <TableCell className="min-w-48 text-muted-foreground">{v.packages ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card>
          <CardHeader><CardTitle>Log a visit</CardTitle></CardHeader>
          <CardContent>
            <form action={addCompetitorVisit} className="grid gap-3 sm:grid-cols-2">
              <SelectField label="Studio" name="competitorId" options={comps.map((c) => ({ value: String(c.id), label: c.name }))} />
              <Field label="Visited on" name="visitedOn" type="date" required defaultValue={today} />
              <Field label="Visited by" name="visitedBy" placeholder="Manager" />
              <Field label="Lead time, days" name="leadTimeDays" type="number" min={0} />
              <Field label="Install price from ₹" name="installPriceMin" type="number" min={0} />
              <Field label="Install price to ₹" name="installPriceMax" type="number" min={0} />
              <Field label="Maintenance visit ₹" name="maintenancePrice" type="number" min={0} />
              <SelectField label="Cabin privacy" name="cabinPrivacy" defaultValue="unknown" options={Object.entries(privacyLabel).map(([value, label]) => ({ value, label: label === "—" ? "Unknown" : label }))} />
              <SelectField label="Upsell pressure" name="upsellPressure" defaultValue="unknown" options={Object.entries(upsellLabel).map(([value, label]) => ({ value, label: label === "—" ? "Unknown" : label }))} />
              <Field label="Bases offered" name="basesOffered" placeholder="Mono, French lace, PU" />
              <div className="sm:col-span-2"><Field label="Products used" name="productsUsed" placeholder="Walker Ultra Hold, Ghost Bond, local tape" /></div>
              <div className="sm:col-span-2"><TextareaField label="Packages offered" name="packages" placeholder="Install + 6 services ₹X; annual plan ₹Y" /></div>
              <div className="sm:col-span-2"><TextareaField label="Notes" name="notes" placeholder="Wait time, hygiene, sample vs installed, how they sold" /></div>
              <div className="sm:col-span-2"><Button type="submit" size="sm">Save visit</Button></div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>All visits</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Studio</TableHead><TableHead>By</TableHead><TableHead>Install</TableHead><TableHead>Notes</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {visits.length === 0 && <TableRow><TableCell colSpan={6} className="text-muted-foreground">Nothing yet.</TableCell></TableRow>}
                {visits.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="whitespace-nowrap">{v.visitedOn}</TableCell>
                    <TableCell className="whitespace-nowrap font-medium">{byId.get(v.competitorId)?.name}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{v.visitedBy ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">{price(v.installPriceMin, v.installPriceMax)}</TableCell>
                    <TableCell className="min-w-56 text-sm text-muted-foreground">{v.notes ?? ""}</TableCell>
                    <TableCell className="w-8"><DeleteButton action={deleteCompetitorVisit.bind(null, v.id)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
```

- [ ] **Step 3: Build and smoke test**

Run: `npm run build`, then start on 3100 and open `/mystery-shop`. Log a visit for Lynx with install 18000 to 29999, maintenance 1500, curtain, high upsell. Confirm Lynx shows ✓ in Coverage and appears in Comparison. Delete it. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/actions/competitors.ts src/app/mystery-shop
git commit -m "Add mystery-shop page: visit log and competitor comparison

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Samples page

**Files:**
- Create: `src/actions/suppliers.ts`
- Create: `src/app/samples/page.tsx`

**Interfaces:**
- Consumes: `SupplierSampleInput`, `SampleVerdictInput` (Task 5), form helpers, `getDb`, `suppliers`, `supplierSamples`.
- Produces:
  ```ts
  export async function addSample(formData: FormData): Promise<void>
  export async function setSampleVerdict(formData: FormData): Promise<void>
  export async function deleteSample(id: number): Promise<void>
  ```

- [ ] **Step 1: Write the actions**

`src/actions/suppliers.ts`:
```ts
"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getDb } from "@/db"
import { supplierSamples } from "@/db/schema"
import { requireUser } from "@/lib/auth"
import { SampleVerdictInput, SupplierSampleInput } from "./schemas"

const PATH = "/samples"

export async function addSample(formData: FormData): Promise<void> {
  await requireUser()
  const v = SupplierSampleInput.parse(Object.fromEntries(formData))
  await getDb().insert(supplierSamples).values(v)
  revalidatePath(PATH)
}

export async function setSampleVerdict(formData: FormData): Promise<void> {
  await requireUser()
  const v = SampleVerdictInput.parse(Object.fromEntries(formData))
  await getDb().update(supplierSamples)
    .set({ verdict: v.verdict, wearTestDays: v.wearTestDays ?? null, receivedOn: v.receivedOn ?? null })
    .where(eq(supplierSamples.id, v.id))
  revalidatePath(PATH)
}

export async function deleteSample(id: number): Promise<void> {
  await requireUser()
  await getDb().delete(supplierSamples).where(eq(supplierSamples.id, id))
  revalidatePath(PATH)
}
```

- [ ] **Step 2: Write the page**

`src/app/samples/page.tsx`:
```tsx
import { asc, desc } from "drizzle-orm"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Field, SelectField, TextareaField } from "@/components/forms/field"
import { DeleteButton } from "@/components/forms/delete-button"
import { getDb } from "@/db"
import { supplierSamples, suppliers } from "@/db/schema"
import { inr } from "@/lib/format"
import { addSample, deleteSample, setSampleVerdict } from "@/actions/suppliers"

export const dynamic = "force-dynamic"

const verdicts = ["pending", "pass", "fail", "reorder"] as const
const verdictLabel = { pending: "Pending", pass: "Pass", fail: "Fail", reorder: "Reorder" } as const
const verdictVariant = { pending: "outline", pass: "default", fail: "destructive", reorder: "secondary" } as const

export default async function Samples() {
  const db = getDb()
  const [sups, samples] = await Promise.all([
    db.select().from(suppliers).orderBy(asc(suppliers.country), asc(suppliers.name)),
    db.select().from(supplierSamples).orderBy(desc(supplierSamples.orderedOn)),
  ])
  const byId = new Map(sups.map((s) => [s.id, s]))
  const bySupplier = new Map<number, typeof samples>()
  for (const s of samples) bySupplier.set(s.supplierId, [...(bySupplier.get(s.supplierId) ?? []), s])
  const today = new Date().toISOString().slice(0, 10)

  return (
    <PageShell title="Samples" subtitle="Order 2 Indian + 2 Qingdao stock pieces in 8×6 and 9×7, #1B. Wear-test 4 weeks before choosing suppliers.">
      <Card>
        <CardHeader><CardTitle>Suppliers</CardTitle><CardDescription>Status of every sample per supplier.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Supplier</TableHead><TableHead>Country</TableHead><TableHead>Product</TableHead><TableHead>Price / lead</TableHead><TableHead>Samples</TableHead></TableRow></TableHeader>
            <TableBody>
              {sups.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="whitespace-nowrap font-medium">{s.name}</TableCell>
                  <TableCell className="whitespace-nowrap capitalize text-muted-foreground">{s.country}</TableCell>
                  <TableCell className="min-w-56 text-muted-foreground">{s.product}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{s.priceNote ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {(bySupplier.get(s.id) ?? []).map((x) => <Badge key={x.id} variant={verdictVariant[x.verdict]}>{x.item}: {verdictLabel[x.verdict]}</Badge>)}
                      {!bySupplier.has(s.id) && <span className="text-xs text-muted-foreground">none</span>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card>
          <CardHeader><CardTitle>Order a sample</CardTitle></CardHeader>
          <CardContent>
            <form action={addSample} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2"><SelectField label="Supplier" name="supplierId" options={sups.map((s) => ({ value: String(s.id), label: `${s.name} (${s.city ?? s.country})` }))} /></div>
              <Field label="Item" name="item" placeholder="8×6 French lace #1B" required />
              <Field label="Spec" name="spec" placeholder="120% density, 6 in, single knots" />
              <Field label="Ordered on" name="orderedOn" type="date" defaultValue={today} />
              <Field label="Landed cost ₹" name="landedCost" type="number" min={0} />
              <div className="sm:col-span-2"><TextareaField label="Notes" name="notes" placeholder="Courier, invoice number, who is wearing it" /></div>
              <div className="sm:col-span-2"><Button type="submit" size="sm">Add sample</Button></div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Wear tests</CardTitle><CardDescription>Update received date, days worn and verdict as the test runs.</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Supplier</TableHead><TableHead>Ordered</TableHead><TableHead>Cost</TableHead><TableHead>Result</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {samples.length === 0 && <TableRow><TableCell colSpan={6} className="text-muted-foreground">No samples ordered.</TableCell></TableRow>}
                {samples.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell className="min-w-40"><div className="font-medium">{x.item}</div><div className="text-xs text-muted-foreground">{x.spec ?? ""}</div></TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{byId.get(x.supplierId)?.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{x.orderedOn ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">{x.landedCost != null ? inr(x.landedCost) : "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <form action={setSampleVerdict} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={x.id} />
                        <input type="date" name="receivedOn" defaultValue={x.receivedOn ?? ""} title="Received on" className="h-7 rounded-md border border-input bg-transparent px-2 text-xs" />
                        <input type="number" name="wearTestDays" defaultValue={x.wearTestDays ?? ""} min={0} placeholder="days" className="h-7 w-16 rounded-md border border-input bg-transparent px-2 text-xs" />
                        <select name="verdict" defaultValue={x.verdict} className="h-7 rounded-md border border-input bg-transparent px-2 text-xs">
                          {verdicts.map((v) => <option key={v} value={v}>{verdictLabel[v]}</option>)}
                        </select>
                        <Button type="submit" size="sm" variant="outline" className="h-7 px-2 text-xs">Save</Button>
                      </form>
                    </TableCell>
                    <TableCell className="w-8"><DeleteButton action={deleteSample.bind(null, x.id)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
```

- [ ] **Step 3: Build and smoke test**

Run: `npm run build`, then start on 3100 and open `/samples`. Add a sample for Ahmed Wigs, set received date and verdict Pass, confirm the badge in the Suppliers table. Delete it. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/actions/suppliers.ts src/app/samples
git commit -m "Add samples page: supplier sample orders and wear-test verdicts

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Data corrections from the research

**Files:**
- Modify: `src/data/insights.ts`
- Modify: `src/app/competitors/page.tsx`
- Modify: `src/app/sourcing/page.tsx`
- Modify: `src/app/economics/page.tsx`

**Interfaces:**
- Produces in `insights.ts`: `competitorsNearby[i].prices: string`, new `marketPriceReferences` array, corrected `compliance`, `landedCost`, `unitEconomics`, `pricingTiers`, `scenarioNotes`.

- [ ] **Step 1: Correct compliance rows**

In `src/data/insights.ts` replace the GST row with:
```ts
  { item: "GST", detail: "Beauty and wellbeing services (SAC 99972x) are 5% WITHOUT input credit since 22 Sep 2025 (Notif. 9/2025). IGST on imports and GST on rent are now a cost, not a credit. Register at ₹20L, or earlier for invoice credibility. CA question: is an install a service (5%, no ITC) or a supply of goods under HSN 6704 (likely 18% with ITC)? The answer decides pricing and import economics.", cost: "Free", time: "7 d", status: "todo" },
```
Replace the Shop & Establishment row with:
```ts
  { item: "Shop & Establishment (Haryana)", detail: "Applies only to establishments with 20+ workers since the Feb 2026 amendment. Keep Code on Wages registers (wage register, slips, attendance) from the first hire. ESI at 10 employees, EPF at 20.", cost: "—", time: "—", status: "na" },
```
Add after the Hygiene row:
```ts
  { item: "Wages floor", detail: "Haryana skilled minimum wage ₹18,500/month from 1 Apr 2026. Technician fixed pay must clear this; commission sits on top. Contractor commission above ₹20K/yr attracts 2% TDS.", cost: "—", time: "—", status: "todo" },
  { item: "DPDP consent", detail: "Obligations enforceable 13 May 2027. Per-purpose consent (treatment record, marketing, publishing photos), withdrawable, recorded with notice version and timestamp. Built into the client record in phase 2.", cost: "—", time: "—", status: "todo" },
```

- [ ] **Step 2: Correct landed cost and unit economics**

Replace `landedCost` with:
```ts
export const landedCost = [
  { line: "FOB price ($80 custom system)", amount: "₹6,700" },
  { line: "Courier (DHL/FedEx, shared)", amount: "₹500–800" },
  { line: "CIF value", amount: "~₹7,400" },
  { line: "Basic Customs Duty, HSN 6704 (verify on ICEGATE; ~20%)", amount: "~₹1,480" },
  { line: "Social Welfare Surcharge (10% of BCD)", amount: "~₹150" },
  { line: "IGST 18% — a cost under the 5% no-ITC services regime", amount: "~₹1,625" },
  { line: "Landed cost", amount: "~₹10,650" },
]
```
In `unitEconomics` change:
```ts
  { label: "System lifespan", value: "Mono 6–12 mo · lace 2–6 mo · thin skin 1–3 mo · hybrid 4–12 mo" },
  { label: "Landed cost, Qingdao custom (IGST not recoverable)", value: "~₹10,500" },
  { label: "Gross margin, install", value: "55–75% after 5% GST and non-recoverable IGST" },
```
In `pricingTiers` change the Custom row cost to `"₹10,500–15,500"` and margin to `"65–72%"`, and Signature cost to `"₹7,000–9,500"`, margin `"68–75%"`.

Append to `scenarioNotes`:
```ts
  "Replacement cycles differ by base: thin skin 1–3 months, lace 2–6, mono 6–12. Revenue per client depends on which base you standardise on, not one 9–12 month cycle.",
  "GST on services is 5% without input credit since Sep 2025. Import IGST and GST on rent are costs. The model page strips GST from prices before counting revenue.",
```

- [ ] **Step 3: Add published prices to competitors**

Add a `prices` field to every `competitorsNearby` entry. Lynx:
```ts
prices: "Patches ₹1,500–37,000 listed; 9×7 mono ₹26,000; 8×6 silk ₹37,000; toppers ₹8–19.5K (lynxhairskin.in, Sep 2026)"
```
All others: `prices: "Not published"`.

Add after `complaintPatterns`:
```ts
// Published NCR price points, Sep 2026. Use as anchors for the mystery-shop sheet.
export const marketPriceReferences = [
  { who: "Malhotra Hair (Delhi)", what: "Patches ₹10–35K; monthly servicing ₹600; mono lasts 10–12 mo, lace 6–8", source: "malhotrahair.in" },
  { who: "Veronica (Gurgaon)", what: "Patches from ₹5,999; 20% off 6- or 12-month service packages; free demo", source: "veronicahairreplacement.com" },
  { who: "Advance Clinic (Noida/Delhi)", what: "₹6,999–49,999 across 9 base styles; Bajaj zero-cost EMI", source: "advanceclinic.in" },
  { who: "Majestic Derma (Delhi/Gurgaon)", what: "Human hair ₹20–50K; consult ₹500–2,000; maintenance ₹1,000–5,000 every 4–6 weeks", source: "majesticderma.com" },
  { who: "Radiance (Delhi)", what: "₹5–50K; annual maintenance plan ₹10–15K/yr; visits every 4–6 weeks", source: "radiancehairstudio.com" },
  { who: "Nile Hair Care (guide)", what: "Bonding ₹900–1,500/visit; client product spend ₹1,800–3,600/mo; all-in ₹52–80K/yr", source: "nilehaircare.com" },
]
```

- [ ] **Step 4: Render the new data**

`src/app/competitors/page.tsx`: add a `Prices` column between Notes and Phone:
```tsx
<TableHead>Published prices</TableHead>
...
<TableCell className="min-w-56 text-muted-foreground">{c.prices}</TableCell>
```
and a third Card after the complaints card:
```tsx
<Card>
  <CardHeader><CardTitle>Published NCR price points</CardTitle><CardDescription>Anchors for the mystery-shop sheet. Verify in person.</CardDescription></CardHeader>
  <CardContent>
    <Table>
      <TableHeader><TableRow><TableHead>Who</TableHead><TableHead>What they publish</TableHead><TableHead>Source</TableHead></TableRow></TableHeader>
      <TableBody>{marketPriceReferences.map((m) => <TableRow key={m.who}><TableCell className="whitespace-nowrap font-medium">{m.who}</TableCell><TableCell className="min-w-72 text-muted-foreground">{m.what}</TableCell><TableCell className="whitespace-nowrap text-xs text-muted-foreground">{m.source}</TableCell></TableRow>)}</TableBody>
    </Table>
  </CardContent>
</Card>
```
Import `marketPriceReferences`.

`src/app/sourcing/page.tsx`: in the landed-cost card change the description to `"Verify BCD for HSN 6704 on ICEGATE before the first shipment; use a CHA. IGST is not recoverable under the 5% services regime."` and the paragraph's "~₹9K net" to "~₹10.5K".

`src/app/economics/page.tsx`: change the PageShell subtitle to `"Why a service with a 25–35% all-in product cost and monthly repeat visits still works"`.

- [ ] **Step 5: Build, tests, commit**

Run: `npm test && npm run build`
Expected: tests pass, build compiles.
```bash
git add src/data/insights.ts src/app/competitors/page.tsx src/app/sourcing/page.tsx src/app/economics/page.tsx
git commit -m "Correct GST to 5% no-ITC, S&E threshold, landed cost; add published competitor prices

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Handover docs, deploy, verify

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/ROADMAP.md` (status line)

- [ ] **Step 1: Rewrite CLAUDE.md**

Replace the file with:
````markdown
# CLAUDE.md — project handover

## What this is
Phase 1 of the management tool for Chetan's non-surgical hair replacement studio (New Gurgaon, Sector 83/84). It started as a research dashboard and now also records go/no-go evidence in Postgres. The roadmap to a full business system (clients, hair-system units, invoices, WhatsApp, payroll, manufacturing) is in `docs/ROADMAP.md`. Read it before adding anything.

Owner: Chetan Verma (indie developer, Delhi NCR). Entity: Stackframe Studios Pvt Ltd. Deployed at https://hairfix-dashboard.vercel.app behind Vercel Authentication.

## Business context
- Service business: install hair systems (₹20–45K) + maintenance visits (₹1.5–3.5K) + replacement by base type (thin skin 1–3 mo, lace 2–6, mono 6–12). Recurring revenue, embarrassment-driven loyalty.
- Constraints: ≤ ₹5L capital, founder part-time, manager runs day-to-day.
- GST on beauty services is 5% without input credit (since Sep 2025). Import IGST is a cost. Open CA question: install as service vs goods.
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
docs/ROADMAP.md            # phases 1–4, data model, stack choices, CA questions
docs/superpowers/plans/    # implementation plans
```

## Conventions
- Static research numbers live in `src/data/insights.ts`. Operational data lives in Postgres. Never hard-code either in pages.
- Server components by default. `"use client"` only for state or Recharts.
- Every write is a Server Action that calls `await requireUser()` first and parses input with a schema from `src/actions/schemas.ts`.
- Money in the DB is integer rupees. Display via `inr()`. Scenario data stays in ₹ lakh.
- Pages that read the DB export `const dynamic = "force-dynamic"`.
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
- Google Fonts unreachable in the original sandbox; `geist` package is used instead.

## Next (see docs/ROADMAP.md)
Phase 2 starts when the first install is booked: clients + consents, hair-system spec and units, visits, calendar, GST invoices, Razorpay links, WhatsApp utility templates on Meta Cloud API, manager login.

## Do not
- Replace `insights.ts` with a CMS.
- Add auth beyond `requireUser()` before phase 2.
- Restyle to a generic light SaaS theme.
- Inflate numbers. The model is optimistic for New Gurgaon.
````

- [ ] **Step 2: Mark phase 1 status in the roadmap**

At the top of `docs/ROADMAP.md`, under the title, add: `Status: Phase 1 shipped <date>. Phase 2 not started.` with today's date.

- [ ] **Step 3: Final checks**

Run: `npm test && npm run build && npx tsc --noEmit`
Expected: all green.

- [ ] **Step 4: Commit and push**

```bash
git add CLAUDE.md docs/ROADMAP.md
git commit -m "Rewrite handover for phase 1 stack and roadmap

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push origin main
```

- [ ] **Step 5: Verify production**

Wait for the Vercel deploy (`vercel ls` shows the newest as Ready). In Chrome, open https://hairfix-dashboard.vercel.app/ads-test (sign in with Vercel if prompted). Confirm the seeded campaign renders and adding a lead works. Open `/model`, `/mystery-shop`, `/samples`. Take one screenshot per page for the summary.

---

## Self-review

**Spec coverage.** Database with Drizzle, migrations, lazy client, Server Actions, `requireUser()` seam: Task 3. Leads and campaigns with funnel and target: Task 5. Competitors and visits with comparison: Task 6. Suppliers and samples with status board: Task 7. Interactive model with GST and cash floor: Tasks 1 and 2. Data corrections including GST, S&E, landed cost, competitor prices with sources: Task 8. Sidebar Track group: Task 2. CLAUDE.md rewrite: Task 9. Not in phase 1 per spec: auth, WhatsApp, invoices, payments.

**Placeholders.** None. Every code step contains the code.

**Type consistency.** `optional()` helper, `LeadStatusInput`, `SampleVerdictInput` names match between schemas, tests, actions and pages. `verdictVariant` values are valid Badge variants (`default`, `secondary`, `destructive`, `outline`). `campaignDays` unique index name `campaign_days_campaign_day` is used by `onConflictDoUpdate` via column targets, not the name, so no mismatch. `Lead.nextFollowUp` is `string | null` from a `date` column; page compares as ISO strings.
