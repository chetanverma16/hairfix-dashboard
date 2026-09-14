# Hairfix roadmap: from decision dashboard to business system

Status: Phase 1 shipped 14 Sep 2026. Phase 2 not started.

Written 14 Sep 2026 from four research passes (salon software features, studio operations, WhatsApp automation, Indian compliance and payments). Numbers marked [U] are unverified. Sources are at the end of each section.

## 0. Findings that change the plan

1. **GST on beauty services is 5% without ITC since 22 Sep 2025** (SAC 99972x, Notification 9/2025). The dashboard still says 18% and assumes voluntary registration recovers IGST on imports and ITC on rent. That logic is dead: at 5% there is no input credit. Import IGST on hair systems becomes a real cost, so landed cost and margins need a rework. Whether an install is a service (5%, no ITC) or a supply of goods (HSN 6704, probably 18% with ITC [U]) depends on how the invoice is structured. **CA question one.**
2. **Haryana Shops and Establishments Act now applies only at 20+ workers** (amended Feb 2026). The compliance checklist marks it mandatory. Drop it, keep Code on Wages registers. ESI kicks in at 10 employees, EPF at 20.
3. **Haryana skilled minimum wage is ₹18,500/month** from 1 Apr 2026. Technician fixed pay must be at or above this, commission on top.
4. **DPDP Act obligations bite on 13 May 2027.** Photos, phone numbers and alopecia or chemo notes are personal data. Consent must be per purpose (treatment record, marketing, publishing before/after) and withdrawable. Build consent capture into the client record from day one rather than retrofit.
5. **WhatsApp automation costs almost nothing at our scale.** Meta Cloud API direct: utility ₹0.115, marketing ₹0.86 per message. 300 clients at 6 utility messages a month plus 300 marketing sends is about ₹470 plus GST a month. Every BSP platform fee (₹1,500 to 6,000 a month) dwarfs the message spend. Nothing on the Vercel Marketplace covers WhatsApp templates.
6. **No salon product tracks a hair system as a unit.** Zenoti, Fresha, Vagaro, Salonist, MioSalon and Dingg all stop at client, appointment, membership, inventory. Per-client system spec, unit lifecycle (ordered, in stock, fitted, retired) and reattachment cadence are the gap and the reason to build rather than buy.
7. **Consumables are ~₹400 to 500 of adhesive per bond** plus remover, protector and shampoo. Walker Ultra Hold 1.4 oz ₹1,450 for 3 to 4 bonds. Track back-bar consumption per service or margins drift unnoticed.
8. **Replacement cycles are shorter than the model assumes** for thin bases: ultra-thin skin 1 to 2 months, thin skin 2 to 3, lace 2 to 6, mono 6 to 12. Indian studios quote mono 10 to 12 months. Plan revenue by base type, not one 9 to 12 month cycle.

## 1. Phases

Each phase ships as its own set of commits and deploys. A phase starts only when the business is at that stage, so dates are anchored to business events, not calendar weeks.

### Phase 0: Decision dashboard (done)

Static research pages, single data file, Vercel Authentication. Live at hairfix-dashboard.vercel.app.

### Phase 1: Validate (now, before any lease)

Business trigger: the ads test and mystery shops start this week.

Build:
- **Database.** Neon Postgres via the Vercel Marketplace, Drizzle ORM with committed migrations, lazy client so static builds still pass. Server Actions for writes, no API routes. One `requireUser()` helper that returns a fixed owner today and becomes a real login later.
- **Leads and campaigns.** `campaigns` (Google Ads test, later JustDial, referrals) and `campaign_days` (spend, impressions, clicks). `leads` with phone, source campaign, status (new, replied, consulted, installed, lost), next follow-up, notes. Ads test page shows the funnel and progress against the 15-enquiry target. Every enquiry is a lead row, never just a count, because leads become clients.
- **Competitors and visits.** `competitors` seeded from the eight in the data file. `competitor_visits` is the mystery-shop log: install price, maintenance price, bases offered, cabin privacy, upsell pressure, products used, lead time, notes. Comparison grid across visits.
- **Suppliers and samples.** `suppliers` seeded from the twelve Indian and Chinese names. `supplier_samples`: item, spec, ordered on, received on, landed cost, wear-test days, verdict. Status board per supplier.
- **Interactive model.** Pure function in `src/lib/model.ts`, unit tested. Sliders for install price, maintenance price, visits per client per month, churn, install ramp, rent, technician, manager, marketing, capital. Add GST at 5% without ITC and import IGST as inputs. Outputs: break-even month, lowest cash point against the ₹5L cap, year-1 P&L, clients at month 12. Existing scenarios plotted as reference lines.
- **Data corrections.** GST row to 5% without ITC with the classification question flagged. Shops and Establishments row to "not until 20 staff". Landed cost table gets IGST as a cost line. Competitor table gains published prices found (Lynx ₹1,500 to ₹37,000, 9×7 mono ₹26,000; Malhotra ₹600 servicing; Veronica 20% off 6 or 12 month packages). Every new number carries a source and an as-of date.

