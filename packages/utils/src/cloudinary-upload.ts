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

  // Without real Cloudinary credentials, keep a deterministic placeholder URL.
  if (!signed.apiKey || signed.apiKey === 'stub' || signed.signature === 'pending-cloudinary-secret') {
    const publicId = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
    return {
      url: `https://picsum.photos/seed/${encodeURIComponent(publicId)}/800/800`,
      publicId,
    }
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', signed.apiKey)
  formData.append('timestamp', String(signed.timestamp))
  formData.append('signature', signed.signature)
  formData.append('folder', signed.folder)

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
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
