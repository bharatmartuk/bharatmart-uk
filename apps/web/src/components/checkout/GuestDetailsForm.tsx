'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  guestCheckoutAddressSchema,
  guestCheckoutContactSchema,
} from '@bharatmart/validation'
import { Button, Input, Label } from '@bharatmart/ui'

const guestDetailsFormSchema = guestCheckoutContactSchema.merge(guestCheckoutAddressSchema)

export type GuestDetailsFormValues = z.infer<typeof guestDetailsFormSchema>

type GuestDetailsFormProps = {
  defaultValues?: Partial<GuestDetailsFormValues> | undefined
  onSubmit: (values: GuestDetailsFormValues) => void
  submitLabel?: string | undefined
  disabled?: boolean | undefined
}

export function GuestDetailsForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Continue to payment',
  disabled = false,
}: GuestDetailsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestDetailsFormValues>({
    resolver: zodResolver(guestDetailsFormSchema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? '',
      lastName: defaultValues?.lastName ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      line1: defaultValues?.line1 ?? '',
      line2: defaultValues?.line2 ?? '',
      city: defaultValues?.city ?? '',
      county: defaultValues?.county ?? '',
      postcode: defaultValues?.postcode ?? '',
      country: defaultValues?.country ?? 'GB',
    },
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="guest-firstName">First name</Label>
          <Input autoComplete="given-name" id="guest-firstName" {...register('firstName')} />
          {errors.firstName ? (
            <p className="text-xs text-[#a83635]">{errors.firstName.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="guest-lastName">Last name</Label>
          <Input autoComplete="family-name" id="guest-lastName" {...register('lastName')} />
          {errors.lastName ? (
            <p className="text-xs text-[#a83635]">{errors.lastName.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="guest-email">Email</Label>
          <Input autoComplete="email" id="guest-email" type="email" {...register('email')} />
          {errors.email ? <p className="text-xs text-[#a83635]">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="guest-phone">Phone</Label>
          <Input autoComplete="tel" id="guest-phone" type="tel" {...register('phone')} />
          {errors.phone ? <p className="text-xs text-[#a83635]">{errors.phone.message}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guest-line1">Address line 1</Label>
        <Input autoComplete="address-line1" id="guest-line1" {...register('line1')} />
        {errors.line1 ? <p className="text-xs text-[#a83635]">{errors.line1.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="guest-line2">Address line 2 (optional)</Label>
        <Input autoComplete="address-line2" id="guest-line2" {...register('line2')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="guest-city">City / town</Label>
          <Input autoComplete="address-level2" id="guest-city" {...register('city')} />
          {errors.city ? <p className="text-xs text-[#a83635]">{errors.city.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="guest-county">County</Label>
          <Input autoComplete="address-level1" id="guest-county" {...register('county')} />
          {errors.county ? <p className="text-xs text-[#a83635]">{errors.county.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="guest-postcode">Postcode</Label>
          <Input autoComplete="postal-code" id="guest-postcode" {...register('postcode')} />
          {errors.postcode ? (
            <p className="text-xs text-[#a83635]">{errors.postcode.message}</p>
          ) : null}
        </div>
      </div>

      <input type="hidden" {...register('country')} />

      <Button
        className="w-full bg-[#7f5700] text-white hover:bg-[#604100] sm:w-auto sm:min-w-[220px]"
        disabled={disabled}
        type="submit"
      >
        {submitLabel}
      </Button>
    </form>
  )
}
