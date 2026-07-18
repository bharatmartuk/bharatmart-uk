import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@bharatmart/ui'

const festivals = [
  ['Diwali', 'Pooja kits, lamps & sweets', 'diwali', 'diwali'],
  ['Navratri', 'Clothing, jewellery & snacks', 'navratri', 'navratri'],
  ['Raksha Bandhan', 'Gifts & designer Rakhis', 'raksha-bandhan', 'rakhi'],
  ['Ganesh Chaturthi', 'Idols & festive essentials', 'ganesh-chaturthi', 'ganesh'],
] as const

export function FestivalSection() {
  return (
    <section aria-labelledby="festival-heading" className="bg-[#f9f3ea] py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-16">
        <h2 className="mb-7 font-heading text-2xl font-semibold md:text-3xl" id="festival-heading">
          Shop by Festival
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {festivals.map(([name, description, slug, seed]) => (
            <Card className="overflow-hidden border-[#d6c4ad] bg-[#fff8f0] shadow-sm" key={name}>
              <CardContent className="p-4">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                  <Image
                    alt=""
                    className="object-cover transition duration-500 hover:scale-105"
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    src={`https://picsum.photos/seed/bharatmart-${seed}/600/400`}
                  />
                </div>
                <h3 className="mt-4 font-semibold">{name}</h3>
                <p className="mt-1 text-sm text-[#514534]">{description}</p>
                <Link
                  className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#7f5700]"
                  href={`/products?festival=${slug}`}
                >
                  Explore <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
