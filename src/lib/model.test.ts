import { describe, expect, it } from "vitest"
import { defaultInputs, runModel, type ModelInputs } from "./model"

const base: ModelInputs = {
  ...defaultInputs,
  gstRate: 0,
  installsStart: 10, installsPeak: 10, peakMonth: 1,
  monthlyChurn: 0,
  rent: 0, technician: 0, manager: 0, marketing: 0,
  systemCost: 0, consumablesPerInstall: 0, consumablesPerVisit: 0,
  replacementMonths: 1000,
  capital: 0,
  months: 12,
}

describe("runModel", () => {
  it("accumulates active clients with zero churn", () => {
    const r = runModel(base)
    expect(r.rows[0].activeClients).toBe(10)
    expect(r.rows[11].activeClients).toBe(120)
    expect(r.clientsM12).toBe(120)
  })

  it("computes install and maintenance revenue net of GST", () => {
    const r = runModel({ ...base, gstRate: 0.05, installPrice: 21_000, maintenancePrice: 2_100, visitsPerClientMonth: 1, replacementPrice: 0 })
    // month 1: 10 installs at 20,000 net + 10 clients * 1 visit * 2,000 net
    expect(r.rows[0].revenue).toBeCloseTo(220_000, 0)
  })

  it("applies churn before counting visits", () => {
    const r = runModel({ ...base, monthlyChurn: 0.5, months: 2 })
    // month 1: 10 new. month 2: 10 * 0.5 survive + 10 new = 15
    expect(r.rows[1].activeClients).toBe(15)
  })

  it("ramps installs linearly to the peak month then holds", () => {
    const r = runModel({ ...base, installsStart: 2, installsPeak: 10, peakMonth: 5, months: 6 })
    expect(r.rows.map((m) => m.installs)).toEqual([2, 4, 6, 8, 10, 10])
  })

  it("reports break-even, lowest cash and year-1 totals", () => {
    const r = runModel({ ...base, rent: 150_000, installPrice: 20_000, maintenancePrice: 0, replacementPrice: 0, capital: 100_000 })
    // month 1: 10*20,000 = 200,000 revenue, 150,000 fixed → profit 50,000 → break-even month 1
    expect(r.breakEvenMonth).toBe(1)
    expect(r.rows[0].cash).toBe(150_000)
    expect(r.lowestCash).toBe(100_000)
    expect(r.year1Revenue).toBe(2_400_000)
    expect(r.year1Profit).toBe(600_000)
  })

  it("returns null break-even when never profitable", () => {
    const r = runModel({ ...base, installPrice: 0, maintenancePrice: 0, replacementPrice: 0, rent: 1 })
    expect(r.breakEvenMonth).toBeNull()
  })

  it("charges system cost and consumables per install, replacement and visit", () => {
    const r = runModel({ ...base, months: 1, systemCost: 5_000, consumablesPerInstall: 500, consumablesPerVisit: 100, visitsPerClientMonth: 1 })
    // 10 installs * (5,000 + 500) + 10 visits * 100 + replacements 10/1000 * 5,000 = 50
    expect(r.rows[0].cogs).toBeCloseTo(56_050, 0)
  })

  it("adds replacements at the cycle rate", () => {
    const r = runModel({ ...base, months: 1, replacementMonths: 10, replacementPrice: 10_000, maintenancePrice: 0 })
    // 10 active / 10 months = 1 replacement → 10,000 revenue
    expect(r.rows[0].replacements).toBeCloseTo(1)
    expect(r.rows[0].revenue).toBeCloseTo(10 * base.installPrice + 10_000)
  })
})
