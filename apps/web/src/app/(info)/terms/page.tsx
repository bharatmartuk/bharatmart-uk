import { LegalPageLayout } from '@/components/legal/LegalPageLayout'
import { termsOfServiceContent } from '@/content/legal/terms-of-service'

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for BharatMart UK — placeholder pending legal counsel review.',
}

export default function TermsOfServicePage() {
  return <LegalPageLayout content={termsOfServiceContent} variant="terms" />
}
