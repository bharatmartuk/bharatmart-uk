import 'server-only'

import { hash } from 'bcryptjs'
import { registerSchema, type RegisterInput } from '@bharatmart/validation'
import { UserRole } from '@bharatmart/types'
import { userRepository } from '../repositories/user.repository'
import { ConflictError, ValidationError } from '../errors'

export const AuthService = {
  getProfile(userId: string) {
    return userRepository.findById(userId)
  },

  async registerCustomer(input: RegisterInput) {
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
    return userRepository.create({
      name: parsed.data.name?.trim() || fallbackName,
      email: parsed.data.email,
      passwordHash,
      role: UserRole.CUSTOMER,
    })
  },
}

export const authService = AuthService
