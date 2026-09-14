// Single source of truth for the dashboard. Edit numbers here, not in pages.
// Figures come from the Sep 2026 research: Google Places data, IndiaMART /
// Made-in-China listings, Delhi clinic price guides and our own model.
// Corrected 14 Sep 2026: GST 5% no-ITC, Haryana S&E threshold, base-type lifespans.

export const decision = {
  business: "Non-surgical hair replacement studio (hair patch / hair system fixing + monthly maintenance)",
  firstOutlet: "New Gurgaon — Sector 83/84 (Vatika Town Square / SS Omnia / Sapphire 83 belt)",
  whyHere: [
    "Founder lives near Manesar — 15 min drop-ins, escalations handled in person",
    "Only one dedicated operator in Sectors 82–95 (Lynx, 2 branches, ~100 reviews, priced high)",
    "Rent ₹20–35K vs ₹40–70K in South Delhi — break-even at ~3 installs + 15 maintenance visits/month",
    "3–5 lakh residents in new towers + IMT Manesar white-collar layer, no mid-tier option",
  ],
  secondOutlet: "South Delhi (GK-1/GK-2/Saket/Hauz Khas) — zero dedicated studios, highest income belt in Delhi",
  positioning: "Same quality as Lynx, 20–25% cheaper, private cabins, maintenance subscription, home visits in Sectors 80–95 + Manesar",
  capital: "≤ ₹5L, part-time founder, manager-run, technicians lined up",
}

export const weeklyActions = [
  { task: "Run ₹5–8K Google Search ads test: 'hair patch New Gurgaon / Sector 83 / Manesar' → WhatsApp landing page", target: "15+ genuine enquiries in 2 weeks", owner: "Chetan" },
  { task: "Mystery-shop Lynx Sec 82, Hair Zone (Sohna Rd), New Look Sec 52, Reline Sec 57 — price lists, base types, maintenance plans, cabin privacy", target: "4 visits, one comparison sheet", owner: "Manager" },
  { task: "Trial technician on 3–5 paid home visits; agree base + maintenance revenue share vesting over 12 months", target: "Signed terms", owner: "Chetan" },
  { task: "Order samples: 2 Indian stock pieces (Delhi/Chennai) + 2 Qingdao stock pieces in 8×6\" and 9×7\", #1B", target: "4-week wear test", owner: "Technician" },
  { task: "Register IEC + GST (voluntary) under Stackframe Studios or new proprietorship", target: "Done", owner: "CA" },
  { task: "Brand name + trademark search (Class 44 services, Class 26 hair goods)", target: "Shortlist of 3", owner: "Chetan" },
]

export const unitEconomics = [
  { label: "Client install price (mid-premium, New Gurgaon)", value: "₹20,000–28,000" },
  { label: "Monthly maintenance visit", value: "₹1,500–3,500" },
  { label: "System lifespan", value: "Mono 6–12 mo · lace 2–6 mo · thin skin 1–3 mo · hybrid 4–12 mo" },
  { label: "Year-1 client value", value: "₹1.0–1.3L" },
  { label: "Landed cost, Indian stock system", value: "₹3,500–5,500" },
  { label: "Landed cost, Qingdao custom (IGST not recoverable)", value: "~₹10,500" },
  { label: "Consumables per install", value: "₹600–1,200" },
  { label: "Gross margin, install", value: "55–75% after 5% GST and non-recoverable IGST" },
  { label: "Gross margin, maintenance", value: "85–90%" },
  { label: "One technician capacity", value: "~12 installs + 60 maintenance / month ≈ ₹4.9L" },
  { label: "Fixed cost (room + tech + manager)", value: "₹1.2–2L / month" },
  { label: "Customer acquisition cost (Google)", value: "₹3–6K per install (₹300–800/lead, 10–20% conv.)" },
]

export const pricingTiers = [
  { tier: "Essential", price: "₹18,000–24,000", source: "Delhi/Chennai stock (mono / lace, Indian Remy)", cost: "₹3,500–5,500", margin: "70–80%" },
  { tier: "Signature", price: "₹28,000–35,000", source: "Qingdao stock (hybrid lace + PU, Indian Remy)", cost: "₹7,000–9,500", margin: "68–75%" },
  { tier: "Custom", price: "₹40,000–55,000", source: "Qingdao custom, mould-fitted, 6–8 weeks", cost: "₹10,500–15,500", margin: "65–72%" },
]

