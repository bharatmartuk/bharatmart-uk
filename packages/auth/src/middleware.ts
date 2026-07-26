import { getToken } from 'next-auth/jwt'
import { NextResponse, type NextRequest } from 'next/server'
import { UserRole, type UserRole as UserRoleType } from '@bharatmart/types'

function isUserRole(value: unknown): value is UserRoleType {
  return (
    value === UserRole.CUSTOMER || value === UserRole.MERCHANT || value === UserRole.ADMIN
  )
}

/**
 * Auth.js sets `__Secure-authjs.session-token` on HTTPS. getToken() picks the
 * cookie name from AUTH_URL by default - a wrong/localhost AUTH_URL on Vercel
 * makes middleware miss the session and bounce users back to /login.
 */
async function readSessionToken(req: NextRequest, secret: string) {
  const preferSecure =
    req.nextUrl.protocol === 'https:' ||
    process.env.VERCEL === '1' ||
    process.env.AUTH_URL?.startsWith('https://') === true

  const primary = await getToken({ req, secret, secureCookie: preferSecure })
  if (primary) return primary

  return getToken({ req, secret, secureCookie: !preferSecure })
}

function redirectToLogin(req: NextRequest, params?: Record<string, string>) {
  const loginUrl = new URL('/login', req.url)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      loginUrl.searchParams.set(key, value)
    }
  }
  return NextResponse.redirect(loginUrl)
}

/**
 * Edge-safe middleware factory for merchant/admin apps.
 * Uses JWT cookies only (no Prisma) so it can run on the Edge runtime.
 */
export function createRoleGuardMiddleware(allowedRoles: UserRoleType[]) {
  return async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (
      pathname.startsWith('/login') ||
      pathname.startsWith('/forbidden') ||
      pathname.startsWith('/api/auth')
    ) {
      return NextResponse.next()
    }

    const secret = process.env.AUTH_SECRET
    if (!secret) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const token = await readSessionToken(req, secret)

    if (!token?.sub || token.invalid) {
      // Let API routes return JSON 401 instead of an HTML login redirect.
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = token.role
    if (!isUserRole(role) || !allowedRoles.includes(role)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/forbidden', req.url))
    }

    return NextResponse.next()
  }
}

/**
 * Merchant portal routing invariant (do not break this again):
 *
 * | Who                         | Visiting `/`              | Registration form              |
 * |-----------------------------|---------------------------|--------------------------------|
 * | Logged out                  | → `/login`                | Only via explicit Register link |
 * | CUSTOMER (no store yet)     | → `/login?continueRegistration=1` | Only via Continue button |
 * | MERCHANT without store row  | → `/login?continueRegistration=1` | Only via Continue button |
 * | MERCHANT pending/rejected   | → `/verification-pending` | Blocked                        |
 * | MERCHANT approved           | → dashboard               | Blocked                        |
 *
 * Never auto-redirect the homepage (or requireMerchant) into `/register-business`.
 */
export function createMerchantPortalMiddleware() {
  const onboardingPaths = ['/register-business', '/verification-pending']
  const publicPaths = ['/login', '/forbidden', '/api/auth']

  return async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      return NextResponse.next()
    }

    // Registration is reachable without a session so new sellers can sign up
    // from the login page link — but it is not the default landing page.
    if (
      pathname === '/register-business' ||
      pathname.startsWith('/register-business/')
    ) {
      return NextResponse.next()
    }

    const secret = process.env.AUTH_SECRET
    if (!secret) {
      return redirectToLogin(req)
    }

    const token = await readSessionToken(req, secret)

    // Missing / deleted accounts must look logged-out (never dump into registration).
    if (!token?.sub || token.invalid) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return redirectToLogin(req, {
        callbackUrl: pathname === '/' ? '/' : pathname,
      })
    }

    const role = token.role
    if (!isUserRole(role)) {
      return NextResponse.redirect(new URL('/forbidden', req.url))
    }

    // API routes enforce their own auth; do not redirect (breaks browser uploads).
    if (pathname.startsWith('/api/')) {
      return NextResponse.next()
    }

    const isOnboarding = onboardingPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )

    // Incomplete sellers (customer account, or merchant role with no store yet).
    // They may open onboarding routes explicitly — never via homepage auto-redirect.
    const incompleteSeller =
      role === UserRole.CUSTOMER || (role === UserRole.MERCHANT && !token.merchantId)

    if (incompleteSeller) {
      if (isOnboarding) {
        return NextResponse.next()
      }
      return redirectToLogin(req, { continueRegistration: '1' })
    }

    if (role === UserRole.MERCHANT) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/forbidden', req.url))
  }
}
