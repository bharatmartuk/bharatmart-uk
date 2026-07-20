import { marketplaceOrigin } from '@/lib/marketplace-url'

/** Resolve marketplace-hosted relative paths for merchant-app previews. */
export function resolveMarketplaceAssetUrl(url: string | null | undefined) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  if (url.startsWith('/')) {
    return `${marketplaceOrigin()}${url}`
  }
  return url
}
