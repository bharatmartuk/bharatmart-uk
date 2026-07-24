import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Star } from 'lucide-react'
import { Badge, Card, CardContent, Separator } from '@bharatmart/ui'
import { ProductService, ReviewService } from '@bharatmart/services'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { MerchantLogo } from '@/components/merchant/MerchantLogo'
import { FavoriteButton } from '@/components/product/FavoriteButton'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { RelatedProducts } from '@/components/product/RelatedProducts'

export const dynamic = 'force-dynamic'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await ProductService.getBySlug(slug)
  if (!product) notFound()

  const [reviews, relatedResult] = await Promise.all([
    ReviewService.getForProduct(product.id, 1, 8),
    ProductService.searchProducts({
      category: product.category.slug,
      page: 1,
      pageSize: 8,
      sort: 'relevance',
    }),
  ])
  const relatedProducts = relatedResult.items
    .filter((item) => item.id !== product.id)
    .slice(0, 4)

  const wishlistItem = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    imageUrl: product.images[0]?.url ?? null,
    priceInPence: product.priceInPence,
    stockQuantity: product.stockQuantity,
    merchantId: product.merchantId,
    merchantName: product.merchant.storeName,
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-16">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-[#837561]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-[#7f5700]" href="/">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link className="hover:text-[#7f5700]" href={`/products?category=${product.category.slug}`}>
              {product.category.name}
            </Link>
          </li>
          <li>/</li>
          <li className="font-medium text-[#1e1b16]">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductImageGallery
          favorite={wishlistItem}
          images={product.images}
          productName={product.name}
        />

        <section className="space-y-5">
          <div>
            <p className="text-sm text-[#837561]">
              Sold by{' '}
              <Link
                className="font-medium text-[#a83635] hover:underline"
                href={`/products?merchantId=${product.merchantId}`}
              >
                {product.merchant.storeName}
              </Link>
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-[#1e1b16] md:text-4xl">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-[#e8a317] text-[#e8a317]" />
                <strong>{product.avgRating.toNumber().toFixed(1)}</strong>
                <span className="text-[#837561]">({product.reviewCount} reviews)</span>
              </div>
              <Badge variant="secondary">
                {product.stockQuantity > 0 ? 'In stock' : 'Out of stock'}
              </Badge>
            </div>
          </div>

          <p className="text-3xl font-bold text-[#a83635]">
            {priceFormatter.format(product.priceInPence / 100)}
          </p>

          <p className="leading-7 text-[#514534]">{product.description}</p>

          <div className="flex flex-wrap gap-3">
            <AddToCartButton
              className="h-11 bg-[#2e6a39] px-6 text-white hover:bg-[#135224]"
              item={wishlistItem}
              showIcon
            />
            <FavoriteButton item={wishlistItem} variant="labeled" />
          </div>

          <Card className="border-[#d6c4ad] bg-[#f9f3ea]">
            <CardContent className="flex items-center gap-4 p-4">
              <MerchantLogo
                className="h-20 w-20 border md:h-24 md:w-24"
                sizes="(max-width: 768px) 80px, 96px"
                storeLogoUrl={product.merchant.storeLogoUrl}
                storeName={product.merchant.storeName}
              />
              <div className="min-w-0">
                <h2 className="font-semibold">{product.merchant.storeName}</h2>
                <p className="line-clamp-2 text-sm text-[#514534]">
                  {product.merchant.storeDescription || 'Verified BharatMart merchant'}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <Separator className="my-12 bg-[#d6c4ad]" />

      <section aria-labelledby="reviews-heading">
        <h2 className="font-heading text-2xl font-semibold" id="reviews-heading">
          Customer reviews
        </h2>
        {reviews.items.length === 0 ? (
          <p className="mt-4 text-sm text-[#514534]">No reviews yet for this product.</p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {reviews.items.map((review) => (
              <Card className="border-[#d6c4ad]" key={review.id}>
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{review.customer.name ?? 'BharatMart shopper'}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-[#e8a317] text-[#e8a317]" />
                      {review.rating}
                    </div>
                  </div>
                  {review.comment ? <p className="text-sm text-[#514534]">{review.comment}</p> : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator className="my-10 bg-[#d6c4ad] md:my-12" />

      <RelatedProducts categoryName={product.category.name} products={relatedProducts} />
    </main>
  )
}
