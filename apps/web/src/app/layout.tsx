import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { Toaster } from '@bharatmart/ui'
import { AuthSessionProvider } from '@/components/auth-session-provider'
import { PageLoader } from '@/components/layout/PageLoader'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })

const favicon = '/favicon.png'

export const metadata: Metadata = {
  title: {
    default: 'BharatMart UK | Premium Indian Marketplace',
    template: '%s | BharatMart UK',
  },
  description: 'Authentic Indian groceries, fashion, festival essentials and local merchants across the UK.',
  icons: {
    icon: [
      { url: favicon, type: 'image/png', sizes: '32x32' },
      { url: favicon, type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: favicon, type: 'image/png', sizes: '180x180' }],
    shortcut: favicon,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={`${inter.variable} ${montserrat.variable}`}
      lang="en-GB"
      suppressHydrationWarning
    >
      <head>
        {/* Explicit links so the tab icon stays visible on first paint, loader, and client navigations */}
        <link href={favicon} rel="icon" sizes="any" type="image/png" />
        <link href={favicon} rel="icon" type="image/png" />
        <link href={favicon} rel="shortcut icon" type="image/png" />
        <link href={favicon} rel="apple-touch-icon" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthSessionProvider>
          <PageLoader />
          {children}
          <Toaster position="top-right" richColors />
        </AuthSessionProvider>
      </body>
    </html>
  )
}
