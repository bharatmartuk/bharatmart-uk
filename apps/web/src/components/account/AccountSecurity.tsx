'use client'

import { useState } from 'react'
import { ArrowRight, Fingerprint, KeyRound, MonitorSmartphone } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle, toast } from '@bharatmart/ui'
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm'
import { cn } from '@bharatmart/utils'

type AccountSecurityProps = {
  hasPassword: boolean
}

export function AccountSecurity({ hasPassword }: AccountSecurityProps) {
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  return (
    <Card
      className="scroll-mt-28 rounded-2xl border-[#e8d9c8] bg-white shadow-sm"
      id="account-security"
    >
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-xl font-semibold text-[#1e1b16]">Security</CardTitle>
        <p className="mt-1 text-sm text-[#514534]">
          Keep your BharatMart account protected.
        </p>
      </CardHeader>
      <CardContent className="space-y-2 p-6 pt-4">
        <button
          aria-expanded={showPasswordForm}
          aria-label="Change password"
          className={cn(
            'flex w-full items-center justify-between gap-3 rounded-2xl border border-[#f0e6d8] bg-[#fdfaf6] p-4 text-left',
            'transition-all duration-200 hover:shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7f5700]/40',
          )}
          onClick={() => setShowPasswordForm((current) => !current)}
          type="button"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f9f3ea] text-[#7f5700]">
              <KeyRound className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="font-semibold text-[#1e1b16]">Change Password</p>
              <p className="mt-0.5 text-sm text-[#514534]">
                Update the password used for email sign-in.
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-[#837561]" aria-hidden />
        </button>

        {showPasswordForm ? (
          <div className="rounded-2xl border border-[#e8d9c8] bg-white p-4">
            <ChangePasswordForm
              embedded
              hasPassword={hasPassword}
              onCancel={() => setShowPasswordForm(false)}
            />
          </div>
        ) : null}

        <button
          aria-label="Manage login sessions (coming soon)"
          className={cn(
            'flex w-full items-center justify-between gap-3 rounded-2xl border border-[#f0e6d8] bg-[#fdfaf6] p-4 text-left',
            'transition-all duration-200 hover:shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7f5700]/40',
          )}
          onClick={() =>
            toast.message('Coming soon', {
              description: 'Login session management will be available in a future update.',
            })
          }
          type="button"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f9f3ea] text-[#7f5700]">
              <MonitorSmartphone className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="font-semibold text-[#1e1b16]">Manage Login Sessions</p>
              <p className="mt-0.5 text-sm text-[#514534]">
                Review devices signed in to your account.
              </p>
            </div>
          </div>
          <Badge className="bg-[#efe2cf] text-[#7f5700] hover:bg-[#efe2cf]">Coming Soon</Badge>
        </button>

        <button
          aria-label="Two-factor authentication (coming soon)"
          className={cn(
            'flex w-full items-center justify-between gap-3 rounded-2xl border border-[#f0e6d8] bg-[#fdfaf6] p-4 text-left',
            'transition-all duration-200 hover:shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7f5700]/40',
          )}
          onClick={() =>
            toast.message('Coming soon', {
              description: 'Two-factor authentication is planned for a later release.',
            })
          }
          type="button"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f9f3ea] text-[#7f5700]">
              <Fingerprint className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="font-semibold text-[#1e1b16]">Two-Factor Authentication</p>
              <p className="mt-0.5 text-sm text-[#514534]">
                Add an extra layer of protection to your account.
              </p>
            </div>
          </div>
          <Badge className="bg-[#efe2cf] text-[#7f5700] hover:bg-[#efe2cf]">Coming Soon</Badge>
        </button>
      </CardContent>
    </Card>
  )
}
