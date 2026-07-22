'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import { generateSlug } from '@bharatmart/utils'
import { Badge, Button, CategoryIcon, Input, Label } from '@bharatmart/ui'
import {
  createCategoryAction,
  deleteCategoryAction,
  reorderCategoriesAction,
  updateCategoryAction,
} from '@/app/(dashboard)/categories/actions'

type CategoryRow = {
  id: string
  name: string
  slug: string
  isActive: boolean
  comingSoon: boolean
  parent: { id: string; name: string } | null
  _count: { products: number; children: number }
}

function SortableRow({
  category,
  onEdit,
}: {
  category: CategoryRow
  onEdit: (category: CategoryRow) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: category.id,
  })

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-lg border border-[#d6c4ad] bg-white px-3 py-2"
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button className="text-[#837561]" type="button" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#eee7de] bg-[#fff8f0]">
          <CategoryIcon className="h-5 w-5" name={category.name} slug={category.slug} />
        </div>
        <div className="min-w-0">
          <p className="font-medium">{category.name}</p>
          <p className="truncate text-xs text-[#837561]">
            {category.slug}
            {category.parent ? ` · child of ${category.parent.name}` : ''}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {category.comingSoon ? <Badge variant="secondary">Coming soon</Badge> : null}
        <Badge variant="secondary">{category._count.products} products</Badge>
        <Badge>{category.isActive ? 'Active' : 'Inactive'}</Badge>
        <Button
          aria-label={`Edit ${category.name}`}
          onClick={() => onEdit(category)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Pencil className="h-4 w-4 text-[#7f5700]" />
        </Button>
      </div>
    </div>
  )
}

export function CategorySortableList({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter()
  const [items, setItems] = useState(categories)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [createComingSoon, setCreateComingSoon] = useState(false)
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [editComingSoon, setEditComingSoon] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const sensors = useSensors(useSensor(PointerSensor))
  const ids = useMemo(() => items.map((item) => item.id), [items])

  useEffect(() => {
    setItems(categories)
  }, [categories])

  function startEdit(category: CategoryRow) {
    setEditing(category)
    setEditName(category.name)
    setEditSlug(category.slug)
    setEditActive(category.isActive)
    setEditComingSoon(category.comingSoon)
    setDeleteError(null)
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    const next = arrayMove(items, oldIndex, newIndex)
    setItems(next)
    startTransition(async () => {
      await reorderCategoriesAction(next.map((item) => item.id))
    })
  }

  const previewSlug = slug.trim() || generateSlug(name)

  return (
    <div className="space-y-6">
      <form
        className="space-y-4 rounded-xl border border-[#d6c4ad] bg-white p-4"
        onSubmit={(event) => {
          event.preventDefault()
          const nextName = name.trim()
          const nextSlug = (slugTouched ? slug : generateSlug(name)).trim()
          if (!nextName || !nextSlug) return

          startTransition(async () => {
            await createCategoryAction({
              name: nextName,
              slug: nextSlug,
              comingSoon: createComingSoon,
            })
            setName('')
            setSlug('')
            setSlugTouched(false)
            setCreateComingSoon(false)
            router.refresh()
          })
        }}
      >
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input
            onChange={(event) => {
              const nextName = event.target.value
              setName(nextName)
              if (!slugTouched) setSlug(generateSlug(nextName))
            }}
            placeholder="Category name"
            value={name}
          />
          <Input
            onChange={(event) => {
              setSlugTouched(true)
              setSlug(event.target.value)
            }}
            placeholder="slug"
            value={slug}
          />
          <Button disabled={pending || !name.trim() || !previewSlug} type="submit">
            Add category
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-[#eee7de] bg-[#fff8f0] px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8d9c8] bg-white">
              <CategoryIcon
                className="h-5 w-5"
                name={name || 'New category'}
                slug={previewSlug || 'new-category'}
              />
            </div>
            <p className="text-xs text-[#514534]">
              Icon is assigned automatically from the category name.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              checked={createComingSoon}
              onChange={(event) => setCreateComingSoon(event.target.checked)}
              type="checkbox"
            />
            Mark as coming soon
          </label>
        </div>
      </form>

      {editing ? (
        <form
          className="space-y-4 rounded-xl border border-[#d6c4ad] bg-white p-4"
          onSubmit={(event) => {
            event.preventDefault()
            startTransition(async () => {
              await updateCategoryAction({
                id: editing.id,
                name: editName,
                slug: editSlug,
                isActive: editActive,
                comingSoon: editComingSoon,
              })
              setItems((current) =>
                current.map((item) =>
                  item.id === editing.id
                    ? {
                        ...item,
                        name: editName.trim(),
                        slug: editSlug.trim(),
                        isActive: editActive,
                        comingSoon: editComingSoon,
                      }
                    : item,
                ),
              )
              setEditing(null)
              setDeleteError(null)
            })
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-[#1e1b16]">Edit category</h2>
            <Button
              onClick={() => {
                setEditing(null)
                setDeleteError(null)
              }}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-[#eee7de] bg-[#fff8f0] px-3 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e8d9c8] bg-white">
              <CategoryIcon className="h-6 w-6" name={editName} slug={editSlug} />
            </div>
            <p className="text-xs text-[#514534]">
              Marketplace icon preview for <strong>{editName || 'category'}</strong>
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                onChange={(event) => setEditName(event.target.value)}
                value={editName}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                onChange={(event) => setEditSlug(event.target.value)}
                value={editSlug}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              checked={editActive}
              onChange={(event) => setEditActive(event.target.checked)}
              type="checkbox"
            />
            Active on marketplace
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              checked={editComingSoon}
              onChange={(event) => setEditComingSoon(event.target.checked)}
              type="checkbox"
            />
            Coming soon (shown in the corner, not clickable)
          </label>
          {deleteError ? <p className="text-sm text-[#a83635]">{deleteError}</p> : null}
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={pending || !editName.trim() || !editSlug.trim()} type="submit">
              Save changes
            </Button>
            <Button
              className="border-[#a83635]/40 text-[#a83635] hover:bg-[#fdf2f2] hover:text-[#a83635]"
              disabled={pending}
              onClick={() => {
                if (
                  !window.confirm(
                    `Delete "${editing.name}"? This cannot be undone. Categories with products or sub-categories cannot be deleted.`,
                  )
                ) {
                  return
                }
                startTransition(async () => {
                  const result = await deleteCategoryAction(editing.id)
                  if (!result.ok) {
                    setDeleteError(result.error)
                    return
                  }
                  setItems((current) => current.filter((item) => item.id !== editing.id))
                  setEditing(null)
                  setDeleteError(null)
                })
              }}
              type="button"
              variant="outline"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete category
            </Button>
          </div>
        </form>
      ) : null}

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((category) => (
              <SortableRow category={category} key={category.id} onEdit={startEdit} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
