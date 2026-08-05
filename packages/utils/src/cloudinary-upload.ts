export type CloudinaryFolder =
  | 'bharatmart/products'
  | 'bharatmart/merchant-documents'
  | 'bharatmart/carousel'
  /** @deprecated Use bharatmart/carousel */
  | 'bharatmart/banners'

export type SignedUploadResponse = {
  cloudName: string
  apiKey: string
  timestamp: number
  folder: CloudinaryFolder
  signature: string
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: string }
    if (payload.error) return payload.error
  } catch {
    // ignore
  }
  return fallback
}

/**
 * Upload a file to Cloudinary via our authenticated API (recommended).
 * Falls back to a browser-signed direct Cloudinary upload for larger files.
 */
export async function uploadFileToCloudinary(
  file: File,
  folder: CloudinaryFolder,
  options?: {
    /** Server upload endpoint (default `/api/uploads`) */
    uploadUrl?: string
    /** Signed-upload endpoint (default `/api/uploads/sign`) */
    signUrl?: string
  },
): Promise<{ url: string; publicId: string }> {
  const uploadUrl = options?.uploadUrl ?? '/api/uploads'
  const signUrl = options?.signUrl ?? '/api/uploads/sign'

  // Prefer server-side Cloudinary upload (works for PDFs + images, no filesystem).
  // Stay under Vercel serverless body limits (~4.5MB).
  if (file.size <= 4 * 1024 * 1024) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Document upload failed. Please try again.'))
    }

    return (await response.json()) as { url: string; publicId: string }
  }

  // Large files: signed direct upload to Cloudinary (bypasses Vercel body limit).
  const signResponse = await fetch(signUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  })

  if (!signResponse.ok) {
    throw new Error(await readErrorMessage(signResponse, 'Unable to sign Cloudinary upload.'))
  }

  const signed = (await signResponse.json()) as SignedUploadResponse
  if (!signed.apiKey || !signed.signature || !signed.cloudName) {
    throw new Error(
      'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel, then redeploy.',
    )
  }

  const resourceType = file.type.startsWith('image/')
    ? 'image'
    : file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      ? 'image'
      : 'auto'
  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', signed.apiKey)
  formData.append('timestamp', String(signed.timestamp))
  formData.append('signature', signed.signature)
  formData.append('folder', signed.folder)

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    },
  )

  if (!uploadResponse.ok) {
    throw new Error(await readErrorMessage(uploadResponse, 'Cloudinary upload failed.'))
  }

  const payload = (await uploadResponse.json()) as {
    secure_url: string
    public_id: string
  }

  return {
    url: payload.secure_url,
    publicId: payload.public_id,
  }
}
