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
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role,
      },
    })
  },
}
