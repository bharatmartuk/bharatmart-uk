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
import { GripVertical } from 'lucide-react'
import { Badge, Button, Input } from '@bharatmart/ui'
import { createCategoryAction, reorderCategoriesAction } from '@/app/(dashboard)/categories/actions'

type CategoryRow = {
  id: string
  name: string
  slug: string
  isActive: boolean
  parent: { id: string; name: string } | null
  _count: { products: number; children: number }
}

function SortableRow({ category }: { category: CategoryRow }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: category.id,
  })

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-lg border border-[#d6c4ad] bg-white px-3 py-2"
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div className="flex items-center gap-3">
        <button className="text-[#837561]" type="button" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <div>
          <p className="font-medium">{category.name}</p>
          <p className="text-xs text-[#837561]">
            {category.slug}
            {category.parent ? ` · child of ${category.parent.name}` : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{category._count.products} products</Badge>
        <Badge>{category.isActive ? 'Active' : 'Inactive'}</Badge>
      </div>
    </div>
  )
}

export function CategorySortableList({ categories }: { categories: CategoryRow[] }) {
  const [items, setItems] = useState(categories)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [pending, startTransition] = useTransition()
  const sensors = useSensors(useSensor(PointerSensor))
  const ids = useMemo(() => items.map((item) => item.id), [items])

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

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((category) => (
              <SortableRow category={category} key={category.id} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
