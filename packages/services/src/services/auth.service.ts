import 'server-only'

import { createHash, randomBytes } from 'node:crypto'
import { compare, hash } from 'bcryptjs'
import { prisma } from '@bharatmart/database'
import {
  changePasswordSchema,
  registerSchema,
  updateProfileSchema,
  parseUpdateProfileInput,
  type ChangePasswordInput,
  type RegisterInput,
  type UpdateProfileInput,
} from '@bharatmart/validation'
import { UserRole } from '@bharatmart/types'
import { userRepository } from '../repositories/user.repository'
import { orderRepository } from '../repositories/order.repository'
import { ConflictError, NotFoundError, ValidationError } from '../errors'
import { NotificationService } from './notification.service'

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function appBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_WEB_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.AUTH_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '')
}

async function createEmailVerificationToken(email: string) {
  const normalized = email.toLowerCase()
  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = hashToken(rawToken)
  const expires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)

  // Drop any outstanding tokens for this address so only the latest link works.
  await prisma.verificationToken.deleteMany({ where: { identifier: normalized } })
  await prisma.verificationToken.create({
    data: {
      identifier: normalized,
      token: tokenHash,
      expires,
    },
  })

  return rawToken
}

async function sendVerificationEmail(
  user: {
    email: string | null
    name: string | null
  },
  options?: { audience?: 'customer' | 'seller' },
) {
  if (!user.email) return
  const rawToken = await createEmailVerificationToken(user.email)
  const audience =
    options?.audience === 'seller' ? '&audience=seller' : ''
  const verifyUrl = `${appBaseUrl()}/verify-email?token=${encodeURIComponent(rawToken)}${audience}`
  await NotificationService.sendEmailVerification(
    user.email,
    verifyUrl,
    user.name ?? undefined,
  )
}

export const AuthService = {
  getProfile(userId: string) {
    return userRepository.findById(userId)
  },

  /**
   * Register a customer / prospective seller.
   * Email stays unverified until they click the link, unless `autoVerify` is set.
   */
  async registerCustomer(
    input: RegisterInput,
    options?: { autoVerify?: boolean; verificationAudience?: 'customer' | 'seller' },
  ) {
    const parsed = registerSchema.safeParse({
      ...input,
      name: input.name?.trim() ? input.name.trim() : undefined,
    })
    if (!parsed.success) {
      throw new ValidationError('Invalid registration details.')
    }

    const existing = await userRepository.findByEmail(parsed.data.email)
    if (existing) {
      throw new ConflictError('An account with this email already exists.')
    }

    const passwordHash = await hash(parsed.data.password, 12)
    const fallbackName = parsed.data.email.split('@')[0] ?? 'Customer'
    const user = await userRepository.create({
      name: parsed.data.name?.trim() || fallbackName,
      email: parsed.data.email,
      passwordHash,
      role: UserRole.CUSTOMER,
      emailVerified: options?.autoVerify ? new Date() : null,
    })

    await orderRepository.attachGuestOrdersToUser(user.id, parsed.data.email)

    if (!options?.autoVerify) {
      await sendVerificationEmail(user, {
        audience: options?.verificationAudience ?? 'customer',
      })
    }

    return user
  },

  async verifyEmail(rawToken: string) {
    const token = rawToken.trim()
    if (!token) {
      throw new ValidationError('Verification link is missing or incomplete.')
    }

    const tokenHash = hashToken(token)
    const record = await prisma.verificationToken.findFirst({
      where: { token: tokenHash },
    })

    if (!record) {
      throw new ValidationError('This verification link is invalid or has already been used.')
    }

    if (record.expires.getTime() < Date.now()) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: record.identifier, token: tokenHash },
      })
      throw new ValidationError('This verification link has expired. Please request a new one.')
    }

    const user = await userRepository.findByEmail(record.identifier)
    if (!user) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: record.identifier },
      })
      throw new ValidationError('No account was found for this verification link.')
    }

    if (!user.emailVerified) {
      await userRepository.markEmailVerified(user.id)
    }

    await prisma.verificationToken.deleteMany({
      where: { identifier: record.identifier },
    })

    return { email: user.email!, alreadyVerified: Boolean(user.emailVerified) }
  },

  /**
   * Always returns success-shaped messaging to the caller so we do not leak
   * whether an email is registered. Emails are only sent for real unverified accounts.
   */
  async resendVerificationEmail(
    email: string,
    options?: { audience?: 'customer' | 'seller' },
  ) {
    const normalized = email.trim().toLowerCase()
    if (!normalized) {
      throw new ValidationError('Enter a valid email address.')
    }

    const user = await userRepository.findByEmail(normalized)
    if (!user || user.emailVerified || !user.passwordHash) {
      return { sent: false as const }
    }

    await sendVerificationEmail(user, { audience: options?.audience ?? 'customer' })
    return { sent: true as const }
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const parsed = changePasswordSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid password details.')
    }

    const user = await userRepository.findById(userId)
    if (!user) throw new NotFoundError('Account not found.')

    if (!user.passwordHash) {
      throw new ValidationError(
        'This account uses Google sign-in and does not have a password to change.',
      )
    }

    const matches = await compare(parsed.data.currentPassword, user.passwordHash)
    if (!matches) {
      throw new ValidationError('Current password is incorrect.')
    }

    const passwordHash = await hash(parsed.data.newPassword, 12)
    await userRepository.updatePasswordHash(userId, passwordHash)
    return { ok: true as const }
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const parsed = updateProfileSchema.safeParse({
      name: input.name,
      phone: input.phone ?? '',
    })
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid profile details.')
    }

    const user = await userRepository.findById(userId)
    if (!user) throw new NotFoundError('Account not found.')

    const data = parseUpdateProfileInput(parsed.data)
    return userRepository.updateProfile(userId, data)
  },
}

export const authService = AuthService
