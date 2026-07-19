'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition } from 'react'
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
import { uploadFileToCloudinary } from '@bharatmart/utils'
import { Badge, Button, Input, Label } from '@bharatmart/ui'
import {
  createBannerAction,
  deleteBannerAction,
  reorderBannersAction,
  toggleBannerActiveAction,
  updateBannerAction,
  type BannerFormInput,
} from '@/app/(dashboard)/banners/actions'

export type BannerRow = {
  id: string
  imageUrl: string
  headline: string
  subtext: string | null
  ctaText: string | null
  ctaLink: string | null
  isActive: boolean
  startDate: string
  endDate: string
  sortOrder: number
}

function emptyForm(): BannerFormInput {
  const today = new Date().toISOString().slice(0, 10)
  const inNinetyDays = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10)
  return {
    headline: '',
    subtext: '',
    ctaText: 'Shop now',
    ctaLink: '/products',
    startDate: today,
    endDate: inNinetyDays,
    imageUrl: '',
    isActive: true,
  }
}

function toForm(banner: BannerRow): BannerFormInput {
  return {
    headline: banner.headline,
    subtext: banner.subtext ?? '',
    ctaText: banner.ctaText ?? '',
    ctaLink: banner.ctaLink ?? '/products',
    startDate: banner.startDate.slice(0, 10),
    endDate: banner.endDate.slice(0, 10),
    imageUrl: banner.imageUrl,
    isActive: banner.isActive,
  }
}

/** Relative paths live on the storefront (`/carousel/...`), not the admin app. */
function resolveBannerImageUrl(url: string) {
  if (!url.startsWith('/')) return url
  const base = (
    process.env.NEXT_PUBLIC_WEB_APP_URL?.trim() || 'https://bharatmart-uk.vercel.app'
  ).replace(/\/$/, '')
  return `${base}${url}`
}

