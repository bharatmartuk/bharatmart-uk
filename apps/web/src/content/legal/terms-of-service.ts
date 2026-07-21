import type { LegalPageContent } from './types'
import { CONTACT_EMAIL_HREF } from '@/lib/contact'

const PLACEHOLDER =
  '[Placeholder — finalize with legal counsel before launch]'

export const termsOfServiceContent: LegalPageContent = {
  title: 'Terms of Service',
  sidebarTitle: 'Terms of Service',
  lastUpdated: 'July 2026',
  sections: [
    {
      id: 'acceptance',
      heading: '1. Acceptance of Terms',
      body: [
        PLACEHOLDER,
        'This section will explain that using BharatMart UK constitutes acceptance of these Terms.',
      ],
    },
    {
      id: 'use',
      heading: '2. Acceptable Use',
      body: [
        PLACEHOLDER,
        'This section will outline permitted and prohibited uses of the marketplace.',
      ],
    },
    {
      id: 'account',
      heading: '3. Account Registration & Responsibilities',
      body: [
        PLACEHOLDER,
        'This section will cover account accuracy, security credentials, and user responsibilities.',
      ],
    },
    {
      id: 'role',
      heading: '4. Marketplace Role',
      body: [
        PLACEHOLDER,
        'This section will clarify that BharatMart UK operates a multi-vendor marketplace and that merchants are responsible for their own products and fulfilment unless otherwise stated.',
      ],
    },
    {
      id: 'orders',
      heading: '5. Orders & Fulfilment',
      body: [
        PLACEHOLDER,
        'This section will describe how orders are placed, accepted, and fulfilled by merchants.',
      ],
    },
    {
      id: 'payment',
      heading: '6. Pricing & Payments',
      body: [
        PLACEHOLDER,
        'This section will cover pricing display, taxes, payment methods, and failed payment handling.',
      ],
    },
    {
      id: 'returns',
      heading: '7. Cancellations & Returns',
      body: [
        PLACEHOLDER,
        'This section will summarise cancellation windows, returns eligibility, and refund processes.',
      ],
    },
    {
      id: 'content',
      heading: '8. Reviews & User Content',
      body: [
        PLACEHOLDER,
        'This section will address ownership, licence, and moderation of reviews and other user-generated content.',
      ],
    },
    {
      id: 'prohibited',
      heading: '9. Prohibited Items',
      body: [
        PLACEHOLDER,
        'This section will list categories of goods that may not be sold on the marketplace.',
      ],
    },
    {
      id: 'liability',
      heading: '10. Limitation of Liability',
      body: [
        PLACEHOLDER,
        'This section will set out liability caps and exclusions to the extent permitted by UK law.',
      ],
    },
    {
      id: 'governing',
      heading: '11. Governing Law',
      body: [
        PLACEHOLDER,
        'This section will state that these Terms are governed by the laws of England and Wales.',
      ],
    },
    {
      id: 'contact',
      heading: '12. Contact Us',
      body: [
        PLACEHOLDER,
        'Questions about these Terms can be sent to our support inbox. Formal company details will be confirmed with counsel before launch.',
      ],
    },
  ],
  contactCta: {
    heading: 'Questions about these terms?',
    body: 'Reach our support team and we will point you to the right policy or contact.',
    buttonLabel: 'Contact Support',
    href: CONTACT_EMAIL_HREF,
  },
}
