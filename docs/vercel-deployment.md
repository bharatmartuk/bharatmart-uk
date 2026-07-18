# BharatMart UK — Vercel deployment

This monorepo has **three separate Next.js apps**. Prefer one Vercel project per app.

| Project name (suggested) | Root Directory | Build filter | Public role |
| --- | --- | --- | --- |
| `bharatmart-uk` (main URL) | `apps/web` (preferred) | `@bharatmart/web` | Customer marketplace |
| `bharatmart-merchant` | `apps/merchant` | `@bharatmart/merchant` | Seller portal + merchant login |
| `bharatmart-admin` | `apps/admin` | `@bharatmart/admin` | Ops console + admin login |

## Main URL = marketplace (not admin)

[https://bharatmart-uk.vercel.app](https://bharatmart-uk.vercel.app) must serve the **ecommerce storefront**.

### Preferred setup

1. Vercel → **bharatmart-uk** → Settings → General → **Root Directory** = `apps/web`
2. Build uses [`apps/web/vercel.json`](../apps/web/vercel.json) (`--filter=@bharatmart/web`)
3. Redeploy

### Temporary bridge (if Root Directory is still `apps/admin`)

[`apps/admin/vercel.json`](../apps/admin/vercel.json) runs [`scripts/vercel-build-marketplace.sh`](../scripts/vercel-build-marketplace.sh), which builds `@bharatmart/web` and stages its `.next` for this project so `/` is the marketplace even when Root Directory has not been moved yet.

For a real admin deployment, create a **separate** project with Root Directory `apps/admin` and build `--filter=@bharatmart/admin` (do not use the marketplace bridge script there).

## Web project env

- `DATABASE_URL`, `DIRECT_URL`
- `AUTH_SECRET` (unique for web)
- `AUTH_URL` = `https://bharatmart-uk.vercel.app`
- `AUTH_TRUST_HOST` = `true`
- `NEXT_PUBLIC_MERCHANT_APP_URL` = merchant project URL (after you create it)

After deploy, `/` is the storefront and `/login` is **customer** login.

## Create merchant + admin projects

### Merchant (`bharatmart-merchant`)

1. **Add New Project** → import the same `bharatmartuk/bharatmart-uk` repo.
2. **Root Directory:** `apps/merchant`
3. Build from [`apps/merchant/vercel.json`](../apps/merchant/vercel.json).
4. Env: shared DB vars + own `AUTH_SECRET` / `AUTH_URL` / `AUTH_TRUST_HOST=true`
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

## Seed production

```bash
pnpm --filter @bharatmart/database db:seed
```

Demo admin (admin project only): `admin@bharatmart.uk` / `Password123!`

## Stripe webhook

`https://bharatmart-uk.vercel.app/api/webhooks/stripe` — event `payment_intent.succeeded`
