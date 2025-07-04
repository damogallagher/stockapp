'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/layout/Navigation'
import MarketOverview from '@/components/stock/MarketOverview'
import { useStockStore } from '@/lib/store'

export default function MarketPage() {
  const { isDarkMode } = useStockStore()
  const router = useRouter()

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleSelectStock = (symbol: string) => {
    router.push(`/stock/${symbol}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
            <p className="text-muted-foreground">
              Stay updated with the latest market trends, indices, and top movers
            </p>
          </div>
          
          <MarketOverview onSelectStock={handleSelectStock} />
        </div>
      </main>
    </div>
  )
}