// Year-1 revenue scenarios, one technician (₹ lakh)
export const scenarios = [
  { name: "Conservative", installsMonth6: 5, installsY1: 55, activeM12: 35, install: 15, maintenance: 5, replacement: 1, cogs: 4, fixed: 15, marketing: 4 },
  { name: "Base", installsMonth6: 10, installsY1: 115, activeM12: 80, install: 32, maintenance: 10, replacement: 3, cogs: 9, fixed: 18, marketing: 5 },
  { name: "Strong", installsMonth6: 12, installsY1: 180, activeM12: 130, install: 50, maintenance: 15, replacement: 5, cogs: 14, fixed: 28, marketing: 7 },
].map((s) => ({
  ...s,
  revenue: s.install + s.maintenance + s.replacement,
  profit: s.install + s.maintenance + s.replacement - s.cogs - s.fixed - s.marketing,
}))

export const scenarioNotes = [
  "Assumes ₹28K average install, ₹2,500 maintenance, 0.8 visits per active client per month, replacement every 9–12 months at ₹15K, ~85% monthly retention.",
  "New Gurgaon first outlet: expect 60–70% of these revenue numbers in year 1 (₹20–28K installs), but lower fixed costs narrow the profit gap.",
  "Year 2, base case, two technicians: ₹90L–1.1 Cr revenue, ₹30–40L profit, 150–200 active clients. Maintenance + replacements become ~40% of revenue.",
  "Retention is the lever: every client kept on maintenance is worth ~₹30K/year at ~90% margin.",
  "Replacement cycles differ by base: thin skin 1–3 months, lace 2–6, mono 6–12. Revenue per client depends on which base you standardise on, not one 9–12 month cycle.",
  "GST on services is 5% without input credit since Sep 2025. Import IGST and GST on rent are costs. The Model page strips GST from prices before counting revenue.",
]

// Base-case monthly ramp used for the run-rate chart (₹ lakh)
export const monthlyRamp = [
  { month: "M1", installs: 3, revenue: 0.9 }, { month: "M2", installs: 5, revenue: 1.5 },
  { month: "M3", installs: 7, revenue: 2.2 }, { month: "M4", installs: 8, revenue: 2.7 },
  { month: "M5", installs: 10, revenue: 3.4 }, { month: "M6", installs: 10, revenue: 3.7 },
  { month: "M7", installs: 12, revenue: 4.4 }, { month: "M8", installs: 12, revenue: 4.6 },
  { month: "M9", installs: 12, revenue: 4.9 }, { month: "M10", installs: 12, revenue: 5.1 },
  { month: "M11", installs: 12, revenue: 5.3 }, { month: "M12", installs: 12, revenue: 5.5 },
]

