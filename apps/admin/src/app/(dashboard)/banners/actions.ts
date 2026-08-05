'use server'

import { revalidatePath } from 'next/cache'
import { BannerAdminService } from '@bharatmart/services'
import { getCurrentUser } from '@/auth'

export type BannerFormInput = {
  headline: string
  subtext: string
  ctaText: string
  ctaLink: string
  startDate: string
  endDate: string
  imageUrl: string
  isActive: boolean
  comingSoon: boolean
}

async function requireAdminUser() {
  const admin = await getCurrentUser()
  if (!admin) throw new Error('Unauthorized')
  return admin
}

async function revalidateBannerPaths() {
  revalidatePath('/banners')
  revalidatePath('/marketplace')
  revalidatePath('/')
}

export async function reorderBannersAction(orderedIds: string[]) {
  await requireAdminUser()
  await BannerAdminService.reorder(orderedIds)
  await revalidateBannerPaths()
}

export async function createBannerAction(input: BannerFormInput) {
  await requireAdminUser()
  const existing = await BannerAdminService.list()
  const nextOrder = existing.reduce((max, banner) => Math.max(max, banner.sortOrder), 0) + 1

  await BannerAdminService.create({
    imageUrl: input.imageUrl,
    headline: input.headline.trim(),
    startDate: new Date(input.startDate),
    endDate: new Date(`${input.endDate}T23:59:59.000Z`),
    isActive: input.isActive,
    comingSoon: input.comingSoon,
    sortOrder: nextOrder,
    ...(input.subtext.trim() ? { subtext: input.subtext.trim() } : {}),
    ...(input.ctaText.trim() ? { ctaText: input.ctaText.trim() } : {}),
    ...(input.ctaLink.trim() ? { ctaLink: input.ctaLink.trim() } : {}),
  })
  await revalidateBannerPaths()
}

export async function updateBannerAction(id: string, input: BannerFormInput) {
  await requireAdminUser()
  await BannerAdminService.update(id, {
    imageUrl: input.imageUrl,
    headline: input.headline.trim(),
    subtext: input.subtext.trim() || null,
    ctaText: input.ctaText.trim() || null,
    ctaLink: input.ctaLink.trim() || null,
    startDate: new Date(input.startDate),
    endDate: new Date(`${input.endDate}T23:59:59.000Z`),
    isActive: input.isActive,
    comingSoon: input.comingSoon,
  })
  await revalidateBannerPaths()
}

export async function toggleBannerActiveAction(id: string, isActive: boolean) {
  await requireAdminUser()
  await BannerAdminService.update(id, { isActive })
  await revalidateBannerPaths()
}

export async function deleteBannerAction(id: string) {
  await requireAdminUser()
  await BannerAdminService.delete(id)
  await revalidateBannerPaths()
}
