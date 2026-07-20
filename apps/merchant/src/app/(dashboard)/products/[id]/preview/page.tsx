import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge, Button, Card, CardContent } from '@bharatmart/ui'
import { prisma } from '@bharatmart/database'
import { requireMerchant } from '@/lib/merchant-context'
import { marketplaceProductUrl } from '@/lib/marketplace-url'
import { resolveMarketplaceAssetUrl } from '@/lib/resolve-asset-url'

export const dynamic = 'force-dynamic'

export default async function ProductPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { merchant } = await requireMerchant()
  const { id } = await params
  const product = await prisma.product.findFirst({
    where: { id, merchantId: merchant.id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: { select: { name: true, slug: true } },
    },
  })

  if (!product) notFound()

  const cover = resolveMarketplaceAssetUrl(product.images[0]?.url ?? null)

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link className="text-sm font-medium text-[#7f5700] hover:underline" href="/products">
            ← Back to products
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-semibold">Marketplace preview</h1>
          <p className="mt-1 text-sm text-[#514534]">
            This is how customers will see this product on BharatMart UK.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/products/${product.id}/edit`}>Edit product</Link>
          </Button>
          {product.status === 'ACTIVE' ? (
            <Button asChild className="bg-[#7f5700] text-white hover:bg-[#604100]">
              <a href={marketplaceProductUrl(product.slug)} rel="noreferrer" target="_blank">
                Open live page
              </a>
            </Button>
          ) : (
            <Badge variant="secondary">{product.status} — publish to go live</Badge>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#d6c4ad] bg-[#fff8f0] p-4 md:p-8">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
            {cover ? (
              <Image
                alt={product.name}
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                src={cover}
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#837561]">
                No product image uploaded
              </div>
            )}
          </div>

          <section className="space-y-4">
            <p className="text-sm text-[#837561]">
              Sold by <span className="font-medium text-[#a83635]">{merchant.storeName}</span>
            </p>
            <h2 className="font-heading text-3xl font-semibold text-[#1e1b16]">{product.name}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{product.category.name}</Badge>
              <Badge>{product.status}</Badge>
              <Badge variant="secondary">
                {product.stockQuantity > 0 ? 'In stock' : 'Out of stock'}
              </Badge>
            </div>
            <p className="text-3xl font-bold text-[#a83635]">
              £{(product.priceInPence / 100).toFixed(2)}
            </p>
            <p className="leading-7 text-[#514534]">{product.description}</p>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-[#2e6a39] text-white hover:bg-[#135224]" disabled type="button">
                Add to Cart
              </Button>
              <Button disabled type="button" variant="outline">
                Chat with Seller on WhatsApp
              </Button>
            </div>
            <Card className="border-[#d6c4ad] bg-white">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[#e8d9c8] bg-[#f9f3ea]">
                  {merchant.storeLogoUrl ? (
                    <Image
                      alt=""
                      className="object-contain p-2"
                      fill
                      sizes="64px"
                      src={resolveMarketplaceAssetUrl(merchant.storeLogoUrl) ?? merchant.storeLogoUrl}
                      unoptimized
                    />
                  ) : null}
                </div>
                <div>
                  <p className="font-semibold">{merchant.storeName}</p>
                  <p className="line-clamp-2 text-sm text-[#514534]">
                    {merchant.storeDescription || 'Verified BharatMart merchant'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {product.images.length > 1 ? (
          <div className="mx-auto mt-8 grid max-w-5xl grid-cols-4 gap-3 md:grid-cols-6">
            {product.images.map((image) => (
              <div
                className="relative aspect-square overflow-hidden rounded-lg border border-[#d6c4ad] bg-white"
                key={image.id}
              >
                <Image alt="" className="object-cover" fill sizes="120px" src={resolveMarketplaceAssetUrl(image.url) ?? image.url} unoptimized />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  )
}