// Google Places cluster scorecard (Sep 13, 2026). Counts are floors — Places returns ≤10 per query.
export const clusters = [
  { cluster: "Gurgaon (old/central)", studios: 10, reviews: 3250, top: "All Hair Solution 903 · Anuj 679 · New Look 625", read: "Highest served demand in NCR; market-shop tier. Premium slot (Reline, 5.0) under-served." , verdict: "Second outlet candidate" },
  { cluster: "Laxmi Nagar / East Delhi", studios: 8, reviews: 2740, top: "Anas Sheikh 1,529 · Arshad Hasrat 506", read: "Budget tier (₹600 services, ₹15K patches). Adhesive-failure and bait-and-switch complaints.", verdict: "Avoid" },
  { cluster: "Dwarka / Janakpuri", studios: 10, reviews: 1460, top: "Veronica 238 · Adore 200", read: "Most fragmented; 10 studios on one middle-class catchment.", verdict: "Avoid" },
  { cluster: "Rajouri Garden", studios: 2, reviews: 1450, top: "Radiance 1,377", read: "One dominant player owns West Delhi.", verdict: "Avoid" },
  { cluster: "Noida Sector 18", studios: 10, reviews: 1400, top: "Advance Clinic 301", read: "Saturated inside one market block; Expressway / Sector 62 side empty.", verdict: "Avoid (Sec 18)" },
  { cluster: "Ghaziabad", studios: 9, reviews: 1270, top: "Revamp 449 (4.6) · New Look 218", read: "Fragmented, low-price, after-sales complaints.", verdict: "Avoid" },
  { cluster: "Karol Bagh / Paharganj", studios: 4, reviews: 960, top: "Adrina 586 · Delhi Hair Fixing 349", read: "Old wig wholesale market; walk-in trade.", verdict: "Avoid" },
  { cluster: "Pitampura / Rohini", studios: 3, reviews: 870, top: "Hair Wig House 523", read: "Under-competed for its population; ₹20K+ pricing validated.", verdict: "Fallback" },
  { cluster: "Lajpat Nagar / Malviya Nagar", studios: 4, reviews: 620, top: "Young Forever 373", read: "Only real South Delhi supply.", verdict: "—" },
  { cluster: "Saket / GK / Hauz Khas / Vasant Kunj", studios: 0, reviews: 0, top: "—", read: "Zero dedicated studios in the highest-income belt. Clients drive to Lajpat or Gurgaon.", verdict: "Second outlet" },
  { cluster: "New Gurgaon (Sec 82–95) + Manesar", studios: 2, reviews: 104, top: "Lynx Sec 82 (51) · Lynx Sec 86 (53)", read: "One premium-priced chain. Nothing in 90–95 or IMT Manesar. Demand unproven on Maps — validate with ads test.", verdict: "First outlet" },
  { cluster: "Sohna Road", studios: 2, reviews: 254, top: "Hair Zone 137 · Hair Patch Centre 117", read: "Nearest real competition to Sector 83, 20–30 min away.", verdict: "—" },
]

export const competitorsNearby = [
  { name: "Lynx Hair Wig Studio", area: "Sector 82 (Vatika Town Square) & Sector 86 (SS Omnia)", rating: 5.0, reviews: 104, note: "7-branch chain. Korean patches, chemo wigs. Reviews say price is on the higher side. Your direct benchmark.", prices: "Patches ₹1,500–37,000 listed; 9×7 mono ₹26,000; 8×6 silk ₹37,000; toppers ₹8–19.5K (lynxhairskin.in, Sep 2026)", phone: "+91 72988 77776" },
  { name: "Hair Zone", area: "Subhash Chowk, Sohna Road (Sec 33)", rating: 5.0, reviews: 137, note: "Salon + patch supplier. 'Affordable and premium' positioning.", prices: "Not published", phone: "+91 92894 43881" },
  { name: "Hair Patch Centre", area: "Sector 61, Ulawas", rating: 5.0, reviews: 117, note: "Small, thin reviews.", prices: "Not published", phone: "+91 89201 99846" },
  { name: "New Look Hair Fixing", area: "Sector 52A, Wazirabad", rating: 5.0, reviews: 625, note: "Uses Walker products, privacy curtains, 7am–11pm. Strong operator.", prices: "Not published", phone: "+91 95577 24412" },
  { name: "Reline Hair World", area: "Sector 57, Sushant Lok 2", rating: 5.0, reviews: 231, note: "Premium positioning, clients from 18+ months. Proof the ₹30K+ tier works in Gurgaon.", prices: "Not published", phone: "+91 81818 16764" },
  { name: "All Hair Solution", area: "Sector 31, HUDA Market", rating: 4.9, reviews: 903, note: "Volume leader; complaints: cameras in cabins, no power backup, sulphate shampoo.", prices: "Not published", phone: "+91 98994 49796" },
  { name: "Anuj Hair Patch & Wig", area: "Sector 11, Model Town", rating: 4.9, reviews: 679, note: "Old Gurgaon volume operator.", prices: "Not published", phone: "+91 93121 27110" },
  { name: "Premium Hair Mafia", area: "Sushant Lok 1, Sector 43", rating: 4.9, reviews: 190, note: "Near Golf Course Road; owner publicly argues with reviewers.", prices: "Not published", phone: "+91 97736 76748" },
]

