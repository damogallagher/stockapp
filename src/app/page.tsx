'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/layout/Navigation'
import StockSearch from '@/components/stock/StockSearch'
import MarketOverview from '@/components/stock/MarketOverview'
import Watchlist from '@/components/stock/Watchlist'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Star, BarChart3, Search as SearchIcon, ArrowRight } from 'lucide-react'
import { useStockStore } from '@/lib/store'

export default function HomePage() {
  const [showSearch, setShowSearch] = useState(false)
  const { watchlist, isDarkMode } = useStockStore()
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

  const handleOpenSearch = () => {
    setShowSearch(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation onSearch={handleOpenSearch} />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Modal/Section */}
        {showSearch && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50">
            <Card className="w-full max-w-2xl mx-4 mt-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Search Stocks</CardTitle>
                  <Button
                    variant="ghost"
                    onClick={() => setShowSearch(false)}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <StockSearch
                  onSelectStock={(symbol) => {
                    setShowSearch(false)
                    handleSelectStock(symbol)
                  }}
                  placeholder="Search for stocks, ETFs, or indices..."
                />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to StockApp
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your comprehensive platform for stock market analysis, portfolio tracking, and investment insights.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleOpenSearch}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <SearchIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Search Stocks</h3>
                    <p className="text-sm text-muted-foreground">Find and analyze any stock</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/market')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Market Overview</h3>
                    <p className="text-sm text-muted-foreground">View market trends and movers</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/watchlist')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">My Watchlist</h3>
                    <p className="text-sm text-muted-foreground">
                      {watchlist.length > 0 ? `${watchlist.length} stocks tracked` : 'Track your favorite stocks'}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Market Overview - Takes 2 columns */}
            <div className="lg:col-span-2">
              <MarketOverview onSelectStock={handleSelectStock} />
            </div>

            {/* Watchlist Sidebar */}
            <div className="space-y-6">
              {watchlist.length > 0 ? (
                <Watchlist onSelectStock={handleSelectStock} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Get Started
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Start by searching for stocks and adding them to your watchlist to track their performance.
                    </p>
                    <Button onClick={handleOpenSearch} className="w-full">
                      <SearchIcon className="h-4 w-4 mr-2" />
                      Search Stocks
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Popular Stocks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Popular Stocks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { symbol: 'AAPL', name: 'Apple Inc.' },
                      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
                      { symbol: 'MSFT', name: 'Microsoft Corp.' },
                      { symbol: 'TSLA', name: 'Tesla Inc.' },
                      { symbol: 'NVDA', name: 'NVIDIA Corp.' }
                    ].map((stock) => (
                      <div
                        key={stock.symbol}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => handleSelectStock(stock.symbol)}
                      >
                        <div>
                          <div className="font-medium text-sm">{stock.symbol}</div>
                          <div className="text-xs text-muted-foreground">{stock.name}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}