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

  create(input: {
    name: string
    slug: string
    parentId?: string | null
    iconUrl?: string | null
    sortOrder?: number
  }) {
    return prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        parentId: input.parentId ?? null,
        iconUrl: input.iconUrl ?? null,
        sortOrder: input.sortOrder ?? 0,
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
      iconUrl?: string | null
      isActive?: boolean
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
