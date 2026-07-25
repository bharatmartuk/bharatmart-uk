import Link from 'next/link'
import { BadgeCheck, Mail, Phone, UserRound } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'

type AccountPersonalInfoProps = {
  name: string
  email: string | null
  phone: string | null
  role: string
  emailVerified: boolean
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
        <Button asChild size="sm" variant="outline">
          <Link aria-label="Review personal information" href="#personal-information">
            Edit
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-6 pt-2">
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
      </CardContent>
    </Card>
  )
}
