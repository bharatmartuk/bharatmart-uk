import { LegalPageLayout } from '@/components/legal/LegalPageLayout'
import { privacyPolicyContent } from '@/content/legal/privacy-policy'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for BharatMart UK — placeholder pending legal counsel review.',
}

export default function PrivacyPolicyPage() {
  return <LegalPageLayout content={privacyPolicyContent} variant="privacy" />
}
