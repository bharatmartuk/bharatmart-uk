import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { Toaster } from '@bharatmart/ui'
import { AuthSessionProvider } from '@/components/auth-session-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })

export const metadata: Metadata = {
  title: {
    default: 'BharatMart UK | Premium Indian Marketplace',
    template: '%s | BharatMart UK',
  },
  description: 'Authentic Indian groceries, fashion, festival essentials and local merchants across the UK.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={`${inter.variable} ${montserrat.variable}`}
      lang="en-GB"
      suppressHydrationWarning
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthSessionProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthSessionProvider>
      </body>
    </html>
  )
}
