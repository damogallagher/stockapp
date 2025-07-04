import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stock App - Professional Stock Market Analytics',
  description: 'Comprehensive stock market analysis tools for investors and traders. Real-time quotes, interactive charts, company financials, and portfolio tracking.',
  keywords: 'stocks, investing, finance, stock market, portfolio, trading, financial analysis',
  authors: [{ name: 'Stock App' }],
  openGraph: {
    title: 'Stock App - Professional Stock Market Analytics',
    description: 'Comprehensive stock market analysis tools for investors and traders.',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stock App - Market Analytics Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stock App - Professional Stock Market Analytics',
    description: 'Comprehensive stock market analysis tools for investors and traders.'
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-full bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  )
}