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
import { uploadFileToCloudinary } from '@bharatmart/utils'
import { Badge, Button, Input, Label } from '@bharatmart/ui'
import { createBannerAction, reorderBannersAction } from '@/app/(dashboard)/banners/actions'

type BannerRow = {
  id: string
  headline: string
  subtext: string | null
  isActive: boolean
  startDate: string
  endDate: string
}

function SortableBanner({ banner }: { banner: BannerRow }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: banner.id,
  })

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-lg border border-[#d6c4ad] bg-white px-3 py-2"
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div className="flex items-center gap-3">
        <button type="button" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 text-[#837561]" />
        </button>
        <div>
          <p className="font-medium">{banner.headline}</p>
          <p className="text-xs text-[#837561]">
            {new Date(banner.startDate).toLocaleDateString('en-GB')} →{' '}
            {new Date(banner.endDate).toLocaleDateString('en-GB')}
          </p>
        </div>
      </div>
      <Badge>{banner.isActive ? 'Active' : 'Inactive'}</Badge>
    </div>
  )
}

export function BannerManager({ banners }: { banners: BannerRow[] }) {
  const [items, setItems] = useState(banners)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({
    headline: '',
    subtext: '',
    ctaText: '',
    ctaLink: '/products',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10),
    imageUrl: '',
  })
  const [uploadError, setUploadError] = useState<string | null>(null)
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
      await reorderBannersAction(next.map((item) => item.id))
    })
  }

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 rounded-xl border border-[#d6c4ad] bg-white p-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (!form.imageUrl) {
            setUploadError('Upload a banner image first.')
            return
          }
          startTransition(async () => {
            await createBannerAction(form)
            setForm((current) => ({
              ...current,
              headline: '',
              subtext: '',
              ctaText: '',
              imageUrl: '',
            }))
          })
        }}
      >
        <div className="space-y-2 md:col-span-2">
          <Label>Headline</Label>
          <Input
            onChange={(event) => setForm((current) => ({ ...current, headline: event.target.value }))}
            value={form.headline}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Subtext</Label>
          <Input
            onChange={(event) => setForm((current) => ({ ...current, subtext: event.target.value }))}
            value={form.subtext}
          />
        </div>
        <div className="space-y-2">
          <Label>CTA text</Label>
          <Input
            onChange={(event) => setForm((current) => ({ ...current, ctaText: event.target.value }))}
            value={form.ctaText}
          />
        </div>
        <div className="space-y-2">
          <Label>CTA link</Label>
          <Input
            onChange={(event) => setForm((current) => ({ ...current, ctaLink: event.target.value }))}
            value={form.ctaLink}
          />
        </div>
        <div className="space-y-2">
          <Label>Start date</Label>
          <Input
            onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
            type="date"
            value={form.startDate}
          />
        </div>
        <div className="space-y-2">
          <Label>End date</Label>
          <Input
            onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
            type="date"
            value={form.endDate}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Banner image (signed Cloudinary upload)</Label>
          <Input
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              setUploadError(null)
              startTransition(async () => {
                try {
                  const uploaded = await uploadFileToCloudinary(file, 'bharatmart/banners')
                  setForm((current) => ({ ...current, imageUrl: uploaded.url }))
                } catch {
                  setUploadError('Image upload failed.')
                }
              })
            }}
            type="file"
          />
          {form.imageUrl ? (
            <p className="text-xs text-[#2e6a39]">Image ready: {form.imageUrl}</p>
          ) : null}
          {uploadError ? <p className="text-xs text-[#a83635]">{uploadError}</p> : null}
        </div>
        <Button className="md:col-span-2" disabled={pending} type="submit">
          Create banner
        </Button>
      </form>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((banner) => (
              <SortableBanner banner={banner} key={banner.id} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