Not in phase 1: any login beyond Vercel Authentication, WhatsApp sending, invoices, payments.

### Phase 2: Operate (first paying client to first 30)

Business trigger: the first home-visit install is booked.

Build:
- **Clients.** Profile, phone, WhatsApp opt-in per channel, referral source, allergies and patch-test result, `consents` table (purpose, notice version, timestamp, channel, withdrawn at). Photos in Vercel Blob private storage tagged with purpose and expiry. Lead converts to client in one action.
- **Hair system spec and units.** `hair_system_specs` versioned per client: base type, skin thickness, size or template ref, front contour, base colour, hair type, length, density, curl, colour code, grey percent, knot type, bleached knots, hair direction, attachment method, expected life months. `hair_system_units`: spec, source (stock, custom, in-house), supplier, cost, ordered, received, fitted, retired, retire reason, warranty expiry.
- **Service catalogue and visits.** `services` with duration and consumables list: consultation and template (30 to 45 min), install and cut-in (90 to 180), maintenance re-bond (60 to 120), full service (90 to 150), cut only, repair, replacement. `visits`: client, service, unit, technician, date, products consumed, photo, next due date. The next-due date drives everything downstream.
- **Calendar.** Day and week view per technician, home-visit flag with address, status (booked, confirmed, done, no-show). No online self-booking yet; the manager books from WhatsApp conversations.
- **Invoices.** GST-compliant tax invoice: FY-scoped gapless counter under 16 characters, per-line SAC or HSN with rate, CGST and SGST split, customer name and address mandatory at ₹50,000 and above, goods and services on separate lines, issued invoices immutable, credit notes linked to the original. PDF generation.
- **Payments.** Razorpay payment links per invoice, idempotent on invoice id, webhook-verified, invoice marked paid only on captured webhook. Snapmint cardless EMI for ₹20 to 45K tickets. Store order id, payment id, method, fee, settlement UTR.
- **WhatsApp, utility only.** Meta Cloud API direct on a new studio number with Coexistence so the manager keeps using the WhatsApp Business app as the inbox. `messages` table logs every send with template, category, status. Templates: opt-in confirmation, consult confirmed, appointment reminder 24h and 2h with confirm and reschedule buttons, post-service check-in at 3 days, maintenance due at 28 days, payment link, payment received. Cron on Vercel triggers reminders. Business verification with the GST certificate on day one.
- **Manager login.** Two roles, owner and manager. Auth via the Vercel Marketplace auth path. Owner sees everything, manager sees operations and clients but not the research and model pages or wage data.
- **Staff, minimal.** `staff` with role, skill category, fixed pay, commission rules. Commission ledger written per visit. No payroll yet.

### Phase 3: Retain and grow (30 to 100 clients)

Business trigger: the room is signed and a second technician is hired.

Build:
- **Plans and memberships.** Prepaid annual maintenance (₹18 to 24K for 12 visits), discount memberships, install plus N services bundles. Fields: visits per month, systems per year, minimum term, member price for extra visits, pause, failed payment state, expiry report. UPI AutoPay via Razorpay Subscriptions for monthly plans (₹15,000 per-debit cap fits).
- **Inventory.** Units as stock with reserved and installed states, reorder points per size and base, consumables with per-service deduction and low-stock alerts, supplier purchase orders with lead times.
- **Marketing automation.** Lead follow-up sequences at 24h and 72h (marketing category, consent required), review request at 2 days (neutral wording, no incentive), lapsed-client win-back past cadence, seasonal and referral campaigns to opted-in clients only. Suppression list honoured on STOP.
- **KPIs.** Rebooking rate (target 65 to 85%), cadence adherence (share of clients seen within their next-due window), 90-day retention, average ticket, no-show rate (target under 6%), membership attach rate, systems per client per year, unit gross margin, technician utilisation.
- **Payroll and compliance.** Monthly wage register and slips, attendance and overtime, commission statements, TDS flag at ₹20K contractor commission, headcount alerts at 10 and 20. GSTR-1 export with B2C aggregated by rate. Turnover tracker with alerts at ₹20L and ₹5 crore.
- **Data rights.** Client data export, erasure that scrubs PII but keeps invoice records, audit log of record reads kept one year, breach incident template with a 72-hour clock.

### Phase 4: Scale (second outlet, manufacturing)

Business trigger: first outlet funds a manager you do not supervise.

