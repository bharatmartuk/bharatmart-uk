#!/usr/bin/env bash
# Used when Vercel Root Directory is still apps/admin but the main URL
# must serve the marketplace. Mirrors apps/web into apps/admin, then builds
# @bharatmart/admin so Vercel file tracing stays under apps/admin (copying
# only .next from web causes runtime 500: missing next/dist modules).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

WEB=apps/web
ADMIN=apps/admin

echo "Mirroring @bharatmart/web source into apps/admin for marketplace deploy..."

rm -rf "$ADMIN/src"
cp -R "$WEB/src" "$ADMIN/src"

if [ -d "$WEB/public" ]; then
  rm -rf "$ADMIN/public"
  cp -R "$WEB/public" "$ADMIN/public"
fi

cp "$WEB/next.config.js" "$ADMIN/next.config.js"
cp "$WEB/tailwind.config.ts" "$ADMIN/tailwind.config.ts"
cp "$WEB/postcss.config.js" "$ADMIN/postcss.config.js"

rm -rf "$ADMIN/.next"
pnpm turbo run build --filter=@bharatmart/admin

echo "Built marketplace (web) as apps/admin for Vercel Root Directory."
