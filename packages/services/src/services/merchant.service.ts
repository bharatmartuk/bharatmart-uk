import 'server-only'

import { merchantOnboardingSchema, type MerchantOnboardingInput } from '@bharatmart/validation'
import { prisma } from '@bharatmart/database'
import { merchantRepository } from '../repositories/merchant.repository'
import { ConflictError, NotFoundError, ValidationError } from '../errors'

export interface FeaturedMerchant {
  id: string
  storeName: string
  storeSlug: string
  storeLogoUrl: string | null
  storeDescription: string
  avgRating: number
  productCount: number
}

export const MerchantService = {
  async getFeatured(limit = 5): Promise<FeaturedMerchant[]> {
    const merchants = await merchantRepository.findFeatured(limit)
    return merchants.map((merchant) => ({
      id: merchant.id,
      storeName: merchant.storeName,
      storeSlug: merchant.storeSlug,
      storeLogoUrl: merchant.storeLogoUrl,
      storeDescription: merchant.storeDescription ?? '',
      avgRating: merchant.avgRating.toNumber(),
      productCount: merchant._count.products,
    }))
  },

  getPendingVerifications() {
    return merchantRepository.findByVerificationStatus('PENDING')
  },

  getFilterOptions() {
    return merchantRepository.findApprovedForFilters()
  },

  async getApprovedCount() {
    return prisma.merchant.count({
      where: { verificationStatus: 'APPROVED' },
    })
  },

  /** Distinct UK outward postcode areas from approved merchant delivery lists. */
  async getServedCityCount() {
    const merchants = await prisma.merchant.findMany({
      where: { verificationStatus: 'APPROVED' },
      select: { deliveryPostcodes: true },
    })
    const areas = new Set<string>()
    for (const merchant of merchants) {
      for (const code of merchant.deliveryPostcodes) {
        const prefix = code.trim().toUpperCase().replace(/\s+/g, '').slice(0, 4)
        if (prefix) areas.add(prefix)
      }
    }
    return areas.size
  },

  async getCustomerCount() {
    return prisma.user.count({ where: { role: 'CUSTOMER' } })
  },

  getByUserId(userId: string) {
    return prisma.merchant.findUnique({ where: { userId } })
  },

  getById(id: string) {
    return prisma.merchant.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    })
  },

  async submitForVerification(userId: string, input: MerchantOnboardingInput) {
    const parsed = merchantOnboardingSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError('Invalid onboarding details.')
    }

    const existing = await prisma.merchant.findUnique({ where: { userId } })
    if (existing) {
      throw new ConflictError('A merchant profile already exists for this account.')
    }

    const slugTaken = await prisma.merchant.findUnique({
      where: { storeSlug: parsed.data.storeSlug },
    })
    if (slugTaken) {
      throw new ConflictError('That store slug is already taken.')
    }

    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { role: 'MERCHANT' },
      })

      return tx.merchant.create({
        data: {
          userId,
          businessName: parsed.data.businessName,
          businessType: parsed.data.businessType,
          ...(parsed.data.registrationNumber
            ? { registrationNumber: parsed.data.registrationNumber }
            : {}),
          verificationStatus: 'PENDING',
          verificationDocumentUrls: [parsed.data.businessDocumentUrl, parsed.data.idProofUrl],
          storeName: parsed.data.storeName,
          storeSlug: parsed.data.storeSlug,
          storeDescription: parsed.data.storeDescription,
          deliveryPostcodes: parsed.data.deliveryPostcodes,
        },
      })
    })
  },

  async updateVerificationDocuments(
    userId: string,
    input: { businessDocumentUrl: string; idProofUrl: string },
  ) {
    const merchant = await prisma.merchant.findUnique({ where: { userId } })
    if (!merchant) throw new NotFoundError('Merchant profile not found.')
    if (merchant.verificationStatus === 'APPROVED') {
      throw new ConflictError('Approved merchants cannot replace verification documents here.')
    }

    return prisma.merchant.update({
      where: { id: merchant.id },
      data: {
        verificationDocumentUrls: [input.businessDocumentUrl, input.idProofUrl],
        verificationStatus: 'PENDING',
      },
    })
  },

  async setVerificationStatus(
    merchantId: string,
    status: 'APPROVED' | 'REJECTED',
    actorId: string,
    reason?: string,
  ) {
    if (status === 'REJECTED' && !reason?.trim()) {
      throw new ValidationError('A rejection reason is required.')
    }

    const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } })
    if (!merchant) throw new NotFoundError('Merchant not found.')

    const updated = await prisma.merchant.update({
      where: { id: merchantId },
      data: { verificationStatus: status },
    })

    await prisma.auditLog.create({
      data: {
        actorId,
        action: status === 'APPROVED' ? 'MERCHANT_APPROVED' : 'MERCHANT_REJECTED',
        entityType: 'Merchant',
        entityId: merchantId,
        ...(reason?.trim() ? { metadata: { reason: reason.trim() } } : {}),
      },
    })

    return updated
  },

  async updateStoreProfile(
    merchantId: string,
    input: {
      storeName: string
      storeDescription: string
      storeLogoUrl?: string
      storeBannerUrl?: string
    },
  ) {
    return prisma.merchant.update({
      where: { id: merchantId },
      data: {
        storeName: input.storeName,
        storeDescription: input.storeDescription,
        storeLogoUrl: input.storeLogoUrl || null,
        storeBannerUrl: input.storeBannerUrl || null,
      },
    })
  },

  async updateDeliveryAreas(merchantId: string, deliveryPostcodes: string[]) {
    return prisma.merchant.update({
      where: { id: merchantId },
      data: { deliveryPostcodes },
    })
  },
}

export const merchantService = MerchantService
