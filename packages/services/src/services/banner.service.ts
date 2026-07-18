import 'server-only'

import { bannerRepository } from '../repositories/banner.repository'

export interface BannerSummary {
  id: string
  imageUrl: string
  headline: string
  subtext: string
  ctaText: string
  ctaLink: string
}

export const BannerService = {
  async getActiveBanners(): Promise<BannerSummary[]> {
    const banners = await bannerRepository.findActive()
    return banners.map(({ id, imageUrl, headline, subtext, ctaText, ctaLink }) => ({
      id,
      imageUrl,
      headline,
      subtext: subtext ?? '',
      ctaText: ctaText ?? '',
      ctaLink: ctaLink ?? '',
    }))
  },
}
