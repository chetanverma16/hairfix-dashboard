import { getDb } from "@/db"
import { campaigns, competitors, suppliers } from "@/db/schema"
import { competitorsNearby, suppliersChina, suppliersIndia } from "@/data/insights"

async function main() {
  const db = getDb()

  await db.insert(competitors).values(
    competitorsNearby.map((c) => ({
      name: c.name, area: c.area, phone: c.phone, rating: c.rating.toFixed(1), reviews: c.reviews, note: c.note,
      sourceUrl: "Google Places, Sep 2026",
    })),
  ).onConflictDoNothing()

  await db.insert(suppliers).values([
    ...suppliersIndia.map((s) => ({ name: s.name, country: "india" as const, city: s.city, product: s.product, priceNote: s.price, note: s.note })),
    ...suppliersChina.map((s) => ({
      name: s.name, country: "china" as const, city: s.city,
      product: `Stock ${s.stock} · Custom ${s.custom} · MOQ ${s.moq}`,
      priceNote: s.lead, note: s.note,
    })),
  ]).onConflictDoNothing()

  const existing = await db.select({ id: campaigns.id }).from(campaigns)
  if (existing.length === 0) {
    await db.insert(campaigns).values({
      name: "Google Ads test, Sep 2026",
      channel: "google_ads",
      startDate: new Date().toISOString().slice(0, 10),
      budget: 8_000,
      targetEnquiries: 15,
      notes: "Search ads for 'hair patch New Gurgaon / Sector 83 / Manesar' to a WhatsApp landing page. Go/no-go: 15+ real enquiries in 2 weeks.",
    })
  }

  const counts = await Promise.all([
    db.select({ id: competitors.id }).from(competitors),
    db.select({ id: suppliers.id }).from(suppliers),
    db.select({ id: campaigns.id }).from(campaigns),
  ])
  console.log(`competitors=${counts[0].length} suppliers=${counts[1].length} campaigns=${counts[2].length}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
