import { asc, desc } from "drizzle-orm"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Field, SelectField, TextareaField } from "@/components/forms/field"
import { DeleteButton } from "@/components/forms/delete-button"
import { getDb } from "@/db"
import { competitors, competitorVisits } from "@/db/schema"
import { inr } from "@/lib/format"
import { addCompetitorVisit, deleteCompetitorVisit } from "@/actions/competitors"

export const dynamic = "force-dynamic"

const privacyLabel = { private_cabin: "Private cabin", curtain: "Curtain", open: "Open floor", unknown: "Unknown" } as const
const upsellLabel = { none: "None", low: "Low", medium: "Medium", high: "High", unknown: "Unknown" } as const
const priorityNames = ["Lynx Hair Wig Studio", "Hair Zone", "New Look Hair Fixing", "Reline Hair World"]

function price(min: number | null, max: number | null) {
  if (min == null && max == null) return "—"
  if (min != null && max != null && min !== max) return `${inr(min)}–${inr(max)}`
  return inr((min ?? max)!)
}

export default async function MysteryShop() {
  const db = getDb()
  const [comps, visits] = await Promise.all([
    db.select().from(competitors).orderBy(asc(competitors.name)),
    db.select().from(competitorVisits).orderBy(desc(competitorVisits.visitedOn)),
  ])
  const byId = new Map(comps.map((c) => [c.id, c]))
  const latestByCompetitor = new Map<number, (typeof visits)[number]>()
  for (const v of visits) if (!latestByCompetitor.has(v.competitorId)) latestByCompetitor.set(v.competitorId, v)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <PageShell title="Mystery shop" subtitle="One row per visit. Compare install price, maintenance price, bases, privacy and upsell before setting our prices.">
      <Card>
        <CardHeader><CardTitle>Coverage</CardTitle><CardDescription>Visit the first four before pricing anything.</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {comps.map((c) => {
            const done = latestByCompetitor.has(c.id)
            const priority = priorityNames.includes(c.name)
            return (
              <Badge key={c.id} variant={done ? "default" : priority ? "destructive" : "outline"}>
                {c.name}{done ? " ✓" : priority ? " · visit first" : ""}
              </Badge>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Comparison</CardTitle><CardDescription>Latest visit per competitor.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Studio</TableHead><TableHead>Install</TableHead><TableHead>Maintenance</TableHead><TableHead>Bases</TableHead>
              <TableHead>Privacy</TableHead><TableHead>Upsell</TableHead><TableHead>Products</TableHead><TableHead>Lead time</TableHead><TableHead>Packages</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {latestByCompetitor.size === 0 && <TableRow><TableCell colSpan={9} className="text-muted-foreground">No visits logged.</TableCell></TableRow>}
              {[...latestByCompetitor.values()].map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="whitespace-nowrap font-medium">{byId.get(v.competitorId)?.name}</TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">{price(v.installPriceMin, v.installPriceMax)}</TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">{v.maintenancePrice != null ? inr(v.maintenancePrice) : "—"}</TableCell>
                  <TableCell className="min-w-40 text-muted-foreground">{v.basesOffered ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{privacyLabel[v.cabinPrivacy]}</TableCell>
                  <TableCell className="whitespace-nowrap">{upsellLabel[v.upsellPressure]}</TableCell>
                  <TableCell className="min-w-40 text-muted-foreground">{v.productsUsed ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{v.leadTimeDays != null ? `${v.leadTimeDays} d` : "—"}</TableCell>
                  <TableCell className="min-w-48 text-muted-foreground">{v.packages ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card>
          <CardHeader><CardTitle>Log a visit</CardTitle></CardHeader>
          <CardContent>
            <form action={addCompetitorVisit} className="grid gap-3 sm:grid-cols-2">
              <SelectField label="Studio" name="competitorId" options={comps.map((c) => ({ value: String(c.id), label: c.name }))} />
              <Field label="Visited on" name="visitedOn" type="date" required defaultValue={today} />
              <Field label="Visited by" name="visitedBy" placeholder="Manager" />
              <Field label="Lead time, days" name="leadTimeDays" type="number" min={0} />
              <Field label="Install price from ₹" name="installPriceMin" type="number" min={0} />
              <Field label="Install price to ₹" name="installPriceMax" type="number" min={0} />
              <Field label="Maintenance visit ₹" name="maintenancePrice" type="number" min={0} />
              <SelectField label="Cabin privacy" name="cabinPrivacy" defaultValue="unknown" options={Object.entries(privacyLabel).map(([value, label]) => ({ value, label }))} />
              <SelectField label="Upsell pressure" name="upsellPressure" defaultValue="unknown" options={Object.entries(upsellLabel).map(([value, label]) => ({ value, label }))} />
              <Field label="Bases offered" name="basesOffered" placeholder="Mono, French lace, PU" />
              <div className="sm:col-span-2"><Field label="Products used" name="productsUsed" placeholder="Walker Ultra Hold, Ghost Bond, local tape" /></div>
              <div className="sm:col-span-2"><TextareaField label="Packages offered" name="packages" placeholder="Install + 6 services ₹X; annual plan ₹Y" /></div>
              <div className="sm:col-span-2"><TextareaField label="Notes" name="notes" placeholder="Wait time, hygiene, sample vs installed, how they sold" /></div>
              <div className="sm:col-span-2"><Button type="submit" size="sm">Save visit</Button></div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>All visits</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Studio</TableHead><TableHead>By</TableHead><TableHead>Install</TableHead><TableHead>Notes</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {visits.length === 0 && <TableRow><TableCell colSpan={6} className="text-muted-foreground">Nothing yet.</TableCell></TableRow>}
                {visits.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="whitespace-nowrap">{v.visitedOn}</TableCell>
                    <TableCell className="whitespace-nowrap font-medium">{byId.get(v.competitorId)?.name}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{v.visitedBy ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">{price(v.installPriceMin, v.installPriceMax)}</TableCell>
                    <TableCell className="min-w-56 text-sm text-muted-foreground">{v.notes ?? ""}</TableCell>
                    <TableCell className="w-8"><DeleteButton action={deleteCompetitorVisit.bind(null, v.id)} /></TableCell>
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
