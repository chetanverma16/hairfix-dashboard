import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { risks } from "@/data/insights"

export default function Risks() {
  return (
    <PageShell title="Risks" subtitle="Ranked. The first two decide whether this works.">
      <Card>
        <CardHeader><CardTitle>Register</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Risk</TableHead><TableHead>Severity</TableHead><TableHead>Mitigation</TableHead></TableRow></TableHeader>
            <TableBody>
              {risks.map((r) => (
                <TableRow key={r.risk}>
                  <TableCell className="font-medium">{r.risk}</TableCell>
                  <TableCell><Badge variant={r.severity === "High" ? "destructive" : r.severity === "Medium" ? "secondary" : "outline"}>{r.severity}</Badge></TableCell>
                  <TableCell className="max-w-xl text-muted-foreground">{r.mitigation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageShell>
  )
}