export const complaintPatterns = [
  "No privacy — cameras in cabins, staff walking in mid-service",
  "No power backup; 45-minute waits after appointment",
  "Sulphate shampoo and low-grade products used on patches",
  "Adhesive failing within 12 hours on sweaty scalps (wrong base recommended)",
  "Sales pressure to buy a new patch instead of repairing",
  "Rude reception, price changing mid-service",
  "Sample shown ≠ patch installed",
]

// Published NCR price points, Sep 2026. Anchors for the mystery-shop sheet.
export const marketPriceReferences = [
  { who: "Malhotra Hair (Delhi)", what: "Patches ₹10–35K; monthly servicing ₹600; mono lasts 10–12 mo, lace 6–8", source: "malhotrahair.in" },
  { who: "Veronica (Gurgaon)", what: "Patches from ₹5,999; 20% off 6- or 12-month service packages; free demo", source: "veronicahairreplacement.com" },
  { who: "Advance Clinic (Noida/Delhi)", what: "₹6,999–49,999 across 9 base styles; Bajaj zero-cost EMI", source: "advanceclinic.in" },
  { who: "Majestic Derma (Delhi/Gurgaon)", what: "Human hair ₹20–50K; consult ₹500–2,000; maintenance ₹1,000–5,000 every 4–6 weeks", source: "majesticderma.com" },
  { who: "Radiance (Delhi)", what: "₹5–50K; annual maintenance plan ₹10–15K/yr; visits every 4–6 weeks", source: "radiancehairstudio.com" },
  { who: "Nile Hair Care (guide)", what: "Bonding ₹900–1,500/visit; client product spend ₹1,800–3,600/mo; all-in ₹52–80K/yr", source: "nilehaircare.com" },
]

export const suppliersIndia = [
  { name: "Ahmed Wigs", city: "New Delhi", product: "Mono, silk, polyfuse, French/full lace, Mirage patches; toppers", price: "₹3,900/pc", note: "Long-standing wholesaler — visit and inspect" },
  { name: "Global Retail Inc", city: "New Delhi", product: "Men's patches 7×5 to 11×9, V-loop, single knot, #1B", price: "₹3,000/pc", note: "Also sells raw temple hair — future manufacturing partner" },
  { name: "Paris Beauty Clinic", city: "New Delhi", product: "Mono, frontless, poly frontline, full wigs", price: "On request", note: "Studio + wholesaler" },
  { name: "Ritu Hair Wigs", city: "Delhi NCR", product: "Mono, French lace, front lace, full lace", price: "On request", note: "Manufacturer + service provider" },
  { name: "Nu Style Wigs", city: "Chennai", product: "Gents/ladies patches, ISO 9001", price: "₹2,500–6,000", note: "Raw-hair processing hub — good for Indian Remy" },
  { name: "Nabi Karim / Chandni Chowk wholesalers", city: "Delhi", product: "Stock patches, tapes, glue, tools", price: "₹2,000–5,000", note: "Walk-in; quality varies wildly" },
]

export const suppliersChina = [
  { name: "Shunfa Hair / ChinaToupees.com", city: "Qingdao", stock: "$45–90", custom: "$90–180", moq: "1 stock / 3–5 custom", lead: "3–7 d stock · 6–8 wk custom", note: "Largest men's hair-prosthesis factory; 10,000+ stock pieces" },
  { name: "Newtimes Hair", city: "Qingdao", stock: "$60–120", custom: "$110–220", moq: "1", lead: "5–10 d · 6–10 wk", note: "Premium B2B, private-label packaging" },
  { name: "Bono Hair", city: "Qingdao", stock: "$50–100", custom: "$100–200", moq: "1", lead: "Similar", note: "Men's systems + women's toppers" },
  { name: "Lyrical Hair", city: "Qingdao", stock: "$45–95", custom: "$90–180", moq: "1", lead: "Similar", note: "Many base designs" },
  { name: "Lordhair", city: "Qingdao", stock: "$60–130", custom: "$120–250", moq: "1", lead: "Similar", note: "Retail + wholesale, complete catalogue" },
  { name: "Xuchang BeautyHair Fashion", city: "Xuchang", stock: "$40–80", custom: "On request", moq: "5–10", lead: "Similar", note: "Est. 1999, large volume" },
]

