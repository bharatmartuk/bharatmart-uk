import { notFound } from 'next/navigation'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { MerchantService } from '@bharatmart/services'
import { VerificationDecisionPanel } from '@/components/merchants/VerificationDecisionPanel'
import {
  describeVerificationDocuments,
  VerificationDocuments,
} from '@/components/merchants/VerificationDocuments'

export const dynamic = 'force-dynamic'

export default async function MerchantVerificationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const merchant = await MerchantService.getById(id)
  if (!merchant) notFound()

  const documents = describeVerificationDocuments({
    verificationDocumentUrls: merchant.verificationDocumentUrls,
    hasPhysicalStore: merchant.hasPhysicalStore,
    physicalStorePhotoUrl: merchant.physicalStorePhotoUrl,
    foodLicenseUrl: merchant.foodLicenseUrl,
  })

  return (
    <main className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">{merchant.storeName}</h1>
          <p className="text-sm text-[#514534]">
            {merchant.businessName} · {merchant.user.email}
          </p>
          <Badge className="mt-2">{merchant.verificationStatus}</Badge>
        </div>

        <Card className="border-[#d6c4ad]">
          <CardHeader>
            <CardTitle>Verification checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#514534]">
            <p>
              <strong>Business type:</strong> {merchant.businessType}
            </p>
            <p>
              <strong>Physical store:</strong>{' '}
              {merchant.hasPhysicalStore ? 'Yes - photo required' : 'No (online-only)'}
            </p>
            <p>
              <strong>Food licence:</strong>{' '}
              {merchant.foodLicenseUrl ? 'Uploaded' : 'Not provided'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#d6c4ad]">
          <CardHeader>
            <CardTitle>Verification documents</CardTitle>
          </CardHeader>
          <CardContent>
            <VerificationDocuments documents={documents} merchantId={merchant.id} />
          </CardContent>
        </Card>
      </section>

      <VerificationDecisionPanel merchantId={merchant.id} />
    </main>
  )
}
