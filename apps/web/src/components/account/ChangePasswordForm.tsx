'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { changePasswordSchema, type ChangePasswordInput } from '@bharatmart/validation'
import { Button, Input, Label, toast } from '@bharatmart/ui'
import { changePasswordAction } from '@/app/(shop)/account/actions'

type ChangePasswordFormProps = {
  hasPassword: boolean
  /** When true, render the form immediately (parent controls expand/collapse). */
  embedded?: boolean
  onCancel?: () => void
}

export function ChangePasswordForm({
  hasPassword,
  embedded = false,
  onCancel,
}: ChangePasswordFormProps) {
  const [open, setOpen] = useState(embedded)
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  if (!hasPassword) {
    return (
      <p className="rounded-xl bg-[#f9f3ea] px-3 py-2 text-sm text-[#514534]">
        You signed in with Google, so there is no password to change on this account.
      </p>
    )
  }

  async function onSubmit(values: ChangePasswordInput) {
    setSuccess(false)
    const result = await changePasswordAction(values)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    reset()
    setSuccess(true)
    setOpen(false)
    onCancel?.()
    toast.success('Password updated', {
      description: 'Use your new password the next time you sign in.',
    })
  }

  function closeForm() {
    reset()
    setOpen(false)
    onCancel?.()
  }

  if (!open && !embedded) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#514534]">
          Update the password you use to sign in to BharatMart.
        </p>
        <Button
          className="bg-[#7f5700] text-white hover:bg-[#604100]"
          onClick={() => {
            setSuccess(false)
            setOpen(true)
          }}
          type="button"
        >
          <KeyRound className="mr-2 h-4 w-4" aria-hidden />
          Change password
        </Button>
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          autoComplete="current-password"
          id="currentPassword"
          type="password"
          {...register('currentPassword')}
        />
        {errors.currentPassword ? (
          <p className="text-sm text-[#a83635]">{errors.currentPassword.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          autoComplete="new-password"
          id="newPassword"
          type="password"
          {...register('newPassword')}
        />
        {errors.newPassword ? (
          <p className="text-sm text-[#a83635]">{errors.newPassword.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          autoComplete="new-password"
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword ? (
          <p className="text-sm text-[#a83635]">{errors.confirmPassword.message}</p>
        ) : null}
      </div>
      {success ? (
        <p className="text-sm text-[#2e6a39]">Your password has been changed successfully.</p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button
          className="bg-[#7f5700] text-white hover:bg-[#604100]"
          disabled={isSubmitting}
          type="submit"
        >
          <KeyRound className="mr-2 h-4 w-4" aria-hidden />
          {isSubmitting ? 'Updating…' : 'Update password'}
        </Button>
        <Button disabled={isSubmitting} onClick={closeForm} type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  )
}
