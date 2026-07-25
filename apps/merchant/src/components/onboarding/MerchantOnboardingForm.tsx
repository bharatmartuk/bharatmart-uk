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
  ['businessName', 'businessType', 'registrationNumber', 'registeredAddress', 'contactPhone'],
  [
    'businessDocumentUrl',
    'idProofUrl',
    'hasPhysicalStore',
    'physicalStorePhotoUrl',
    'foodLicenseUrl',
  ],
  ['storeName', 'storeSlug', 'storeDescription', 'storeLogoUrl', 'deliveryPostcodes'],
  [
    'businessName',
    'businessType',
    'registrationNumber',
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
    'storeLogoUrl',
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
      storeLogoUrl: '',
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
      | 'foodLicenseUrl'
      | 'storeLogoUrl',
    file: File,
  ) {
    setError(null)
    try {
      const folder =
        field === 'storeLogoUrl' ? 'bharatmart/products' : 'bharatmart/merchant-documents'
      const uploaded = await uploadFileToCloudinary(file, folder)
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

  function addDeliveryPostcode() {
    const code = postcodeInput.trim().toUpperCase()
    if (!code) return
    form.setValue(
      'deliveryPostcodes',
      [...new Set([...(values.deliveryPostcodes ?? []), code])],
      { shouldValidate: true },
    )
    setPostcodeInput('')
  }

  function removeDeliveryPostcode(code: string) {
    form.setValue(
      'deliveryPostcodes',
      (values.deliveryPostcodes ?? []).filter((entry) => entry !== code),
      { shouldValidate: true },
    )
  }

  async function onSubmit(data: MerchantOnboardingInput) {
    // Only the Review step may submit — never skip the preview.
    if (step !== steps.length - 1) {
      await goNext()
      return
    }

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

  const businessTypeLabel =
    businessTypes.find(([value]) => value === values.businessType)?.[1] ?? values.businessType

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
          {step === 3 ? (
            <p className="text-sm font-normal text-[#514534]">
              Check every detail below. Nothing is submitted until you confirm.
            </p>
          ) : null}
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              // Block accidental Enter-key submits on steps 1-3; only Review may submit.
              if (step < steps.length - 1) {
                event.preventDefault()
                return
              }
              void form.handleSubmit(onSubmit, (errors) => {
                setError(firstErrorMessage(errors))
              })(event)
            }}
          >
            {step === 0 ? (
              <>
                <div className="space-y-2">
                  <Label>Company / business name</Label>
                  <Input {...form.register('businessName')} placeholder="e.g. Royal Spice Traders Ltd" />
                  {fieldErrors.businessName ? (
                    <p className="text-xs text-[#a83635]">{fieldErrors.businessName.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Company number</Label>
                  <Input
                    {...form.register('registrationNumber')}
                    placeholder="e.g. 12345678"
                  />
                  {fieldErrors.registrationNumber ? (
                    <p className="text-xs text-[#a83635]">{fieldErrors.registrationNumber.message}</p>
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
                  <Label>Registered office address</Label>
                  <Input
                    {...form.register('registeredAddress')}
                    placeholder="Full registered office address"
                  />
                  {fieldErrors.registeredAddress ? (
                    <p className="text-xs text-[#a83635]">{fieldErrors.registeredAddress.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Contact number</Label>
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
                  <Label>Store logo</Label>
                  <Input
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void handleUpload('storeLogoUrl', file)
                    }}
                    type="file"
                  />
                  {values.storeLogoUrl ? (
                    <div className="flex items-center gap-3">
                      <img
                        alt="Store logo preview"
                        className="h-14 w-14 rounded-xl border border-[#d6c4ad] object-cover"
                        src={values.storeLogoUrl}
                      />
                      <p className="text-xs text-[#2e6a39]">Logo uploaded</p>
                    </div>
                  ) : null}
                  {fieldErrors.storeLogoUrl ? (
                    <p className="text-xs text-[#a83635]">{fieldErrors.storeLogoUrl.message}</p>
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
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addDeliveryPostcode()
                        }
                      }}
                      placeholder="E1"
                      value={postcodeInput}
                    />
                    <Button onClick={addDeliveryPostcode} type="button" variant="outline">
                      Add
                    </Button>
                  </div>
                  {(values.deliveryPostcodes ?? []).length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(values.deliveryPostcodes ?? []).map((code) => (
                        <button
                          className="inline-flex items-center gap-1 rounded-full border border-[#d6c4ad] bg-[#f9f3ea] px-2.5 py-1 text-xs font-medium text-[#514534] hover:border-[#a83635] hover:text-[#a83635]"
                          key={code}
                          onClick={() => removeDeliveryPostcode(code)}
                          type="button"
                        >
                          {code}
                          <span aria-hidden>×</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#514534]">None added yet - add at least one</p>
                  )}
                  {fieldErrors.deliveryPostcodes ? (
                    <p className="text-xs text-[#a83635]">{fieldErrors.deliveryPostcodes.message}</p>
                  ) : null}
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#d6c4ad] bg-[#f9f3ea] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-[#1e1b16]">Business details</h3>
                    <Button onClick={() => setStep(0)} size="sm" type="button" variant="outline">
                      Edit
                    </Button>
                  </div>
                  <dl className="space-y-2 text-sm text-[#514534]">
                    <div className="flex justify-between gap-4">
                      <dt>Company / business</dt>
                      <dd className="text-right font-medium text-[#1e1b16]">{values.businessName}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Company number</dt>
                      <dd className="text-right font-medium text-[#1e1b16]">
                        {values.registrationNumber || '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Business type</dt>
                      <dd className="text-right font-medium text-[#1e1b16]">{businessTypeLabel}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Registered office</dt>
                      <dd className="max-w-[60%] text-right font-medium text-[#1e1b16]">
                        {values.registeredAddress}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Contact number</dt>
                      <dd className="text-right font-medium text-[#1e1b16]">{values.contactPhone}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-[#d6c4ad] bg-[#f9f3ea] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-[#1e1b16]">Documents</h3>
                    <Button onClick={() => setStep(1)} size="sm" type="button" variant="outline">
                      Edit
                    </Button>
                  </div>
                  <ul className="space-y-1.5 text-sm text-[#514534]">
                    <li>
                      Business document:{' '}
                      <strong className="text-[#1e1b16]">
                        {values.businessDocumentUrl ? 'Uploaded' : 'Missing'}
                      </strong>
                    </li>
                    <li>
                      Owner ID proof:{' '}
                      <strong className="text-[#1e1b16]">
                        {values.idProofUrl ? 'Uploaded' : 'Missing'}
                      </strong>
                    </li>
                    <li>
                      Physical store:{' '}
                      <strong className="text-[#1e1b16]">
                        {values.hasPhysicalStore
                          ? values.physicalStorePhotoUrl
                            ? 'Yes · photo uploaded'
                            : 'Yes · photo missing'
                          : 'No'}
                      </strong>
                    </li>
                    {needsFoodLicense ? (
                      <li>
                        Food licence:{' '}
                        <strong className="text-[#1e1b16]">
                          {values.foodLicenseUrl ? 'Uploaded' : 'Missing'}
                        </strong>
                      </li>
                    ) : null}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#d6c4ad] bg-[#f9f3ea] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-[#1e1b16]">Store setup</h3>
                    <Button onClick={() => setStep(2)} size="sm" type="button" variant="outline">
                      Edit
                    </Button>
                  </div>
                  <div className="flex gap-4">
                    {values.storeLogoUrl ? (
                      <img
                        alt="Store logo preview"
                        className="h-16 w-16 shrink-0 rounded-xl border border-[#d6c4ad] object-cover"
                        src={values.storeLogoUrl}
                      />
                    ) : null}
                    <dl className="min-w-0 flex-1 space-y-2 text-sm text-[#514534]">
                      <div className="flex justify-between gap-4">
                        <dt>Store name</dt>
                        <dd className="text-right font-medium text-[#1e1b16]">{values.storeName}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt>Store slug</dt>
                        <dd className="text-right font-medium text-[#1e1b16]">{values.storeSlug}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt>Description</dt>
                        <dd className="max-w-[65%] text-right font-medium text-[#1e1b16]">
                          {values.storeDescription}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt>Delivery postcodes</dt>
                        <dd className="max-w-[65%] text-right font-medium text-[#1e1b16]">
                          {(values.deliveryPostcodes ?? []).join(', ') || 'None'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <p className="rounded-lg border border-[#d6c4ad] bg-white px-3 py-2 text-sm text-[#514534]">
                  After you submit, your application goes to <strong>PENDING</strong> verification.
                  An admin must approve it before you can sell.
                </p>
              </div>
            ) : null}

            {error ? <p className="text-sm text-[#a83635]">{error}</p> : null}

            <div className="flex justify-between gap-3 pt-2">
              <Button
                disabled={step === 0 || form.formState.isSubmitting}
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
                  {form.formState.isSubmitting ? 'Submitting…' : 'Confirm & submit for verification'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
