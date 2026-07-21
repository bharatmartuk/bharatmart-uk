import { Button } from '@bharatmart/ui'
import type { LegalPageContent } from '@/content/legal/types'
import { LegalToc } from './LegalToc'

type LegalPageLayoutProps = {
  content: LegalPageContent
  /** Visual variant: privacy uses primary headings; terms uses secondary bordered headings. */
  variant?: 'privacy' | 'terms'
}

export function LegalPageLayout({ content, variant = 'privacy' }: LegalPageLayoutProps) {
  return (
    <main className="mx-auto flex max-w-7xl gap-12 px-4 pb-20 pt-10 md:px-8 lg:px-16">
      <LegalToc
        lastUpdated={content.lastUpdated}
        sections={content.sections}
        sidebarTitle={content.sidebarTitle}
      />

      <article className="min-w-0 flex-1 pt-2 lg:max-w-[720px]">
        <header className="mb-12">
          <h1
            className={`font-heading text-3xl font-bold md:text-4xl ${
              variant === 'privacy' ? 'text-[#a83635]' : 'text-[#1e1b16]'
            }`}
          >
            {content.title}
          </h1>
          <p className="mt-2 text-sm italic text-[#514534]">Last updated: {content.lastUpdated}</p>
        </header>

        <div className="space-y-16">
          {content.sections.map((section) => (
            <section className="scroll-mt-28" id={section.id} key={section.id}>
              <h2
                className={`mb-6 font-heading text-xl font-semibold md:text-2xl ${
                  variant === 'privacy'
                    ? 'text-[#7f5700]'
                    : 'border-b border-[#d6c4ad] pb-2 text-[#a83635]'
                }`}
              >
                {section.heading}
              </h2>
              <div className="space-y-4 text-base leading-7 text-[#514534]">
                {section.body.map((paragraph, index) => (
                  <p key={`${section.id}-${index}`}>{paragraph}</p>
                ))}
              </div>

              {content.contactCta && section.id === 'contact' ? (
                <div
                  className={`mt-8 flex flex-col items-start gap-6 rounded-2xl p-8 md:flex-row md:items-center ${
                    variant === 'privacy' ? 'bg-[#e8a317]' : 'border border-[#d6c4ad] bg-[#f4ede4]'
                  }`}
                >
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-semibold ${
                        variant === 'privacy' ? 'text-[#5b3d00]' : 'text-[#1e1b16]'
                      }`}
                    >
                      {content.contactCta.heading}
                    </h3>
                    <p
                      className={`mt-2 text-sm ${
                        variant === 'privacy' ? 'text-[#5b3d00]/90' : 'text-[#514534]'
                      }`}
                    >
                      {content.contactCta.body}
                    </p>
                  </div>
                  <Button
                    asChild
                    className={
                      variant === 'privacy'
                        ? 'bg-[#7f5700] text-white hover:bg-[#5b3d00]'
                        : 'bg-[#7f5700] text-white hover:bg-[#a83635]'
                    }
                  >
                    <a href={content.contactCta.href}>{content.contactCta.buttonLabel}</a>
                  </Button>
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}
