import 'server-only'

import { prisma } from '@bharatmart/database'
import { NotFoundError, ValidationError } from '../errors'

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

  async remove(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, children: true } },
      },
    })

    if (!category) throw new NotFoundError('Category not found.')

    if (category._count.children > 0) {
      throw new ValidationError(
        `Cannot delete "${category.name}" while it has ${category._count.children} sub-categor${
          category._count.children === 1 ? 'y' : 'ies'
        }. Remove or move those first.`,
      )
    }

    if (category._count.products > 0) {
      throw new ValidationError(
        `Cannot delete "${category.name}" while it has ${category._count.products} product${
          category._count.products === 1 ? '' : 's'
        }. Reassign or remove those products first.`,
      )
    }

    await prisma.category.delete({ where: { id } })
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
