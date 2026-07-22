import { redirect } from 'next/navigation'

export default function CategoriesPage() {
  redirect('/marketplace?tab=categories')
}
