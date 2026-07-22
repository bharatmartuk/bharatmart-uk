import 'server-only'

import {
  RATE_LIMITS,
  clientIpFromHeaders,
  consumeRateLimit,
  formatRateLimitMessage,
  type RateLimitPolicy,
  type RateLimitResult,
} from '@bharatmart/utils'
import { RateLimitError } from './errors'

export { RATE_LIMITS, clientIpFromHeaders, formatRateLimitMessage }
export type { RateLimitPolicy, RateLimitResult }

/**
 * Enforce a rate limit or throw RateLimitError (HTTP 429 semantics for APIs/actions).
 */
export async function enforceRateLimit(
  identifier: string,
  policy: RateLimitPolicy,
  actionLabel?: string,
): Promise<RateLimitResult> {
  const result = await consumeRateLimit(identifier, policy)
  if (!result.success) {
    throw new RateLimitError(formatRateLimitMessage(result, actionLabel ?? 'try again'), result.retryAfterSeconds)
  }
  return result
}

export async function enforceLoginRateLimit(email: string, ip: string) {
  return enforceRateLimit(`${ip}:${email}`, RATE_LIMITS.login, 'try signing in again')
}
