'use client'

import { useMemo, useState, useTransition } from 'react'
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
import { GripVertical, Pencil } from 'lucide-react'
import { Badge, Button, Input, Label } from '@bharatmart/ui'
import {
  createCategoryAction,
  reorderCategoriesAction,
  updateCategoryAction,
} from '@/app/(dashboard)/categories/actions'

type CategoryRow = {
  id: string
  name: string
  slug: string
  iconUrl: string | null
  isActive: boolean
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
        {category.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="h-10 w-10 rounded-full border border-[#eee7de] object-contain bg-[#fff8f0]"
            src={category.iconUrl}
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eee7de] text-xs text-[#837561]">
            —
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium">{category.name}</p>
          <p className="truncate text-xs text-[#837561]">
            {category.slug}
            {category.parent ? ` · child of ${category.parent.name}` : ''}
            {category.iconUrl ? ` · ${category.iconUrl}` : ''}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
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
  const [items, setItems] = useState(categories)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editIconUrl, setEditIconUrl] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [pending, startTransition] = useTransition()
  const sensors = useSensors(useSensor(PointerSensor))
  const ids = useMemo(() => items.map((item) => item.id), [items])

  function startEdit(category: CategoryRow) {
    setEditing(category)
    setEditName(category.name)
    setEditSlug(category.slug)
    setEditIconUrl(category.iconUrl ?? '')
    setEditActive(category.isActive)
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

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 rounded-xl border border-[#d6c4ad] bg-white p-4 md:grid-cols-[1fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault()
          startTransition(async () => {
            await createCategoryAction({ name, slug })
            setName('')
            setSlug('')
          })
        }}
      >
        <Input onChange={(event) => setName(event.target.value)} placeholder="Name" value={name} />
        <Input onChange={(event) => setSlug(event.target.value)} placeholder="slug" value={slug} />
        <Button disabled={pending} type="submit">
          Add category
        </Button>
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
                iconUrl: editIconUrl,
                isActive: editActive,
              })
              setItems((current) =>
                current.map((item) =>
                  item.id === editing.id
                    ? {
                        ...item,
                        name: editName.trim(),
                        slug: editSlug.trim(),
                        iconUrl: editIconUrl.trim() || null,
                        isActive: editActive,
                      }
                    : item,
                ),
              )
              setEditing(null)
            })
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-[#1e1b16]">Edit category</h2>
            <Button onClick={() => setEditing(null)} type="button" variant="ghost">
              Cancel
            </Button>
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
          <div className="space-y-1.5">
            <Label htmlFor="edit-icon">Icon URL</Label>
            <Input
              id="edit-icon"
              onChange={(event) => setEditIconUrl(event.target.value)}
              placeholder="/categories/homemade-foods.png"
              value={editIconUrl}
            />
            <p className="text-xs text-[#837561]">
              Use a storefront path like <code>/categories/your-icon.png</code> or a full image URL.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              checked={editActive}
              onChange={(event) => setEditActive(event.target.checked)}
              type="checkbox"
            />
            Active on marketplace
          </label>
          <Button disabled={pending || !editName.trim() || !editSlug.trim()} type="submit">
            Save changes
          </Button>
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
