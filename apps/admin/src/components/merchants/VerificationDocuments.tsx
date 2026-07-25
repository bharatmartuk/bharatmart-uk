'use client'

import { useState } from 'react'
import { ExternalLink, FileText, AlertTriangle } from 'lucide-react'

export type VerificationDocumentMeta = {
  label: string
  url: string
  kind: 'pdf' | 'image' | 'stub' | 'other'
}

function classifyUrl(url: string): VerificationDocumentMeta['kind'] {
  if (url.includes('picsum.photos')) return 'stub'

  if (
    url.startsWith('data:application/pdf') ||
    url.includes('application/pdf') ||
    /\.pdf($|\?|#)/i.test(url) ||
    url.includes('/raw/upload/') ||
    /\/upload\/.*\.pdf/i.test(url)
  ) {
    return 'pdf'
  }

  if (
    url.startsWith('data:image/') ||
    /\.(png|jpe?g|gif|webp|avif)($|\?|#)/i.test(url) ||
    url.includes('/image/upload/')
  ) {
    return 'image'
  }

  if (url.includes('res.cloudinary.com')) {
    return 'other'
  }

  return 'other'
}

export function describeVerificationDocuments(input: {
  verificationDocumentUrls: string[]
  hasPhysicalStore: boolean
  physicalStorePhotoUrl: string | null
  foodLicenseUrl: string | null
}): VerificationDocumentMeta[] {
  const docs: VerificationDocumentMeta[] = []
  const [businessUrl, idUrl] = input.verificationDocumentUrls

  if (businessUrl) {
    docs.push({ label: 'Business document', url: businessUrl, kind: classifyUrl(businessUrl) })
  }
  if (idUrl) {
    docs.push({ label: 'Owner identity proof', url: idUrl, kind: classifyUrl(idUrl) })
  }
  if (input.hasPhysicalStore && input.physicalStorePhotoUrl) {
    docs.push({
      label: 'Physical store photo',
      url: input.physicalStorePhotoUrl,
      kind: classifyUrl(input.physicalStorePhotoUrl),
    })
  }
  if (input.foodLicenseUrl) {
    docs.push({
      label: 'Food hygiene / licence',
      url: input.foodLicenseUrl,
      kind: classifyUrl(input.foodLicenseUrl),
    })
  }

  return docs
}

function DocumentPreview({
  kind,
  label,
  openUrl,
  previewUrl,
}: {
  kind: VerificationDocumentMeta['kind']
  label: string
  openUrl: string
  previewUrl: string
}) {
  const [failed, setFailed] = useState(false)

  if (kind === 'stub') {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg bg-[#f4ede4] px-4 text-center">
        <FileText className="h-8 w-8 text-[#837561]" />
        <p className="text-sm text-[#514534]">
          Placeholder upload - ask the merchant to re-upload so you can review the real file.
        </p>
      </div>
    )
  }

  if (failed) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-[#f5c2c0] bg-[#fff5f4] px-4 text-center">
        <AlertTriangle className="h-8 w-8 text-[#a83635]" />
        <p className="text-sm text-[#a83635]">
          Preview failed to load. Use Open to download the file, or ask the merchant to re-upload.
        </p>
        <a
          className="text-xs font-medium text-[#7f5700] hover:underline"
          href={openUrl}
          rel="noreferrer"
          target="_blank"
        >
          Open document
        </a>
      </div>
    )
  }

  if (kind === 'pdf') {
    return (
      <div className="space-y-2">
        <img
          alt={`${label} preview`}
          className="max-h-72 w-full rounded-lg border border-[#d6c4ad] bg-white object-contain"
          onError={() => setFailed(true)}
          src={previewUrl}
        />
        <p className="text-xs text-[#837561]">
          Preview of page 1.{' '}
          <a
            className="font-medium text-[#7f5700] hover:underline"
            href={openUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open full PDF
          </a>
        </p>
      </div>
    )
  }

  if (kind === 'image') {
    return (
      <img
        alt={label}
        className="max-h-72 w-full rounded-lg bg-white object-contain"
        onError={() => setFailed(true)}
        src={openUrl}
      />
    )
  }

  return (
    <object
      className="h-72 w-full rounded-lg border border-[#d6c4ad] bg-white"
      data={`${openUrl}#toolbar=1&navpanes=0`}
      type="application/pdf"
    >
      <iframe
        className="h-72 w-full rounded-lg border-0 bg-white"
        onError={() => setFailed(true)}
        src={`${openUrl}#toolbar=1&navpanes=0`}
        title={label}
      />
    </object>
  )
}

export function VerificationDocuments({
  merchantId,
  documents,
}: {
  merchantId: string
  documents: VerificationDocumentMeta[]
}) {
  if (documents.length === 0) {
    return <p className="text-sm text-[#514534]">No documents uploaded.</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {documents.map((document, index) => {
        const openUrl = `/api/merchants/${merchantId}/documents/${index}`
        const previewUrl = `${openUrl}?preview=1`

        return (
          <article
            className="overflow-hidden rounded-xl border border-[#d6c4ad] bg-[#fffaf4]"
            key={`${document.label}-${index}`}
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#d6c4ad] px-3 py-2">
              <p className="text-sm font-medium text-[#1e1b16]">{document.label}</p>
              {document.kind !== 'stub' ? (
                <a
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#7f5700] hover:underline"
                  href={openUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>

            <div className="p-3">
              <DocumentPreview
                kind={document.kind}
                label={document.label}
                openUrl={openUrl}
                previewUrl={previewUrl}
              />
            </div>
          </article>
        )
      })}
    </div>
  )
}
