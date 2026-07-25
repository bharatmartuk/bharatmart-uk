import Link from 'next/link'
import {
  AlertTriangle,
  FileText,
  Package,
  ShoppingBag,
  Wallet,
} from 'lucide-react'
import { Card, CardContent } from '@bharatmart/ui'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

export type ProductKpis = {
  total: number
  active: number
  outOfStock: number
  drafts: number
  inventoryValueInPence: number
}

const cards: Array<{
  key: keyof ProductKpis | 'inventory'
  title: string
  description: string
  icon: typeof Package
  iconWrap: string
  descriptionClass?: string
}> = [
  {
    key: 'total',
    title: 'Total Products',
    description: 'All catalogue items',
    icon: Package,
    iconWrap: 'bg-[#ede7ff] text-[#5b4bb7]',
  },
  {
    key: 'active',
    title: 'Active',
    description: 'Published products',
    icon: ShoppingBag,
    iconWrap: 'bg-[#d8f5d9] text-[#2e6a39]',
  },
  {
    key: 'outOfStock',
    title: 'Out of Stock',
    description: 'Needs attention',
    icon: AlertTriangle,
    iconWrap: 'bg-[#ffdeae] text-[#9a6700]',
    descriptionClass: 'text-[#9a6700]',
  },
  {
    key: 'drafts',
    title: 'Drafts',
    description: 'Unpublished',
    icon: FileText,
    iconWrap: 'bg-[#dce8ff] text-[#2c4a8c]',
    descriptionClass: 'text-[#2c4a8c]',
  },
  {
    key: 'inventory',
    title: 'Total Value',
    description: 'Inventory value',
    icon: Wallet,
    iconWrap: 'bg-[#ffe0e8] text-[#a83635]',
  },
]

export function ProductKpiCards({ kpis }: { kpis: ProductKpis }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        const value =
          card.key === 'inventory'
            ? priceFormatter.format(kpis.inventoryValueInPence / 100)
            : String(kpis[card.key])

        return (
          <Card
            className="border-[#d6c4ad]/bg-white shadow-sm transition-shadow hover:shadow-md"
            key={card.key}
          >
            <CardContent className="flex items-start gap-3 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconWrap}`}
              >
                <Icon aria-hidden className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-semibold tracking-tight text-[#1e1b16]">{value}</p>
                <p className="text-sm font-medium text-[#1e1b16]">{card.title}</p>
                <p className={`text-xs ${card.descriptionClass ?? 'text-[#837561]'}`}>
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function ProductsEmptyHint() {
  return (
    <p className="text-sm text-[#514534]">
      No products yet.{' '}
      <Link className="font-semibold text-[#7f5700] hover:underline" href="/products/new">
        Add your first product
      </Link>
    </p>
  )
}
