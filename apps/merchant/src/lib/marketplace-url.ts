export function marketplaceOrigin() {
  return (
    process.env.NEXT_PUBLIC_WEB_APP_URL?.trim() || 'https://bharatmart-uk.vercel.app'
  ).replace(/\/$/, '')
}

export function marketplaceProductUrl(slug: string) {
  return `${marketplaceOrigin()}/products/${slug}`
}
