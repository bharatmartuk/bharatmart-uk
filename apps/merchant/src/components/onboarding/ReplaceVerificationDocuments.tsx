'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Label } from '@bharatmart/ui'
import { uploadFileToCloudinary } from '@bharatmart/utils'
import { isFoodBusinessType } from '@bharatmart/validation'
import { replaceVerificationDocuments } from '@/app/(onboarding)/actions'

type MerchantBusinessType = Parameters<typeof isFoodBusinessType>[0]

export function ReplaceVerificationDocuments({
  businessType,
}: {
  businessType?: MerchantBusinessType | string
}) {
  const router = useRouter()
  const [businessDocumentUrl, setBusinessDocumentUrl] = useState('')
  const [idProofUrl, setIdProofUrl] = useState('')
  const [hasPhysicalStore, setHasPhysicalStore] = useState(false)
  const [physicalStorePhotoUrl, setPhysicalStorePhotoUrl] = useState('')
  const [foodLicenseUrl, setFoodLicenseUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const typedBusinessType = (businessType ?? 'OTHER') as MerchantBusinessType
  const needsFoodLicense = isFoodBusinessType(typedBusinessType)

  async function handleUpload(
    field: 'business' | 'id' | 'store' | 'food',
    file: File,
  ) {
    setError(null)
    setMessage(null)
    try {
      const uploaded = await uploadFileToCloudinary(file, 'bharatmart/merchant-documents')
      if (field === 'business') setBusinessDocumentUrl(uploaded.url)
      else if (field === 'id') setIdProofUrl(uploaded.url)
      else if (field === 'store') setPhysicalStorePhotoUrl(uploaded.url)
      else setFoodLicenseUrl(uploaded.url)
    } catch {
      setError('Document upload failed. Please try again.')
    }
  }

  async function onSave() {
    setError(null)
    setMessage(null)
    setPending(true)
    const result = await replaceVerificationDocuments({
      businessDocumentUrl,
      idProofUrl,
      hasPhysicalStore,
      physicalStorePhotoUrl: hasPhysicalStore ? physicalStorePhotoUrl : '',
      foodLicenseUrl: needsFoodLicense ? foodLicenseUrl : '',
      businessType: typedBusinessType,
    })
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setMessage('Documents updated. Admins can review them now.')
    router.refresh()
  }

  return (
    <div className="space-y-3 rounded-xl border border-[#d6c4ad] bg-[#fffaf4] p-4">
      <p className="text-sm font-medium text-[#1e1b16]">Replace verification documents</p>
      <p className="text-xs text-[#514534]">
        Re-upload owner identity, store photo (if applicable), and food licence so admins can review
        the real files.
      </p>
      <div className="space-y-2">
        <Label>Business document</Label>
        <Input
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleUpload('business', file)
          }}
          type="file"
        />
        {businessDocumentUrl ? <p className="text-xs text-[#2e6a39]">Ready</p> : null}
      </div>
      <div className="space-y-2">
        <Label>Owner identity proof</Label>
        <Input
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleUpload('id', file)
          }}
          type="file"
        />
        {idProofUrl ? <p className="text-xs text-[#2e6a39]">Ready</p> : null}
      </div>
      <div className="flex items-center gap-3">
        <input
          checked={hasPhysicalStore}
          className="h-4 w-4 accent-[#7f5700]"
          id="replace-has-store"
          onChange={(event) => setHasPhysicalStore(event.target.checked)}
          type="checkbox"
        />
        <Label className="cursor-pointer font-normal" htmlFor="replace-has-store">
          I have a physical store
        </Label>
      </div>
      {hasPhysicalStore ? (
        <div className="space-y-2">
          <Label>Physical store photo</Label>
          <Input
            accept=".png,.jpg,.jpeg,.webp"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleUpload('store', file)
            }}
            type="file"
          />
          {physicalStorePhotoUrl ? <p className="text-xs text-[#2e6a39]">Ready</p> : null}
        </div>
      ) : null}
      {needsFoodLicense ? (
        <div className="space-y-2">
          <Label>Food hygiene / licence certificate</Label>
          <Input
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleUpload('food', file)
            }}
            type="file"
          />
          {foodLicenseUrl ? <p className="text-xs text-[#2e6a39]">Ready</p> : null}
        </div>
      ) : null}
      {error ? <p className="text-sm text-[#a83635]">{error}</p> : null}
      {message ? <p className="text-sm text-[#2e6a39]">{message}</p> : null}
      <Button
        disabled={pending || !businessDocumentUrl || !idProofUrl}
        onClick={() => void onSave()}
        type="button"
      >
        {pending ? 'Saving…' : 'Submit documents'}
      </Button>
    </div>
  )
}
