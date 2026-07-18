/**
 * Absolute base URL for the merchant portal (separate Next.js app).
 * Local default: http://localhost:3001
 *
 * Accepts values with or without a scheme. Host-only values (common when
 * pasting a Vercel domain) are treated as https:// so the browser does not
 * resolve them as relative paths on the marketplace origin.
 */
export function getMerchantAppUrl() {
  const raw = process.env.NEXT_PUBLIC_MERCHANT_APP_URL?.trim().replace(/\/$/, '')
  if (!raw) return 'http://localhost:3001'

  if (/^https?:\/\//i.test(raw)) return raw

  // localhost / 127.0.0.1 without scheme → http
  if (/^(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(raw)) {
    return `http://${raw}`
  }

  return `https://${raw}`
}

export function merchantAppPath(path: string) {
  const base = getMerchantAppUrl()
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}
