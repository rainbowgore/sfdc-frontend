import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Salesforce AI Case Enricher',
  description: 'Upload and enrich customer support cases with AI',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon0.svg', type: 'image/svg+xml' },
      { url: '/icon1.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </body>
    </html>
  )
}
