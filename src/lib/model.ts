export type ModelInputs = {
  installPrice: number
  maintenancePrice: number
  replacementPrice: number
  gstRate: number
  visitsPerClientMonth: number
  monthlyChurn: number
  replacementMonths: number
  installsStart: number
  installsPeak: number
  peakMonth: number
  systemCost: number
  consumablesPerInstall: number
  consumablesPerVisit: number
  rent: number
  technician: number
  manager: number
  marketing: number
  capital: number
  months: number
}

export type MonthRow = {
  month: number
  installs: number
  activeClients: number
  visits: number
  replacements: number
  revenue: number
  cogs: number
  fixed: number
  profit: number
  cash: number
}

export type ModelResult = {
  rows: MonthRow[]
  breakEvenMonth: number | null
  lowestCash: number
  lowestCashMonth: number
  year1Revenue: number
  year1Profit: number
  clientsM12: number
}

// New Gurgaon base case. Prices are what the client pays; GST is stripped
// before revenue is counted. Costs include taxes we cannot recover under the
// 5% no-ITC services regime.
export const defaultInputs: ModelInputs = {
  installPrice: 24_000,
  maintenancePrice: 2_000,
  replacementPrice: 15_000,
  gstRate: 0.05,
  visitsPerClientMonth: 0.8,
  monthlyChurn: 0.05,
  replacementMonths: 9,
  installsStart: 3,
  installsPeak: 10,
  peakMonth: 7,
  systemCost: 7_500,
  consumablesPerInstall: 900,
  consumablesPerVisit: 250,
  rent: 30_000,
  technician: 30_000,
  manager: 25_000,
  marketing: 25_000,
  capital: 500_000,
  months: 24,
}

function installsFor(month: number, i: ModelInputs): number {
  if (i.peakMonth <= 1 || month >= i.peakMonth) return i.installsPeak
  const step = (i.installsPeak - i.installsStart) / (i.peakMonth - 1)
  return i.installsStart + step * (month - 1)
}

export function runModel(i: ModelInputs): ModelResult {
  const net = 1 / (1 + i.gstRate)
  const fixed = i.rent + i.technician + i.manager + i.marketing
  const rows: MonthRow[] = []
  let active = 0
  let cash = i.capital
  let breakEvenMonth: number | null = null
  let lowestCash = cash
  let lowestCashMonth = 0

  for (let m = 1; m <= i.months; m++) {
    const installs = installsFor(m, i)
    active = active * (1 - i.monthlyChurn) + installs
    const visits = active * i.visitsPerClientMonth
    const replacements = active / i.replacementMonths
    const revenue =
      installs * i.installPrice * net +
      visits * i.maintenancePrice * net +
      replacements * i.replacementPrice * net
    const cogs =
      (installs + replacements) * i.systemCost +
      installs * i.consumablesPerInstall +
      visits * i.consumablesPerVisit
    const profit = revenue - cogs - fixed
    cash += profit
    if (breakEvenMonth === null && profit >= 0) breakEvenMonth = m
    if (cash < lowestCash) {
      lowestCash = cash
      lowestCashMonth = m
    }
    rows.push({ month: m, installs, activeClients: active, visits, replacements, revenue, cogs, fixed, profit, cash })
  }

  const y1 = rows.slice(0, 12)
  return {
    rows,
    breakEvenMonth,
    lowestCash,
    lowestCashMonth,
    year1Revenue: y1.reduce((s, r) => s + r.revenue, 0),
    year1Profit: y1.reduce((s, r) => s + r.profit, 0),
    clientsM12: rows[Math.min(11, rows.length - 1)]?.activeClients ?? 0,
  }
}
