import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ClusterChart } from "@/components/charts"
import { clusters } from "@/data/insights"

function verdictBadge(v: string) {
  if (v.includes("First")) return <Badge>{v}</Badge>
  if (v.includes("Second")) return <Badge variant="secondary">{v}</Badge>
  if (v.includes("Avoid")) return <Badge variant="destructive">{v}</Badge>
  return <Badge variant="outline">{v}</Badge>
}

export default function Locations() {
  return (
    <PageShell title="Where to open" subtitle="Google Places, dedicated hair-patch studios, 13 Sep 2026. Review volume is the proxy for served demand.">
      <Card>
        <CardHeader><CardTitle>Served demand by cluster</CardTitle><CardDescription>Total Google reviews across dedicated studios. Counts are floors — Places returns at most 10 per query.</CardDescription></CardHeader>
        <CardContent><ClusterChart /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Scorecard</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Cluster</TableHead><TableHead className="text-right">Studios</TableHead><TableHead className="text-right">Reviews</TableHead><TableHead>Biggest players</TableHead><TableHead>Read</TableHead><TableHead>Verdict</TableHead></TableRow></TableHeader>
            <TableBody>
              {clusters.map((c) => (
                <TableRow key={c.cluster}>
                  <TableCell className="whitespace-nowrap font-medium">{c.cluster}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.studios}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.reviews.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="min-w-48 text-muted-foreground">{c.top}</TableCell>
                  <TableCell className="min-w-72 text-muted-foreground">{c.read}</TableCell>
                  <TableCell className="whitespace-nowrap">{verdictBadge(c.verdict)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Why New Gurgaon first</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>Founder lives near Manesar. Unannounced drop-ins, in-person escalations and society-group referrals are worth more in year 1 than the extra AOV of South Delhi.</p>
            <p>One premium-priced competitor (Lynx) and nothing in Sectors 90–95 or IMT Manesar. Rent ₹20–35K puts break-even at roughly 3 installs + 15 maintenance visits a month.</p>
            <p>Expect ₹20–28K installs and a slower ramp — 60–70% of the base-case revenue in year 1, with a smaller profit gap because fixed costs are lower.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Why South Delhi second</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>GK-1/2, Saket, Hauz Khas, Vasant Kunj returned zero dedicated studios. Clients currently drive to Lajpat Nagar (Young Forever, 373 reviews) or Gurgaon.</p>
            <p>Highest disposable income in the city, ₹30–45K install tier, central for Faridabad and Gurgaon on the Metro. Rent ₹40–70K for 200–300 sq ft.</p>
            <p>Open it once the first outlet throws off enough profit to fund a manager you don&apos;t need to supervise.</p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
