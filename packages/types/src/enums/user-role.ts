export const UserRole = {
  CUSTOMER: 'CUSTOMER',
  MERCHANT: 'MERCHANT',
  ADMIN: 'ADMIN',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]
