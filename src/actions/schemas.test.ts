import { describe, expect, it } from "vitest"
import { CampaignDayInput, CompetitorVisitInput, LeadInput, LeadStatusInput, SampleVerdictInput, SupplierSampleInput } from "./schemas"

const form = (o: Record<string, string>) => o

describe("LeadInput", () => {
  it("requires a phone and defaults status to new", () => {
    const r = LeadInput.parse(form({ phone: "+91 98765 43210", campaignId: "1", name: "", area: "", notes: "" }))
    expect(r.phone).toBe("+91 98765 43210")
    expect(r.status).toBe("new")
    expect(r.campaignId).toBe(1)
    expect(r.name).toBeUndefined()
  })
  it("rejects an empty phone", () => {
    expect(() => LeadInput.parse(form({ phone: "", campaignId: "1" }))).toThrow()
  })
  it("ignores Next.js action metadata keys", () => {
    const r = LeadInput.parse(form({ phone: "1", $ACTION_ID_abc: "" }))
    expect(Object.keys(r)).not.toContain("$ACTION_ID_abc")
  })
})

describe("LeadStatusInput", () => {
  it("coerces id and validates status", () => {
    expect(LeadStatusInput.parse(form({ id: "7", status: "consulted", nextFollowUp: "" }))).toMatchObject({ id: 7, status: "consulted" })
    expect(() => LeadStatusInput.parse(form({ id: "7", status: "maybe" }))).toThrow()
  })
})

describe("CampaignDayInput", () => {
  it("coerces numbers and requires a day", () => {
    const r = CampaignDayInput.parse(form({ campaignId: "1", day: "2026-09-15", spend: "450", impressions: "1200", clicks: "38", notes: "" }))
    expect(r).toMatchObject({ campaignId: 1, day: "2026-09-15", spend: 450, impressions: 1200, clicks: 38 })
    expect(() => CampaignDayInput.parse(form({ campaignId: "1", day: "", spend: "0" }))).toThrow()
  })
  it("defaults blank impressions and clicks to zero", () => {
    const r = CampaignDayInput.parse(form({ campaignId: "1", day: "2026-09-15", spend: "100", impressions: "", clicks: "" }))
    expect(r.impressions).toBe(0)
    expect(r.clicks).toBe(0)
  })
})

describe("CompetitorVisitInput", () => {
  it("accepts a partial visit", () => {
    const r = CompetitorVisitInput.parse(form({ competitorId: "2", visitedOn: "2026-09-16", installPriceMin: "18000", installPriceMax: "", cabinPrivacy: "curtain", upsellPressure: "high" }))
    expect(r.installPriceMin).toBe(18000)
    expect(r.installPriceMax).toBeUndefined()
    expect(r.cabinPrivacy).toBe("curtain")
  })
})

describe("SupplierSampleInput", () => {
  it("defaults verdict to pending", () => {
    const r = SupplierSampleInput.parse(form({ supplierId: "3", item: "8x6 French lace #1B", spec: "", orderedOn: "2026-09-20", landedCost: "4200" }))
    expect(r.verdict).toBe("pending")
    expect(r.landedCost).toBe(4200)
  })
})

describe("SampleVerdictInput", () => {
  it("parses a verdict update with blanks", () => {
    const r = SampleVerdictInput.parse(form({ id: "4", verdict: "pass", wearTestDays: "", receivedOn: "" }))
    expect(r).toMatchObject({ id: 4, verdict: "pass" })
    expect(r.wearTestDays).toBeUndefined()
  })
})
