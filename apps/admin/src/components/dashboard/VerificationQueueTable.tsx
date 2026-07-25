'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, Eye, Search, X } from 'lucide-react'
import { Badge, Button, Input } from '@bharatmart/ui'

export type PendingMerchantRow = {
  id: string
  storeName: string
  ownerName: string | null
  email: string | null
  submittedAt: string
  verificationStatus: string
}

export function VerificationQueueTable({ merchants }: { merchants: PendingMerchantRow[] }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING'>('ALL')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return merchants.filter((merchant) => {
      if (statusFilter !== 'ALL' && merchant.verificationStatus !== statusFilter) return false
      if (!q) return true
      return (
        merchant.storeName.toLowerCase().includes(q) ||
        (merchant.ownerName || '').toLowerCase().includes(q) ||
        (merchant.email || '').toLowerCase().includes(q)
      )
    })
  }, [merchants, query, statusFilter])

  if (merchants.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-xl bg-[#f9f3ea] px-6 text-center">
        <p className="text-sm font-medium text-[#1e1b16]">No merchants waiting for approval.</p>
        <p className="mt-1 text-sm text-[#514534]">
          New seller applications will appear here for review.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#837561]" />
          <Input
            aria-label="Search pending merchants"
            className="pl-9"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search store, owner or email…"
            value={query}
          />
        </div>
        <select
          aria-label="Filter by status"
          className="h-10 rounded-md border border-[#d6c4ad] bg-white px-3 text-sm text-[#1e1b16]"
          onChange={(event) => setStatusFilter(event.target.value as 'ALL' | 'PENDING')}
          value={statusFilter}
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#efe2cf]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-[#f9f3ea] text-xs uppercase tracking-wide text-[#837561]">
            <tr>
              <th className="px-4 py-3 font-medium">Store</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((merchant) => (
              <tr
                className="border-t border-[#efe2cf] transition-colors duration-200 hover:bg-[#fdfaf6]"
                key={merchant.id}
              >
                <td className="px-4 py-3 font-medium text-[#1e1b16]">{merchant.storeName}</td>
                <td className="px-4 py-3 text-[#514534]">
                  <div>{merchant.ownerName || '—'}</div>
                  <div className="text-xs text-[#837561]">{merchant.email}</div>
                </td>
                <td className="px-4 py-3 text-[#514534]">{merchant.submittedAt}</td>
                <td className="px-4 py-3">
                  <Badge className="bg-[#ffdeae] text-[#5b3d00]">{merchant.verificationStatus}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/merchants/${merchant.id}`}>
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                    <Button asChild className="bg-[#2e6a39] text-white hover:bg-[#245530]" size="sm">
                      <Link href={`/merchants/${merchant.id}`}>
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Approve
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="border-[#f5c2c0] text-[#a83635] hover:bg-[#ffdad6]"
                      size="sm"
                      variant="outline"
                    >
                      <Link href={`/merchants/${merchant.id}`}>
                        <X className="mr-1 h-3.5 w-3.5" />
                        Reject
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-[#514534]">No merchants match your search.</p>
        ) : null}
      </div>
    </div>
  )
}
