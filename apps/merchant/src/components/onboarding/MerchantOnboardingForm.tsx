'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  merchantOnboardingSchema,
  type MerchantOnboardingInput,
} from '@bharatmart/validation'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bharatmart/ui'
import { uploadFileToCloudinary } from '@bharatmart/utils'
import { submitMerchantOnboarding } from '@/app/(onboarding)/actions'

const steps = ['Business Details', 'Documents', 'Store Setup', 'Review'] as const

const businessTypes = [
  ['GROCERY', 'Grocery'],
  ['RESTAURANT', 'Restaurant'],
  ['SWEETS_SNACKS', 'Sweets & Snacks'],
  ['CLOTHING', 'Clothing'],
  ['JEWELLERY', 'Jewellery'],
  ['TEMPLE_STORE', 'Temple Store'],
  ['AYURVEDIC_WELLNESS', 'Ayurvedic & Wellness'],
  ['DISTRIBUTOR', 'Distributor'],
  ['OTHER', 'Other'],
] as const

export function MerchantOnboardingForm() {
  const router = useRouter()
  const { update } = useSession()
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [postcodeInput, setPostcodeInput] = useState('')
  const form = useForm<MerchantOnboardingInput>({
    resolver: zodResolver(merchantOnboardingSchema),
    defaultValues: {
      businessName: '',
      businessType: 'GROCERY',
      registrationNumber: '',
      contactPhone: '',
      registeredAddress: '',
      storeName: '',
      storeSlug: '',
      storeDescription: '',
      deliveryPostcodes: [],
      businessDocumentUrl: '',
      idProofUrl: '',
    },
    mode: 'onBlur',
  })

  const values = form.watch()

  async function handleUpload(field: 'businessDocumentUrl' | 'idProofUrl', file: File) {
    try {
      const uploaded = await uploadFileToCloudinary(file, 'bharatmart/merchant-documents')
      form.setValue(field, uploaded.url, { shouldValidate: true })
    } catch {
      setError('Document upload failed. Please try again.')
    }
  }

  async function onSubmit(data: MerchantOnboardingInput) {
    setError(null)
    const result = await submitMerchantOnboarding(data)
    if (!result.ok) {
      setError(result.error)
      return
    }

    // Refresh JWT so middleware sees MERCHANT after role promotion.
    await update()
    router.push('/verification-pending')
    router.refresh()
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading text-3xl font-semibold text-[#7f5700]">Register your business</h1>
      <ol className="mt-6 flex flex-wrap gap-3">
        {steps.map((label, index) => (
          <li
            className={`rounded-full px-3 py-1 text-sm ${
              index === step ? 'bg-[#a83635] text-white' : 'bg-[#eee7de] text-[#514534]'
            }`}
            key={label}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      <Card className="mt-8 border-[#d6c4ad]">
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {step === 0 ? (
              <>
                <div className="space-y-2">
                  <Label>Business name</Label>
                  <Input {...form.register('businessName')} placeholder="e.g. Royal Spice Traders" />
                </div>
                <div className="space-y-2">
                  <Label>Business type</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue('businessType', value as MerchantOnboardingInput['businessType'])
                    }
                    value={values.businessType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Registered address</Label>
                  <Input {...form.register('registeredAddress')} />
                </div>
                <div className="space-y-2">
                  <Label>Contact phone</Label>
                  <Input {...form.register('contactPhone')} placeholder="7700 900000" />
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label>Business document</Label>
                  <Input
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void handleUpload('businessDocumentUrl', file)
                    }}
                    type="file"
                  />
                  {values.businessDocumentUrl ? (
                    <p className="text-xs text-[#2e6a39]">Uploaded via signed Cloudinary flow</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>ID proof</Label>
                  <Input
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void handleUpload('idProofUrl', file)
                    }}
                    type="file"
                  />
                  {values.idProofUrl ? (
                    <p className="text-xs text-[#2e6a39]">Uploaded via signed Cloudinary flow</p>
                  ) : null}
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div className="space-y-2">
                  <Label>Store name</Label>
                  <Input {...form.register('storeName')} />
                </div>
                <div className="space-y-2">
                  <Label>Store slug</Label>
                  <Input {...form.register('storeSlug')} placeholder="royal-spice-traders" />
                </div>
                <div className="space-y-2">
                  <Label>Store description</Label>
                  <Input {...form.register('storeDescription')} />
                </div>
                <div className="space-y-2">
                  <Label>Delivery postcodes</Label>
                  <div className="flex gap-2">
                    <Input
                      onChange={(event) => setPostcodeInput(event.target.value.toUpperCase())}
                      placeholder="E1"
                      value={postcodeInput}
                    />
                    <Button
                      onClick={() => {
                        if (!postcodeInput.trim()) return
                        form.setValue(
                          'deliveryPostcodes',
                          [...new Set([...(values.deliveryPostcodes ?? []), postcodeInput.trim()])],
                          { shouldValidate: true },
                        )
                        setPostcodeInput('')
                      }}
                      type="button"
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-[#514534]">
                    {(values.deliveryPostcodes ?? []).join(', ') || 'None added yet'}
                  </p>
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <div className="space-y-2 text-sm text-[#514534]">
                <p>
                  <strong>Business:</strong> {values.businessName} ({values.businessType})
                </p>
                <p>
                  <strong>Store:</strong> {values.storeName} / {values.storeSlug}
                </p>
                <p>
                  <strong>Documents:</strong>{' '}
                  {values.businessDocumentUrl && values.idProofUrl
                    ? 'Ready'
                    : 'Missing uploads'}
                </p>
              </div>
            ) : null}

            {error ? <p className="text-sm text-[#a83635]">{error}</p> : null}

            <div className="flex justify-between gap-3 pt-2">
              <Button
                disabled={step === 0}
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                type="button"
                variant="outline"
              >
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button
                  className="bg-[#a83635] text-white hover:bg-[#881e20]"
                  onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}
                  type="button"
                >
                  Save & Continue
                </Button>
              ) : (
                <Button
                  className="bg-[#a83635] text-white hover:bg-[#881e20]"
                  disabled={form.formState.isSubmitting}
                  type="submit"
                >
                  Submit for verification
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