export const landedCost = [
  { line: "FOB price ($80 custom system)", amount: "₹6,700" },
  { line: "Courier (DHL/FedEx, shared)", amount: "₹500–800" },
  { line: "CIF value", amount: "~₹7,400" },
  { line: "Basic Customs Duty, HSN 6704 (verify on ICEGATE; ~20%)", amount: "~₹1,480" },
  { line: "Social Welfare Surcharge (10% of BCD)", amount: "~₹150" },
  { line: "IGST 18% — a cost under the 5% no-ITC services regime", amount: "~₹1,625" },
  { line: "Landed cost", amount: "~₹10,650" },
]

export const baseTypes = [
  { base: "French lace", look: "Very natural hairline", life: "6–9 mo", breath: "Excellent", use: "Default for Indian climate" },
  { base: "Swiss / HD lace", look: "Most natural, thinnest", life: "3–5 mo, fragile", breath: "Excellent", use: "Premium, low activity" },
  { base: "Monofilament", look: "Scalp-like from top", life: "9–14 mo", breath: "Good", use: "Durability-first, older men" },
  { base: "PU / thin skin 0.03–0.06 mm", look: "Invisible", life: "2–4 mo", breath: "Poor", use: "Photo-critical, short-term" },
  { base: "PU / skin 0.08–0.12 mm", look: "Very natural", life: "4–6 mo", breath: "Poor", use: "Easiest to clean and re-bond" },
  { base: "Hybrid lace front + PU perimeter", look: "Natural front, easy edges", life: "6–10 mo", breath: "Good", use: "The workhorse — standardise here" },
]

export const compliance = [
  { item: "Entity", detail: "Run under Stackframe Studios Pvt Ltd (add object clause) or a separate proprietorship for liability isolation", cost: "₹5–10K", time: "1–2 wk", status: "todo" },
  { item: "GST", detail: "Beauty and wellbeing services (SAC 99972x) are 5% WITHOUT input credit since 22 Sep 2025 (Notif. 9/2025). IGST on imports and GST on rent are now a cost, not a credit. Register at ₹20L, or earlier for invoice credibility. CA question: is an install a service (5%, no ITC) or a supply of goods under HSN 6704 (likely 18% with ITC)? The answer decides pricing and import economics.", cost: "Free", time: "7 d", status: "todo" },
  { item: "IEC", detail: "Needed to import from China", cost: "Free", time: "2 d", status: "todo" },
  { item: "Shop & Establishment (Haryana)", detail: "Applies only to establishments with 20+ workers since the Feb 2026 amendment. Keep Code on Wages registers (wage register, slips, attendance) from the first hire. ESI at 10 employees, EPF at 20.", cost: "—", time: "—", status: "na" },
  { item: "Trade licence (MCG)", detail: "Salon/clinic-type premises", cost: "₹2–10K", time: "2–4 wk", status: "todo" },
  { item: "Trademark", detail: "Class 44 (services) + Class 26 (hair goods); MSME fee ₹4,500/class", cost: "₹10–20K", time: "12–18 mo (application no. in days)", status: "todo" },
  { item: "Udyam / MSME", detail: "Free, unlocks fee discounts", cost: "Free", time: "10 min", status: "todo" },
  { item: "Insurance", detail: "Public liability + professional indemnity, ₹5–10L cover", cost: "₹8–15K/yr", time: "1 wk", status: "todo" },
  { item: "Client consent & photos", detail: "Written consent, secure storage (DPDP Act); first-name-only reviews", cost: "—", time: "—", status: "todo" },
  { item: "Hygiene protocol", detail: "Sterilisation, disposable capes/gloves, 48-hr adhesive patch test", cost: "₹5–10K", time: "—", status: "todo" },
  { item: "Wages floor", detail: "Haryana skilled minimum wage ₹18,500/month from 1 Apr 2026. Technician fixed pay must clear this; commission sits on top. Contractor commission above ₹20K/yr attracts 2% TDS.", cost: "—", time: "—", status: "todo" },
  { item: "DPDP consent", detail: "Obligations enforceable 13 May 2027. Per-purpose consent (treatment record, marketing, publishing photos), withdrawable, recorded with notice version and timestamp. Built into the client record in phase 2.", cost: "—", time: "—", status: "todo" },
  { item: "Not required", detail: "CDSCO/drug licence, BIS, FSSAI. LMPC only if retailing packaged patches", cost: "—", time: "—", status: "na" },
]

