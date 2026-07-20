'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { productSchema, type ProductInput } from '@bharatmart/validation'
import { Button, Input, Label } from '@bharatmart/ui'
import { uploadFileToCloudinary } from '@bharatmart/utils'
import { createProductAction, updateProductAction } from '@/app/(dashboard)/products/actions'
import { marketplaceProductUrl } from '@/lib/marketplace-url'
import { resolveMarketplaceAssetUrl } from '@/lib/resolve-asset-url'

type CategoryOption = { id: string; name: string }

export function ProductForm({
  categories,
  initial,
  productId,
}: {
  categories: CategoryOption[]
  initial?: ProductInput
  productId?: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: initial ?? {
      name: '',
      slug: '',
      description: '',
      categoryId: categories[0]?.id ?? '',
      priceInPence: 100,
      stockQuantity: 0,
      sku: '',
      imageUrls: [],
      status: 'DRAFT',
    },
  })

  const imageUrls = form.watch('imageUrls')
  const name = form.watch('name')
  const slug = form.watch('slug')
  const priceInPence = form.watch('priceInPence')
  const description = form.watch('description')

  async function save(status: 'DRAFT' | 'ACTIVE') {
    setError(null)
    const values = form.getValues()
    const payload = { ...values, status }
    const result = productId
      ? await updateProductAction(productId, payload)
      : await createProductAction(payload, status)

    if (!result.ok) {
      setError(result.error)
      return
    }

    router.push('/products')
    router.refresh()
  }

  function removeImage(url: string) {
    form.setValue(
      'imageUrls',
      imageUrls.filter((entry) => entry !== url),
      { shouldValidate: true, shouldDirty: true },
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form className="space-y-4 rounded-xl border border-[#d6c4ad] bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...form.register('name')} />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input {...form.register('slug')} />
          </div>
          <div className="space-y-2">
            <Label>SKU</Label>
            <Input {...form.register('sku')} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              {...form.register('categoryId')}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Price (pence)</Label>
            <Input type="number" {...form.register('priceInPence', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Stock</Label>
            <Input type="number" {...form.register('stockQuantity', { valueAsNumber: true })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <textarea
            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            {...form.register('description')}
          />
        </div>
        <div className="space-y-3">
          <Label>Images</Label>
          <Input
            disabled={uploading}
            multiple
            accept="image/*"
            onChange={async (event) => {
              const files = [...(event.target.files ?? [])]
              if (files.length === 0) return
              setUploading(true)
              setError(null)
              try {
                const uploaded = await Promise.all(
                  files.map((file) => uploadFileToCloudinary(file, 'bharatmart/products')),
                )
                form.setValue(
                  'imageUrls',
                  [...imageUrls, ...uploaded.map((item) => item.url)].slice(0, 8),
                  { shouldValidate: true, shouldDirty: true },
                )
              } catch {
                setError('Image upload failed. Please try again.')
              } finally {
                setUploading(false)
                event.target.value = ''
              }
            }}
            type="file"
          />
          <p className="text-xs text-[#514534]">
            {uploading
              ? 'Uploading…'
              : `${imageUrls.length} image(s) attached (max 8). First image is the marketplace cover.`}
          </p>
          {imageUrls.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {imageUrls.map((url, index) => (
                <div
                  className="relative aspect-square overflow-hidden rounded-lg border border-[#d6c4ad] bg-[#f9f3ea]"
                  key={`${url}-${index}`}
                >
                  <Image
                    alt={`Product image ${index + 1}`}
                    className="object-cover"
                    fill
                    sizes="160px"
                    src={resolveMarketplaceAssetUrl(url) ?? url}
                    unoptimized
                  />
                  {index === 0 ? (
                    <span className="absolute left-2 top-2 rounded bg-[#7f5700] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      Cover
                    </span>
                  ) : null}
                  <button
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute right-2 top-2 rounded-full bg-white/95 p-1 text-[#a83635] shadow"
                    onClick={() => removeImage(url)}
                    type="button"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#d6c4ad] bg-[#f9f3ea] px-4 py-8 text-center text-sm text-[#837561]">
              No images yet. Upload product photos to preview them here.
            </div>
          )}
        </div>
        {error ? <p className="text-sm text-[#a83635]">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void save('DRAFT')} type="button" variant="outline">
            Save draft
          </Button>
          <Button
            className="bg-[#2e6a39] text-white hover:bg-[#135224]"
            onClick={() => void save('ACTIVE')}
            type="button"
          >
            Publish
          </Button>
          {productId && slug ? (
            <Button asChild type="button" variant="outline">
              <a href={`/products/${productId}/preview`}>Preview marketplace look</a>
            </Button>
          ) : null}
        </div>
      </form>

      <aside className="space-y-3">
        <p className="text-sm font-semibold text-[#514534]">Live card preview</p>
        <div className="overflow-hidden rounded-xl border border-[#d6c4ad] bg-white shadow-sm">
          <div className="relative aspect-square bg-[#f9f3ea]">
            {imageUrls[0] ? (
              <Image alt="" className="object-cover" fill sizes="320px" src={resolveMarketplaceAssetUrl(imageUrls[0]) ?? imageUrls[0]} unoptimized />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#837561]">
                Image preview
              </div>
            )}
          </div>
          <div className="space-y-2 p-4">
            <p className="line-clamp-2 font-semibold text-[#1e1b16]">{name || 'Product name'}</p>
            <p className="line-clamp-2 text-xs text-[#514534]">
              {description || 'Product description appears here.'}
            </p>
            <p className="font-bold text-[#a83635]">
              £{(((Number.isFinite(priceInPence) ? priceInPence : 0) as number) / 100).toFixed(2)}
            </p>
          </div>
        </div>
        {slug ? (
          <a
            className="block text-xs font-medium text-[#7f5700] hover:underline"
            href={marketplaceProductUrl(slug)}
            rel="noreferrer"
            target="_blank"
          >
            Open live marketplace page ↗
          </a>
        ) : null}
      </aside>
    </div>
  )
}
