# RoofToGrid — Business Model

Status: Living document
Last updated: 2026-07-29

---

## 1. Why this can be a business

Rooftop solar is a high-ticket, low-frequency, high-anxiety purchase. Homeowners spend ₹1.5–6 lakh once and
have no way to judge whether they were treated fairly. Installers spend heavily on lead generation and lose
deals to opaque price competition. RoofToGrid sits between them and gets paid for reducing that friction —
but only in ways that do not require lying to the homeowner.

**Non-negotiable:** revenue never depends on suppressing a red flag or inflating an estimate. Every monetised
surface is downstream of a recommendation the homeowner can audit.

---

## 2. Revenue streams

### 2.1 Installer referral commissions (primary, Phase 2)

A fee per qualified lead or per closed project, paid by the installer.

- **Model:** 1.5–3% of contract value on closure, or ₹1,500–4,000 per qualified lead in a bidding pool.
- **Why it works:** installer CAC in India runs ₹8,000–20,000 per closed customer through ads and channel
  partners. A lead with a validated bill, a roof profile, and a chosen system size closes far faster.
- **Trust guardrail:** ranking is by value score and delivered reputation, never by fee paid. Fee tiers do not
  affect ordering, and paid placement, if ever introduced, must be labelled and separated from ranked results.
- **Recognition:** on commissioning (`NET_METERING_ACTIVE`), which aligns our revenue with the homeowner
  actually getting a working system.

### 2.2 Premium quote review (early revenue, late Phase 1 / Phase 2)

Paid, deeper analysis for homeowners at the decision point.

- **Model:** ₹499–1,499 one-time per review; ₹2,999 for an expert-reviewed report.
- **Contents:** line-item audit of each quote, brand-level reliability notes, contract clause risks (escalation
  terms, warranty exclusions, AMC gaps), a negotiation brief with specific asks, and a P50/P90 generation
  estimate.
- **Why it works:** willingness to pay peaks when ₹3 lakh is about to be committed and the buyer has 3
  confusing PDFs. The free comparison creates the need; the review resolves it.
- **This is the cleanest stream:** the homeowner pays us, so our incentive is unambiguous.

### 2.3 SaaS for installers (Phase 2–3)

- **Model:** ₹2,500–15,000/month per installer by seat and pipeline volume; annual contracts.
- **Product:** lead pipeline and CRM, standardised proposal generation, DISCOM/subsidy paperwork tracking,
  fleet performance analytics, warranty and service desk, reputation dashboard.
- **Why it works:** small and mid EPCs run on WhatsApp and Excel. The workflow tool is sticky and gives us the
  data that makes reputation scoring credible.

### 2.4 O&M marketplace fees (Phase 3)

- **Model:** 10–15% commission on cleaning, AMC, and repair jobs booked through the platform.
- **Why it works:** a 25-year asset needs servicing; we already hold the warranty, serial, and performance
  data, and underperformance alerts are natural demand generation.

### 2.5 Financing referral (Phase 3)

- **Model:** 0.5–1.5% of disbursed loan value from lender partners.
- **Guardrail:** the financing comparison must show cash as an option and disclose effective APR, including
  when cash wins.

### 2.6 Data and benchmarks (Phase 3, opt-in only)

- **Model:** subscription access to anonymised, aggregated regional price/kWp indices, brand performance and
  failure rates, and DISCOM approval cycle times, sold to OEMs, lenders, and policy bodies.
- **Guardrail:** aggregate-only, k-anonymity thresholds, explicit opt-in, no resale of personal data.

### Stream maturity

| Stream | Phase | Payer | Gross margin | Defensibility |
|---|---|---|---|---|
| Premium quote review | 1–2 | Homeowner | 60–80% (expert time) | Medium |
| Installer referrals | 2 | Installer | 85–95% | High (demand aggregation) |
| Installer SaaS | 2–3 | Installer | 80–90% | High (workflow lock-in) |
| O&M marketplace | 3 | Homeowner | 85% | High (asset data) |
| Financing referral | 3 | Lender | 95% | Medium |
| Data products | 3 | Enterprise | 90%+ | High (proprietary corpus) |

---

## 3. Unit economics sketch (India, Phase 2 steady state)

