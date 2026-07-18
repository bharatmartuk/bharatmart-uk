'use server'

import { revalidatePath } from 'next/cache'
import { BannerAdminService } from '@bharatmart/services'

export async function reorderBannersAction(orderedIds: string[]) {
  await BannerAdminService.reorder(orderedIds)
  revalidatePath('/banners')
}

export async function createBannerAction(input: {
  headline: string
  subtext: string
  ctaText: string
  ctaLink: string
  startDate: string
  endDate: string
  imageUrl: string
}) {
  await BannerAdminService.create({
    imageUrl: input.imageUrl,
    headline: input.headline,
    subtext: input.subtext,
    ctaText: input.ctaText,
    ctaLink: input.ctaLink,
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
    isActive: true,
  })
  revalidatePath('/banners')
}
