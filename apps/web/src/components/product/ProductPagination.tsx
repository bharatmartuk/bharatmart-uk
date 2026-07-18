import Link from 'next/link'
import { Button } from '@bharatmart/ui'

interface ProductPaginationProps {
  page: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}

function hrefFor(page: number, searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value)
  }
  if (page <= 1) params.delete('page')
  else params.set('page', String(page))
  const query = params.toString()
  return query ? `/products?${query}` : '/products'
}

export function ProductPagination({ page, totalPages, searchParams }: ProductPaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, page - 3),
    Math.max(0, page - 3) + 5,
  )

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <Button asChild disabled={page <= 1} size="sm" variant="outline">
        <Link href={hrefFor(page - 1, searchParams)}>Previous</Link>
      </Button>
      {pages.map((entry) => (
        <Button
          asChild
          className={entry === page ? 'bg-[#7f5700] text-white hover:bg-[#604100]' : ''}
          key={entry}
          size="sm"
          variant={entry === page ? 'default' : 'outline'}
        >
          <Link href={hrefFor(entry, searchParams)}>{entry}</Link>
        </Button>
      ))}
      <Button asChild disabled={page >= totalPages} size="sm" variant="outline">
        <Link href={hrefFor(page + 1, searchParams)}>Next</Link>
      </Button>
    </nav>
  )
}
