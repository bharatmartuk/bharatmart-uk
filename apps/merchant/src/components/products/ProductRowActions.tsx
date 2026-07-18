'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { Button } from '@bharatmart/ui'
import { deleteProductAction, duplicateProductAction } from '@/app/(dashboard)/products/actions'

export function ProductRowActions({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={`/products/${productId}/edit`}>Edit</Link>
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
