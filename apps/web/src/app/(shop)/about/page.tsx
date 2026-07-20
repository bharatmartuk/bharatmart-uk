import Image from 'next/image'
import Link from 'next/link'
import { INSTAGRAM_URL, CONTACT_EMAIL, CONTACT_EMAIL_HREF, WHATSAPP_URL } from '@/lib/contact'

export const metadata = {
  title: 'Our Story',
  description: 'Learn about Bharat Mart UK and our mission to bring authentic Indian essentials to the UK.',
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 lg:px-16">
      <article className="overflow-hidden rounded-2xl border border-[#e8d9c8] bg-white shadow-[0_8px_30px_rgba(46,21,21,0.06)]">
        <div className="grid gap-8 p-8 md:grid-cols-[200px_minmax(0,1fr)] md:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#f6e6e4]">
              <Image
                alt="BharatMart"
                className="h-16 w-auto object-contain"
                height={98}
                src="/bharatmart-logo.png"
                width={217}
              />
            </div>
            <h1 className="mt-5 font-heading text-2xl font-semibold text-[#8a3a2a]">Who We Are</h1>
          </div>
          <div className="space-y-4 text-[15px] leading-7 text-[#2a2a2a]">
            <p>
              At <strong>Bharat Mart UK</strong>, we know how hard it is to find authentic, high-quality
              Indian pooja items, décor, wellness products, and everyday essentials in the UK. That&apos;s
              why we&apos;re working to bring all these products together online, so you can shop easily and
              get them delivered direct to your door.
            </p>
            <p>
              Our aim is to offer genuine Indian goods at prices lower than the market average, making it
              simple for you to enjoy the best of India. Whether you want to keep your traditions alive or
              add a touch of India to your home, Bharat Mart will be your trusted partner across the UK.
            </p>
            <p className="pt-2 text-sm text-[#837561]">
              Looking for help?{' '}
              <Link className="font-semibold text-[#8a3a2a] hover:underline" href="/contact">
                Contact us
              </Link>
              {' · '}
              <a className="font-semibold text-[#8a3a2a] hover:underline" href={WHATSAPP_URL} rel="noreferrer" target="_blank">
                WhatsApp
              </a>
              {' · '}
              <a className="font-semibold text-[#8a3a2a] hover:underline" href={INSTAGRAM_URL} rel="noreferrer" target="_blank">
                Instagram
              </a>
              {' · '}
              <a className="font-semibold text-[#8a3a2a] hover:underline" href={CONTACT_EMAIL_HREF}>
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </article>
    </main>
  )
}
