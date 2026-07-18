import { ExternalLink, FileText } from 'lucide-react'

export type VerificationDocumentMeta = {
  kind: 'pdf' | 'image' | 'stub' | 'other'
}

function documentLabel(index: number) {
  if (index === 0) return 'Business document'
  if (index === 1) return 'ID proof'
  return `Document ${index + 1}`
}

export function describeVerificationDocuments(urls: string[]): VerificationDocumentMeta[] {
  return urls.map((url) => {
    if (url.includes('picsum.photos')) return { kind: 'stub' }
    if (
      url.startsWith('data:application/pdf') ||
      url.includes('application/pdf') ||
      /\.pdf($|\?|#)/i.test(url)
    ) {
      return { kind: 'pdf' }
    }
    if (
      url.startsWith('data:image/') ||
      /\.(png|jpe?g|gif|webp|avif)($|\?|#)/i.test(url) ||
      url.includes('res.cloudinary.com')
    ) {
      return { kind: 'image' }
    }
    return { kind: 'other' }
  })
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
        const label = documentLabel(index)
        const previewUrl = `/api/merchants/${merchantId}/documents/${index}`

        return (
          <article
            className="overflow-hidden rounded-xl border border-[#d6c4ad] bg-[#fffaf4]"
            key={`${label}-${index}`}
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#d6c4ad] px-3 py-2">
              <p className="text-sm font-medium text-[#1e1b16]">{label}</p>
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
                    Old placeholder upload — ask the merchant to re-upload documents so you can review
                    the real file.
                  </p>
                </div>
              ) : document.kind === 'pdf' || document.kind === 'other' ? (
                <iframe
                  className="h-64 w-full rounded-lg border border-[#d6c4ad] bg-white"
                  src={previewUrl}
                  title={label}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- preview via authenticated API
                <img
                  alt={label}
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
