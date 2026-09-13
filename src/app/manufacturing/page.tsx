import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { manufacturingSequence, manufacturingVision } from "@/data/insights"

export default function Manufacturing() {
  return (
    <PageShell title="Manufacturing later" subtitle="India exports the raw hair, China adds the value. A year-2 decision, not a year-1 one.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Value chain</CardTitle><CardDescription>Only base material has to be imported. Hair and labour are Indian.</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Stage</TableHead><TableHead>Where</TableHead><TableHead>India advantage</TableHead></TableRow></TableHeader>
              <TableBody>{manufacturingVision.map((m) => <TableRow key={m.stage}><TableCell className="font-medium">{m.stage}</TableCell><TableCell className="text-muted-foreground">{m.where}</TableCell><TableCell>{m.advantage}</TableCell></TableRow>)}</TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Sequence</CardTitle><CardDescription>A 10-knotter unit makes ~40 pieces/month at ₹3–4K finished cost. Knotting quality is the whole product and trained knotters are scarce.</CardDescription></CardHeader>
          <CardContent><ol className="grid gap-3 text-sm text-muted-foreground">{manufacturingSequence.map((s, i) => <li key={s} className="flex gap-3"><span className="font-medium text-foreground">{i + 1}.</span>{s}</li>)}</ol></CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
