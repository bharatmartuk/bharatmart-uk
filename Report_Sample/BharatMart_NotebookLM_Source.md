# BharatMart UK — Internship Project Source Document

**Purpose:** Upload this file as a NotebookLM source for generating the internship review slide deck and related materials.

---

## 1. Intern and internship details

| Field | Value |
|--------|--------|
| Intern full name | Sai Manjith Paripelli |
| Student ID | B210840 |
| College | Rajiv Gandhi University of Knowledge Technologies (RGUKT), Basar |
| Course | B. Tech. (Computer Science and Engineering) |
| Role during internship | Full Stack Engineer Intern |
| Organisation | BharatMart.uk |
| Website | https://bharatmart.uk |
| GitHub repository | https://github.com/bharatmartuk/bharatmart-uk |
| Industry mentor | Uday Kumar Kadiyam (Mentor, BharatMart.uk) |
| Faculty reviewer | Uddamari Nagamani |
| Head of Department | Mr. B Venkat Raman |
| Internship start | 15 June 2026 |
| Internship end | 30 July 2026 |
| Work covered in review materials | Till 23 July 2026 |
| Remaining close-out window | 24–30 July 2026 (QA, report, demo) |
| Mode | Product internship on a live marketplace codebase |
| Stipend | Unpaid (as applicable to programme) |

**One-line pitch for slides:**  
During my internship at BharatMart.uk, I owned end-to-end delivery of the customer marketplace storefront — UI/UX and full-stack — including discovery, UK postcode delivery filtering, cart/wishlist, multi-merchant checkout, and production deployment on Vercel.

---

## 2. About the organisation and product

**BharatMart.uk** is a UK-focused online marketplace connecting shoppers with independent Indian grocery and homemade-food merchants. The platform aims to make authentic regional products discoverable with:

- Clear seller / store identity
- Local delivery expectations by UK postcode
- Secure checkout and payments
- A modern, mobile-friendly shopping experience

The product is organised as a **monorepo** with three applications sharing one backend domain layer and database.

---

## 3. Problem statement

Customers shopping for specialty Indian groceries in the UK often face:

1. Fragmented discovery via WhatsApp groups and single-shop websites  
2. Unclear whether a merchant delivers to their postcode  
3. No unified multi-merchant cart and checkout  
4. Inconsistent branding and mobile UX  

Merchants need onboarding, catalogue tools, and order handling. Operators need verification workflows and homepage CMS.

**BharatMart goal:** Trusted UK Indian grocery commerce with local delivery awareness, multi-merchant checkout, and a polished customer storefront.

---

## 4. Internship ownership and role framing

**Role title to use on slides:** Full Stack Engineer Intern  

**Primary ownership:** `apps/web` — the customer-facing marketplace  

**Also contributed to / supported:**

- Shared packages used by all apps (`packages/services`, `packages/database`, `packages/auth`, `packages/ui`, `packages/utils`, `packages/validation`)
- Admin CMS hooks for banners and categories
- Merchant media / document upload paths (Cloudinary)
- Production hardening for Auth, Prisma, ESLint, and Vercel deploys

**Three streams of execution (for “one role, three streams” slide):**

1. **Storefront UI/UX** — branding, header, categories nav, hero carousel, mobile nav, product pages, favourites CTA, sticky filters  
2. **Full-stack commerce** — auth, catalogue, search, cart, wishlist, postcode location, checkout, Stripe/COD, multi-merchant orders  
3. **Platform & ops** — Cloudinary media, rate limits, seed/demo data, admin marketplace tools, Vercel/Auth/Prisma production fixes  

**Important accuracy rule for AI-generated slides:**  
Do **not** claim trained ML models, embeddings, LLM chatbots, or agentic AI product features. Search uses **heuristic fuzzy ranking** and popularity sorting — not machine learning models.

---

## 5. System architecture

### 5.1 Applications

