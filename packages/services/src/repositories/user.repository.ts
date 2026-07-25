import 'server-only'

import { prisma } from '@bharatmart/database'
import type { UserRole } from '@bharatmart/types'

export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  },

  create(data: {
    name: string
    email: string
    passwordHash: string
    role: UserRole
    emailVerified?: Date | null
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role,
        emailVerified: data.emailVerified ?? null,
      },
    })
  },

  markEmailVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    })
  },
}
