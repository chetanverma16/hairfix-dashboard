import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { competitorsNearby, complaintPatterns, marketPriceReferences } from "@/data/insights"

export default function Competitors() {
  return (
    <PageShell title="Competitors" subtitle="Gurgaon operators within 30 minutes of Sector 83, from Google Places">
      <Card>
        <CardHeader><CardTitle>Who you&apos;re up against</CardTitle><CardDescription>Mystery-shop the first four before pricing anything</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Studio</TableHead><TableHead>Area</TableHead><TableHead className="text-right">Rating</TableHead><TableHead className="text-right">Reviews</TableHead><TableHead>Notes</TableHead><TableHead>Published prices</TableHead><TableHead>Phone</TableHead></TableRow></TableHeader>
            <TableBody>
              {competitorsNearby.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="whitespace-nowrap font-medium">{c.name}</TableCell>
                  <TableCell className="min-w-44 text-muted-foreground">{c.area}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.rating.toFixed(1)}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.reviews}</TableCell>
                  <TableCell className="min-w-72 text-muted-foreground">{c.note}</TableCell>
                  <TableCell className="min-w-56 text-muted-foreground">{c.prices}</TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs">{c.phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>What clients complain about across NCR</CardTitle><CardDescription>Each one is a positioning line for you</CardDescription></CardHeader>
        <CardContent><ul className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">{complaintPatterns.map((c) => <li key={c} className="flex gap-2"><span className="text-destructive">–</span>{c}</li>)}</ul></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Published NCR price points</CardTitle><CardDescription>Anchors for the mystery-shop sheet. Verify in person.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Who</TableHead><TableHead>What they publish</TableHead><TableHead>Source</TableHead></TableRow></TableHeader>
            <TableBody>{marketPriceReferences.map((m) => <TableRow key={m.who}><TableCell className="whitespace-nowrap font-medium">{m.who}</TableCell><TableCell className="min-w-72 text-muted-foreground">{m.what}</TableCell><TableCell className="whitespace-nowrap text-xs text-muted-foreground">{m.source}</TableCell></TableRow>)}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageShell>
  )
}
