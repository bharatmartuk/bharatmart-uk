import type { LegalPageContent } from './types'
import { CONTACT_EMAIL_HREF } from '@/lib/contact'

const PLACEHOLDER =
  '[Placeholder — finalize with legal counsel before launch]'

export const privacyPolicyContent: LegalPageContent = {
  title: 'Privacy Policy',
  sidebarTitle: 'Privacy Center',
  lastUpdated: 'July 2026',
  sections: [
    {
      id: 'collect',
      heading: 'Information We Collect',
      body: [
        PLACEHOLDER,
        'This section will describe the categories of personal data BharatMart UK collects when you create an account, place an order, or contact support.',
      ],
    },
    {
      id: 'use',
      heading: 'How We Use Your Information',
      body: [
        PLACEHOLDER,
        'This section will explain the purposes for which we process personal data (order fulfilment, customer support, fraud prevention, and service improvement).',
      ],
    },
    {
      id: 'sharing',
      heading: 'Sharing With Merchants & Third Parties',
      body: [
        PLACEHOLDER,
        'This section will cover how order and delivery details are shared with merchants and vetted service providers needed to operate the marketplace.',
      ],
    },
    {
      id: 'stripe',
      heading: 'Payment Data & Stripe',
      body: [
        PLACEHOLDER,
        'We do not store full card details on our servers. Payment processing is handled by Stripe as our PCI-DSS compliant partner. Final wording pending counsel review.',
      ],
    },
    {
      id: 'cookies',
      heading: 'Cookies',
      body: [
        PLACEHOLDER,
        'This section will describe essential and optional cookies used for authentication, analytics, and remembering preferences.',
      ],
    },
    {
      id: 'gdpr',
      heading: 'Your Rights Under UK GDPR',
      body: [
        PLACEHOLDER,
        'This section will list your rights of access, rectification, erasure, restriction, objection, and data portability under UK GDPR.',
      ],
    },
    {
      id: 'retention',
      heading: 'Data Retention',
      body: [
        PLACEHOLDER,
        'This section will set out how long different categories of data are retained and the criteria used to determine retention periods.',
      ],
    },
    {
      id: 'children',
      heading: "Children's Privacy",
      body: [
        PLACEHOLDER,
        'This section will state age restrictions for the marketplace and how we handle data relating to children.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to This Policy',
      body: [
        PLACEHOLDER,
        'This section will explain how we notify users when this Privacy Policy is updated.',
      ],
    },
    {
      id: 'contact',
      heading: 'Contact Us',
      body: [
        PLACEHOLDER,
        'For privacy questions, contact our support team using the details below. Formal Data Protection Officer contact details will be added once confirmed with counsel.',
      ],
    },
  ],
  contactCta: {
    heading: 'Have a privacy question?',
    body: 'Our team is ready to help with concerns regarding your personal information.',
    buttonLabel: 'Email Privacy Team',
    href: CONTACT_EMAIL_HREF,
  },
}
