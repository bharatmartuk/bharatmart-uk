import { ExternalLink, FileText } from 'lucide-react'

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
    /\.pdf($|\?|#)/i.test(url)
  ) {
    return 'pdf'
  }
  if (
    url.startsWith('data:image/') ||
    /\.(png|jpe?g|gif|webp|avif)($|\?|#)/i.test(url) ||
    url.includes('res.cloudinary.com')
  ) {
    return 'image'
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
        const previewUrl = `/api/merchants/${merchantId}/documents/${index}`

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
                  href={previewUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>

            <div className="p-3">
              {document.kind === 'stub' ? (
                <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg bg-[#f4ede4] px-4 text-center">
                  <FileText className="h-8 w-8 text-[#837561]" />
                  <p className="text-sm text-[#514534]">
                    Placeholder upload - ask the merchant to re-upload so you can review the real file.
                  </p>
                </div>
              ) : document.kind === 'pdf' || document.kind === 'other' ? (
                <iframe
                  className="h-64 w-full rounded-lg border border-[#d6c4ad] bg-white"
                  src={previewUrl}
                  title={document.label}
                />
              ) : (
                <img
                  alt={document.label}
                  className="max-h-72 w-full rounded-lg bg-white object-contain"
                  src={previewUrl}
                />
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
