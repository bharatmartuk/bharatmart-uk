export const MerchantVerificationStatus = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const

export type MerchantVerificationStatus =
  (typeof MerchantVerificationStatus)[keyof typeof MerchantVerificationStatus]
