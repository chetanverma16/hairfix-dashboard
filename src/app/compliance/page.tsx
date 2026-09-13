import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { compliance } from "@/data/insights"

export default function Compliance() {
  return (
    <PageShell title="Compliance" subtitle="Everything needed to open, in launch order. Budget ₹25–40K and about four weeks.">
      <Card>
        <CardHeader><CardTitle>Checklist</CardTitle><CardDescription>GST: the ₹20L threshold is real for services, but voluntary registration day one pays for itself through IGST credit on imports and ITC on rent and consumables.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Detail</TableHead><TableHead>Cost</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {compliance.map((c) => (
                <TableRow key={c.item}>
                  <TableCell className="font-medium">{c.item}</TableCell>
                  <TableCell className="max-w-md text-muted-foreground">{c.detail}</TableCell>
                  <TableCell className="whitespace-nowrap">{c.cost}</TableCell>
                  <TableCell className="whitespace-nowrap">{c.time}</TableCell>
                  <TableCell>{c.status === "na" ? <Badge variant="outline">Not needed</Badge> : <Badge variant="secondary">To do</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageShell>
  )
}
