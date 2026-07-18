import { getToken } from 'next-auth/jwt'
import { NextResponse, type NextRequest } from 'next/server'
import { UserRole, type UserRole as UserRoleType } from '@bharatmart/types'

function isUserRole(value: unknown): value is UserRoleType {
  return (
    value === UserRole.CUSTOMER || value === UserRole.MERCHANT || value === UserRole.ADMIN
  )
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

    const token = await getToken({
      req,
      secret,
    })

    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = token.role
    if (!isUserRole(role) || !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL('/forbidden', req.url))
    }

    return NextResponse.next()
  }
}

/**
 * Merchant portal middleware:
 * - MERCHANT can access the full dashboard
 * - CUSTOMER can only access onboarding / verification-pending (Become a Seller flow)
 */
export function createMerchantPortalMiddleware() {
  const onboardingPaths = ['/register-business', '/verification-pending']

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

    const token = await getToken({ req, secret })

    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = token.role
    if (!isUserRole(role)) {
      return NextResponse.redirect(new URL('/forbidden', req.url))
    }

    if (role === UserRole.MERCHANT) {
      return NextResponse.next()
    }

    // Prospective sellers (CUSTOMER) may only onboard.
    if (role === UserRole.CUSTOMER) {
      const isOnboarding = onboardingPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
      )
      if (isOnboarding) {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL('/register-business', req.url))
    }

    return NextResponse.redirect(new URL('/forbidden', req.url))
  }
}
