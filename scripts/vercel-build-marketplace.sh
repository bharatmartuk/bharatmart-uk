#!/usr/bin/env bash
# Used by Vercel when the project Root Directory is still apps/admin:
# build the marketplace (web) and place its .next where Vercel expects it.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

pnpm turbo run build --filter=@bharatmart/web

rm -rf apps/admin/.next
cp -R apps/web/.next apps/admin/.next

if [ -d apps/web/public ]; then
  rm -rf apps/admin/public
  cp -R apps/web/public apps/admin/public
fi

echo "Staged @bharatmart/web build into apps/admin for Vercel output."
