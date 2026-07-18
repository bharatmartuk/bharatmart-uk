/**
 * Resolve a post-login navigation target that stays on the current app origin.
 * Auth.js may return an absolute `result.url` built from AUTH_URL; if AUTH_URL
 * points at a wrong/missing Vercel host, using that URL causes DEPLOYMENT_NOT_FOUND.
 */
export function safeInternalPath(
  preferred: string | null | undefined,
  fallback = '/',
  resultUrl?: string | null,
): string {
  const candidates = [preferred, resultUrl, fallback]

  for (const value of candidates) {
    if (!value) continue

    if (value.startsWith('/') && !value.startsWith('//')) {
      return value
    }

    try {
      const url = new URL(value)
      return `${url.pathname}${url.search}${url.hash}` || fallback
    } catch {
      // ignore invalid absolute URLs
    }
  }

  return fallback
}