| App | Path | Audience | Responsibility |
|-----|------|----------|----------------|
| Customer web | `apps/web` | Shoppers | Browse, search, location, cart, wishlist, checkout, account |
| Merchant portal | `apps/merchant` | Sellers | Onboarding, products, orders, store settings, delivery postcodes |
| Admin console | `apps/admin` | Operators | Merchant verification, banners CMS, categories, orders, support |

### 5.2 Shared packages

| Package | Role |
|---------|------|
| `@bharatmart/database` | Prisma schema, PostgreSQL access, seeds/scripts |
| `@bharatmart/services` | Domain services + repositories (server-only) |
| `@bharatmart/auth` | Auth.js v5 shared config / middleware |
| `@bharatmart/ui` | Shared UI components (shadcn-style) |
| `@bharatmart/utils` | Postcode helpers, fuzzy search rank, rate-limit, Cloudinary helpers |
| `@bharatmart/validation` | Zod schemas |
| `@bharatmart/types` | Shared types |
| `@bharatmart/config` | ESLint / TS / Tailwind presets |

### 5.3 Logical layers

1. **Presentation** — Next.js 15 App Router UIs  
2. **Application** — Server Actions + route handlers  
3. **Domain** — Product, Merchant, Order, Payment, Category, Review, Banner services  
4. **Data & integrations** — PostgreSQL (Prisma), Cloudinary, Stripe, Auth.js, Vercel  

### 5.4 Key domain concepts

- Prices stored in **GBP pence**
- Merchants declare **`deliveryPostcodes`**
- Product/merchant queries can filter by customer postcode so only deliverable sellers/products show
- Checkout creates one customer **Order** that fans out into per-merchant **MerchantOrder**s
- Auth.js sessions with role-scoped access across apps
- Cart and wishlist use **Zustand** on the client (wishlist is client-persisted; Prisma Wishlist model exists but UI sync to DB is not the main shipped path)

---

## 6. Technology stack

| Tool / Framework | Category | Role in the project |
|------------------|----------|---------------------|
| Next.js 15 | Web framework | App Router for web, merchant, admin |
| TypeScript | Language | End-to-end typed monorepo |
| Prisma + PostgreSQL | Data | Schema, queries, migrations |
| Auth.js v5 | Auth | Credentials + optional Google OAuth |
| Zod + React Hook Form | Validation / forms | Input schemas and form UX |
| Zustand | Client state | Cart and wishlist |
| Stripe | Payments | PaymentIntents + webhook finalisation |
| Cash on Delivery (COD) | Payments | Alternate checkout path |
| Cloudinary | Media | Product, banner, logo, document uploads |
| Turborepo + pnpm | Monorepo | Workspaces and task orchestration |
| Vercel | Hosting | Separate projects for web / merchant / admin |
| Tailwind + shared UI | Design system | Branded storefront components |
| Resend | Email | Contact / transactional patterns |
| Upstash Redis (optional) | Infra | Distributed rate limiting |

---

## 7. Customer journey (Browse → Locate → Checkout)

1. **Discover** — Homepage hero carousel, categories, featured merchants  
2. **Locate** — Guest UK postcode soft-gate (continue or skip); location chip in header; logged-in users use saved/default address  
3. **Browse** — Product listing with filters/sort/pagination; fuzzy search + autocomplete; product detail with gallery, reviews, related products  
4. **Save / Cart** — Add to favourites (wishlist); add to cart; auth gate with resume-after-login when required  
5. **Checkout** — Multi-step: Address → Payment → Review; Stripe or COD  
6. **Confirm** — Multi-merchant order creation; account / order history  

**Product detail CTA change:** Removed “Chat with Seller on WhatsApp”; replaced with **Add to favourites / Saved to favourites** beside Add to cart. Heart icon on image gallery remains.

---

## 8. Major features implemented

### 8.1 Storefront UI/UX

