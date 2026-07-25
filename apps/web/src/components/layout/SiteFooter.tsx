import Link from 'next/link'
import { Instagram, MessageCircle } from 'lucide-react'
import { Button, Separator } from '@bharatmart/ui'
import { merchantAppPath } from '@/lib/app-urls'
import { INSTAGRAM_URL, WHATSAPP_URL } from '@/lib/contact'

const footerGroups = [
  {
    title: 'Shop',
    links: [
      ['All products', '/products'],
      ['Homemade Foods', '/products?category=homemade-foods'],
      ['Festive Collections', '/products?category=festive-collections'],
      ['Indian Clothing', '/products?category=indian-clothing'],
      ['Indian Food', '/products?category=indian-food'],
      ['Rice', '/products?category=rice'],
      ['Favourites', '/wishlist'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['Our story', '/about'],
      ['Contact us', '/contact'],
      ['Privacy policy', '/privacy-policy'],
      ['Terms of service', '/terms'],
    ],
  },
] as const

export function SiteFooter() {
  const sellLinks = [
    ['Become a seller', merchantAppPath('/login?intent=register')],
    ['Merchant login', merchantAppPath('/login')],
  ] as const

  return (
    <footer className="border-t border-[#d6c4ad] bg-[#f4ede4]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-8 lg:px-16">
        <div>
          <Link className="inline-block rounded-md bg-[#f4ede4]" href="/">
            <img
              alt="BharatMart"
              className="h-12 w-auto bg-[#f4ede4] object-contain"
              height={98}
              src="/bharatmart-logo.png"
              width={217}
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#514534]">
            Bringing the heart of Indian markets to the UK. Quality, authenticity, and community
            at every step.
          </p>
          <div className="mt-5 flex gap-2">
            <Button asChild aria-label="Instagram" size="icon" variant="ghost">
              <a href={INSTAGRAM_URL} rel="noreferrer" target="_blank">
                <Instagram className="h-4 w-4 text-[#7f5700]" />
              </a>
            </Button>
            <Button asChild aria-label="WhatsApp" size="icon" variant="ghost">
              <a href={WHATSAPP_URL} rel="noreferrer" target="_blank">
                <MessageCircle className="h-4 w-4 text-[#7f5700]" />
              </a>
            </Button>
          </div>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="font-semibold text-[#7f5700]">{group.title}</h2>
            <ul className="mt-4 space-y-3">
              {group.links.map(([label, href]) => (
                <li key={label}>
                  <Link className="text-sm text-[#514534] hover:underline" href={href}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="font-semibold text-[#7f5700]">Sell on BharatMart</h2>
          <ul className="mt-4 space-y-3">
            {sellLinks.map(([label, href]) => (
              <li key={label}>
                <a className="text-sm text-[#514534] hover:underline" href={href}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Separator className="bg-[#d6c4ad]" />
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-[#837561] md:px-8 lg:px-16">
        © {new Date().getFullYear()} BharatMart UK. All rights reserved.
      </div>
    </footer>
  )
}
