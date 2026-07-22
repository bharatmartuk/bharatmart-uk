import { redirect } from 'next/navigation'

export default function BannersPage() {
  redirect('/marketplace?tab=carousel')
}