export const launchPlan = [
  { phase: "Validate", weeks: "0–2", spend: "₹5–8K", actions: "Ads test, mystery-shop 4 competitors, manager + technician terms, IEC + GST" },
  { phase: "Samples", weeks: "2–5", spend: "₹40K", actions: "4 Indian + 2 Qingdao stock pieces, consumables kit, mannequin heads; wear-test" },
  { phase: "Home-visit soft launch", weeks: "4–10", spend: "₹20K", actions: "Serve Sectors 80–95 + Manesar from home visits; build first 10–15 maintenance clients; zero rent" },
  { phase: "Room", weeks: "8–12", spend: "₹60–90K", actions: "150–250 sq ft first-floor unit in Sector 83/84 (₹20–35K/mo, 2-mo deposit); chair, basin, private cabin, power backup" },
  { phase: "Inventory", weeks: "10–12", spend: "₹80–90K", actions: "10–12 systems across 8×6 and 9×7, two bases, #1B" },
  { phase: "Marketing", weeks: "10–24", spend: "₹60–80K", actions: "Google Business Profile + review system, JustDial/Sulekha, WhatsApp booking, ₹25–40K search ads, before/after reels, dermatologist referrals" },
  { phase: "Buffer", weeks: "—", spend: "₹1–1.2L", actions: "Two months of fixed costs untouched" },
]

export const risks = [
  { risk: "Technician leaves with clients", severity: "High", mitigation: "Base + maintenance revenue share vesting over 12 mo; manager owns every booking/phone number; train a second person on maintenance within 90 days" },
  { risk: "Demand in New Gurgaon slower than modelled", severity: "High", mitigation: "Ads test before lease; home-visit-first; South Delhi as fallback" },
  { risk: "Adhesive failures in monsoon", severity: "Medium", mitigation: "Ghost Bond Platinum / Walker Ultra Hold; 3-week cycle Jun–Sep; match base to sweat profile" },
  { risk: "Founder over-involvement hurts day job", severity: "Medium", mitigation: "Rule: founder does QC, hiring, marketing only; 10–15 hrs/week cap" },
  { risk: "Cash gap in slow summer", severity: "Medium", mitigation: "Prepaid annual maintenance plans (₹18–24K/12 visits); keep ₹1–1.5L reserve" },
  { risk: "Reputation in an embarrassment-driven category", severity: "Medium", mitigation: "No pressure selling; consent-only photos; private cabins; fix-first policy on complaints" },
  { risk: "Stock stuck in wrong sizes", severity: "Low", mitigation: "Standardise 2 sizes, 2 bases; cut down 8×10 stock" },
  { risk: "Import duty misclassification", severity: "Low", mitigation: "Declare 6704.20.10 with invoice; use a CHA for first shipment" },
]

export const manufacturingVision = [
  { stage: "Raw hair collection & sorting", where: "India (temples, village collectors)", advantage: "Yes — at the source" },
  { stage: "Processing (wash, cuticle align, colour)", where: "Chennai / Eluru / Kolkata; Xuchang", advantage: "Partly — Indian processors exist" },
  { stage: "Base materials (lace, mono, PU)", where: "Imported — Korea, Germany, China", advantage: "No — import" },
  { stage: "Ventilating (hand-knotting)", where: "Qingdao; small Delhi/Kolkata units", advantage: "Yes — 40–60 hrs/piece, labour cheaper than China" },
  { stage: "Cut, style, QC, pack", where: "Anywhere", advantage: "Yes" },
]

export const manufacturingSequence = [
  "Year 1: service only. Learn which bases and sizes sell; build 60–100 clients; buy from 2–3 suppliers.",
  "Year 1.5: move custom orders to one Qingdao factory under your label; private-label packaging.",
  "Year 2: hire 2–3 knotters in Delhi for repairs, re-knotting and small custom jobs. Source processed hair from Chennai.",
  "Year 2–3: 10-knotter unit (~40 pieces/month) once own book + 3–5 wholesale studio clients justify 30+ pieces/month. Capital ₹8–15L. Finished cost ₹3–4K vs ₹6–9K wholesale.",
]
