import { StoreSettingsTabs } from '@/components/settings/StoreSettingsTabs'
import { requireMerchant } from '@/lib/merchant-context'

export const dynamic = 'force-dynamic'

export default async function StoreSettingsPage() {
  const { merchant } = await requireMerchant()

  return (
    <main className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Store settings</h1>
        <p className="text-sm text-[#514534]">Each tab saves independently.</p>
      </div>
      <StoreSettingsTabs
        deliveryPostcodes={merchant.deliveryPostcodes}
        storeBannerUrl={merchant.storeBannerUrl}
        storeDescription={merchant.storeDescription ?? ''}
        storeLogoUrl={merchant.storeLogoUrl}
        storeName={merchant.storeName}
      />
    </main>
  )
}