Build:
- **Multi-location.** Outlet on every operational table, per-outlet pricing, stock transfers, consolidated owner dashboard.
- **Repairs and work orders.** Hair addition, base repair, re-knotting jobs with status and turnaround, first for outsourced repair, then for the in-house knotters.
- **Manufacturing.** Bill of materials per spec, knotter time per piece, raw hair lots, finished cost versus wholesale, wholesale customers as a client type.
- **Online booking and client self-service.** Booking link, plan status, invoices, consent management from the client side.

## 2. Data model, all phases

Core entities and their owners by phase. Every table has id, created_at, updated_at, and from phase 4 an outlet_id.

| Entity | Phase | Notes |
|---|---|---|
| campaigns, campaign_days | 1 | Ads test and later channels |
| leads | 1 | Converts to client |
| competitors, competitor_visits | 1 | Market watch |
| suppliers, supplier_samples | 1 | Later purchase_orders hang here |
| clients, consents, client_photos | 2 | DPDP-shaped from day one |
| hair_system_specs, hair_system_units | 2 | The differentiator |
| services, visits, visit_products | 2 | next_due_date on visits |
| appointments | 2 | Calendar |
| invoices, invoice_lines, credit_notes | 2 | Immutable after issue |
| payments, payment_links | 2 | Razorpay webhooks |
| messages, message_templates | 2 | WhatsApp log |
| users, roles | 2 | Owner, manager |
| staff, commission_ledger | 2 | Payroll in 3 |
| plans, client_plans, mandates | 3 | Memberships |
| products, stock_movements, purchase_orders | 3 | Inventory |
| audit_log, data_requests | 3 | DPDP rights |
| outlets | 4 | Multi-location |
| work_orders, bom, hair_lots | 4 | Repairs, manufacturing |

## 3. Stack additions

| Need | Choice | Why |
|---|---|---|
| Database | Neon Postgres via Vercel Marketplace, Drizzle ORM | Preferred provisioning path, env vars injected, free tier covers years at this scale, migrations committed |
| Files | Vercel Blob, private access | Client photos must never be public by default |
| Auth (phase 2) | Vercel Marketplace auth provider | Two users, avoid hand-rolled sessions |
| WhatsApp | Meta Cloud API direct, Coexistence | Cheapest by far; MSG91 as fallback if embedded signup lacks Coexistence |
| Payments | Razorpay | Payment links, Snapmint EMI, UPI AutoPay, WhatsApp-native payments; Cashfree as alternative for 0% on first ₹20L |
| Scheduling | Vercel Cron | Reminders and due-date jobs |
| PDF | React-based PDF renderer in a server action | Invoices and consent forms |

## 4. Decisions needed before phase 1 code

1. Approve provisioning Neon through the Vercel Marketplace (free tier, on your Vercel billing).
2. Confirm the phase split above, or move items between phases.

## 5. Decisions needed before phase 2 code

1. WhatsApp: Meta direct with Coexistence (recommended) or a BSP for a hosted inbox.
2. Payment gateway: Razorpay (recommended) or Cashfree.
3. A new studio phone number for WhatsApp Business, not a personal number.

## 6. Questions for the CA before phase 2

1. Goods versus service classification of an install, and the current rate for HSN 6704.
2. Whether any Haryana registration remains below 20 workers.
3. Skill category for hair technicians under the Haryana wage schedule.
4. Whether the 5% no-ITC regime or a goods-led 18% structure is better given import volumes.

## 6a. AI voice calling: complement to WhatsApp, not a replacement

Researched 14 Sep 2026. Costs are list prices; Hindi quality claims are vendor claims.

**What it costs.** Indian platforms (Bolna, Caller Digital, Ravan, Gnani, Exotel AI) bundle telephony, speech and the model at roughly ₹4 to 9 per minute all-in; Bolna is the cheapest published at ₹4 to 6 at volume. US platforms (Vapi $0.05, Retell $0.07, ElevenLabs $0.08 per minute platform fee) land at $0.13 to 0.32 per minute fully loaded and need an Indian telephony partner (Exotel, Plivo, Ozonetel) for a local caller ID, which adds ₹0.60 to 1.50 per minute plus number rental. At 300 clients and 2 calls per client a month of 90 seconds each, that is about 900 minutes, so ₹4,000 to 8,000 a month on an Indian platform. WhatsApp for the same volume is under ₹500. Sarvam is the Indic speech layer several of these run on, not a product you deploy directly.

**Rules for outbound calls.** TRAI's TCCCPR amendments of Feb 2025 apply to calls in a way they do not to WhatsApp. Promotional calls must go out on 140-series numbers after scrubbing against the DND registry; transactional and service calls on 160-series numbers. Explicit consent for a transaction is valid 7 days; inferred consent lasts as long as the client relationship. Robocalls and auto-diallers must be disclosed to the telecom provider in advance, and TRAI has signalled AI-disclosure rules are coming. Call recording needs upfront, specific consent under the DPDP rules. India is the most spam-called market in the world (95% of users report daily unwanted calls), so an unknown number calling about hair loss is a trust problem in an embarrassment-driven category.

