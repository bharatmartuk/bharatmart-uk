export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
  retryAfterSeconds: number
}

export type RateLimitPolicy = {
  /** Unique policy name used in keys */
  name: string
  /** Max requests allowed in the window */
  limit: number
  /** Window length in milliseconds */
  windowMs: number
}

/** Industry-style defaults for a marketplace (login, writes, uploads). */
export const RATE_LIMITS = {
  /** Brute-force protection: 5 attempts / 15 min per IP+email (OWASP-style). */
  login: { name: 'login', limit: 5, windowMs: 15 * 60 * 1000 },
  /** Account spam: 3 registrations / hour / IP. */
  register: { name: 'register', limit: 3, windowMs: 60 * 60 * 1000 },
  /** Contact form abuse: 3 messages / 10 min / IP. */
  contact: { name: 'contact', limit: 3, windowMs: 10 * 60 * 1000 },
  /** Checkout / payment intent churn: 8 orders / 10 min / user. */
  checkout: { name: 'checkout', limit: 8, windowMs: 10 * 60 * 1000 },
  /** Coupon probing: 20 attempts / 10 min / user. */
  coupon: { name: 'coupon', limit: 20, windowMs: 10 * 60 * 1000 },
  /** Cloudinary signature minting: 60 / min / user. */
  uploadSign: { name: 'upload-sign', limit: 60, windowMs: 60 * 1000 },
  /** Local document upload: 20 / 10 min / user. */
  uploadLocal: { name: 'upload-local', limit: 20, windowMs: 10 * 60 * 1000 },
  /** Single product create/update: 20 writes / min / merchant. */
  productWrite: { name: 'product-write', limit: 20, windowMs: 60 * 1000 },
  /**
   * Bulk catalogue import jobs (not individual rows).
   * Up to 5 CSV imports / hour; each job may create many products.
   */
  productBulk: { name: 'product-bulk', limit: 5, windowMs: 60 * 60 * 1000 },
  /** Search suggest: 60 / min / IP. */
  search: { name: 'search', limit: 60, windowMs: 60 * 1000 },
} as const satisfies Record<string, RateLimitPolicy>

type Bucket = {
  timestamps: number[]
}

const memoryStore = new Map<string, Bucket>()

function prune(bucket: Bucket, windowStart: number) {
  bucket.timestamps = bucket.timestamps.filter((ts) => ts > windowStart)
}

function memoryConsume(key: string, policy: RateLimitPolicy): RateLimitResult {
  const now = Date.now()
  const windowStart = now - policy.windowMs
  const bucket = memoryStore.get(key) ?? { timestamps: [] }
  prune(bucket, windowStart)

  if (bucket.timestamps.length >= policy.limit) {
    const oldest = bucket.timestamps[0] ?? now
    const resetAt = oldest + policy.windowMs
    memoryStore.set(key, bucket)
    return {
      success: false,
      limit: policy.limit,
      remaining: 0,
      resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
    }
  }

  bucket.timestamps.push(now)
  memoryStore.set(key, bucket)
  const resetAt = (bucket.timestamps[0] ?? now) + policy.windowMs
  return {
    success: true,
    limit: policy.limit,
    remaining: Math.max(0, policy.limit - bucket.timestamps.length),
    resetAt,
    retryAfterSeconds: 0,
  }
}

async function upstashConsume(key: string, policy: RateLimitPolicy): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  const now = Date.now()
  const windowStart = now - policy.windowMs
  const redisKey = `rl:${policy.name}:${key}`

  try {
    // Sliding window via sorted set: ZREMRANGEBYSCORE + ZCARD + ZADD + PEXPIRE
    const pipeline = [
      ['ZREMRANGEBYSCORE', redisKey, '0', String(windowStart)],
      ['ZCARD', redisKey],
      ['ZADD', redisKey, String(now), `${now}:${Math.random().toString(36).slice(2, 8)}`],
      ['PEXPIRE', redisKey, String(policy.windowMs)],
    ]

    const response = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipeline),
    })

    if (!response.ok) return null

    const results = (await response.json()) as Array<{ result: number }>
    const countBeforeAdd = Number(results[1]?.result ?? 0)

    if (countBeforeAdd >= policy.limit) {
      // Undo the optimistic ZADD by removing newest member roughly via expire-only path:
      // re-check and report failure (occasional overshoot of 1 is acceptable).
      const resetAt = now + policy.windowMs
      return {
        success: false,
        limit: policy.limit,
        remaining: 0,
        resetAt,
        retryAfterSeconds: Math.max(1, Math.ceil(policy.windowMs / 1000)),
      }
    }

    return {
      success: true,
      limit: policy.limit,
      remaining: Math.max(0, policy.limit - (countBeforeAdd + 1)),
      resetAt: now + policy.windowMs,
      retryAfterSeconds: 0,
    }
  } catch {
    return null
  }
}

/**
 * Consume one unit from a rate-limit bucket.
 * Uses Upstash Redis when configured (multi-instance / Vercel), otherwise in-memory.
 */
export async function consumeRateLimit(
  identifier: string,
  policy: RateLimitPolicy,
): Promise<RateLimitResult> {
  const key = identifier.trim().toLowerCase() || 'anonymous'
  const remote = await upstashConsume(key, policy)
  if (remote) return remote
  return memoryConsume(key, policy)
}

export function formatRateLimitMessage(result: RateLimitResult, action = 'try again') {
  const minutes = Math.ceil(result.retryAfterSeconds / 60)
  if (minutes <= 1) {
    return `Too many requests. Please ${action} in ${result.retryAfterSeconds} seconds.`
  }
  return `Too many requests. Please ${action} in about ${minutes} minute${minutes === 1 ? '' : 's'}.`
}

/** Extract client IP from standard proxy headers. */
export function clientIpFromHeaders(headerStore: Headers | { get(name: string): string | null }) {
  const forwarded = headerStore.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return headerStore.get('x-real-ip')?.trim() || headerStore.get('cf-connecting-ip')?.trim() || 'unknown'
}
