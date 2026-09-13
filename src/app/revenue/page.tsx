import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RampChart, ScenarioChart } from "@/components/charts"
import { scenarioNotes, scenarios } from "@/data/insights"

const rows: { key: keyof (typeof scenarios)[number]; label: string; money?: boolean }[] = [
  { key: "installsMonth6", label: "Installs / month by month 6" },
  { key: "installsY1", label: "Installs in year 1" },
  { key: "activeM12", label: "Active maintenance clients, month 12" },
  { key: "install", label: "Install revenue", money: true },
  { key: "maintenance", label: "Maintenance revenue", money: true },
  { key: "replacement", label: "Replacements", money: true },
  { key: "revenue", label: "Year-1 revenue", money: true },
  { key: "cogs", label: "COGS (systems + consumables)", money: true },
  { key: "fixed", label: "Fixed (room, technician, manager)", money: true },
  { key: "marketing", label: "Marketing", money: true },
  { key: "profit", label: "Year-1 profit", money: true },
]

export default function Revenue() {
  return (
    <PageShell title="Revenue model" subtitle="One technician, year 1, ₹28K average install">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Revenue vs profit</CardTitle><CardDescription>₹ lakh</CardDescription></CardHeader><CardContent><ScenarioChart /></CardContent></Card>
        <Card><CardHeader><CardTitle>Base-case monthly run rate</CardTitle><CardDescription>Exit year 1 at ~₹5.5L/month with 80 clients paying monthly</CardDescription></CardHeader><CardContent><RampChart /></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Scenario table</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead /> {scenarios.map((s) => <TableHead key={s.name} className="text-right">{s.name}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.key} className={r.key === "revenue" || r.key === "profit" ? "font-medium" : ""}>
                  <TableCell>{r.label}</TableCell>
                  {scenarios.map((s) => <TableCell key={s.name} className="text-right tabular-nums">{r.money ? `₹${s[r.key]}L` : s[r.key]}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Assumptions and caveats</CardTitle></CardHeader>
        <CardContent><ul className="grid gap-2 text-sm text-muted-foreground">{scenarioNotes.map((n) => <li key={n} className="flex gap-2"><span className="text-primary">–</span>{n}</li>)}</ul></CardContent>
      </Card>
    </PageShell>
  )
}
