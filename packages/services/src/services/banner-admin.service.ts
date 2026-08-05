import 'server-only'

import { prisma } from '@bharatmart/database'

export const BannerAdminService = {
  list() {
    return prisma.banner.findMany({
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
    })
  },

  create(input: {
    imageUrl: string
    headline: string
    subtext?: string
    ctaText?: string
    ctaLink?: string
    startDate: Date
    endDate: Date
    isActive?: boolean
    comingSoon?: boolean
    sortOrder?: number
  }) {
    return prisma.banner.create({
      data: {
        imageUrl: input.imageUrl,
        headline: input.headline,
        ...(input.subtext != null ? { subtext: input.subtext } : {}),
        ...(input.ctaText != null ? { ctaText: input.ctaText } : {}),
        ...(input.ctaLink != null ? { ctaLink: input.ctaLink } : {}),
        startDate: input.startDate,
        endDate: input.endDate,
        isActive: input.isActive ?? true,
        comingSoon: input.comingSoon ?? false,
        sortOrder: input.sortOrder ?? 0,
      },
    })
  },

  update(
    id: string,
    input: Partial<{
      imageUrl: string
      headline: string
      subtext: string | null
      ctaText: string | null
      ctaLink: string | null
      startDate: Date
      endDate: Date
      isActive: boolean
      comingSoon: boolean
      sortOrder: number
    }>,
  ) {
    return prisma.banner.update({
      where: { id },
      data: input,
    })
  },

  async reorder(orderedIds: string[]) {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.banner.update({
          where: { id },
          data: { sortOrder: index + 1 },
        }),
      ),
    )
  },

  delete(id: string) {
    return prisma.banner.delete({ where: { id } })
  },
}
