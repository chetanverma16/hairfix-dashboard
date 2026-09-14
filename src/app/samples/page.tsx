import { asc, desc } from "drizzle-orm"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Field, SelectField, TextareaField } from "@/components/forms/field"
import { DeleteButton } from "@/components/forms/delete-button"
import { getDb } from "@/db"
import { supplierSamples, suppliers } from "@/db/schema"
import { inr } from "@/lib/format"
import { addSample, deleteSample, setSampleVerdict } from "@/actions/suppliers"

export const dynamic = "force-dynamic"

const verdicts = ["pending", "pass", "fail", "reorder"] as const
const verdictLabel = { pending: "Pending", pass: "Pass", fail: "Fail", reorder: "Reorder" } as const
const verdictVariant = { pending: "outline", pass: "default", fail: "destructive", reorder: "secondary" } as const
const smallControl = "h-7 rounded-md border border-input bg-transparent px-2 text-xs"

export default async function Samples() {
  const db = getDb()
  const [sups, samples] = await Promise.all([
    db.select().from(suppliers).orderBy(asc(suppliers.country), asc(suppliers.name)),
    db.select().from(supplierSamples).orderBy(desc(supplierSamples.orderedOn)),
  ])
  const byId = new Map(sups.map((s) => [s.id, s]))
  const bySupplier = new Map<number, typeof samples>()
  for (const s of samples) bySupplier.set(s.supplierId, [...(bySupplier.get(s.supplierId) ?? []), s])
  const today = new Date().toISOString().slice(0, 10)

  return (
    <PageShell title="Samples" subtitle="Order 2 Indian + 2 Qingdao stock pieces in 8×6 and 9×7, #1B. Wear-test 4 weeks before choosing suppliers.">
      <Card>
        <CardHeader><CardTitle>Suppliers</CardTitle><CardDescription>Status of every sample per supplier.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Supplier</TableHead><TableHead>Country</TableHead><TableHead>Product</TableHead><TableHead>Price / lead</TableHead><TableHead>Samples</TableHead></TableRow></TableHeader>
            <TableBody>
              {sups.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="whitespace-nowrap font-medium">{s.name}</TableCell>
                  <TableCell className="whitespace-nowrap capitalize text-muted-foreground">{s.country}</TableCell>
                  <TableCell className="min-w-56 text-muted-foreground">{s.product}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{s.priceNote ?? "—"}</TableCell>
                  <TableCell className="min-w-40">
                    <div className="flex flex-wrap gap-1">
                      {(bySupplier.get(s.id) ?? []).map((x) => <Badge key={x.id} variant={verdictVariant[x.verdict]}>{x.item}: {verdictLabel[x.verdict]}</Badge>)}
                      {!bySupplier.has(s.id) && <span className="text-xs text-muted-foreground">none</span>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card>
          <CardHeader><CardTitle>Order a sample</CardTitle></CardHeader>
          <CardContent>
            <form action={addSample} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2"><SelectField label="Supplier" name="supplierId" options={sups.map((s) => ({ value: String(s.id), label: `${s.name} (${s.city ?? s.country})` }))} /></div>
              <Field label="Item" name="item" placeholder="8×6 French lace #1B" required />
              <Field label="Spec" name="spec" placeholder="120% density, 6 in, single knots" />
              <Field label="Ordered on" name="orderedOn" type="date" defaultValue={today} />
              <Field label="Landed cost ₹" name="landedCost" type="number" min={0} />
              <div className="sm:col-span-2"><TextareaField label="Notes" name="notes" placeholder="Courier, invoice number, who is wearing it" /></div>
              <div className="sm:col-span-2"><Button type="submit" size="sm">Add sample</Button></div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Wear tests</CardTitle><CardDescription>Update received date, days worn and verdict as the test runs.</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Supplier</TableHead><TableHead>Ordered</TableHead><TableHead>Cost</TableHead><TableHead>Result</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {samples.length === 0 && <TableRow><TableCell colSpan={6} className="text-muted-foreground">No samples ordered.</TableCell></TableRow>}
                {samples.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell className="min-w-40"><div className="font-medium">{x.item}</div><div className="text-xs text-muted-foreground">{x.spec ?? ""}</div></TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{byId.get(x.supplierId)?.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{x.orderedOn ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">{x.landedCost != null ? inr(x.landedCost) : "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <form key={`${x.id}-${x.verdict}-${x.wearTestDays ?? ""}-${x.receivedOn ?? ""}`} action={setSampleVerdict} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={x.id} />
                        <input type="date" name="receivedOn" defaultValue={x.receivedOn ?? ""} title="Received on" className={smallControl} />
                        <input type="number" name="wearTestDays" defaultValue={x.wearTestDays ?? ""} min={0} placeholder="days" title="Days worn" className={`${smallControl} w-16`} />
                        <select name="verdict" defaultValue={x.verdict} className={smallControl}>
                          {verdicts.map((v) => <option key={v} value={v}>{verdictLabel[v]}</option>)}
                        </select>
                        <Button type="submit" size="sm" variant="outline" className="h-7 px-2 text-xs">Save</Button>
                      </form>
                    </TableCell>
                    <TableCell className="w-8"><DeleteButton action={deleteSample.bind(null, x.id)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
