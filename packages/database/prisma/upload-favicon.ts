/**
 * Upload the app favicon to Cloudinary.
 * Run: pnpm --filter @bharatmart/database exec tsx prisma/upload-favicon.ts
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
loadEnv({ path: path.join(REPO_ROOT, '.env') })
loadEnv({ path: path.join(REPO_ROOT, '.env.local'), override: true })

const PUBLIC_ID = 'bharatmart/brand/favicon'

function requireCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing CLOUDINARY_* env vars in root .env')
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
  return cloudName
}

async function main() {
  const cloudName = requireCloudinary()
  const localPath = path.join(REPO_ROOT, 'apps', 'web', 'public', 'favicon.png')
  const buffer = await readFile(localPath)

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: PUBLIC_ID,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
      },
      (error, uploadResult) => {
        if (error || !uploadResult) reject(error ?? new Error('Upload failed'))
        else resolve({ secure_url: uploadResult.secure_url, public_id: uploadResult.public_id })
      },
    )
    stream.end(buffer)
  })

  console.log(`Uploaded favicon to Cloudinary (${cloudName})`)
  console.log(`public_id: ${result.public_id}`)
  console.log(`url: ${result.secure_url}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
