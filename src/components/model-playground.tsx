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

  useEffect(() => {
    setInputs(load())
    setHydrated(true)
  }, [])
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
        <Stat label="Break-even month" value={result.breakEvenMonth ? `M${result.breakEvenMonth}` : "Never"} warn={result.breakEvenMonth === null} />
        <Stat label="Lowest cash" value={lakh(result.lowestCash)} hint={result.lowestCashMonth ? `in M${result.lowestCashMonth}` : "never below opening capital"} warn={result.lowestCash < 0} />
        <Stat label="Year-1 revenue" value={lakh(result.year1Revenue)} hint={baseScenario ? `static base case ₹${baseScenario.revenue}L` : undefined} />
        <Stat label="Year-1 profit" value={lakh(result.year1Profit)} hint={`${Math.round(result.clientsM12)} active clients in M12`} warn={result.year1Profit < 0} />
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
                      <span className="font-medium tabular-nums">{c.fmt(inputs[c.key])}</span>
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
                      <TableCell className="whitespace-nowrap text-right tabular-nums">{lakh(r.revenue)}</TableCell>
                      <TableCell className={`whitespace-nowrap text-right tabular-nums ${r.profit < 0 ? "text-destructive" : ""}`}>{lakh(r.profit)}</TableCell>
                      <TableCell className={`whitespace-nowrap text-right tabular-nums ${r.cash < 0 ? "text-destructive" : ""}`}>{lakh(r.cash)}</TableCell>
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
