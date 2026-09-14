import { date, integer, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}
const id = () => integer().primaryKey().generatedAlwaysAsIdentity()

export const channelEnum = pgEnum("channel", ["google_ads", "justdial", "instagram", "referral", "walk_in", "other"])
export const leadStatusEnum = pgEnum("lead_status", ["new", "replied", "consulted", "installed", "lost"])
export const cabinPrivacyEnum = pgEnum("cabin_privacy", ["private_cabin", "curtain", "open", "unknown"])
export const upsellEnum = pgEnum("upsell_pressure", ["none", "low", "medium", "high", "unknown"])
export const countryEnum = pgEnum("supplier_country", ["india", "china"])
export const verdictEnum = pgEnum("sample_verdict", ["pending", "pass", "fail", "reorder"])

export const campaigns = pgTable("campaigns", {
  id: id(),
  name: text().notNull(),
  channel: channelEnum().notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  budget: integer().notNull().default(0),
  targetEnquiries: integer("target_enquiries").notNull().default(0),
  notes: text(),
  ...timestamps,
})

export const campaignDays = pgTable("campaign_days", {
  id: id(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  day: date().notNull(),
  spend: integer().notNull().default(0),
  impressions: integer().notNull().default(0),
  clicks: integer().notNull().default(0),
  notes: text(),
  ...timestamps,
}, (t) => [uniqueIndex("campaign_days_campaign_day").on(t.campaignId, t.day)])

export const leads = pgTable("leads", {
  id: id(),
  campaignId: integer("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  name: text(),
  phone: text().notNull(),
  area: text(),
  status: leadStatusEnum().notNull().default("new"),
  firstContactAt: timestamp("first_contact_at", { withTimezone: true }).defaultNow().notNull(),
  nextFollowUp: date("next_follow_up"),
  notes: text(),
  ...timestamps,
})

export const competitors = pgTable("competitors", {
  id: id(),
  name: text().notNull(),
  area: text(),
  phone: text(),
  rating: numeric({ precision: 2, scale: 1 }),
  reviews: integer(),
  note: text(),
  sourceUrl: text("source_url"),
  ...timestamps,
}, (t) => [uniqueIndex("competitors_name").on(t.name)])

export const competitorVisits = pgTable("competitor_visits", {
  id: id(),
  competitorId: integer("competitor_id").notNull().references(() => competitors.id, { onDelete: "cascade" }),
  visitedOn: date("visited_on").notNull(),
  visitedBy: text("visited_by"),
  installPriceMin: integer("install_price_min"),
  installPriceMax: integer("install_price_max"),
  maintenancePrice: integer("maintenance_price"),
  basesOffered: text("bases_offered"),
  cabinPrivacy: cabinPrivacyEnum("cabin_privacy").notNull().default("unknown"),
  upsellPressure: upsellEnum("upsell_pressure").notNull().default("unknown"),
  productsUsed: text("products_used"),
  leadTimeDays: integer("lead_time_days"),
  packages: text(),
  notes: text(),
  ...timestamps,
})

export const suppliers = pgTable("suppliers", {
  id: id(),
  name: text().notNull(),
  country: countryEnum().notNull(),
  city: text(),
  product: text(),
  priceNote: text("price_note"),
  note: text(),
  ...timestamps,
}, (t) => [uniqueIndex("suppliers_name").on(t.name)])

export const supplierSamples = pgTable("supplier_samples", {
  id: id(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id, { onDelete: "cascade" }),
  item: text().notNull(),
  spec: text(),
  orderedOn: date("ordered_on"),
  receivedOn: date("received_on"),
  landedCost: integer("landed_cost"),
  wearTestDays: integer("wear_test_days"),
  verdict: verdictEnum().notNull().default("pending"),
  notes: text(),
  ...timestamps,
})

export type Campaign = typeof campaigns.$inferSelect
export type CampaignDay = typeof campaignDays.$inferSelect
export type Lead = typeof leads.$inferSelect
export type Competitor = typeof competitors.$inferSelect
export type CompetitorVisit = typeof competitorVisits.$inferSelect
export type Supplier = typeof suppliers.$inferSelect
export type SupplierSample = typeof supplierSamples.$inferSelect
