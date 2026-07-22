import Image from 'next/image'
import { cn } from '@bharatmart/utils'

type MerchantLogoProps = {
  storeName: string
  storeLogoUrl: string | null
  className?: string
  imageClassName?: string
  sizes?: string
}

const FILL_TRANSFORMS = 'e_trim:40/c_fill,g_center,w_800,h_800,q_auto,f_auto'

/**
 * Rebuild Cloudinary URLs so illustrated logos (with lots of white canvas)
 * are trimmed and hard-cropped before we zoom them into the circle.
 */
function filledMerchantLogoUrl(url: string) {
  const marker = '/image/upload/'
  const idx = url.indexOf(marker)
  if (!url.includes('res.cloudinary.com') || idx === -1) return url

  const prefix = url.slice(0, idx + marker.length)
  const rest = url.slice(idx + marker.length)
  const segments = rest.split('/').filter(Boolean)

  let i = 0
  while (i < segments.length) {
    const seg = segments[i]
    if (seg == null) break
    if (/^v\d+$/.test(seg)) {
      i += 1
      break
    }
    // Drop existing transformation segments (comma lists or known prefixes)
    if (
      seg.includes(',') ||
      /^(c_|e_|w_|h_|q_|f_|g_|b_|ar_|fl_|dpr_|r_)/.test(seg)
    ) {
      i += 1
      continue
    }
    break
  }

  const publicId = segments.slice(i).join('/')
  if (!publicId) return url
  return `${prefix}${FILL_TRANSFORMS}/${publicId}`
}

export function MerchantLogo({
  storeName,
  storeLogoUrl,
  className,
  imageClassName,
  sizes = '128px',
}: MerchantLogoProps) {
  const src = storeLogoUrl ? filledMerchantLogoUrl(storeLogoUrl) : null

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full border-2 border-[#e8d9c8] bg-white',
        className,
      )}
    >
      {src ? (
        <Image
          alt={`${storeName} logo`}
          className={cn(
            // Illustrations ship with large white margins; zoom until art hits the rim
            'scale-[2.55] object-cover object-center',
            imageClassName,
          )}
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
