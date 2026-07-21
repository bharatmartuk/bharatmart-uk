export type LegalSection = {
  id: string
  heading: string
  body: string[]
}

export type LegalPageContent = {
  title: string
  sidebarTitle: string
  lastUpdated: string
  sections: LegalSection[]
  /** Optional CTA shown after the final section (privacy “contact” style). */
  contactCta?: {
    heading: string
    body: string
    buttonLabel: string
    href: string
  }
}
