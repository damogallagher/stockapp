'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, TrendingUp, Plus, Minus, Building, DollarSign, BarChart3 } from 'lucide-react'
import { useStockData } from '@/hooks/useStockData'
import { useStockStore } from '@/lib/store'
import { formatCurrency, formatPercentage, formatMarketCap, getPriceChangeColor } from '@/lib/utils'

interface StockDashboardProps {
  symbol: string
}

export default function StockDashboard({ symbol }: StockDashboardProps) {
  const { quote, overview, loading, error } = useStockData(symbol)
  const { watchlist, addToWatchlist, removeFromWatchlist } = useStockStore()
  
  const isInWatchlist = watchlist.some(item => item.symbol === symbol)
  const changeColor = getPriceChangeColor(quote?.change || 0)

  const handleWatchlistToggle = () => {
    if (!quote) return
    
    if (isInWatchlist) {
      removeFromWatchlist(symbol)
    } else {
      addToWatchlist({
        symbol: symbol,
        name: overview?.name || symbol,
        addedAt: new Date().toISOString(),
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!quote) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No data available for {symbol}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Stock Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{symbol}</CardTitle>
              {overview?.name && (
                <p className="text-muted-foreground">{overview.name}</p>
              )}
            </div>
            <Button
              variant={isInWatchlist ? "outline" : "default"}
              onClick={handleWatchlistToggle}
              className="flex items-center gap-2"
            >
              {isInWatchlist ? (
                <>
                  <Minus className="h-4 w-4" />
                  Remove from Watchlist
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add to Watchlist
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Price and Change */}
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">
              {formatCurrency(quote.price)}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={quote.change >= 0 ? "success" : "destructive"} className="flex items-center gap-1">
                {quote.change >= 0 ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {formatCurrency(Math.abs(quote.change))}
              </Badge>
              <span className={`text-lg font-medium ${changeColor}`}>
                {formatPercentage(quote.changePercent)}
              </span>
            </div>
          </div>

          {/* Trading Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Open</div>
              <div className="font-medium">{formatCurrency(quote.open)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">High</div>
              <div className="font-medium">{formatCurrency(quote.high)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Low</div>
              <div className="font-medium">{formatCurrency(quote.low)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Previous Close</div>
              <div className="font-medium">{formatCurrency(quote.previousClose)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Volume</div>
              <div className="font-medium">{quote.volume.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Market Cap</div>
              <div className="font-medium">
                {overview?.marketCapitalization 
                  ? formatMarketCap(overview.marketCapitalization)
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">P/E Ratio</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.peRatio ? overview.peRatio.toFixed(2) : 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">EPS</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.eps ? formatCurrency(overview.eps) : 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">52W High</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.high52Week ? formatCurrency(overview.high52Week) : 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">52W Low</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground rotate-180" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.low52Week ? formatCurrency(overview.low52Week) : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Company Info */}
      {overview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Sector</div>
                <div className="font-medium">{overview.sector || 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Industry</div>
                <div className="font-medium">{overview.industry || 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Exchange</div>
                <div className="font-medium">{overview.exchange || 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Country</div>
                <div className="font-medium">{overview.country || 'N/A'}</div>
              </div>
            </div>
            {overview.description && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Description</div>
                <p className="text-sm leading-relaxed">{overview.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}