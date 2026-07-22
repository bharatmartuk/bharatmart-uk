import Image from 'next/image'
import { cn } from '@bharatmart/utils'

type MerchantLogoProps = {
  storeName: string
  storeLogoUrl: string | null
  className?: string
  imageClassName?: string
  sizes?: string
}

/** Cloudinary transform so logos fill the circle (trim padding, then crop to square). */
function filledMerchantLogoUrl(url: string) {
  if (!url.includes('res.cloudinary.com/') || !url.includes('/upload/')) return url
  return url.replace(/\/upload\/(?:[^/]+\/)?/, '/upload/e_trim,c_fill,g_center,w_500,h_500/')
}

export function MerchantLogo({
  storeName,
  storeLogoUrl,
  className,
  imageClassName,
  sizes = '112px',
}: MerchantLogoProps) {
  const src = storeLogoUrl ? filledMerchantLogoUrl(storeLogoUrl) : null

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full border-2 border-[#e8d9c8] bg-[#f4ede4]',
        className,
      )}
    >
      {src ? (
        <Image
          alt={`${storeName} logo`}
          className={cn('scale-125 object-cover object-center', imageClassName)}
          fill
          sizes={sizes}
          src={src}
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#f4ede4] text-base font-semibold text-[#7f5700]">
          {storeName.slice(0, 1)}
        </div>
      )}
    </div>
  )
}
