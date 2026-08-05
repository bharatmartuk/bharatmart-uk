# NotebookLM Prompt — BharatMart Internship Review PPT

Use the attached sample deck style as visual reference:

`Precision_Hospitality_AI_Review.pdf.pdf`

Create a **new** internship review presentation for **BharatMart UK**, matching that sample’s **slide count, visual language, pacing, and layout patterns** — but with **BharatMart content only** (do not keep Flavio / hospitality AI wording).

---

## How to use in NotebookLM

1. Upload sources:
   - Your BharatMart internship report PDF (or `main.tex` export)
   - Optional: `ARCHITECTURE_PROMPT.md` / screenshots
   - The **style reference**: `Precision_Hospitality_AI_Review.pdf.pdf`
2. Paste the prompt below into NotebookLM (Generate → Slide deck / Briefing / custom instruct).
3. Ask it to match the reference deck’s design system exactly.

---

## Copy this prompt into NotebookLM

```text
You are generating a professional internship REVIEW slide deck (like a design-studio / product-engineering review), not a plain academic bullet deck.

STYLE REFERENCE (must match closely):
I attached a sample NotebookLM deck: “Precision Hospitality AI Review” (dark tech aesthetic).
Match that sample’s visual system:
- Dark charcoal / navy backgrounds
- Subtle code / blueprint / UI chrome textures in the background
- Accent colors: warm orange/gold highlights, supporting green and terracotta/red cards
- Monospaced / developer typography vibes for detail cards
- Use curly-brace { } panels, [ > item ] list styling, window chrome, dashed arrows, and ticket/card metaphors where helpful
- Big clear titles, short punchy statements, highlight 2–4 key words in orange
- Prefer diagrams and comparison layouts over dense paragraphs
- Landscape slides, ~12–14 slides total (same density as the sample)

PROJECT / PERSON DETAILS (use exactly):
- Intern: Sai Manjith Paripelli
- ID: B210840
- Faculty reviewer: Uddamari Nagamani
- HOD: Mr. B Venkat Raman
- Role title on slides: Full Stack Engineer Intern
- Organisation: BharatMart.uk
- Project: BharatMart UK — Multi-Merchant Grocery Marketplace
- Mentor: Uday Kumar Kadiyam
- College: RGUKT Basar
- Internship window: 15 June 2026 – 30 July 2026
- Work shown till: 23 July 2026
- Repo: https://github.com/bharatmartuk/bharatmart-uk
- Site: https://bharatmart.uk

CONTENT RULES:
- Be accurate to a full-stack marketplace internship (Next.js monorepo, Prisma, Auth.js, Stripe, Cloudinary, Vercel).
- Do NOT invent ML models, LLM agents, embeddings, or agentic AI product features.
- Search/recommendations may be described as heuristic fuzzy ranking / popularity ranking only.
- Emphasize ownership of customer web + UI/UX + shipping/production hardening.
- Keep British English spelling (favourites, colour, organisation).

SLIDE PLAN (follow this structure; mirror the sample’s narrative arc):

SLIDE 1 — Title
- Big title: “BharatMart UK — Multi-Merchant Grocery Marketplace”
- Subtitle: “Professional Internship Review: Building and shipping a production storefront”
- Intern card (bottom-left window chrome): Sai Manjith Paripelli · Full Stack Engineer Intern
- Meta (bottom-right): BharatMart.uk · 15 June – 30 July 2026 · (Work shown till 23 July)
- Hero visual metaphor: marketplace / grocery / checkout UI collage or monorepo architecture vignette (not Flavio receipt)

SLIDE 2 — Problem framing (like “The Pre-Order Blind Spot”)
- Title idea: “The Fragmented Grocery Discovery Problem”
- Top callout: Without a unified marketplace, shoppers rely on WhatsApp/single shops → missed discovery + unclear delivery eligibility
- Left: chaos (fragmented channels)
- Right: structured marketplace signals { Categories } { Search } { Postcode delivery } { Multi-merchant cart }
- Bottom goal: “The BharatMart Goal: Trusted UK Indian grocery commerce with local delivery awareness.”

SLIDE 3 — System arc (like “Intelligence to Operations Arc”)
- Title: “Browse → Locate → Checkout Arc”
- Three stages:
  1) Input: catalogue + UK postcode + search intent
  2) Engine: Next.js apps + shared services/Prisma domain layer
  3) Output: filtered products, cart/wishlist, Stripe/COD multi-merchant orders
- Show outputs as “tickets/cards” for Customer / Merchant / Admin

SLIDE 4 — Role streams (like “One Role, Three Streams”)
- Title: “One Role, Three Streams of Execution”
- Subtitle: “Primary ownership of customer web, supported by platform delivery.”
- Three columns:
  1) Storefront UI/UX (header, mobile nav, hero, product pages, favourites)
  2) Full-Stack Commerce (auth, cart, wishlist, checkout, Stripe/COD, orders)
  3) Platform & Ops (Cloudinary, admin CMS hooks, Vercel/Auth/Prisma hardening, rate limits)

SLIDE 5 — Timeline topography (like “Six Weeks of Impact”)
- Title: “Six+ Weeks of Impact Topography”
- Map June 15 → July 23 with peaks:
  - Foundation (15–30 Jun)
  - Core build (1–17 Jul)
  - [PEAK] Monorepo ship / Vercel stabilise (18 Jul)
  - CMS + demo data (19 Jul)
  - [PEAK] Mobile/wishlist/search UX (20 Jul)
  - Media/info pages/Cloudinary (21 Jul)
  - Admin/bulk/rate-limits polish (22 Jul)
  - [PEAK] Postcode gate + favourites CTA (23 Jul)
- Footer note: Remaining week 24–30 Jul = QA, report, demo scripting

SLIDE 6 — Architecture
- Title: “Monorepo Architecture at a Glance”
- Show apps/web, apps/merchant, apps/admin → shared packages → PostgreSQL/Prisma + Cloudinary + Stripe + Auth.js + Vercel
- Keep it diagram-first

SLIDE 7 — Signature feature deep-dive #1
- Title: “UK Postcode Gate & Delivery Filtering”
- Flow: modal soft-gate → location chip/cookie → filter merchants by deliveryPostcodes → filtered storefront
- Note logged-in users use saved address; guests may skip

SLIDE 8 — Signature feature deep-dive #2
- Title: “Commerce Path That Ships”
- Cart + wishlist auth gates with resume-after-login
- Checkout stepper Address → Payment → Review
- Stripe PaymentIntents + COD
- One customer order → per-merchant MerchantOrders
- Product page CTA: Add to favourites (not chat-with-seller)

SLIDE 9 — Discovery stack
- Title: “Search Without Overclaiming AI”
- Header suggest API: autocomplete vs recommended products
- Fuzzy relevance ranking (prefix/token/subsequence heuristics)
- Popularity recommendations when query empty
- Explicit line: “Heuristic ranking — not trained ML / not LLM agents”

SLIDE 10 — Production hardening
- Title: “What It Took to Make It Live”
- Vercel multi-app deploy
- Prisma engine bundling
- Auth URL / cookie-prefix login bounce fixes
- Cloudinary uploads for serverless
- Rate limits, ESLint/build fixes
- Result callout: “Storefront stays deployable and operable.”

SLIDE 11 — Outcomes / evidence
- Title: “Delivered Outcomes”
- Grid of objective → outcome cards:
  Storefront UX, Discovery, Delivery awareness, Commerce, Media/CMS, Production
- Optional mini metric-style cards (qualitative is fine): end-to-end purchase path, mobile-ready chrome, deployable monorepo

SLIDE 12 — Key learnings (2x2 cards like sample)
- // Product ownership
- // UX under commerce constraints
- // Platform reality (auth/media/deploy)
- // Honest scoping (heuristics ≠ ML theatre)

SLIDE 13 — Next steps & close
- Immediate (24–30 July): final QA, report polish, demo script
- Future: server-synced wishlist, review write flow, stronger personalisation later, E2E tests, merchant coupon UI
- Closing card: Thank you · Sai Manjith Paripelli · B210840 · Questions welcome
- Include GitHub + bharatmart.uk
- Faculty reviewer: Uddamari Nagamani · HOD: Mr. B Venkat Raman · Mentor: Uday Kumar Kadiyam

OUTPUT REQUIREMENTS:
- Produce a complete slide deck in the same NotebookLM visual style as the attached Precision Hospitality sample.
- Every slide should feel designed (diagrams/cards), not a wall of text.
- Keep claims truthful to BharatMart full-stack internship work.
```

---

## Optional short follow-up (if NotebookLM drifts)

```text
Revise the deck to more closely match the Precision Hospitality sample:
more dark UI chrome, orange keyword highlights, brace/card layouts, fewer plain bullets.
Remove any invented LLM/agent features. Keep Full Stack Engineer Intern framing.
```

---

## Suggested source blurb to paste as an extra NotebookLM source

If NotebookLM needs a text source besides the report, paste this:

```text
BharatMart.uk internship project summary for Sai Manjith Paripelli (B210840), Full Stack Engineer Intern, mentored by Uday Kumar Kadiyam. Faculty reviewer: Uddamari Nagamani. HOD: Mr. B Venkat Raman. Duration 15 June 2026 to 30 July 2026 (work shown till 23 July). Built customer marketplace in a Turborepo/pnpm monorepo with Next.js 15 apps (web, merchant, admin), Prisma/PostgreSQL, Auth.js, Zustand cart/wishlist, fuzzy search ranking, UK postcode delivery filtering, Stripe + COD checkout with multi-merchant orders, Cloudinary media, admin banner/category CMS support, and Vercel production hardening. GitHub: https://github.com/bharatmartuk/bharatmart-uk
```
