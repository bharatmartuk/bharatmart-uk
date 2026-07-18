import { NextResponse } from 'next/server'
import { UploadService, type UploadFolder } from '@bharatmart/services'
import { getCurrentUser } from '@/auth'

const allowedFolders: UploadFolder[] = [
  'bharatmart/products',
  'bharatmart/merchant-documents',
  'bharatmart/merchant-logos',
]

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as { folder?: string }
  const folder = body.folder as UploadFolder | undefined
  if (!folder || !allowedFolders.includes(folder)) {
    return NextResponse.json({ error: 'Invalid upload folder' }, { status: 400 })
  }

  const signed = await UploadService.createSignedUpload(folder)
  return NextResponse.json(signed)
}
