const inrFmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })

export function inr(n: number): string {
  return inrFmt.format(Math.round(n))
}

export function lakh(n: number): string {
  const l = n / 100_000
  const s = Math.abs(l) >= 10 ? l.toFixed(0) : l.toFixed(1)
  return `₹${s}L`
}

export function pct(n: number): string {
  return `${Math.round(n * 100)}%`
}
