# BharatMart UK — Vercel deployment

Create **three** Vercel projects from the same Git repository:

| Project | Root Directory | Filter |
| --- | --- | --- |
| web | `apps/web` | `@bharatmart/web` |
| merchant | `apps/merchant` | `@bharatmart/merchant` |
| admin | `apps/admin` | `@bharatmart/admin` |

## Build settings (each project)

- **Install Command:** `cd ../.. && pnpm install`
- **Build Command:** `cd ../.. && pnpm turbo run build --filter=@bharatmart/web`  
  (swap the filter for merchant/admin)
- **Output Directory:** leave default (Next.js detects `.next`)
- **Framework Preset:** Next.js

## Shared environment variables

Set these on all three projects:

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

## Auth secret decision

Use **one shared `AUTH_SECRET`** across web/merchant/admin only if you intentionally want a shared Auth.js cookie/session namespace. Prefer **distinct `AUTH_SECRET` values per app** for fully separate sessions (recommended for this marketplace, because roles and dashboards are isolated).

Also set per-app:

- `AUTH_URL` (e.g. `https://bharatmart.uk`, `https://merchant.bharatmart.uk`, `https://admin.bharatmart.uk`)
- `AUTH_TRUST_HOST=true`
- Google OAuth credentials if enabled

## Domains

1. Confirm preview deployments on a test PR for each project.
2. Then attach:
   - `bharatmart.uk` → web
   - `merchant.bharatmart.uk` → merchant
   - `admin.bharatmart.uk` → admin

## Stripe webhook

Point Stripe webhooks to:

`https://bharatmart.uk/api/webhooks/stripe`

Event: `payment_intent.succeeded`
