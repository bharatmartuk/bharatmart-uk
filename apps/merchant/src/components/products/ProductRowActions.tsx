'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { Button } from '@bharatmart/ui'
import {
  deleteProductAction,
  duplicateProductAction,
  setProductStatusAction,
} from '@/app/(dashboard)/products/actions'
import { marketplaceProductUrl } from '@/lib/marketplace-url'

export function ProductRowActions({
  productId,
  slug,
  status,
}: {
  productId: string
  slug: string
  status: string
}) {
  const [pending, startTransition] = useTransition()
  const isActive = status === 'ACTIVE'

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={`/products/${productId}/preview`}>Preview</Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href={`/products/${productId}/edit`}>Edit</Link>
      </Button>
      {isActive ? (
        <Button asChild size="sm" variant="outline">
          <a href={marketplaceProductUrl(slug)} rel="noreferrer" target="_blank">
            View live
          </a>
        </Button>
      ) : null}
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () =>
            setProductStatusAction(productId, isActive ? 'DRAFT' : 'ACTIVE'),
          )
        }
        size="sm"
        type="button"
        variant="outline"
      >
        {isActive ? 'Unpublish' : 'Publish'}
      </Button>
      <Button
        disabled={pending}
        onClick={() => startTransition(async () => duplicateProductAction(productId))}
        size="sm"
        type="button"
        variant="outline"
      >
        Duplicate
      </Button>
      <Button
        disabled={pending}
        onClick={() => startTransition(async () => deleteProductAction(productId))}
        size="sm"
        type="button"
        variant="destructive"
      >
        Delete
      </Button>
    </div>
  )
}
