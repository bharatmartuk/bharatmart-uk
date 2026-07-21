export type CloudinaryFolder =
  | 'bharatmart/products'
  | 'bharatmart/merchant-documents'
  | 'bharatmart/merchant-logos'
  | 'bharatmart/banners'

export type SignedUploadResponse = {
  cloudName: string
  apiKey: string
  timestamp: number
  folder: CloudinaryFolder
  signature: string
}

/**
 * Browser-side signed upload:
 * 1) fetch a signature from our API (secret stays on the server)
 * 2) POST the file directly to Cloudinary
 *
 * Without Cloudinary credentials, merchant documents are stored via local upload API
 * so admins can open/review them without huge data-URL payloads.
 */
export async function uploadFileToCloudinary(
  file: File,
  folder: CloudinaryFolder,
  signUrl = '/api/uploads/sign',
): Promise<{ url: string; publicId: string }> {
  const signResponse = await fetch(signUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  })

  if (!signResponse.ok) {
    throw new Error('Unable to sign Cloudinary upload.')
  }

  const signed = (await signResponse.json()) as SignedUploadResponse
  const publicId = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`

  if (!signed.apiKey || signed.signature === 'pending-cloudinary-secret') {
    if (folder === 'bharatmart/merchant-documents') {
      const formData = new FormData()
      formData.append('file', file)
      const localResponse = await fetch('/api/uploads/local', {
        method: 'POST',
        body: formData,
      })
      if (!localResponse.ok) {
        throw new Error('Local document upload failed.')
      }
      return (await localResponse.json()) as { url: string; publicId: string }
    }

    throw new Error(
      'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to upload images.',
    )
  }

  const resourceType = file.type.startsWith('image/') ? 'image' : 'auto'
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
    throw new Error('Cloudinary upload failed.')
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
