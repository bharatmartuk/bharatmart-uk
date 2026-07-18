import Link from 'next/link'
import { Facebook, Instagram, MessageCircle, Share2 } from 'lucide-react'
import { Button, Separator } from '@bharatmart/ui'
import { merchantAppPath } from '@/lib/app-urls'

const footerGroups = [
  {
    title: 'Shop',
    links: [
      ['All products', '/products'],
      ['Groceries', '/products?category=groceries'],
      ['Pooja & Festival', '/products?category=pooja-festival'],
      ['Clothing & Sarees', '/products?category=clothing-sarees'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['Our story', '/about'],
      ['Contact us', '/contact'],
      ['Privacy policy', '/privacy'],
      ['Terms of service', '/terms'],
    ],
  },
] as const

export function SiteFooter() {
  const sellLinks = [
    ['Become a seller', merchantAppPath('/register-business')],
    ['Merchant login', merchantAppPath('/login')],
  ] as const

  return (
    <>
      <aside className="fixed bottom-5 right-5 z-40">
        <Button
          asChild
          className="h-12 rounded-full bg-[#2e6a39] px-4 text-white shadow-lg hover:bg-[#135224]"
        >
          <a href="https://wa.me/" rel="noreferrer" target="_blank">
            <MessageCircle className="mr-2 h-5 w-5" />
            <span className="hidden sm:inline">Chat on WhatsApp</span>
          </a>
        </Button>
      </aside>

      <footer className="border-t border-[#d6c4ad] bg-[#f4ede4]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-8 lg:px-16">
          <div>
            <Link className="font-heading text-2xl font-bold text-[#7f5700]" href="/">
              BharatMart UK
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#514534]">
              Bringing the heart of Indian markets to the UK. Quality, authenticity, and community
              at every step.
            </p>
            <div className="mt-5 flex gap-2">
              {[Facebook, Instagram, Share2].map((Icon, index) => (
                <Button aria-label="Social media" key={index} size="icon" variant="ghost">
                  <Icon className="h-4 w-4 text-[#7f5700]" />
                </Button>
              ))}
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
    </>
  )
}
