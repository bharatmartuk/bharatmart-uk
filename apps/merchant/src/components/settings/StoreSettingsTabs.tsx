'use client'

import { useState, useTransition } from 'react'
import { Lock } from 'lucide-react'
import {
  Button,
  Input,
  Label,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@bharatmart/ui'
import {
  saveDeliveryAreasAction,
  saveNotificationSettingsAction,
  savePayoutDetailsAction,
  saveStoreProfileAction,
} from '@/app/(dashboard)/store-settings/actions'

export function StoreSettingsTabs({
  storeName,
  storeDescription,
  storeLogoUrl,
  storeBannerUrl,
  deliveryPostcodes,
}: {
  storeName: string
  storeDescription: string
  storeLogoUrl: string | null
  storeBannerUrl: string | null
  deliveryPostcodes: string[]
}) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [profile, setProfile] = useState({
    storeName,
    storeDescription,
    storeLogoUrl: storeLogoUrl ?? '',
    storeBannerUrl: storeBannerUrl ?? '',
  })
  const [postcodes, setPostcodes] = useState(deliveryPostcodes.join(', '))
  const [payout, setPayout] = useState({
    accountHolderName: '',
    sortCode: '',
    accountNumber: '',
  })
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailStock: true,
    emailMarketing: false,
  })

  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Store Profile</TabsTrigger>
        <TabsTrigger value="delivery">Delivery Areas</TabsTrigger>
        <TabsTrigger value="payout">Payout Details</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent className="space-y-4 rounded-xl border border-[#d6c4ad] bg-white p-5" value="profile">
        <div className="space-y-2">
          <Label>Store name</Label>
          <Input
            onChange={(event) => setProfile((current) => ({ ...current, storeName: event.target.value }))}
            value={profile.storeName}
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            onChange={(event) =>
              setProfile((current) => ({ ...current, storeDescription: event.target.value }))
            }
            value={profile.storeDescription}
          />
        </div>
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await saveStoreProfileAction(profile)
              setMessage('Store profile saved.')
            })
          }
          type="button"
        >
          Save profile
        </Button>
      </TabsContent>

      <TabsContent className="space-y-4 rounded-xl border border-[#d6c4ad] bg-white p-5" value="delivery">
        <div className="space-y-2">
          <Label>Delivery postcodes (comma separated)</Label>
          <Input onChange={(event) => setPostcodes(event.target.value)} value={postcodes} />
        </div>
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await saveDeliveryAreasAction(
                postcodes
                  .split(',')
                  .map((value) => value.trim().toUpperCase())
                  .filter(Boolean),
              )
              setMessage('Delivery areas saved.')
            })
          }
          type="button"
        >
          Save delivery areas
        </Button>
      </TabsContent>

      <TabsContent className="space-y-4 rounded-xl border border-[#d6c4ad] bg-white p-5" value="payout">
        <p className="flex items-center gap-2 text-sm text-[#514534]">
          <Lock className="h-4 w-4" />
          Sensitive payout fields are captured for future verified payouts only.
        </p>
        <div className="space-y-2">
          <Label>Account holder</Label>
          <Input
            onChange={(event) =>
              setPayout((current) => ({ ...current, accountHolderName: event.target.value }))
            }
            value={payout.accountHolderName}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Sort code</Label>
            <Input
              onChange={(event) => setPayout((current) => ({ ...current, sortCode: event.target.value }))}
              value={payout.sortCode}
            />
          </div>
          <div className="space-y-2">
            <Label>Account number</Label>
            <Input
              onChange={(event) =>
                setPayout((current) => ({ ...current, accountNumber: event.target.value }))
              }
              value={payout.accountNumber}
            />
          </div>
        </div>
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await savePayoutDetailsAction(payout)
              setMessage(result.message)
            })
          }
          type="button"
        >
          Save payout details
        </Button>
      </TabsContent>

      <TabsContent className="space-y-4 rounded-xl border border-[#d6c4ad] bg-white p-5" value="notifications">
        {(
          [
            ['emailOrders', 'Order emails'],
            ['emailStock', 'Low stock alerts'],
            ['emailMarketing', 'Marketing updates'],
          ] as const
        ).map(([key, label]) => (
          <div className="flex items-center justify-between" key={key}>
            <Label>{label}</Label>
            <Switch
              checked={notifications[key]}
              onCheckedChange={(checked) =>
                setNotifications((current) => ({ ...current, [key]: checked }))
              }
            />
          </div>
        ))}
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await saveNotificationSettingsAction(notifications)
              setMessage(result.message)
            })
          }
          type="button"
        >
          Save notifications
        </Button>
      </TabsContent>

      {message ? <p className="mt-4 text-sm text-[#2e6a39]">{message}</p> : null}
    </Tabs>
  )
}
