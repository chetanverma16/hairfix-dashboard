import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { launchPlan } from "@/data/insights"

export default function Plan() {
  return (
    <PageShell title="Launch plan" subtitle="Home-visit first, sign the lease once you have 10 paying clients. Total ₹3.5–4.5L.">
      <Card>
        <CardHeader><CardTitle>Phases</CardTitle><CardDescription>Month-6 target: 8–10 installs + 40 maintenance visits ≈ ₹3–3.8L/month</CardDescription></CardHeader>
        <CardContent>
          <ol className="relative grid gap-6 border-l pl-6">
            {launchPlan.map((p, i) => (
              <li key={p.phase} className="relative">
                <span className="absolute -left-[31px] top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">{i + 1}</span>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <p className="font-medium">{p.phase}</p>
                  <p className="text-xs text-muted-foreground">weeks {p.weeks}</p>
                  <p className="text-xs font-medium tabular-nums">{p.spend}</p>
                </div>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{p.actions}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </PageShell>
  )
}