**Where a call beats a message.** Speed to lead: a callback inside 5 minutes converts far better than one after 30 (the widely cited MIT/InsideSales figures are 21x more likely to qualify; treat as directional). An AI agent that calls a new ad lead back within a minute, in Hindi, and books a consultation is the single strongest use. Appointment confirmation calls also work: healthcare campaigns report 94% confirm or reschedule on a 60 to 90 second AI call. No-show recovery is the third.

**Where WhatsApp wins.** Maintenance-due reminders, post-service check-ins, payment links, review requests. These are asynchronous, cheap, silent, and leave a written record the client can act on later. Indian clinic playbooks consistently put WhatsApp first for follow-up and rebooking.

**Verdict for this studio.**

| Use case | Channel | Why |
|---|---|---|
| New ad lead, first contact | WhatsApp reply within the free 72-hour window, then AI call if no reply in 10 minutes | Speed matters; the lead started on WhatsApp so the number is expected |
| Consultation booking | AI call or manager call | Conversation converts better than a form |
| Appointment reminder 24h and 2h | WhatsApp with confirm button; AI call only if no confirmation by 2h | Cheap first, voice as escalation |
| No-show recovery | AI call same day, in Hindi | A message is easy to ignore after embarrassment |
| Maintenance due at day 28 | WhatsApp | Routine, written, low cost |
| Post-service check-in at day 3 | WhatsApp | Client may not want to talk about it |
| Payment link, receipt | WhatsApp | Needs a tappable link |
| Review request | WhatsApp | Needs a tappable link |

**Build order.** Phase 2 ships WhatsApp only. Phase 3 adds AI calling for two flows: lead callback and no-show recovery, on an Indian platform with a 160-series number, Hindi-first, with a "press 1 to talk to a person" escape and recording consent at the top of the call. Provider is chosen then, after a trial of two platforms on 50 real leads. The `messages` table gains a `channel` of `call` and stores transcript and outcome so calls and messages share one timeline per client.

Sources: myoperator.com and caller.digital India voice AI comparisons 2026, dvaarik.com pricing index, ravan.ai cost guide, bolti.co.in on Bolna pricing, retellai.com and medium.com Vapi/Retell/Bland cost comparisons, cloudtalk.io Exotel pricing, securiti.ai and ssrana.in on the TCCCPR 2025 amendments, rootle.ai on voice AI compliance, frejun.com on call recording, theprint.in LocalCircles spam survey, getnextphone.com and clientmagnet.in on speed to lead, scalifylabs.com and engageoagency.com on Indian clinic reminders.

## 7. Sources

Software features: zenoti.com, fresha.com/for-business/features, support.vagaro.com (memberships, failed payments), miosalon.com/features, dingg.app, salonist.io, lordhair.com/how-to-order-hair-systems, superhairpieces.com/hair-system-subscription-program, hairclub.com cost page, meevo.com KPI guide.

Operations: newtimeshair.com and superhairpieces.com bonding guides, hairweavon.com template guide, lordhair.com lifespan guide, IndiaMART and Flipkart listings for Walker and Ghost Bond, rituhairwigs.com, lynxhairskin.in products, malhotrahair.in, veronicahairreplacement.com, advanceclinic.in, majesticderma.com, nilehaircare.com rate guide, apna.co technician postings.

WhatsApp: developers.facebook.com/docs/whatsapp (pricing, messaging limits, phone numbers, template guidelines, opt-in, coexistence migration, payments), msg91.com/in/pricing/whatsapp, aisensy.com/pricing, interakt.shop/pricing, wati.io/en/pricing, gupshup.ai/pricing, twilio.com/en-us/whatsapp/pricing, vercel.com/marketplace?category=messaging, ycloud.com and respond.io on the Oct 2026 service-message change.

Compliance and payments: taxgarden.in 5% guide, finodha.in Notification 9/2025, gimbooks.com Rule 46 checklist, cleartax.in composition, einvoice6.gst.gov.in B2C QR, razorpay.com/pricing, cashfree.com/payment-links, developer.phonepe.com payment links, razorpay.com Snapmint docs, PIB DPDP backgrounder, sansalegal.com phased timeline, consentos.in breach rules, scconline.com WhatsApp and DPDP, sigmachambers.in TCCCPR 2025, sgcms.com Haryana minimum wage Apr 2026, lawrbit.com and khaitanco.com on the Haryana S&E amendment, roharyana.esic.gov.in coverage, ksandk.com Code on Wages guide.
