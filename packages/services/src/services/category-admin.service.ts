import 'server-only'

import { prisma } from '@bharatmart/database'

export const CategoryAdminService = {
  list() {
    return prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
    })
  },

  async create(input: {
    name: string
    slug: string
    parentId?: string | null
    sortOrder?: number
    comingSoon?: boolean
  }) {
    const maxSortOrder = await prisma.category.aggregate({
      _max: { sortOrder: true },
    })

    return prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        parentId: input.parentId ?? null,
        iconUrl: null,
        sortOrder: input.sortOrder ?? (maxSortOrder._max.sortOrder ?? 0) + 1,
        comingSoon: input.comingSoon ?? false,
        isActive: true,
      },
    })
  },

  update(
    id: string,
    input: {
      name?: string
      slug?: string
      parentId?: string | null
      isActive?: boolean
      comingSoon?: boolean
      sortOrder?: number
    },
  ) {
    return prisma.category.update({
      where: { id },
      data: input,
    })
  },

  async reorder(orderedIds: string[]) {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder: index + 1 },
        }),
      ),
    )
  },
}
