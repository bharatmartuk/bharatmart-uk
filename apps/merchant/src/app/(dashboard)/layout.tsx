import { MerchantShell } from '@/components/layout/MerchantShell'
import { requireMerchant } from '@/lib/merchant-context'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { merchant } = await requireMerchant()
  return <MerchantShell storeName={merchant.storeName}>{children}</MerchantShell>
}
