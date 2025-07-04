'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/layout/Navigation'
import Watchlist from '@/components/stock/Watchlist'
import { useStockStore } from '@/lib/store'

export default function WatchlistPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">My Watchlist</h1>
            <p className="text-muted-foreground">
              Track and monitor your favorite stocks in one place
            </p>
          </div>
          
          <Watchlist onSelectStock={handleSelectStock} />
        </div>
      </main>
    </div>
  )
}