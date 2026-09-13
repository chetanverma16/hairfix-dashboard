import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScenarioChart } from "@/components/charts"
import { decision, scenarios, weeklyActions } from "@/data/insights"

export default function Overview() {
  const base = scenarios[1]
  return (
    <PageShell title="Overview" subtitle="What we decided and what to do this week">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>The decision</CardTitle>
            <CardDescription>{decision.business}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <div>
              <p className="font-medium">First outlet</p>
              <p className="text-muted-foreground">{decision.firstOutlet}</p>
            </div>
            <ul className="grid gap-1.5 text-muted-foreground">
              {decision.whyHere.map((w) => <li key={w} className="flex gap-2"><span className="text-primary">–</span>{w}</li>)}
            </ul>
            <div>
              <p className="font-medium">Positioning</p>
              <p className="text-muted-foreground">{decision.positioning}</p>
            </div>
            <div>
              <p className="font-medium">Second outlet, once the first funds a manager you don&apos;t supervise</p>
              <p className="text-muted-foreground">{decision.secondOutlet}</p>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-2"><CardDescription>Year-1 revenue, base case</CardDescription><CardTitle className="text-3xl">₹{base.revenue}L</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">₹{base.profit}L profit · {base.activeM12} clients on maintenance by month 12</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription>Capital</CardDescription><CardTitle className="text-3xl">≤ ₹5L</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Launch plan totals ₹3.5–4.5L including a 2-month buffer</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription>Break-even, New Gurgaon</CardDescription><CardTitle className="text-3xl">3 + 15</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">installs + maintenance visits per month</CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Three scenarios, one technician</CardTitle><CardDescription>₹ lakh, year 1</CardDescription></CardHeader>
        <CardContent><ScenarioChart /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>This week</CardTitle><CardDescription>Cheap tests that answer what the data can&apos;t: is there demand here, and at what price</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Target</TableHead><TableHead className="w-28">Owner</TableHead></TableRow></TableHeader>
            <TableBody>
              {weeklyActions.map((a) => (
                <TableRow key={a.task}><TableCell>{a.task}</TableCell><TableCell className="text-muted-foreground">{a.target}</TableCell><TableCell><Badge variant="outline">{a.owner}</Badge></TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageShell>
  )
}
