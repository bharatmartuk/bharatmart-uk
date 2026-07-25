import Link from 'next/link'
import { Heart, Handshake, Truck, Users } from 'lucide-react'
import { Button } from '@bharatmart/ui'
import { MerchantService } from '@bharatmart/services'
import { merchantAppPath } from '@/lib/app-urls'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'About Us',
  description:
    'Learn how BharatMart UK connects the diaspora with authentic Indian merchants across the United Kingdom.',
}

function formatStat(value: number) {
  if (value >= 1000) {
    return `${Math.round(value / 100) / 10}k+`
  }
  return String(value)
}

const values = [
  {
    title: 'Authenticity',
    body: 'Sourced directly from creators and genuine high-street merchants.',
    icon: Heart,
    accent: 'bg-[#ffdad7]/40 text-[#a83635]',
  },
  {
    title: 'Community-First',
    body: 'Rooted in the local high street and the stories of the diaspora.',
    icon: Users,
    accent: 'bg-[#ffdeae]/50 text-[#7f5700]',
  },
  {
    title: 'Fair to Merchants',
    body: 'Empowering small businesses with the tools to compete digitally.',
    icon: Handshake,
    accent: 'bg-[#b1f2b4]/40 text-[#2e6a39]',
  },
  {
    title: 'Convenience',
    body: 'Home-grown taste, delivered safely right to your doorstep.',
    icon: Truck,
    accent: 'bg-[#ffdad7]/30 text-[#881e20]',
  },
] as const

async function loadAboutStats() {
  try {
    const [merchantCount, cityCount, customerCount] = await Promise.all([
      MerchantService.getApprovedCount(),
      MerchantService.getServedCityCount(),
      MerchantService.getCustomerCount(),
    ])
    return { merchantCount, cityCount, customerCount }
  } catch (error) {
    console.error('[about] Failed to load marketplace stats', error)
    return { merchantCount: 0, cityCount: 0, customerCount: 0 }
  }
}

