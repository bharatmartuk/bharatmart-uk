'use client'

import { useEffect, useState, useTransition } from 'react'
import { MapPin } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  toast,
} from '@bharatmart/ui'
import {
  saveDeliveryPostcodeAction,
  skipDeliveryPostcodeAction,
} from '@/app/(shop)/location-actions'

type PostcodeGateProps = {
  /** Show gate only when the shopper has never set or skipped. */
  openOnMount: boolean
}

export function PostcodeGate({ openOnMount }: PostcodeGateProps) {
  const [open, setOpen] = useState(false)
  const [postcode, setPostcode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (openOnMount) setOpen(true)
  }, [openOnMount])

  function submit() {
    setError(null)
    startTransition(async () => {
      const result = await saveDeliveryPostcodeAction(postcode)
      if (!result.ok) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      setOpen(false)
      toast.success(`Delivery area set to ${result.postcode}`)
    })
  }

  function skip() {
    setError(null)
    startTransition(async () => {
      await skipDeliveryPostcodeAction()
      setOpen(false)
      toast.message('Browsing all areas', {
        description: 'Add a postcode anytime to filter merchants near you.',
      })
    })
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        // Soft gate: closing without choosing = skip browse-all mode
        if (!next && open) {
          startTransition(async () => {
            await skipDeliveryPostcodeAction()
            setOpen(false)
            toast.message('Browsing all areas', {
              description: 'Add a postcode anytime to filter merchants near you.',
            })
          })
          return
        }
        setOpen(next)
      }}
      open={open}
    >
      <DialogContent className="border-[#d6c4ad] bg-[#fffaf4] sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4ede4] text-[#7f5700]">
            <MapPin className="h-6 w-6" />
          </div>
          <DialogTitle className="font-heading text-xl text-[#1e1b16]">
            Enter your postcode
          </DialogTitle>
          <DialogDescription className="text-[#514534]">
            See products and merchants that deliver to your area - just like grocery apps you
            already use.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="delivery-postcode">UK postcode</Label>
          <Input
            autoComplete="postal-code"
            autoFocus
            className="uppercase"
            disabled={pending}
            id="delivery-postcode"
            onChange={(event) => setPostcode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                submit()
              }
            }}
            placeholder="e.g. E14 8PX"
            value={postcode}
          />
          {error ? <p className="text-sm text-[#a83635]">{error}</p> : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            className="border-[#d6c4ad] bg-white text-[#514534] hover:bg-[#f4ede4]"
            disabled={pending}
            onClick={skip}
            type="button"
            variant="outline"
          >
            Browse all areas
          </Button>
          <Button
            className="bg-[#a83635] text-white hover:bg-[#8f2e2d]"
            disabled={pending || !postcode.trim()}
            onClick={submit}
            type="button"
          >
            {pending ? 'Saving…' : 'See products near me'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
