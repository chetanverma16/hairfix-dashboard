import { PageShell } from "@/components/page-shell"
import { ModelPlayground } from "@/components/model-playground"

export default function Model() {
  return (
    <PageShell title="Model" subtitle="Move the sliders. Break-even, lowest cash and year-1 P&L update live.">
      <ModelPlayground />
    </PageShell>
  )
}
