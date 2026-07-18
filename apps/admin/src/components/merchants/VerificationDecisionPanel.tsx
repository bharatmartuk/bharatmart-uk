'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button, Input, Label } from '@bharatmart/ui'
import { approveMerchantAction, rejectMerchantAction } from '@/app/(dashboard)/merchants/actions'

export function VerificationDecisionPanel({ merchantId }: { merchantId: string }) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-4 rounded-xl border border-[#d6c4ad] bg-white p-5">
      <h2 className="text-lg font-semibold">Decision panel</h2>
      <Button
        className="w-full bg-[#2e6a39] text-white hover:bg-[#135224]"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setMessage(null)
            setError(null)
            try {
              const result = await approveMerchantAction(merchantId)
              if (!result.ok) {
                setError(result.error)
                return
              }
              setMessage('Merchant approved.')
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
        <Input onChange={(event) => setReason(event.target.value)} value={reason} />
      </div>
      <Button
        className="w-full"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setMessage(null)
            setError(null)
            try {
              const result = await rejectMerchantAction(merchantId, reason)
              if (!result.ok) {
                setError(result.error)
                return
              }
              setMessage('Merchant rejected.')
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
      {message ? <p className="text-sm text-[#2e6a39]">{message}</p> : null}
      {error ? <p className="text-sm text-[#a83635]">{error}</p> : null}
    </div>
  )
}
