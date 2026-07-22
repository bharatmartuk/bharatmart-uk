'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  merchantOnboardingSchema,
  isFoodBusinessType,
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

const stepFields: Array<Array<keyof MerchantOnboardingInput>> = [
  ['businessName', 'businessType', 'registeredAddress', 'contactPhone'],
  [
    'businessDocumentUrl',
    'idProofUrl',
    'hasPhysicalStore',
    'physicalStorePhotoUrl',
    'foodLicenseUrl',
  ],
  ['storeName', 'storeSlug', 'storeDescription', 'deliveryPostcodes'],
  [
    'businessName',
    'businessType',
    'registeredAddress',
    'contactPhone',
    'businessDocumentUrl',
    'idProofUrl',
    'hasPhysicalStore',
    'physicalStorePhotoUrl',
    'foodLicenseUrl',
    'storeName',
    'storeSlug',
    'storeDescription',
    'deliveryPostcodes',
  ],
]

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

function firstErrorMessage(
  errors: Partial<Record<keyof MerchantOnboardingInput, { message?: string }>>,
) {
  for (const value of Object.values(errors)) {
    if (value?.message) return value.message
  }
  return 'Please fix the highlighted fields.'
}

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
      hasPhysicalStore: false,
      physicalStorePhotoUrl: '',
      foodLicenseUrl: '',
    },
    mode: 'onBlur',
  })

  const values = form.watch()
  const fieldErrors = form.formState.errors
  const needsFoodLicense = isFoodBusinessType(values.businessType)

  async function handleUpload(
    field:
      | 'businessDocumentUrl'
      | 'idProofUrl'
      | 'physicalStorePhotoUrl'
      | 'foodLicenseUrl',
    file: File,
  ) {
    setError(null)
    try {
      const uploaded = await uploadFileToCloudinary(file, 'bharatmart/merchant-documents')
      form.setValue(field, uploaded.url, { shouldValidate: true })
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Document upload failed. Please try again.',
      )
    }
  }

  async function goNext() {
    setError(null)
    const valid = await form.trigger(stepFields[step])
    if (!valid) {
      setError(firstErrorMessage(form.formState.errors))
      return
    }
    setStep((current) => Math.min(steps.length - 1, current + 1))
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
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              setError(firstErrorMessage(errors))
            })}
          >
            {step === 0 ? (
              <>
                <div className="space-y-2">
                  <Label>Business name</Label>
                  <Input {...form.register('businessName')} placeholder="e.g. Royal Spice Traders" />
                  {fieldErrors.businessName ? (
                    <p className="text-xs text-[#a83635]">{fieldErrors.businessName.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Business type</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue('businessType', value as MerchantOnboardingInput['businessType'], {
                        shouldValidate: true,
                      })
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
                  {fieldErrors.registeredAddress ? (
                    <p className="text-xs text-[#a83635]">{fieldErrors.registeredAddress.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Contact phone</Label>
                  <Input {...form.register('contactPhone')} placeholder="7700 900000" />
                  {fieldErrors.contactPhone ? (
                    <p className="text-xs text-[#a83635]">{fieldErrors.contactPhone.message}</p>
                  ) : null}
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <p className="rounded-lg bg-[#f9f3ea] p-3 text-sm text-[#514534]">
                  We verify the owner&apos;s identity, ask whether you have a physical store (and need a
                  photo of it), and require a food licence for food businesses such as pickles and
                  groceries.
                </p>
                <div className="space-y-2">
                  <Label>Business document</Label>
                  <Input
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void handleUpload('businessDocumentUrl', file)
                    }}
                    type="file"
                  />
                  {values.businessDocumentUrl ? (
                    <p className="text-xs text-[#2e6a39]">Document uploaded</p>
                  ) : null}
                  {fieldErrors.businessDocumentUrl ? (
                    <p className="text-xs text-[#a83635]">{fieldErrors.businessDocumentUrl.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Owner identity proof (passport / driving licence / national ID)</Label>
                  <Input
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void handleUpload('idProofUrl', file)
                    }}
                    type="file"
                  />
                  {values.idProofUrl ? (
                    <p className="text-xs text-[#2e6a39]">Document uploaded</p>
                  ) : null}
                  {fieldErrors.idProofUrl ? (
                    <p className="text-xs text-[#a83635]">{fieldErrors.idProofUrl.message}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-[#d6c4ad] px-3 py-3">
                  <input
                    checked={values.hasPhysicalStore}
                    className="h-4 w-4 accent-[#7f5700]"
                    id="hasPhysicalStore"
                    onChange={(event) => {
                      form.setValue('hasPhysicalStore', event.target.checked, {
                        shouldValidate: true,
                      })
                      if (!event.target.checked) {
                        form.setValue('physicalStorePhotoUrl', '', { shouldValidate: true })
                      }
                    }}
                    type="checkbox"
                  />
                  <Label className="cursor-pointer font-normal" htmlFor="hasPhysicalStore">
                    I have a physical store / market stall
                  </Label>
                </div>
                {values.hasPhysicalStore ? (
                  <div className="space-y-2">
                    <Label>Physical store photo</Label>
                    <Input
                      accept=".png,.jpg,.jpeg,.webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) void handleUpload('physicalStorePhotoUrl', file)
                      }}
                      type="file"
                    />
                    {values.physicalStorePhotoUrl ? (
                      <p className="text-xs text-[#2e6a39]">Photo uploaded</p>
                    ) : null}
                    {fieldErrors.physicalStorePhotoUrl ? (
                      <p className="text-xs text-[#a83635]">
                        {fieldErrors.physicalStorePhotoUrl.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {needsFoodLicense ? (
                  <div className="space-y-2">
                    <Label>Food hygiene / licence certificate (required for food businesses)</Label>
                    <Input
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) void handleUpload('foodLicenseUrl', file)
                      }}
                      type="file"
                    />
                    {values.foodLicenseUrl ? (
                      <p className="text-xs text-[#2e6a39]">Licence uploaded</p>
                    ) : null}
                    {fieldErrors.foodLicenseUrl ? (
                      <p className="text-xs text-[#a83635]">{fieldErrors.foodLicenseUrl.message}</p>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div className="space-y-2">
                  <Label>Store name</Label>
                  <Input {...form.register('storeName')} />
                  {fieldErrors.storeName ? (
                    <p className="text-xs text-[#a83635]">{fieldErrors.storeName.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Store slug</Label>
                  <Input {...form.register('storeSlug')} placeholder="royal-spice-traders" />
                  {fieldErrors.storeSlug ? (
                    <p className="text-xs text-[#a83635]">{fieldErrors.storeSlug.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Store description</Label>
                  <Input
                    {...form.register('storeDescription')}
                    placeholder="At least 20 characters about your store"
                  />
                  {fieldErrors.storeDescription ? (
                    <p className="text-xs text-[#a83635]">{fieldErrors.storeDescription.message}</p>
                  ) : null}
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
                    {(values.deliveryPostcodes ?? []).join(', ') || 'None added yet - add at least one'}
                  </p>
                  {fieldErrors.deliveryPostcodes ? (
                    <p className="text-xs text-[#a83635]">{fieldErrors.deliveryPostcodes.message}</p>
                  ) : null}
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
                  <strong>Delivery:</strong>{' '}
                  {(values.deliveryPostcodes ?? []).join(', ') || 'None'}
                </p>
                <p>
                  <strong>Documents:</strong>{' '}
                  {values.businessDocumentUrl && values.idProofUrl
                    ? 'Business + owner ID uploaded'
                    : 'Missing uploads'}
                  {values.hasPhysicalStore ? ' · Store photo' : ''}
                  {needsFoodLicense ? ' · Food licence' : ''}
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
                  onClick={() => void goNext()}
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
                  {form.formState.isSubmitting ? 'Submitting…' : 'Submit for verification'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
