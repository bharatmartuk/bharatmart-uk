'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Label } from '@bharatmart/ui'
import { uploadFileToCloudinary } from '@bharatmart/utils'
import { replaceVerificationDocuments } from '@/app/(onboarding)/actions'

export function ReplaceVerificationDocuments() {
  const router = useRouter()
  const [businessDocumentUrl, setBusinessDocumentUrl] = useState('')
  const [idProofUrl, setIdProofUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleUpload(
    field: 'business' | 'id',
    file: File,
  ) {
    setError(null)
    setMessage(null)
    try {
      const uploaded = await uploadFileToCloudinary(file, 'bharatmart/merchant-documents')
      if (field === 'business') setBusinessDocumentUrl(uploaded.url)
      else setIdProofUrl(uploaded.url)
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
        Re-upload if your previous files were placeholders so the admin can open and review them.
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
        <Label>ID proof</Label>
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
      {error ? <p className="text-sm text-[#a83635]">{error}</p> : null}
      {message ? <p className="text-sm text-[#2e6a39]">{message}</p> : null}
      <Button
        className="w-full bg-[#a83635] text-white hover:bg-[#881e20]"
        disabled={pending || !businessDocumentUrl || !idProofUrl}
        onClick={() => void onSave()}
        type="button"
      >
        {pending ? 'Saving…' : 'Save documents for review'}
      </Button>
    </div>
  )
}
