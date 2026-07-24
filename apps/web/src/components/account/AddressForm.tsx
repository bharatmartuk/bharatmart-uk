'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addressSchema, type AddressInput } from '@bharatmart/validation'
import { Button, Input, Label, toast } from '@bharatmart/ui'
import { createAddressAction, updateAddressAction } from '@/app/(shop)/account/actions'

export type AddressRecord = {
  id: string
  label: string
  line1: string
  line2: string | null
  city: string
  postcode: string
  isDefault: boolean
}

type AddressFormProps = {
  mode?: 'create' | 'edit' | undefined
  addressId?: string | undefined
  initialValues?: Partial<AddressInput> | undefined
  onCreated?: ((address: AddressRecord) => void) | undefined
  onUpdated?: ((address: AddressRecord) => void) | undefined
  onCancel?: (() => void) | undefined
  submitLabel?: string | undefined
}

export function AddressForm({
  mode = 'create',
  addressId,
  initialValues,
  onCreated,
  onUpdated,
  onCancel,
  submitLabel,
}: AddressFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initialValues?.label ?? 'Home',
      line1: initialValues?.line1 ?? '',
      line2: initialValues?.line2 ?? '',
      city: initialValues?.city ?? '',
      postcode: initialValues?.postcode ?? '',
      country: initialValues?.country ?? 'GB',
      isDefault: initialValues?.isDefault ?? mode === 'create',
    },
  })

  useEffect(() => {
    if (!initialValues) return
    form.reset({
      label: initialValues.label ?? 'Home',
      line1: initialValues.line1 ?? '',
      line2: initialValues.line2 ?? '',
      city: initialValues.city ?? '',
      postcode: initialValues.postcode ?? '',
      country: initialValues.country ?? 'GB',
      isDefault: initialValues.isDefault ?? false,
    })
  }, [form, initialValues])

  async function onSubmit(values: AddressInput) {
    setError(null)
    setSuccess(null)

    const payload: AddressInput = {
      ...values,
      country: values.country || 'GB',
      isDefault: Boolean(values.isDefault),
      line2: values.line2?.trim() ? values.line2.trim() : undefined,
    }

    const result =
      mode === 'edit' && addressId
        ? await updateAddressAction(addressId, payload)
        : await createAddressAction(payload)

    if (!result.ok) {
      setError(result.error)
      toast.error(result.error)
      return
    }

    if (!('address' in result) || !result.address) {
      const message = 'Address saved, but the response was incomplete.'
      setError(message)
      toast.error(message)
      return
    }

    if (mode === 'edit') {
      setSuccess('Address updated.')
      toast.success('Delivery address updated')
      onUpdated?.(result.address)
    } else {
      form.reset({
        label: 'Home',
        line1: '',
        line2: '',
        city: '',
        postcode: '',
        country: 'GB',
        isDefault: false,
      })
      setSuccess('Address saved.')
      toast.success('New delivery address added')
      onCreated?.(result.address)
    }

    router.refresh()
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`address-label-${addressId ?? 'new'}`}>Label</Label>
          <Input
            id={`address-label-${addressId ?? 'new'}`}
            placeholder="Home, Work…"
            {...form.register('label')}
          />
          {form.formState.errors.label ? (
            <p className="text-sm text-[#a83635]">{form.formState.errors.label.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`address-postcode-${addressId ?? 'new'}`}>Postcode</Label>
          <Input
            id={`address-postcode-${addressId ?? 'new'}`}
            placeholder="SW1A 1AA"
            {...form.register('postcode')}
          />
          {form.formState.errors.postcode ? (
            <p className="text-sm text-[#a83635]">{form.formState.errors.postcode.message}</p>
          ) : null}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`address-line1-${addressId ?? 'new'}`}>Address line 1</Label>
          <Input
            id={`address-line1-${addressId ?? 'new'}`}
            placeholder="Flat / house number and street"
            {...form.register('line1')}
          />
          {form.formState.errors.line1 ? (
            <p className="text-sm text-[#a83635]">{form.formState.errors.line1.message}</p>
          ) : null}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`address-line2-${addressId ?? 'new'}`}>Address line 2 (optional)</Label>
          <Input
            id={`address-line2-${addressId ?? 'new'}`}
            placeholder="Area / landmark"
            {...form.register('line2')}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`address-city-${addressId ?? 'new'}`}>City / town</Label>
          <Input
            id={`address-city-${addressId ?? 'new'}`}
            placeholder="London"
            {...form.register('city')}
          />
          {form.formState.errors.city ? (
            <p className="text-sm text-[#a83635]">{form.formState.errors.city.message}</p>
          ) : null}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[#514534]">
        <input className="h-4 w-4" type="checkbox" {...form.register('isDefault')} />
        Set as default delivery address
      </label>

      {error ? <p className="text-sm text-[#a83635]">{error}</p> : null}
      {success ? <p className="text-sm text-[#2e6a39]">{success}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button
          className="bg-[#7f5700] text-white hover:bg-[#604100]"
          disabled={form.formState.isSubmitting}
          type="submit"
        >
          {form.formState.isSubmitting
            ? 'Saving…'
            : submitLabel ?? (mode === 'edit' ? 'Update address' : 'Save address')}
        </Button>
        {onCancel ? (
          <Button onClick={onCancel} type="button" variant="outline">
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