- Brand palette: cream `#FFF8F0`, brown-gold `#7F5700`, terracotta accents
- Site header: logo, categories, delivery location chip, search with gold search button, Become a Seller CTA
- Mobile bottom navigation + search sheet
- Hero carousel (CMS-driven banners)
- Category grid (including coming-soon states)
- Sticky product filters / sort on desktop
- Info pages: About, Contact, Privacy, Terms
- Favicon / branding consistency across apps

### 8.2 Discovery and search

- Header search suggest API
- Modes: **autocomplete** (when query present) and **recommended products** (when empty)
- Recommendations when empty query: popularity via review count / average rating
- Product search relevance: hand-tuned **fuzzy/string scoring** (prefix, contains, token, subsequence) — classical IR heuristics, **not** a trained ML model
- Related products: same-category listing

### 8.3 UK postcode / delivery filtering

- Guest **PostcodeGate** modal on first visit (soft gate; skip allowed)
- Cookie-based guest location; banner if skipped
- Logged-in users: postcode from default/saved address; no guest modal
- Header **LocationChip**
- Merchants/products filtered by `deliveryArea` / `deliveryPostcodes` when postcode is set
- UK postcode validation utilities in `@bharatmart/utils`

### 8.4 Cart, wishlist, auth

- Zustand cart store
- Zustand wishlist / favourites store
- Auth-required actions with pending-action hydrator (resume after login)
- Account area: addresses, order history

### 8.5 Checkout and payments

- Checkout client stepper: Address → Payment → Review
- Stripe PaymentIntents + webhook (`payment_intent.succeeded`)
- Cash on Delivery path
- Coupon validation on cart
- Multi-merchant order finalisation into `MerchantOrder`s

### 8.6 Media, CMS, and admin/merchant support

- Cloudinary for product images, banners, logos, merchant documents (server upload APIs suitable for Vercel)
- Admin: homepage carousel editing, category marketplace management (sortable / coming-soon), merchant verification review, orders, support tickets
- Merchant: product CRUD, stock adjuster, CSV bulk import, store settings including delivery postcodes, dashboard analytics charts
- Seed / wipe / demo cart hydrate scripts for marketplace demos

### 8.7 Production hardening (shipping reality)

- Separate Vercel deployments for marketplace, merchant, admin
- Prisma query engine bundling for monorepo production
- AUTH_SECRET / Turbo env passthrough
- AUTH_URL cookie-prefix fixes to stop login bounce loops
- ESLint / Next.js rule registration for successful builds
- Rate limiting for sensitive routes / bulk operations
- Em-dash cleanup in user-visible copy; favicon and logo fill fixes

---

## 9. Weekly timeline (15 June – 23 July 2026)

| Period | Focus | Key outcomes |
|--------|--------|--------------|
| 15–30 Jun | Foundation | Requirements, stack choice, UX direction, monorepo scaffolding |
| 1–17 Jul | Core build | Auth, catalogue, cart/checkout, shared packages, portal shells |
| 18 Jul | Ship (peak) | Monorepo milestone live; Auth/Prisma/Vercel production stabilisation |
| 19 Jul | CMS & demo | Homepage carousel admin, demo reseed, homepage cleanup |
| 20 Jul | UX & discovery (peak) | Mobile nav, wishlist, sticky filters, smarter search, branding |
| 21 Jul | Content & media | Info pages, categories expansion, Cloudinary product images |
| 22 Jul | Ops polish | Marketplace admin, bulk products, rate limits, favicon, uploads |
| 23 Jul | Location UX (peak) | Postcode delivery gate, header polish, favourites CTA on product page |
| 24–30 Jul | Close-out | QA, remaining commits, demo prep, internship report & presentation |

**Note on git history:** Public intensive shipping commits are concentrated around 18–22 July after a monorepo milestone push; earlier weeks include foundation and core build before that milestone. Work on 23 July includes postcode UX and favourites (may include local/uncommitted polish depending on push status).

---

## 10. Objectives mapped to outcomes

