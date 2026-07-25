'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import {
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@bharatmart/ui'
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
    <div className="flex items-center justify-end gap-2">
      <Button
        asChild
        className="border-[#d6c4ad] bg-white text-[#1e1b16] hover:bg-[#f9f3ea]"
        size="sm"
        variant="outline"
      >
        <Link aria-label="Preview product" href={`/products/${productId}/preview`}>
          <Eye className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Preview
        </Link>
      </Button>
      <Button
        asChild
        className="border-[#d6c4ad] bg-white text-[#1e1b16] hover:bg-[#f9f3ea]"
        size="sm"
        variant="outline"
      >
        <Link aria-label="Edit product" href={`/products/${productId}/edit`}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Edit
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="More product actions"
            className="border-[#d6c4ad] bg-white px-2 text-[#1e1b16] hover:bg-[#f9f3ea]"
            disabled={pending}
            size="sm"
            type="button"
            variant="outline"
          >
            <MoreVertical className="h-4 w-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 border-[#d6c4ad]">
          {isActive ? (
            <DropdownMenuItem asChild>
              <a href={marketplaceProductUrl(slug)} rel="noreferrer" target="_blank">
                <ExternalLink className="h-4 w-4" aria-hidden />
                View live
              </a>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            disabled={pending}
            onSelect={() => startTransition(async () => duplicateProductAction(productId))}
          >
            <Copy className="h-4 w-4" aria-hidden />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={pending}
            onSelect={() =>
              startTransition(async () =>
                setProductStatusAction(productId, isActive ? 'DRAFT' : 'ACTIVE'),
              )
            }
          >
            {isActive ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
            {isActive ? 'Unpublish' : 'Publish'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-[#a83635] focus:bg-[#ffdad6] focus:text-[#93000a]"
            disabled={pending}
            onSelect={() => startTransition(async () => deleteProductAction(productId))}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
