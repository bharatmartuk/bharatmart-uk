import type { Metadata } from 'next'
import { AuthSessionProvider } from '@/components/auth-session-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'BharatMart Admin',
  description: 'BharatMart Admin for BharatMart UK',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  )
}
