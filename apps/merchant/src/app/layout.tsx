import type { Metadata } from 'next'
import { AuthSessionProvider } from '@/components/auth-session-provider'
import './globals.css'

const favicon = '/favicon.png'

export const metadata: Metadata = {
  title: 'BharatMart Merchant',
  description: 'BharatMart Merchant for BharatMart UK',
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
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <link href={favicon} rel="icon" sizes="any" type="image/png" />
        <link href={favicon} rel="icon" type="image/png" />
        <link href={favicon} rel="shortcut icon" type="image/png" />
        <link href={favicon} rel="apple-touch-icon" />
      </head>
      <body suppressHydrationWarning>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  )
}
