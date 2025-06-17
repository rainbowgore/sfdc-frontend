import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap'  // Add display swap for better font loading
})

export const metadata: Metadata = {
  title: 'Salesforce AI Case Enricher',
  description: 'Upload and enrich customer support cases with AI',
  viewport: 'width=device-width, initial-scale=1',
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
