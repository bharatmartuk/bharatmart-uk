import './augmentations'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import type { Adapter } from '@auth/core/adapters'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { prisma } from '@bharatmart/database'
import { UserRole, type UserRole as UserRoleType } from '@bharatmart/types'
import {
  RATE_LIMITS,
  clientIpFromHeaders,
  consumeRateLimit,
  formatRateLimitMessage,
} from '@bharatmart/utils'
import { CredentialsSignin } from 'next-auth'
import type { AuthOptions } from './types'

class LoginRateLimitedError extends CredentialsSignin {
  override code = 'rate_limited'
}

function isUserRole(value: unknown): value is UserRoleType {
  return (
    value === UserRole.CUSTOMER || value === UserRole.MERCHANT || value === UserRole.ADMIN
  )
}

async function getRequestIp() {
  try {
    const { headers } = await import('next/headers')
    const headerStore = await headers()
    return clientIpFromHeaders(headerStore)
  } catch {
    return 'unknown'
  }
}

function createAdapter(): Adapter {
  const base = PrismaAdapter(prisma)
  return {
    ...base,
    async createUser(data) {
      const email = data.email?.toLowerCase()
      if (!email) {
        throw new Error('Google account did not return an email address.')
      }

      const created = await prisma.user.create({
        data: {
          name: data.name ?? null,
          email,
          emailVerified: data.emailVerified ?? null,
          image: data.image ?? null,
          role: UserRole.CUSTOMER,
        },
      })

      return {
        id: created.id,
        name: created.name,
        email: created.email!,
        emailVerified: created.emailVerified,
        image: created.image,
        role: created.role,
      }
    },
  }
}

/**
 * Build a NextAuth (Auth.js v5) config scoped to the roles an app may accept.
 * Uses JWT sessions (required with the Credentials provider + PrismaAdapter).
 */
export function buildAuthConfig(allowedRoles: UserRoleType[]): AuthOptions {
  const providers: NextAuthConfig['providers'] = [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === 'string' ? credentials.email.trim().toLowerCase() : ''
        const password = typeof credentials?.password === 'string' ? credentials.password : ''

        if (!email || !password) {
          return null
        }

        const ip = await getRequestIp()
        const rate = await consumeRateLimit(`${ip}:${email}`, RATE_LIMITS.login)
        if (!rate.success) {
          throw new LoginRateLimitedError(formatRateLimitMessage(rate, 'try signing in again'))
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { merchant: { select: { id: true } } },
        })

        if (!user?.passwordHash || !user.email) {
          return null
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash)
        if (!passwordMatches) {
          return null
        }

        if (!isUserRole(user.role) || !allowedRoles.includes(user.role)) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          merchantId: user.merchant?.id ?? null,
        }
      },
    }),
  ]

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    )
  }

  return {
    adapter: createAdapter(),
    session: { strategy: 'jwt' },
    ...(process.env.AUTH_SECRET ? { secret: process.env.AUTH_SECRET } : {}),
    trustHost: true,
    pages: {
      signIn: '/login',
      error: '/login',
    },
    providers,
    callbacks: {
      async signIn({ user, account }) {
        // Credentials already enforce role in authorize().
        if (account?.provider === 'credentials') {
          return true
        }

        const email = user.email?.trim().toLowerCase()
        if (!email) {
          return false
        }

        // Prefer email — on first OAuth pass, `user.id` may not be the DB cuid yet.
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { role: true },
        })

        // Brand-new Google user: Auth.js creates them after this callback (as CUSTOMER).
        if (!dbUser) {
          return allowedRoles.includes(UserRole.CUSTOMER) ? true : '/forbidden'
        }

        if (!isUserRole(dbUser.role) || !allowedRoles.includes(dbUser.role)) {
          return '/forbidden'
        }

        return true
      },

      async jwt({ token, user }) {
        if (user?.id) {
          token.sub = user.id
          if (isUserRole(user.role)) {
            token.role = user.role
          }
          token.merchantId = user.merchantId ?? null
        }

        // Keep role/merchantId in sync (e.g. CUSTOMER → MERCHANT after onboarding).
        // Never throw here — a DB blip must not invalidate the whole session/action.
        if (token.sub) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.sub },
              include: { merchant: { select: { id: true } } },
            })

            if (dbUser && isUserRole(dbUser.role)) {
              token.role = dbUser.role
              token.merchantId = dbUser.merchant?.id ?? null
            } else if (user?.email) {
              const byEmail = await prisma.user.findUnique({
                where: { email: user.email.toLowerCase() },
                include: { merchant: { select: { id: true } } },
              })
              if (byEmail && isUserRole(byEmail.role)) {
                token.sub = byEmail.id
                token.role = byEmail.role
                token.merchantId = byEmail.merchant?.id ?? null
              }
            }
          } catch {
            // Keep existing token claims if the database is temporarily unreachable.
          }
        }

        return token
      },

      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.sub ?? ''
          session.user.role = isUserRole(token.role) ? token.role : UserRole.CUSTOMER
          session.user.merchantId = token.merchantId ?? null
        }

        return session
      },
    },
  }
}
