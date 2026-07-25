import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { MerchantService } from '@bharatmart/services'
import { VerificationDecisionPanel } from '@/components/merchants/VerificationDecisionPanel'
import {
  describeVerificationDocuments,
  VerificationDocuments,
} from '@/components/merchants/VerificationDocuments'

export const dynamic = 'force-dynamic'

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-[#f0e6d8] py-3 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-[#837561]">{label}</dt>
      <dd className="text-sm text-[#1e1b16]">{value || '—'}</dd>
    </div>
  )
}

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

  const submittedAt = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(merchant.createdAt)

  return (
    <main className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-4">
        <div className="flex flex-wrap items-start gap-4">
          {merchant.storeLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`${merchant.storeName} logo`}
              className="h-16 w-16 rounded-xl border border-[#d6c4ad] bg-white object-contain p-1"
              src={merchant.storeLogoUrl}
            />
          ) : null}
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold">{merchant.storeName}</h1>
            <p className="text-sm text-[#514534]">
              {merchant.businessName} · {merchant.user.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge>{merchant.verificationStatus}</Badge>
              <span className="text-xs text-[#837561]">Submitted {submittedAt}</span>
            </div>
          </div>
        </div>

        <Card className="border-[#d6c4ad]">
          <CardHeader>
            <CardTitle>Registration details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Owner name" value={merchant.user.name} />
              <DetailRow label="Owner email" value={merchant.user.email} />
              <DetailRow label="Contact phone" value={merchant.user.phone} />
              <DetailRow label="Business name" value={merchant.businessName} />
              <DetailRow label="Business type" value={merchant.businessType} />
              <DetailRow label="Company / registration no." value={merchant.registrationNumber} />
              <DetailRow
                label="Registered address"
                value={
                  <span className="whitespace-pre-wrap">{merchant.registeredAddress}</span>
                }
              />
              <DetailRow label="Store name" value={merchant.storeName} />
              <DetailRow label="Store slug" value={`/${merchant.storeSlug}`} />
              <DetailRow
                label="Store description"
                value={
                  <span className="whitespace-pre-wrap">{merchant.storeDescription}</span>
                }
              />
              <DetailRow
                label="Delivery postcodes"
                value={
                  merchant.deliveryPostcodes.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {merchant.deliveryPostcodes.map((postcode) => (
                        <Badge className="bg-[#f4ede4] text-[#5b3d00]" key={postcode}>
                          {postcode}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    'None provided'
                  )
                }
              />
              <DetailRow
                label="Physical store"
                value={merchant.hasPhysicalStore ? 'Yes — photo required' : 'No (online-only)'}
              />
              <DetailRow
                label="Food licence"
                value={merchant.foodLicenseUrl ? 'Uploaded' : 'Not provided'}
              />
              <DetailRow
                label="Store logo"
                value={merchant.storeLogoUrl ? 'Uploaded' : 'Not provided'}
              />
            </dl>
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
