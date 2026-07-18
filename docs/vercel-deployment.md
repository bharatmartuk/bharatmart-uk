# BharatMart UK — Vercel deployment

This monorepo has **three separate Next.js apps**. Deploy each as its own Vercel project from the same GitHub repo. Do **not** point the marketplace domain at `apps/admin`.

| Project name (suggested) | Root Directory | Build filter | Public role |
| --- | --- | --- | --- |
| `bharatmart-uk` (existing) | `apps/web` | `@bharatmart/web` | Customer marketplace |
| `bharatmart-merchant` | `apps/merchant` | `@bharatmart/merchant` | Seller portal + merchant login |
| `bharatmart-admin` | `apps/admin` | `@bharatmart/admin` | Ops console + admin login |

## Fix the current main URL (shows Admin login)

If [https://bharatmart-uk.vercel.app](https://bharatmart-uk.vercel.app) shows **Admin login**, the project Root Directory is still `apps/admin`.

1. Open **Vercel → bharatmart-uk → Settings → General**.
2. Set **Root Directory** to `apps/web` (Include source files outside root if prompted / leave as Vercel monorepo default).
3. Confirm build settings match [`apps/web/vercel.json`](../apps/web/vercel.json):
   - **Install:** `cd ../.. && pnpm install`
   - **Build:** `cd ../.. && pnpm turbo run build --filter=@bharatmart/web`
4. Environment Variables (Production):
   - `DATABASE_URL`, `DIRECT_URL`
   - `AUTH_SECRET` (unique for web)
   - `AUTH_URL` = `https://bharatmart-uk.vercel.app`
   - `AUTH_TRUST_HOST` = `true`
   - `NEXT_PUBLIC_MERCHANT_APP_URL` = your merchant project URL (after step below), e.g. `https://bharatmart-merchant.vercel.app`
5. **Deployments → Redeploy** (clear cache optional).

After this, `/` is the marketplace and `/login` is **customer** login only.

## Create merchant + admin projects

### Merchant (`bharatmart-merchant`)

1. **Add New Project** → import the same `bharatmartuk/bharatmart-uk` repo.
2. **Root Directory:** `apps/merchant`
3. Build from [`apps/merchant/vercel.json`](../apps/merchant/vercel.json) (`--filter=@bharatmart/merchant`).
4. Env:
   - shared DB vars
   - `AUTH_SECRET` (**different** from web)
   - `AUTH_URL` = `https://<merchant-project>.vercel.app`
   - `AUTH_TRUST_HOST` = `true`
5. Deploy. Merchant login lives at `/login` on **that** URL only — not inside the storefront.

### Admin (`bharatmart-admin`)

1. **Add New Project** → same repo.
2. **Root Directory:** `apps/admin`
3. Build from [`apps/admin/vercel.json`](../apps/admin/vercel.json) (`--filter=@bharatmart/admin`).
4. Env: same pattern with its own `AUTH_SECRET` / `AUTH_URL`.
5. Deploy. Admin login is only on the admin URL.

Then set `NEXT_PUBLIC_MERCHANT_APP_URL` on the **web** project to the merchant production URL and redeploy web so “Become a Seller” / “Merchant login” leave the customer UI.

## Build settings (each project)

- **Install Command:** `cd ../.. && pnpm install`
- **Build Command:** `cd ../.. && pnpm turbo run build --filter=@bharatmart/<web|merchant|admin>`
- **Output Directory:** leave default (Next.js detects `.next`)
- **Framework Preset:** Next.js

## Shared environment variables

Set on all three projects:

- `DATABASE_URL`
- `DIRECT_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

### Web-only

- `NEXT_PUBLIC_MERCHANT_APP_URL` — absolute merchant portal origin (no trailing slash)

### Required for Auth.js

- `AUTH_SECRET` — `openssl rand -base64 32` (prefer **one secret per app**)
- `AUTH_URL` — exact public URL of that app
- `AUTH_TRUST_HOST=true`

## Custom domains (later)

- `bharatmart.uk` → web
- `merchant.bharatmart.uk` → merchant
- `admin.bharatmart.uk` → admin

## Seed production (demo admin login)

After `DATABASE_URL` points at Neon, seed once from your machine:

```bash
pnpm --filter @bharatmart/database db:seed
```

(Uses the same `DATABASE_URL` as in `packages/database/.env` / root `.env`.)

Demo admin:

- Email: `admin@bharatmart.uk`
- Password: `Password123!` (capital **P** — not `password123!`)

Admin credentials only work on the **admin** project URL. They will not sign into the merchant portal (role-gated).

## Stripe webhook

Point Stripe webhooks to the **web** app:

`https://bharatmart-uk.vercel.app/api/webhooks/stripe`  
(or your custom web domain)

Event: `payment_intent.succeeded`
