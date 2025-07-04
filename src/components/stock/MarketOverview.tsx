'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, Globe, Clock, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getMarketIndices } from '@/lib/api'
import { MarketIndex, MarketMover } from '@/lib/types'
import { formatCurrency, formatPercentage, getPriceChangeColor, isMarketOpen, getNextMarketOpen } from '@/lib/utils'
import { format } from 'date-fns'

interface MarketOverviewProps {
  onSelectStock?: (symbol: string) => void
}

// Mock data for market movers since Alpha Vantage free tier is limited
const mockMarketMovers = {
  gainers: [
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 485.50, change: 28.45, changePercent: 6.23, volume: 45820000 },
    { symbol: 'AMD', name: 'Advanced Micro Devices', price: 142.75, change: 7.80, changePercent: 5.78, volume: 32500000 },
    { symbol: 'TSLA', name: 'Tesla Inc', price: 248.90, change: 12.15, changePercent: 5.13, volume: 58900000 },
    { symbol: 'GOOGL', name: 'Alphabet Inc', price: 145.20, change: 6.85, changePercent: 4.95, volume: 28400000 },
    { symbol: 'META', name: 'Meta Platforms Inc', price: 338.50, change: 14.25, changePercent: 4.39, volume: 19800000 }
  ],
  losers: [
    { symbol: 'PYPL', name: 'PayPal Holdings Inc', price: 58.45, change: -3.25, changePercent: -5.27, volume: 12400000 },
    { symbol: 'NFLX', name: 'Netflix Inc', price: 425.80, change: -18.95, changePercent: -4.26, volume: 8900000 },
    { symbol: 'UBER', name: 'Uber Technologies Inc', price: 62.10, change: -2.45, changePercent: -3.80, volume: 15600000 },
    { symbol: 'SNAP', name: 'Snap Inc', price: 11.25, change: -0.42, changePercent: -3.60, volume: 24500000 },
    { symbol: 'TWTR', name: 'Twitter Inc', price: 42.85, change: -1.48, changePercent: -3.34, volume: 18200000 }
  ],
  active: [
    { symbol: 'AAPL', name: 'Apple Inc', price: 185.20, change: 2.15, changePercent: 1.17, volume: 89500000 },
    { symbol: 'TSLA', name: 'Tesla Inc', price: 248.90, change: 12.15, changePercent: 5.13, volume: 58900000 },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 485.50, change: 28.45, changePercent: 6.23, volume: 45820000 },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 445.60, change: 1.85, changePercent: 0.42, volume: 42300000 },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 375.40, change: 4.20, changePercent: 1.13, volume: 38700000 }
  ]
}

function MarketMoverCard({ 
  mover, 
  rank, 
  onSelect 
}: { 
  mover: MarketMover
  rank: number
  onSelect?: (symbol: string) => void 
}) {
  const changeColor = getPriceChangeColor(mover.change)

  return (
    <div 
      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={() => onSelect?.(mover.symbol)}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
          {rank}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium">{mover.symbol}</div>
          <div className="text-sm text-muted-foreground truncate">{mover.name}</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-medium">{formatCurrency(mover.price)}</div>
        <div className="flex items-center gap-1 text-sm">
          {mover.change >= 0 ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={changeColor}>
            {formatPercentage(mover.changePercent)}
          </span>
        </div>
      </div>
    </div>
  )
}

function MarketIndexCard({ index }: { index: MarketIndex }) {
  const changeColor = getPriceChangeColor(index.change)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{index.name}</h4>
            <Badge variant={index.change >= 0 ? "success" : "destructive"}>
              {index.change >= 0 ? '↗' : '↘'}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold">{formatCurrency(index.price)}</div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`font-medium ${changeColor}`}>
                {formatCurrency(Math.abs(index.change))}
              </span>
              <span className={`${changeColor}`}>
                ({formatPercentage(index.changePercent)})
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MarketOverview({ onSelectStock }: MarketOverviewProps) {
  const [indices, setIndices] = useState<MarketIndex[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const marketOpen = isMarketOpen()
  const nextOpen = getNextMarketOpen()

  const fetchIndices = async () => {
    try {
      setError(null)
      const response = await getMarketIndices()
      if (response.success) {
        setIndices(response.data)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to fetch market data')
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLastUpdated(new Date())
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchIndices()
  }

  useEffect(() => {
    fetchIndices()
    
    // Auto-refresh every 5 minutes during market hours
    const interval = setInterval(() => {
      if (marketOpen) {
        fetchIndices()
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [marketOpen])

  return (
    <div className="space-y-6">
      {/* Market Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Market Overview
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={marketOpen ? "success" : "secondary"}>
                {marketOpen ? 'Market Open' : 'Market Closed'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Market Status
              </div>
              <div className="text-lg font-medium">
                {marketOpen ? 'Open' : 'Closed'}
              </div>
              {!marketOpen && (
                <div className="text-sm text-muted-foreground">
                  Next open: {format(nextOpen, 'MMM dd, HH:mm')}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="text-lg font-medium">
                {format(lastUpdated, 'HH:mm:ss')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Indices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Major Indices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-4">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {indices.map((index) => (
                <MarketIndexCard key={index.symbol} index={index} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Movers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Movers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="gainers" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
              <TabsTrigger value="losers">Top Losers</TabsTrigger>
              <TabsTrigger value="active">Most Active</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gainers" className="space-y-2">
              {mockMarketMovers.gainers.map((mover, index) => (
                <MarketMoverCard
                  key={mover.symbol}
                  mover={mover}
                  rank={index + 1}
                  onSelect={onSelectStock}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="losers" className="space-y-2">
              {mockMarketMovers.losers.map((mover, index) => (
                <MarketMoverCard
                  key={mover.symbol}
                  mover={mover}
                  rank={index + 1}
                  onSelect={onSelectStock}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="active" className="space-y-2">
              {mockMarketMovers.active.map((mover, index) => (
                <MarketMoverCard
                  key={mover.symbol}
                  mover={mover}
                  rank={index + 1}
                  onSelect={onSelectStock}
                />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}