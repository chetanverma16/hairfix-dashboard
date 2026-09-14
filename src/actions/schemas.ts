import { z } from "zod"

// FormData gives "" for blank inputs. Treat "" as absent so optional columns stay NULL.
export const optional = <T extends z.ZodTypeAny>(s: T) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), s.optional())

const int = z.coerce.number().int()
const money = z.coerce.number().int().min(0)
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
const text = z.string().trim().min(1)

export const CampaignDayInput = z.object({
  campaignId: int,
  day: isoDate,
  spend: money.default(0),
  impressions: optional(money).default(0),
  clicks: optional(money).default(0),
  notes: optional(text),
})

export const LeadStatus = z.enum(["new", "replied", "consulted", "installed", "lost"])

export const LeadInput = z.object({
  campaignId: optional(int),
  name: optional(text),
  phone: text,
  area: optional(text),
  status: LeadStatus.default("new"),
  nextFollowUp: optional(isoDate),
  notes: optional(text),
})

export const LeadStatusInput = z.object({
  id: int,
  status: LeadStatus,
  nextFollowUp: optional(isoDate),
})

export const CompetitorVisitInput = z.object({
  competitorId: int,
  visitedOn: isoDate,
  visitedBy: optional(text),
  installPriceMin: optional(money),
  installPriceMax: optional(money),
  maintenancePrice: optional(money),
  basesOffered: optional(text),
  cabinPrivacy: z.enum(["private_cabin", "curtain", "open", "unknown"]).default("unknown"),
  upsellPressure: z.enum(["none", "low", "medium", "high", "unknown"]).default("unknown"),
  productsUsed: optional(text),
  leadTimeDays: optional(int.min(0)),
  packages: optional(text),
  notes: optional(text),
})

export const SampleVerdict = z.enum(["pending", "pass", "fail", "reorder"])

export const SupplierSampleInput = z.object({
  supplierId: int,
  item: text,
  spec: optional(text),
  orderedOn: optional(isoDate),
  receivedOn: optional(isoDate),
  landedCost: optional(money),
  wearTestDays: optional(int.min(0)),
  verdict: SampleVerdict.default("pending"),
  notes: optional(text),
})

export const SampleVerdictInput = z.object({
  id: int,
  verdict: SampleVerdict,
  wearTestDays: optional(int.min(0)),
  receivedOn: optional(isoDate),
})
