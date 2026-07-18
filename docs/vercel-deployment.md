# BharatMart UK — Vercel deployment

This monorepo has **three separate Next.js apps**. Prefer one Vercel project per app.

| Project name (suggested) | Root Directory | Build filter | Public role |
| --- | --- | --- | --- |
| `bharatmart-uk` (main URL) | `apps/web` (preferred) | `@bharatmart/web` | Customer marketplace |
| `bharatmart-merchant` | `apps/merchant` | `@bharatmart/merchant` | Seller portal + merchant login |
| `bharatmart-admin` | `apps/admin` | `@bharatmart/admin` | Ops console + admin login |

## Main URL = marketplace (not admin)

[https://bharatmart-uk.vercel.app](https://bharatmart-uk.vercel.app) must serve the **ecommerce storefront**.

### Preferred setup (do this when you can)

1. Vercel → **bharatmart-uk** → Settings → General → **Root Directory** = `apps/web` (not `apps/admin`)
2. Switch [`apps/admin/vercel.json`](../apps/admin/vercel.json) build back to `--filter=@bharatmart/admin` (or use a separate admin project)
3. Redeploy

### Temporary bridge (Root Directory still `apps/admin`)

[`apps/admin/vercel.json`](../apps/admin/vercel.json) runs [`scripts/vercel-build-marketplace.sh`](../scripts/vercel-build-marketplace.sh): it mirrors `apps/web` source into `apps/admin`, then builds `@bharatmart/admin` so tracing paths match the Root Directory. Do **not** copy only `.next` from web — that causes runtime 500s.

For a real admin deployment, create a **separate** project with Root Directory `apps/admin` and build `--filter=@bharatmart/admin` (do not use the marketplace bridge there).

## Web project env

- `DATABASE_URL`, `DIRECT_URL`
- `AUTH_SECRET` (unique for web)
- `AUTH_URL` = `https://bharatmart-uk.vercel.app`
- `AUTH_TRUST_HOST` = `true`
- `NEXT_PUBLIC_MERCHANT_APP_URL` = full merchant origin, e.g. `https://bharatmart-uk-merchant-theta.vercel.app` (include `https://`, no trailing slash)

After deploy, `/` is the storefront and `/login` is **customer** login.

## Create merchant + admin projects

### Merchant (`bharatmart-merchant`)

1. **Add New Project** → import the same `bharatmartuk/bharatmart-uk` repo.
2. **Root Directory:** `apps/merchant`
3. Build from [`apps/merchant/vercel.json`](../apps/merchant/vercel.json).
4. Env: shared DB vars + own `AUTH_SECRET` / `AUTH_URL` / `AUTH_TRUST_HOST=true`
   - `AUTH_URL` must be the **exact** live merchant origin (e.g. `https://bharatmart-uk-merchant-theta.vercel.app`), including `https://`. A wrong host (e.g. `bharatmart-merchant.vercel.app` when that project does not exist) breaks post-login redirects.
5. Deploy.

### Admin (`bharatmart-admin`)

1. **Add New Project** → same repo.
2. **Root Directory:** `apps/admin`
3. Build: `cd ../.. && pnpm turbo run build --filter=@bharatmart/admin`
4. Env: own `AUTH_SECRET` / `AUTH_URL` / `AUTH_TRUST_HOST=true`
5. Deploy.

Then set `NEXT_PUBLIC_MERCHANT_APP_URL` on the **web** project and redeploy.

## Shared environment variables

- `DATABASE_URL`, `DIRECT_URL`
- Cloudinary / Stripe / Resend as needed
- `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST=true` per app
- Web only: `NEXT_PUBLIC_MERCHANT_APP_URL`
- Google login (web + merchant): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## Google sign-in (web + merchant)

Google only appears when both env vars are set on that Vercel project. Production currently exposes **credentials only** until you add them.

1. **Vercel → each project** (`bharatmart-uk` and `bharatmart-uk-merchant`) → Settings → Environment Variables → add (Production + Preview):

| Name | Value |
| --- | --- |
| `GOOGLE_CLIENT_ID` | from Google Cloud Console (same as local `.env.local`) |
| `GOOGLE_CLIENT_SECRET` | from Google Cloud Console |

2. **Google Cloud Console** → APIs & Services → Credentials → your OAuth 2.0 Client → **Authorized redirect URIs** must include:

- `https://bharatmart-uk.vercel.app/api/auth/callback/google`
- `https://bharatmart-uk-merchant-theta.vercel.app/api/auth/callback/google`  
  (use your real merchant host)

Also keep local URIs if you develop locally:

- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3001/api/auth/callback/google`

3. Redeploy **both** projects after saving env vars.

4. Confirm: open `/api/auth/providers` — the JSON should include a `"google"` entry.

## Seed production

```bash
pnpm --filter @bharatmart/database db:seed
```

Demo admin (admin project only): `admin@bharatmart.uk` / `Password123!`

## Stripe webhook

`https://bharatmart-uk.vercel.app/api/webhooks/stripe` — event `payment_intent.succeeded`
