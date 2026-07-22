import { ArrowRight, Clock, Instagram, Mail, MessageCircle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@bharatmart/ui'
import { ContactForm } from './ContactForm'
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  INSTAGRAM_URL,
  getWhatsAppSupportUrl,
} from '@/lib/contact'
import { merchantAppPath } from '@/lib/app-urls'

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with BharatMart UK for orders, merchant questions, or general support.',
}

const faqs = [
  {
    q: 'How do I track my order?',
    a: "You can track your order in real-time by checking the 'My Orders' section in your account. We also send automated tracking links via email and WhatsApp as soon as your courier dispatches the parcel.",
  },
  {
    q: 'How do I become a merchant?',
    a: "Joining BharatMart is easy! Click 'Become a Seller' in the footer to start our simplified onboarding process. You'll need a UK business registration and a passion for quality products.",
  },
  {
    q: 'What if my item arrives damaged?',
    a: 'We pride ourselves on careful packaging, but if something goes wrong, please contact us here or via WhatsApp with your order number and photos of the damage. We offer full refunds or replacements for damaged goods reported within 48 hours.',
  },
  {
    q: 'Which areas do you deliver to?',
    a: 'We deliver across all mainland UK postcodes. For Northern Ireland, the Scottish Highlands, and islands, please enter your postcode at checkout to see applicable shipping rates and transit times.',
  },
] as const

export default function ContactPage() {
  const whatsappUrl = getWhatsAppSupportUrl(
    'Hi BharatMart UK - I have a question about my order / becoming a merchant.',
  )

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8 lg:px-16">
      <section className="mx-auto mb-16 max-w-3xl text-center">
        <h1 className="font-heading text-3xl font-bold text-[#7f5700] md:text-5xl">Get in Touch</h1>
        <p className="mt-4 text-base leading-7 text-[#514534] md:text-lg">
          We&apos;re here to help with orders, merchant questions, or anything else. Whether you&apos;re
          a customer looking for home flavours or a vendor wanting to reach the UK market.
        </p>
      </section>

      <div className="mb-20 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="rounded-xl border border-[#e8e2d9] bg-white p-8 shadow-sm lg:col-span-7">
          <ContactForm />
        </div>

        <div className="space-y-6 lg:col-span-5">
          <a
            className="group flex items-center justify-between rounded-xl bg-[#80bf85] p-8 text-[#0e4e21] transition-transform hover:-translate-y-1"
            href={whatsappUrl}
            rel="noreferrer"
            target="_blank"
          >
            <div className="flex items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2e6a39] text-white">
                <MessageCircle aria-hidden className="h-7 w-7" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold">Chat on WhatsApp</h2>
                <p className="text-sm opacity-90">Instant support for quick questions</p>
              </div>
            </div>
            <ArrowRight aria-hidden className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          </a>

          <div className="space-y-8 rounded-xl border border-[#d6c4ad] bg-[#f4ede4] p-8">
            <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">Other Ways to Reach Us</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail aria-hidden className="mt-1 h-5 w-5 text-[#a83635]" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#514534]">
                    Email Support
                  </p>
                  <a className="text-lg font-semibold text-[#a83635] hover:underline" href={CONTACT_EMAIL_HREF}>
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Instagram aria-hidden className="mt-1 h-5 w-5 text-[#a83635]" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#514534]">Follow Us</p>
                  <a
                    className="text-lg font-semibold text-[#a83635] hover:underline"
                    href={INSTAGRAM_URL}
                    rel="noreferrer"
                    target="_blank"
                  >
                    @bharatmart_uk
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-[#eee7de] p-4">
                <Clock aria-hidden className="h-5 w-5 text-[#7f5700]" />
                <p className="text-sm text-[#514534]">
                  We typically respond within <span className="font-bold text-[#1e1b16]">2–4 hours</span>{' '}
                  during business hours.
                </p>
              </div>
            </div>
          </div>

          <div className="h-40 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#a83635_0%,#7f5700_50%,#e8a317_100%)] shadow-sm" />
        </div>
      </div>

      <section className="border-t border-[#d6c4ad] pt-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-semibold text-[#1e1b16]">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-[#514534]">Find quick answers to our most common questions</p>
          </div>
          <Accordion className="space-y-4" collapsible type="single">
            {faqs.map((faq, index) => (
              <AccordionItem
                className="overflow-hidden rounded-xl border border-[#d6c4ad] border-b-0 bg-[#f9f3ea] px-2"
                key={faq.q}
                value={`faq-${index}`}
              >
                <AccordionTrigger className="px-4 text-left text-base font-semibold text-[#1e1b16] hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-[#514534]">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="mt-8 text-center text-sm text-[#837561]">
            Want to sell with us?{' '}
            <a
              className="font-semibold text-[#7f5700] hover:underline"
              href={merchantAppPath('/register-business')}
            >
              Become a merchant
            </a>
          </p>
        </div>
      </section>
    </main>
  )
}
