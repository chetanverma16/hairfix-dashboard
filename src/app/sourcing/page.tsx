import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { baseTypes, landedCost, suppliersChina, suppliersIndia } from "@/data/insights"

export default function Sourcing() {
  return (
    <PageShell title="Sourcing" subtitle="Indian stock for the Essential tier, Qingdao for Signature and Custom">
      <Tabs defaultValue="india">
        <TabsList><TabsTrigger value="india">India</TabsTrigger><TabsTrigger value="china">China</TabsTrigger><TabsTrigger value="landed">Landed cost</TabsTrigger><TabsTrigger value="bases">Base types</TabsTrigger></TabsList>
        <TabsContent value="india">
          <Card>
            <CardHeader><CardTitle>Indian suppliers</CardTitle><CardDescription>₹2,500–6,000 stock, 1–5 day availability, no duty, 18% GST recoverable. Base and knotting consistency below Qingdao tier-1.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Supplier</TableHead><TableHead>City</TableHead><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead>Note</TableHead></TableRow></TableHeader>
                <TableBody>{suppliersIndia.map((s) => <TableRow key={s.name}><TableCell className="whitespace-nowrap font-medium">{s.name}</TableCell><TableCell className="whitespace-nowrap">{s.city}</TableCell><TableCell className="min-w-56 text-muted-foreground">{s.product}</TableCell><TableCell className="whitespace-nowrap">{s.price}</TableCell><TableCell className="text-muted-foreground">{s.note}</TableCell></TableRow>)}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="china">
          <Card>
            <CardHeader><CardTitle>Qingdao and Xuchang factories</CardTitle><CardDescription>Qingdao is the men&apos;s hair-system capital. They buy Indian raw hair, process it in Xuchang, knot it on imported lace/PU, and sell it back.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Supplier</TableHead><TableHead>City</TableHead><TableHead>Stock (FOB)</TableHead><TableHead>Custom</TableHead><TableHead>MOQ</TableHead><TableHead>Lead time</TableHead><TableHead>Note</TableHead></TableRow></TableHeader>
                <TableBody>{suppliersChina.map((s) => <TableRow key={s.name}><TableCell className="whitespace-nowrap font-medium">{s.name}</TableCell><TableCell className="whitespace-nowrap">{s.city}</TableCell><TableCell className="whitespace-nowrap">{s.stock}</TableCell><TableCell className="whitespace-nowrap">{s.custom}</TableCell><TableCell className="whitespace-nowrap">{s.moq}</TableCell><TableCell className="whitespace-nowrap text-muted-foreground">{s.lead}</TableCell><TableCell className="text-muted-foreground">{s.note}</TableCell></TableRow>)}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="landed">
          <Card>
            <CardHeader><CardTitle>Landed cost of an $80 Qingdao custom system</CardTitle><CardDescription>Verify BCD for HSN 6704 on ICEGATE before the first shipment; use a CHA.</CardDescription></CardHeader>
            <CardContent>
              <Table><TableBody>{landedCost.map((l) => <TableRow key={l.line} className={l.line.startsWith("Landed") ? "font-medium" : ""}><TableCell>{l.line}</TableCell><TableCell className="whitespace-nowrap text-right tabular-nums">{l.amount}</TableCell></TableRow>)}</TableBody></Table>
              <p className="mt-4 text-sm text-muted-foreground">A Qingdao piece lands at ~₹9K net vs ₹4–6K Indian. It is better made, lasts longer, and lets you sell a ₹35–45K tier credibly. Opening inventory: 6–8 Indian + 4–5 Qingdao stock pieces in 8×6&quot; and 9×7&quot;, #1B ≈ ₹80–90K.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bases">
          <Card>
            <CardHeader><CardTitle>Base types</CardTitle><CardDescription>Hair: Indian Remy, 110–120% density, 5–6&quot;, #1B, single split knots. Never non-Remy for ₹20K+ clients.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Base</TableHead><TableHead>Look</TableHead><TableHead>Life</TableHead><TableHead>Breathability</TableHead><TableHead>Use</TableHead></TableRow></TableHeader>
                <TableBody>{baseTypes.map((b) => <TableRow key={b.base}><TableCell className="whitespace-nowrap font-medium">{b.base}</TableCell><TableCell className="min-w-40">{b.look}</TableCell><TableCell className="whitespace-nowrap">{b.life}</TableCell><TableCell>{b.breath}</TableCell><TableCell className="text-muted-foreground">{b.use}</TableCell></TableRow>)}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