| Objective | Delivered outcome |
|-----------|-------------------|
| Storefront UI/UX | Branded responsive marketplace with mobile navigation |
| Discovery | Catalogue, filters, fuzzy search, recommendations |
| Delivery awareness | Postcode gate + merchant delivery filtering |
| Commerce | Cart, wishlist, multi-merchant checkout, Stripe/COD |
| Media & CMS | Cloudinary assets; admin banner/category tools |
| Production | Vercel deployments; auth, media, and build fixes |

---

## 11. Limitations and honest scope (do not overclaim)

- Wishlist UI is primarily **client Zustand** persistence; full server wishlist sync is a future enhancement  
- Customer **review write** flow is not the focus of this internship slice (reviews can be listed/read)  
- WhatsApp exists as support deep-links / float CTA on some surfaces — **not** a WhatsApp Business API bot and **not** an AI agent  
- No OpenAI/Anthropic/LangChain/embeddings/vector DB product features in the shipped codebase  
- Some admin/merchant pages remain placeholders (e.g. certain settings/users/analytics stubs) while core flows work  

---

## 12. Future enhancements

1. Server-synced wishlist and followed-store features using existing Prisma models  
2. Customer review submission + moderation  
3. Stronger personalisation later (learned ranking) on top of current fuzzy heuristics  
4. Merchant coupon management UI (cart coupon validation already exists)  
5. Automated end-to-end tests for checkout and postcode filtering in CI  
6. Expanded merchant analytics beyond current revenue charts  

---

## 13. Suggested demo script (for presentation)

1. Open homepage — hero, categories, featured merchants  
2. Enter UK postcode — see location chip and deliverable catalogue filtering  
3. Search a product — open product detail — **Add to favourites**  
4. Add to cart — proceed to checkout — show Address → Payment → Review (Stripe test or COD)  
5. Optional: admin banner edit or merchant verification glimpse  

---

## 14. Key learnings (for “learnings” slide)

1. **Product ownership** — shipping a real commerce path beats isolated UI mockups  
2. **UX under constraints** — postcode-first delivery UX and auth-gated cart/wishlist need careful guest vs logged-in design  
3. **Platform reality** — Auth cookies, Prisma engines, Cloudinary on serverless, and Vercel multi-app deploy are part of “done”  
4. **Honest scoping** — heuristic search ranking is valuable engineering; it is not the same as claiming ML/agentic AI  

---

## 15. Slide deck guidance for NotebookLM

When generating slides from this source:

- Visual style reference may be a dark tech NotebookLM sample deck, but **all content must be BharatMart**  
- Intern name on title/closing slides: **Sai Manjith Paripelli (B210840)**  
- Role: **Full Stack Engineer Intern**  
- Mentor: **Uday Kumar Kadiyam**  
- Dates: **15 June – 30 July 2026 (work shown till 23 July)**  
- Prefer diagrams: architecture, customer journey, postcode flow, timeline peaks, three work streams  
- Do not invent Flavio, hospitality AI, LLM pipelines, Grok/Claude agents, or AutoAI content  

### Recommended slide arc (12–14 slides)

1. Title  
2. Problem (fragmented grocery discovery)  
3. Browse → Locate → Checkout arc  
4. One role, three streams  
5. Timeline topography with peaks  
6. Monorepo architecture  
7. Postcode gate deep-dive  
8. Commerce path (cart/checkout/Stripe–COD)  
9. Search without overclaiming AI  
10. Production hardening  
11. Outcomes grid  
12. Key learnings  
13. Next steps + thank you  

---

## 16. References / links

1. Source code: https://github.com/bharatmartuk/bharatmart-uk  
2. Product site: https://bharatmart.uk  
3. Next.js docs: https://nextjs.org/docs  
4. Prisma docs: https://www.prisma.io/docs  
5. Auth.js docs: https://authjs.dev  
6. Stripe Payment Intents: https://docs.stripe.com/payments/payment-intents  
7. Cloudinary docs: https://cloudinary.com/documentation  
8. Turborepo docs: https://turbo.build/repo/docs  
9. Vercel docs: https://vercel.com/docs  

---

*End of NotebookLM source document.*
