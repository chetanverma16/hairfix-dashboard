import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { pricingTiers, unitEconomics } from "@/data/insights"

export default function Economics() {
  return (
    <PageShell title="Unit economics" subtitle="Why a service with a 20–30% product cost and monthly repeat visits works">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>The business in one table</CardTitle></CardHeader>
          <CardContent>
            <Table><TableBody>
              {unitEconomics.map((u) => <TableRow key={u.label}><TableCell className="text-muted-foreground">{u.label}</TableCell><TableCell className="text-right font-medium tabular-nums">{u.value}</TableCell></TableRow>)}
            </TableBody></Table>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <Card>
            <CardHeader><CardTitle>Three-tier pricing</CardTitle><CardDescription>Standardise on two sizes (8×6&quot;, 9×7&quot;) and two bases for 90% of orders</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Tier</TableHead><TableHead>Client price</TableHead><TableHead>Source</TableHead><TableHead className="text-right">Cost</TableHead><TableHead className="text-right">GM</TableHead></TableRow></TableHeader>
                <TableBody>
                  {pricingTiers.map((t) => <TableRow key={t.tier}><TableCell className="font-medium">{t.tier}</TableCell><TableCell>{t.price}</TableCell><TableCell className="text-muted-foreground">{t.source}</TableCell><TableCell className="text-right">{t.cost}</TableCell><TableCell className="text-right">{t.margin}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Levers that matter</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground">
              <p>Retention beats acquisition: a client kept on maintenance is worth ~₹30K a year at ~90% margin. The manager&apos;s real job is reminders and follow-ups.</p>
              <p>Prepaid annual maintenance (₹18–24K for 12 visits) puts cash upfront and locks retention. Zero-interest EMI on installs (Rizy in Noida already does this) lifts conversion.</p>
              <p>Women&apos;s toppers and chemo/alopecia wigs are often 30–40% of a studio&apos;s revenue, pay more, churn less. Plan a fully closed cabin and female staff for female clients from day one.</p>
              <p>Dermatologist and hair-transplant referrals at 10% are cheaper than Google leads at ₹300–800.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
