import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type LoginInput = z.infer<typeof loginSchema>

export const resendVerificationSchema = z.object({
  email: z.string().email(),
})

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>

export const verifyEmailSchema = z.object({
  token: z.string().min(10),
})

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from your current password',
    path: ['newPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be under 80 characters'),
  phone: z
    .string()
    .trim()
    .max(20, 'Enter a valid phone number')
    .refine((value) => value === '' || /^[+0-9()\s-]{10,20}$/.test(value), {
      message: 'Enter a valid phone number',
    }),
})

export type UpdateProfileInput = {
  name: string
  phone: string | null
}

export function parseUpdateProfileInput(input: z.infer<typeof updateProfileSchema>): UpdateProfileInput {
  return {
    name: input.name,
    phone: input.phone.length > 0 ? input.phone : null,
  }
}
