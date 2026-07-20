import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/auth'
import { WishlistPageClient } from '@/app/(shop)/wishlist/WishlistPageClient'

export default async function WishlistPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=/wishlist')

  return <WishlistPageClient />
}
