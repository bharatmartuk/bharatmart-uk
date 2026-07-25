'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button, Input, Label } from '@bharatmart/ui'
import { approveMerchantAction, rejectMerchantAction } from '@/app/(dashboard)/merchants/actions'

export function VerificationDecisionPanel({
  merchantId,
  canApprove,
  missingDocuments,
  documentCount,
  verificationStatus,
}: {
  merchantId: string
  canApprove: boolean
  missingDocuments: string[]
  documentCount: number
  verificationStatus: string
}) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [reviewedDocs, setReviewedDocs] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localStatus, setLocalStatus] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const status = localStatus ?? verificationStatus
  const alreadyDecided = status === 'APPROVED' || status === 'REJECTED'
  const approveEnabled = canApprove && reviewedDocs && !pending

  if (alreadyDecided) {
    const approved = status === 'APPROVED'
    return (
      <div className="space-y-4 rounded-xl border border-[#d6c4ad] bg-white p-5">
        <h2 className="text-lg font-semibold">Decision panel</h2>
        <div
          className={`rounded-xl px-4 py-5 text-center ${
            approved ? 'bg-[#e8f5eb] text-[#2e6a39]' : 'bg-[#fff5f4] text-[#a83635]'
          }`}
        >
          {approved ? (
            <CheckCircle2 className="mx-auto h-8 w-8" aria-hidden />
          ) : (
            <XCircle className="mx-auto h-8 w-8" aria-hidden />
          )}
          <p className="mt-3 text-base font-semibold">
            {approved ? 'Merchant approved' : 'Merchant rejected'}
          </p>
          <p className="mt-1 text-sm opacity-90">
            {approved
              ? 'This seller can access the merchant dashboard. No further action is needed.'
              : 'This application has been rejected. Approve/reject actions are closed.'}
          </p>
        </div>
        <p className="text-center text-xs uppercase tracking-wide text-[#837561]">
          Status · {status}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-[#d6c4ad] bg-white p-5">
      <h2 className="text-lg font-semibold">Decision panel</h2>

      <div className="rounded-lg bg-[#f9f3ea] px-3 py-2 text-sm text-[#514534]">
        {documentCount > 0 ? (
          <p>
            {documentCount} document{documentCount === 1 ? '' : 's'} uploaded. Open each preview
            below and confirm they are genuine before approving.
          </p>
        ) : (
          <p>No verification documents uploaded yet. Approval is blocked.</p>
        )}
        {missingDocuments.length > 0 ? (
          <p className="mt-2 text-[#a83635]">
            Missing required: {missingDocuments.join(', ')}.
          </p>
        ) : null}
      </div>

      <label className="flex items-start gap-2 text-sm text-[#1e1b16]">
        <input
          checked={reviewedDocs}
          className="mt-1"
          disabled={!canApprove || pending}
          onChange={(event) => setReviewedDocs(event.target.checked)}
          type="checkbox"
        />
        <span>
          I have opened and reviewed all uploaded verification documents and they look
          legitimate.
        </span>
      </label>

      <Button
        className="w-full bg-[#2e6a39] text-white hover:bg-[#135224] disabled:opacity-50"
        disabled={!approveEnabled}
        onClick={() =>
          startTransition(async () => {
            setError(null)
            try {
              const result = await approveMerchantAction(merchantId)
              if (!result.ok) {
                setError(result.error)
                return
              }
              setLocalStatus('APPROVED')
              router.refresh()
            } catch {
              setError('Approve failed. Refresh the page and try again.')
            }
          })
        }
        type="button"
      >
        {pending ? 'Working…' : 'Approve merchant'}
      </Button>
      <div className="space-y-2">
        <Label>Rejection reason</Label>
        <Input
          disabled={pending}
          onChange={(event) => setReason(event.target.value)}
          value={reason}
        />
      </div>
      <Button
        className="w-full"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null)
            try {
              const result = await rejectMerchantAction(merchantId, reason)
              if (!result.ok) {
                setError(result.error)
                return
              }
              setLocalStatus('REJECTED')
              router.refresh()
            } catch {
              setError('Reject failed. Refresh the page and try again.')
            }
          })
        }
        type="button"
        variant="destructive"
      >
        Reject merchant
      </Button>
      {error ? <p className="text-sm text-[#a83635]">{error}</p> : null}
    </div>
  )
}
