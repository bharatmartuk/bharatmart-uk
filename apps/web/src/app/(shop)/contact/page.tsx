import { Instagram, Mail, MessageCircle, Phone } from 'lucide-react'
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF, INSTAGRAM_URL, WHATSAPP_NUMBER, WHATSAPP_URL } from '@/lib/contact'

export const metadata = {
  title: 'Contact Us',
  description: 'Reach Bharat Mart UK on WhatsApp, Instagram, or email.',
}

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 lg:px-16">
      <article className="overflow-hidden rounded-2xl border border-[#e8d9c8] bg-white shadow-[0_8px_30px_rgba(46,21,21,0.06)]">
        <div className="grid gap-8 p-8 md:grid-cols-[200px_minmax(0,1fr)] md:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#f6e6e4]">
              <Phone className="h-10 w-10 text-[#8a3a2a]" />
            </div>
            <h1 className="mt-5 font-heading text-2xl font-semibold text-[#8a3a2a]">Contact Us</h1>
          </div>
          <div className="space-y-5 text-[15px] leading-7 text-[#2a2a2a]">
            <p>
              Have questions or want to know more? Reach out to us directly on{' '}
              <a
                className="font-semibold text-[#8a3a2a] hover:underline"
                href={WHATSAPP_URL}
                rel="noreferrer"
                target="_blank"
              >
                WhatsApp
              </a>{' '}
              for a quick response, follow us on{' '}
              <a
                className="inline-flex items-center gap-1 font-semibold text-[#8a3a2a] hover:underline"
                href={INSTAGRAM_URL}
                rel="noreferrer"
                target="_blank"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
              , or email us at{' '}
              <a className="font-semibold text-[#8a3a2a] hover:underline" href={CONTACT_EMAIL_HREF}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
            <p>
              Get instant help with distributing partner and for purchases. We&apos;re here to help you
              with all your queries!
            </p>

            <ul className="space-y-3 pt-2 text-sm">
              <li>
                <a
                  className="inline-flex items-center gap-2 font-medium text-[#8a3a2a] hover:underline"
                  href={WHATSAPP_URL}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp: {WHATSAPP_NUMBER}
                </a>
              </li>
              <li>
                <a
                  className="inline-flex items-center gap-2 font-medium text-[#8a3a2a] hover:underline"
                  href={INSTAGRAM_URL}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Instagram className="h-4 w-4" />
                  @bharatmart_uk
                </a>
              </li>
              <li>
                <a
                  className="inline-flex items-center gap-2 font-medium text-[#8a3a2a] hover:underline"
                  href={CONTACT_EMAIL_HREF}
                >
                  <Mail className="h-4 w-4" />
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </article>
    </main>
  )
}
