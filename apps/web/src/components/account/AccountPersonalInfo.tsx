'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BadgeCheck, Mail, Pencil, Phone, UserRound } from 'lucide-react'
import { updateProfileSchema } from '@bharatmart/validation'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, toast } from '@bharatmart/ui'
import { updateProfileAction } from '@/app/(shop)/account/actions'

type AccountPersonalInfoProps = {
  name: string
  email: string | null
  phone: string | null
  role: string
  emailVerified: boolean
}

type ProfileFormValues = {
  name: string
  phone: string
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 border-b border-[#f0e6d8] py-4 last:border-b-0 last:pb-0 first:pt-0">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f9f3ea] text-[#7f5700]">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-[#837561]">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-[#1e1b16]">{value}</p>
      </div>
    </div>
  )
}

export function AccountPersonalInfo({
  name,
  email,
  phone,
  role,
  emailVerified,
}: AccountPersonalInfoProps) {
  const [editing, setEditing] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: name.trim() || '',
      phone: phone || '',
    },
  })

  async function onSubmit(values: ProfileFormValues) {
    const result = await updateProfileAction(values)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setEditing(false)
    toast.success('Profile updated', {
      description: 'Your name and phone number have been saved.',
    })
  }

  function cancelEdit() {
    reset({
      name: name.trim() || '',
      phone: phone || '',
    })
    setEditing(false)
  }

  return (
    <Card
      className="scroll-mt-28 rounded-2xl border-[#e8d9c8] bg-white shadow-sm"
      id="personal-information"
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-6 pb-2">
        <div>
          <CardTitle className="text-xl font-semibold text-[#1e1b16]">Personal Information</CardTitle>
          <p className="mt-1 text-sm text-[#514534]">Your account details on BharatMart UK.</p>
        </div>
        {!editing ? (
          <Button
            aria-label="Edit personal information"
            onClick={() => setEditing(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Edit
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="p-6 pt-2">
        {editing ? (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                aria-invalid={Boolean(errors.name)}
                id="profile-name"
                {...register('name')}
              />
              {errors.name ? (
                <p className="text-sm text-[#a83635]">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input disabled id="profile-email" value={email || 'Not provided'} />
              <p className="text-xs text-[#837561]">Email cannot be changed here.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                aria-invalid={Boolean(errors.phone)}
                id="profile-phone"
                placeholder="e.g. 07123 456789"
                {...register('phone')}
              />
              {errors.phone ? (
                <p className="text-sm text-[#a83635]">{errors.phone.message}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                className="bg-[#7f5700] text-white hover:bg-[#604100]"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Saving…' : 'Save changes'}
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={cancelEdit}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <InfoRow icon={UserRound} label="Name" value={name.trim() || 'BharatMart customer'} />
            <InfoRow icon={Mail} label="Email" value={email || 'Not provided'} />
            <InfoRow icon={Phone} label="Phone" value={phone || 'Not added yet'} />
            <InfoRow
              icon={UserRound}
              label="Account Type"
              value={role === 'CUSTOMER' ? 'Customer' : role}
            />
            <div className="flex items-start gap-3 pt-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f9f3ea] text-[#7f5700]">
                <BadgeCheck className="h-4 w-4" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#837561]">
                  Email Verified
                </p>
                <div className="mt-1">
                  {emailVerified ? (
                    <Badge className="bg-[#2e6a39] text-white hover:bg-[#2e6a39]">Verified</Badge>
                  ) : (
                    <Badge className="bg-[#ffdeae] text-[#5b3d00] hover:bg-[#ffdeae]">Pending</Badge>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
