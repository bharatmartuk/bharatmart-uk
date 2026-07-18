'use client'

import { useState, useTransition } from 'react'
import { Button, Input, Label } from '@bharatmart/ui'
import { approveMerchantAction, rejectMerchantAction } from '@/app/(dashboard)/merchants/actions'

export function VerificationDecisionPanel({ merchantId }: { merchantId: string }) {
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-4 rounded-xl border border-[#d6c4ad] bg-white p-5">
      <h2 className="text-lg font-semibold">Decision panel</h2>
      <Button
        className="w-full bg-[#2e6a39] text-white hover:bg-[#135224]"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await approveMerchantAction(merchantId)
            setMessage(result.ok ? 'Merchant approved.' : result.error)
          })
        }
        type="button"
      >
        Approve merchant
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
            const result = await rejectMerchantAction(merchantId, reason)
            setMessage(result.ok ? 'Merchant rejected.' : result.error)
          })
        }
        type="button"
        variant="destructive"
      >
        Reject merchant
      </Button>
      {message ? <p className="text-sm text-[#514534]">{message}</p> : null}
    </div>
  )
}
