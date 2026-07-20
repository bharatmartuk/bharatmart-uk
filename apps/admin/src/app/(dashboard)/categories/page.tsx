import { CategoryAdminService } from '@bharatmart/services'
import { CategorySortableList } from '@/components/categories/CategorySortableList'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const categories = await CategoryAdminService.list()

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Categories</h1>
        <p className="text-sm text-[#514534]">
          Drag to reorder, or edit a category name, slug, icon, and active status.
        </p>
      </div>
      <CategorySortableList categories={categories} />
    </main>
  )
}
