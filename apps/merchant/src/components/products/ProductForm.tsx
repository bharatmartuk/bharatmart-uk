'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductInput } from '@bharatmart/validation'
import { Button, Input, Label } from '@bharatmart/ui'
import { uploadFileToCloudinary } from '@bharatmart/utils'
import { createProductAction, updateProductAction } from '@/app/(dashboard)/products/actions'

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

  return (
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
          <Input
            type="number"
            {...form.register('priceInPence', { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Stock</Label>
          <Input
            type="number"
            {...form.register('stockQuantity', { valueAsNumber: true })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input {...form.register('description')} />
      </div>
      <div className="space-y-2">
        <Label>Images</Label>
        <Input
          multiple
          onChange={async (event) => {
            const files = [...(event.target.files ?? [])]
            try {
              const uploaded = await Promise.all(
                files.map((file) => uploadFileToCloudinary(file, 'bharatmart/products')),
              )
              form.setValue(
                'imageUrls',
                [...imageUrls, ...uploaded.map((item) => item.url)].slice(0, 8),
                { shouldValidate: true },
              )
            } catch {
              setError('Image upload failed. Please try again.')
            }
          }}
          type="file"
        />
        <p className="text-xs text-[#514534]">{imageUrls.length} image(s) attached</p>
      </div>
      {error ? <p className="text-sm text-[#a83635]">{error}</p> : null}
      <div className="flex gap-3">
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
      </div>
    </form>
  )
}
