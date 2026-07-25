'use client'

import { useEffect, useState } from 'react'
import { Mail, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Label, Switch } from '@bharatmart/ui'

const STORAGE_KEY = 'bharatmart-account-notification-prefs'

type NotificationPrefs = {
  emailNotifications: boolean
  orderUpdates: boolean
}

const DEFAULT_PREFS: NotificationPrefs = {
  emailNotifications: true,
  orderUpdates: true,
}

const rows = [
  {
    key: 'emailNotifications' as const,
    title: 'Email Notifications',
    description: 'General account and marketplace messages.',
    icon: Mail,
  },
  {
    key: 'orderUpdates' as const,
    title: 'Order Updates',
    description: 'Shipping and delivery progress for your orders.',
    icon: Package,
  },
]

export function AccountNotificationPrefs() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<NotificationPrefs>
        setPrefs({
          emailNotifications: parsed.emailNotifications ?? DEFAULT_PREFS.emailNotifications,
          orderUpdates: parsed.orderUpdates ?? DEFAULT_PREFS.orderUpdates,
        })
      }
    } catch {
      // Ignore invalid local preference data.
    }
    setReady(true)
  }, [])

  function updatePref(key: keyof NotificationPrefs, value: boolean) {
    setPrefs((current) => {
      const next = { ...current, [key]: value }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore storage failures (private mode, quota, etc.).
      }
      return next
    })
  }

  return (
    <Card className="rounded-2xl border-[#e8d9c8] bg-white shadow-sm">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-xl font-semibold text-[#1e1b16]">Notifications</CardTitle>
        <p className="mt-1 text-sm text-[#514534]">
          Choose how you want to hear from BharatMart. Preferences are saved on this device.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 p-6 pt-4">
        {rows.map((row) => {
          const Icon = row.icon
          const checked = prefs[row.key]
          return (
            <div
              className="flex items-center justify-between gap-4 rounded-2xl border border-[#f0e6d8] bg-[#fdfaf6] p-4"
              key={row.key}
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f9f3ea] text-[#7f5700]">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <Label className="text-sm font-semibold text-[#1e1b16]" htmlFor={row.key}>
                    {row.title}
                  </Label>
                  <p className="mt-0.5 text-sm text-[#514534]">{row.description}</p>
                </div>
              </div>
              <Switch
                aria-label={row.title}
                checked={checked}
                className="data-[state=checked]:bg-[#7f5700]"
                disabled={!ready}
                id={row.key}
                onCheckedChange={(value) => updatePref(row.key, value)}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
