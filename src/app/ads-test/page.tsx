import { desc, eq } from "drizzle-orm"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Field, TextareaField } from "@/components/forms/field"
import { DeleteButton } from "@/components/forms/delete-button"
import { getDb } from "@/db"
import { campaignDays, campaigns, leads } from "@/db/schema"
import { inr } from "@/lib/format"
import { addCampaignDay, addLead, deleteCampaignDay, deleteLead, setLeadStatus } from "@/actions/leads"

export const dynamic = "force-dynamic"

const statuses = ["new", "replied", "consulted", "installed", "lost"] as const
type Status = (typeof statuses)[number]
const statusLabel: Record<Status, string> = { new: "New", replied: "Replied", consulted: "Consulted", installed: "Installed", lost: "Lost" }
const smallControl = "h-7 rounded-md border border-input bg-transparent px-2 text-xs"

export default async function AdsTest() {
  const db = getDb()
  const [campaign] = await db.select().from(campaigns).orderBy(desc(campaigns.startDate)).limit(1)
  if (!campaign) {
    return (
      <PageShell title="Ads test" subtitle="No campaign yet">
        <Card><CardContent className="py-6 text-sm text-muted-foreground">Run <code>npm run db:seed</code> to create the first campaign.</CardContent></Card>
      </PageShell>
    )
  }
  const [days, allLeads] = await Promise.all([
    db.select().from(campaignDays).where(eq(campaignDays.campaignId, campaign.id)).orderBy(desc(campaignDays.day)),
    db.select().from(leads).where(eq(leads.campaignId, campaign.id)).orderBy(desc(leads.firstContactAt)),
  ])

  const spend = days.reduce((s, d) => s + d.spend, 0)
  const clicks = days.reduce((s, d) => s + d.clicks, 0)
  const count = (s: Status) => allLeads.filter((l) => l.status === s).length
  const enquiries = allLeads.filter((l) => l.status !== "lost").length
  const consulted = count("consulted") + count("installed")
  const installed = count("installed")
  const target = campaign.targetEnquiries || 1
  const today = new Date().toISOString().slice(0, 10)

  return (
    <PageShell title="Ads test" subtitle={`${campaign.name}. Go/no-go: ${campaign.targetEnquiries} real enquiries in two weeks.`}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Spend" value={inr(spend)} hint={`budget ${inr(campaign.budget)}`} />
        <Stat label="Enquiries" value={`${enquiries} / ${campaign.targetEnquiries}`} hint={spend && enquiries ? `${inr(spend / enquiries)} per enquiry` : "no spend logged yet"} />
        <Stat label="Consultations" value={String(consulted)} hint={enquiries ? `${Math.round((consulted / enquiries) * 100)}% of enquiries` : undefined} />
        <Stat label="Installs" value={String(installed)} hint={spend && installed ? `${inr(spend / installed)} per install` : undefined} />
      </div>

      <Card>
        <CardHeader><CardTitle>Progress to go/no-go</CardTitle><CardDescription>Leads not marked lost count as enquiries. Clicks so far: {clicks}.</CardDescription></CardHeader>
        <CardContent className="grid gap-3">
          <Progress value={Math.min(100, (enquiries / target) * 100)} />
          <div className="grid gap-2 text-sm sm:grid-cols-5">
            {statuses.map((s) => (
              <div key={s} className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-muted-foreground">{statusLabel[s]}</span>
                <span className="font-medium tabular-nums">{count(s)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card>
          <CardHeader><CardTitle>Daily spend</CardTitle><CardDescription>From the Google Ads dashboard. Re-entering a day overwrites it.</CardDescription></CardHeader>
          <CardContent className="grid gap-4">
            <form action={addCampaignDay} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="campaignId" value={campaign.id} />
              <Field label="Day" name="day" type="date" required defaultValue={today} />
              <Field label="Spend ₹" name="spend" type="number" min={0} required />
              <Field label="Impressions" name="impressions" type="number" min={0} />
              <Field label="Clicks" name="clicks" type="number" min={0} />
              <div className="sm:col-span-2"><Button type="submit" size="sm">Save day</Button></div>
            </form>
            <Table>
              <TableHeader><TableRow><TableHead>Day</TableHead><TableHead className="text-right">Spend</TableHead><TableHead className="text-right">Impr.</TableHead><TableHead className="text-right">Clicks</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {days.length === 0 && <TableRow><TableCell colSpan={5} className="text-muted-foreground">No days logged.</TableCell></TableRow>}
                {days.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="whitespace-nowrap">{d.day}</TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums">{inr(d.spend)}</TableCell>
                    <TableCell className="text-right tabular-nums">{d.impressions}</TableCell>
                    <TableCell className="text-right tabular-nums">{d.clicks}</TableCell>
                    <TableCell className="w-8"><DeleteButton action={deleteCampaignDay.bind(null, d.id)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Leads</CardTitle><CardDescription>One row per WhatsApp enquiry. Phone is the identity; these become clients later.</CardDescription></CardHeader>
          <CardContent className="grid gap-4">
            <form action={addLead} className="grid gap-3 sm:grid-cols-3">
              <input type="hidden" name="campaignId" value={campaign.id} />
              <Field label="Phone" name="phone" placeholder="+91 …" required />
              <Field label="Name" name="name" />
              <Field label="Area / sector" name="area" placeholder="Sector 84" />
              <div className="sm:col-span-3"><TextareaField label="Notes" name="notes" placeholder="What they asked, budget hints, base preference" /></div>
              <div className="sm:col-span-3"><Button type="submit" size="sm">Add lead</Button></div>
            </form>
            <Table>
              <TableHeader><TableRow><TableHead>Lead</TableHead><TableHead>Area</TableHead><TableHead>Status</TableHead><TableHead>Follow-up</TableHead><TableHead>Notes</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {allLeads.length === 0 && <TableRow><TableCell colSpan={6} className="text-muted-foreground">No leads yet.</TableCell></TableRow>}
                {allLeads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium">{l.name ?? "—"}</div>
                      <div className="font-mono text-xs text-muted-foreground">{l.phone}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{l.area ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <form action={setLeadStatus} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={l.id} />
                        <select name="status" defaultValue={l.status} className={smallControl}>
                          {statuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                        </select>
                        <input type="date" name="nextFollowUp" defaultValue={l.nextFollowUp ?? ""} title="Next follow-up" className={smallControl} />
                        <Button type="submit" size="sm" variant="outline" className="h-7 px-2 text-xs">Save</Button>
                      </form>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {l.nextFollowUp ? (l.nextFollowUp < today ? <Badge variant="destructive">{l.nextFollowUp}</Badge> : l.nextFollowUp) : "—"}
                    </TableCell>
                    <TableCell className="min-w-56 text-sm text-muted-foreground">{l.notes ?? ""}</TableCell>
                    <TableCell className="w-8"><DeleteButton action={deleteLead.bind(null, l.id)} /></TableCell>
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

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardDescription>{label}</CardDescription></CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}
