import 'server-only'

import { prisma } from '@bharatmart/database'

export type AddressWriteData = {
  userId: string
  label: string
  line1: string
  line2?: string | null | undefined
  city: string
  postcode: string
  country?: string | undefined
  isDefault?: boolean | undefined
}

export const addressRepository = {
  findForUser(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
    })
  },

  findByIdForUser(id: string, userId: string) {
    return prisma.address.findFirst({ where: { id, userId } })
  },

  async create(data: AddressWriteData) {
    const makeDefault = Boolean(data.isDefault)

    return prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.address.updateMany({
          where: { userId: data.userId, isDefault: true },
          data: { isDefault: false },
        })
      }

      const existingCount = await tx.address.count({ where: { userId: data.userId } })

      return tx.address.create({
        data: {
          userId: data.userId,
          label: data.label,
          line1: data.line1,
          line2: data.line2?.trim() ? data.line2.trim() : null,
          city: data.city,
          postcode: data.postcode.toUpperCase(),
          country: data.country ?? 'GB',
          isDefault: makeDefault || existingCount === 0,
        },
      })
    })
  },

  async update(id: string, userId: string, data: Omit<AddressWriteData, 'userId'>) {
    const existing = await prisma.address.findFirst({ where: { id, userId } })
    if (!existing) return null

    const makeDefault = Boolean(data.isDefault)

    return prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true, NOT: { id } },
          data: { isDefault: false },
        })
      }

      return tx.address.update({
        where: { id },
        data: {
          label: data.label,
          line1: data.line1,
          line2: data.line2?.trim() ? data.line2.trim() : null,
          city: data.city,
          postcode: data.postcode.toUpperCase(),
          country: data.country ?? 'GB',
          isDefault: makeDefault,
        },
      })
    })
  },

  async setDefault(id: string, userId: string) {
    const existing = await prisma.address.findFirst({ where: { id, userId } })
    if (!existing) return null

    return prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
      return tx.address.update({
        where: { id },
        data: { isDefault: true },
      })
    })
  },

  async delete(id: string, userId: string) {
    const existing = await prisma.address.findFirst({ where: { id, userId } })
    if (!existing) return null

    return prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id } })

      if (existing.isDefault) {
        const next = await tx.address.findFirst({
          where: { userId },
          orderBy: { id: 'asc' },
        })
        if (next) {
          await tx.address.update({
            where: { id: next.id },
            data: { isDefault: true },
          })
        }
      }

      return existing
    })
  },
}
