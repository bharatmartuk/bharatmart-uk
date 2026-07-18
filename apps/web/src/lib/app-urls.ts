/**
 * Absolute base URL for the merchant portal (separate Next.js app).
 * Local default: http://localhost:3001
 */
export function getMerchantAppUrl() {
  const configured = process.env.NEXT_PUBLIC_MERCHANT_APP_URL?.replace(/\/$/, '')
  return configured || 'http://localhost:3001'
}

export function merchantAppPath(path: string) {
  const base = getMerchantAppUrl()
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}