| Metric | Assumption |
|---|---|
| Blended CAC (content + SEO + referral) | ₹350 per registered homeowner |
| Registered → project created | 8% |
| CAC per created project | ₹4,400 |
| Average contract value | ₹2,60,000 (≈5 kWp) |
| Referral commission at 2% | ₹5,200 |
| Premium review attach rate × price | 12% × ₹899 ≈ ₹108 per registration |
| Contribution per project | ≈ ₹5,200 + review revenue − ₹4,400 CAC − ₹400 service cost |
| Payback on CAC | Within the first commissioned project |

The sensitivity that matters is registered → project conversion. Every point of conversion is worth more than
any pricing change, which is why the funnel metrics below are the operating dashboard.

---

## 4. Key metrics

### 4.1 Funnel (the core instrument)

```
Visitor
  └─▶ Guest sizing completed          (Curious Homeowner activated)
        └─▶ Registered
              └─▶ Onboarding completed (profile + bill + roof)
                    └─▶ Sizing run saved
                          └─▶ ≥2 quotes entered   (Decisive Buyer activated)
                                └─▶ Quote selected
                                      └─▶ Project created
                                            └─▶ Installation complete
                                                  └─▶ Net metering active
                                                        └─▶ Generation logged 3+ months
```

| Metric | Definition | Phase 1 target |
|---|---|---|
| Guest sizing completion | visitors who see scenario cards | 35% of landing sessions |
| Guest → registered | registrations per completed guest sizing | 25% |
| Onboarding completion | profile + ≥1 bill + ≥1 roof profile | 60% of registrations |
| **Curious → Decisive** | users with ≥2 quotes ÷ users with ≥1 saved sizing run | 20% |
| **Decisive → Project created** | projects ÷ users with ≥2 quotes | 40% |
| **Project → Commissioned** | projects reaching `NET_METERING_ACTIVE` ÷ projects created | 55% |
| Median days to commissioning | `commissionedDate − project.createdAt` | ≤ 75 days |
| Monitoring retention | commissioned projects with a log in the last 45 days | 50% at month 3 |

### 4.2 Value-delivered metrics (our licence to monetise)

| Metric | Definition | Target |
|---|---|---|
| Savings/payback improvement vs baseline | payback of the selected quote vs the homeowner's first-received quote | ≥ 0.8 years better |
| Price/kWp delta | selected quote price/kWp vs median of that user's quotes | ≤ −4% |
| Estimate accuracy | first-year measured generation vs platform projection | within ±10% for 70% of projects |
| Red-flag catch rate | quotes where a flagged issue was renegotiated or the quote dropped | ≥ 30% |
| Trust NPS | post-commissioning survey | > 45 |

### 4.3 Health and cost

Sizing p95 latency, API error rate, upload failure rate, document storage GB per active user, infra cost per
active project (target < ₹15/month), support tickets per commissioned project.

### 4.4 Instrumentation note (Phase 1)

Phase 1 ships the data that makes these computable — `SizingRun` counts per user, `Quote` counts per user,
`Project.sourceQuoteId`, milestone completion dates, `GenerationLog` vs `expectedAnnualGenerationKwh` — but the
analytics pipeline itself is Phase 2. No third-party tracker is wired into the MVP.

---

## 5. Go-to-market (Phase 1 → 2)

1. **Content and SEO on the questions people actually type:** "is 3 kW enough for my house", "PM Surya Ghar
   subsidy amount", "is this solar quote fair". The free comparison tool is the landing surface.
2. **City-by-city depth, not national breadth.** One metro at a time so DISCOM specifics and installer
   coverage are genuinely accurate.
3. **Housing societies and resident associations** for clustered demand and word-of-mouth in dense pockets.
4. **Installer supply seeded manually:** 5–10 verified installers per city before enabling lead routing.
5. **The receipt loop:** commissioned homeowners get a shareable savings summary. Verified outcomes are the
   only marketing asset competitors cannot fabricate.

---

## 6. Moat

- **Standardised quote corpus.** A growing, normalised dataset of real quotes with prices, brands, warranties,
  and outcomes is not scrapeable.
- **Outcome-linked reputation.** Reputation tied to measured generation and milestone timeliness cannot be
  bought.
- **Full-lifecycle data.** Bill → sizing → quote → project → generation in one record makes estimate
  calibration compound over time.
- **Trust position.** Being the party that says "this quote is too cheap to be real" is a durable brand that
  ad-funded marketplaces structurally cannot occupy.