export default async function AboutPage() {
  const { merchantCount, cityCount, customerCount } = await loadAboutStats()

  const stats = [
    {
      value: formatStat(merchantCount),
      label: 'Verified Merchants',
      color: 'text-[#7f5700]',
      span: false,
    },
    {
      value: formatStat(cityCount),
      label: 'UK Cities Served',
      color: 'text-[#a83635]',
      span: false,
    },
    {
      value: formatStat(customerCount),
      label: 'Happy Customers',
      color: 'text-[#2e6a39]',
      span: true,
    },
  ] as const

  return (
    <main>
      <section className="relative flex min-h-[420px] items-center overflow-hidden md:min-h-[560px]">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#e8a317_0%,_transparent_45%),radial-gradient(ellipse_at_bottom_right,_#a83635_0%,_transparent_40%),linear-gradient(115deg,_#1e1b16_0%,_#514534_45%,_#7f5700_100%)]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e1b16]/85 via-[#1e1b16]/55 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 md:px-8 lg:px-16">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl font-bold leading-tight text-[#ffdeae] drop-shadow-lg md:text-5xl">
              Bringing India Closer to Home
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[#f4ede4] md:text-xl">
              Connecting the UK&apos;s Indian community with the heritage, flavours, and craftsmanship
              they love.
            </p>
            <div className="mt-8">
              <Button asChild className="bg-[#e8a317] px-8 py-6 text-base font-semibold text-[#5b3d00] hover:bg-[#7f5700] hover:text-white">
                <Link href="/products">Start Exploring</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fff8f0] px-4 py-20 md:px-8 lg:px-16">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="space-y-6">
            <h2 className="border-l-4 border-[#7f5700] pl-6 font-heading text-3xl font-semibold text-[#a83635]">
              Our Story
            </h2>
            <div className="space-y-4 text-base leading-8 text-[#514534]">
              <p>
                BharatMart UK was born from a simple realisation: the vibrant spirit of the Indian high
                street shouldn&apos;t be lost across an ocean. What started as a modest directory to help
                friends find authentic spices in London has evolved into a nationwide digital marketplace.
              </p>
              <p>
                We saw local merchants-the guardians of heritage-struggling to reach customers beyond
                their neighbourhoods. At the same time, we felt the longing of the diaspora for textures
                and tastes of home that &ldquo;international aisles&rdquo; simply couldn&apos;t satisfy.
              </p>
              <p>
                Today we bridge that gap. We are more than an e-commerce platform; we are a
                community-rooted movement dedicated to preserving craftsmanship and fuelling the dreams
                of small Indian businesses across the United Kingdom.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {stats.map((stat) => (
              <div
                className={`rounded-xl bg-white p-8 text-center shadow-[0px_4px_12px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-1 ${
                  stat.span ? 'md:col-span-2' : ''
                }`}
                key={stat.label}
              >
                <div className={`font-heading text-4xl font-bold md:text-5xl ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="mt-2 text-xs font-medium uppercase tracking-widest text-[#514534]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f9f3ea] px-4 py-20 md:px-8 lg:px-16">
        <div className="mx-auto mb-14 max-w-7xl text-center">
          <h2 className="font-heading text-3xl font-semibold text-[#1e1b16]">What We Stand For</h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#7f5700]" />
        </div>
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => {
            const Icon = value.icon
            return (
              <div
                className="rounded-2xl bg-white p-8 text-center transition-all hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(168,54,53,0.1)]"
                key={value.title}
              >
                <div
                  className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${value.accent}`}
                >
                  <Icon aria-hidden className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-[#1e1b16]">{value.title}</h3>
                <p className="text-sm leading-6 text-[#514534]">{value.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* PLACEHOLDER - Meet the Team: pending real team bios/photos before launch */}
      <section className="bg-[#fff8f0] px-4 py-20 md:px-8 lg:px-16">
        <div className="mx-auto mb-14 max-w-7xl text-center">
          <h2 className="font-heading text-3xl font-semibold text-[#1e1b16]">Meet the Visionaries</h2>
          <p className="mt-3 text-base text-[#514534]">
            A diverse team passionate about culture and commerce.
          </p>
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {[
            { name: 'Arjun K.', role: 'Founder & CEO' },
            { name: 'Priya S.', role: 'Head of Merchant Success' },
            { name: 'Vikram R.', role: 'Chief Technology Officer' },
            { name: 'Ananya P.', role: 'Creative Director' },
            { name: 'Samir D.', role: 'Logistics Lead', desktopOnly: true },
          ].map((member) => (
            <div
              className={`flex flex-col items-center text-center ${member.desktopOnly ? 'hidden lg:flex' : ''}`}
              key={member.name}
            >
              <div className="mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-[#e8e2d9] bg-[#f4ede4]">
                <Users aria-hidden className="h-12 w-12 text-[#837561]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1e1b16]">{member.name}</h3>
              <p className="text-xs font-medium uppercase tracking-wide text-[#a83635]">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#a83635] px-4 py-20 text-white md:px-8 lg:px-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-8 border-[#ffdeae]" />
          <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full border-8 border-[#ffdeae]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-4xl font-bold md:text-5xl">Ready to explore?</h2>
          <p className="mt-6 text-base leading-7 opacity-90 md:text-lg">
            Whether you&apos;re looking for the taste of home or a way to grow your business, BharatMart
            UK is your gateway.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Button asChild className="bg-[#e8a317] px-10 py-6 text-base font-semibold text-[#5b3d00] hover:bg-[#ffdeae]">
              <Link href="/products">Start Shopping</Link>
            </Button>
            <Button
              asChild
              className="border-2 border-[#e8a317] bg-transparent px-10 py-6 text-base font-semibold text-[#e8a317] hover:bg-[#e8a317]/10"
              variant="outline"
            >
              <a href={merchantAppPath('/register-business')}>Become a Seller</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