function SortableBannerCard({
  banner,
  editing,
  onEdit,
  onCancel,
  onSaved,
  pending,
}: {
  banner: BannerRow
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  onSaved: () => void
  pending: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: banner.id,
  })
  const [form, setForm] = useState(() => toForm(banner))
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [localPending, startLocal] = useTransition()
  const busy = pending || localPending

  useEffect(() => {
    if (editing) setForm(toForm(banner))
  }, [banner, editing])

  return (
    <div
      className="rounded-xl border border-[#d6c4ad] bg-white p-4"
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div className="flex flex-wrap items-start gap-4">
        <button
          aria-label="Drag to reorder"
          className="mt-1 text-[#837561]"
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-[#f4ede4]">
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="128px"
            src={resolveBannerImageUrl(banner.imageUrl)}
            unoptimized
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-[#1e1b16]">{banner.headline}</p>
            <Badge variant={banner.isActive ? 'default' : 'secondary'}>
              {banner.isActive ? 'Live' : 'Hidden'}
            </Badge>
          </div>
          {banner.subtext ? (
            <p className="line-clamp-2 text-sm text-[#514534]">{banner.subtext}</p>
          ) : null}
          <p className="text-xs text-[#837561]">
            {new Date(banner.startDate).toLocaleDateString('en-GB')} →{' '}
            {new Date(banner.endDate).toLocaleDateString('en-GB')}
            {banner.ctaText ? ` · ${banner.ctaText}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={busy}
            onClick={() => {
              startLocal(async () => {
                await toggleBannerActiveAction(banner.id, !banner.isActive)
                onSaved()
              })
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            {banner.isActive ? 'Hide' : 'Show'}
          </Button>
          <Button
            disabled={busy}
            onClick={onEdit}
            size="sm"
            type="button"
            variant="outline"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            disabled={busy}
            onClick={() => {
              if (!window.confirm(`Delete carousel slide “${banner.headline}”?`)) return
              startLocal(async () => {
                await deleteBannerAction(banner.id)
                onSaved()
              })
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {editing ? (
        <form
          className="mt-4 grid gap-3 border-t border-[#eee7de] pt-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (!form.imageUrl.trim()) {
              setUploadError('Add an image URL or upload a file.')
              return
            }
            startLocal(async () => {
              await updateBannerAction(banner.id, form)
              onSaved()
              onCancel()
            })
          }}
        >
          <BannerFields
            form={form}
            onChange={setForm}
            onUploadError={setUploadError}
            pending={busy}
            uploadError={uploadError}
          />
          <div className="flex gap-2 md:col-span-2">
            <Button disabled={busy} type="submit">
              Save changes
            </Button>
            <Button disabled={busy} onClick={onCancel} type="button" variant="outline">
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  )
}

function BannerFields({
  form,
  onChange,
  pending,
  uploadError,
  onUploadError,
}: {
  form: BannerFormInput
  onChange: (next: BannerFormInput | ((current: BannerFormInput) => BannerFormInput)) => void
  pending: boolean
  uploadError: string | null
  onUploadError: (message: string | null) => void
}) {
  return (
    <>
      <div className="space-y-2 md:col-span-2">
        <Label>Headline</Label>
        <Input
          onChange={(event) => onChange((current) => ({ ...current, headline: event.target.value }))}
          required
          value={form.headline}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Subtext</Label>
        <Input
          onChange={(event) => onChange((current) => ({ ...current, subtext: event.target.value }))}
          value={form.subtext}
        />
      </div>
      <div className="space-y-2">
        <Label>CTA text</Label>
        <Input
          onChange={(event) => onChange((current) => ({ ...current, ctaText: event.target.value }))}
          value={form.ctaText}
        />
      </div>
      <div className="space-y-2">
        <Label>CTA link</Label>
        <Input
          onChange={(event) => onChange((current) => ({ ...current, ctaLink: event.target.value }))}
          placeholder="/products"
          value={form.ctaLink}
        />
      </div>
      <div className="space-y-2">
        <Label>Start date</Label>
        <Input
          onChange={(event) => onChange((current) => ({ ...current, startDate: event.target.value }))}
          required
          type="date"
          value={form.startDate}
        />
      </div>
      <div className="space-y-2">
        <Label>End date</Label>
        <Input
          onChange={(event) => onChange((current) => ({ ...current, endDate: event.target.value }))}
          required
          type="date"
          value={form.endDate}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Image URL</Label>
        <Input
          onChange={(event) => onChange((current) => ({ ...current, imageUrl: event.target.value }))}
          placeholder="https://… or /carousel/my-slide.png"
          value={form.imageUrl}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Or upload image</Label>
        <Input
          disabled={pending}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            onUploadError(null)
            void uploadFileToCloudinary(file, 'bharatmart/banners')
              .then((uploaded) => {
                onChange((current) => ({ ...current, imageUrl: uploaded.url }))
              })
              .catch(() => onUploadError('Image upload failed. Paste an image URL instead.'))
          }}
          type="file"
          accept="image/*"
        />
        {form.imageUrl ? (
          <div className="relative mt-2 h-32 w-full max-w-md overflow-hidden rounded-md bg-[#f4ede4]">
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="400px"
              src={resolveBannerImageUrl(form.imageUrl)}
              unoptimized
            />
          </div>
        ) : null}
        {uploadError ? <p className="text-xs text-[#a83635]">{uploadError}</p> : null}
      </div>
      <label className="flex items-center gap-2 text-sm text-[#514534] md:col-span-2">
        <input
          checked={form.isActive}
          onChange={(event) =>
            onChange((current) => ({ ...current, isActive: event.target.checked }))
          }
          type="checkbox"
        />
        Show on homepage carousel (within date range)
      </label>
    </>
  )
}

export function BannerManager({ banners }: { banners: BannerRow[] }) {
  const router = useRouter()
  const [items, setItems] = useState(banners)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState(emptyForm)
  const [createError, setCreateError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const sensors = useSensors(useSensor(PointerSensor))
  const ids = useMemo(() => items.map((item) => item.id), [items])

  useEffect(() => {
    setItems(banners)
  }, [banners])

  function refreshFromServer() {
    router.refresh()
  }

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
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Carousel slides</h2>
        <p className="text-sm text-[#514534]">
          Drag to change order. Active slides within their date range appear on the marketplace
          homepage hero.
        </p>

        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#d6c4ad] bg-white p-6 text-sm text-[#514534]">
            No carousel slides yet. Create one below.
          </p>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {items.map((banner) => (
                  <SortableBannerCard
                    banner={banner}
                    editing={editingId === banner.id}
                    key={banner.id}
                    onCancel={() => setEditingId(null)}
                    onEdit={() => setEditingId(banner.id)}
                    onSaved={refreshFromServer}
                    pending={pending}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Add slide</h2>
        <form
          className="grid gap-3 rounded-xl border border-[#d6c4ad] bg-white p-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (!createForm.imageUrl.trim() || !createForm.headline.trim()) {
              setCreateError('Headline and image are required.')
              return
            }
            setCreateError(null)
            startTransition(async () => {
              await createBannerAction(createForm)
              setCreateForm(emptyForm())
              refreshFromServer()
            })
          }}
        >
          <BannerFields
            form={createForm}
            onChange={setCreateForm}
            onUploadError={setCreateError}
            pending={pending}
            uploadError={createError}
          />
          <Button className="md:col-span-2" disabled={pending} type="submit">
            {pending ? 'Saving…' : 'Add to carousel'}
          </Button>
        </form>
      </section>
    </div>
  )
}
