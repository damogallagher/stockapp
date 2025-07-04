'use client'

import { ArrowUp, ArrowDown, TrendingUp, Plus, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useStockStore } from '@/lib/store'
import { StockQuote } from '@/lib/types'
import { formatCurrency, formatPercentage, getPriceChangeColor } from '@/lib/utils'

interface StockCardProps {
  quote: StockQuote
  loading?: boolean
  onViewDetails?: () => void
  showAddToWatchlist?: boolean
  compact?: boolean
}

export default function StockCard({ 
  quote, 
  loading = false, 
  onViewDetails, 
  showAddToWatchlist = true,
  compact = false 
}: StockCardProps) {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useStockStore()
  
  const isInWatchlist = watchlist.some(item => item.symbol === quote?.symbol)
  const changeColor = getPriceChangeColor(quote?.change || 0)

  const handleWatchlistToggle = () => {
    if (!quote) return
    
    if (isInWatchlist) {
      removeFromWatchlist(quote.symbol)
    } else {
      addToWatchlist({
        symbol: quote.symbol,
        name: quote.symbol, // We'll use symbol as name for now
        addedAt: new Date().toISOString(),
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent
      })
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          {!compact && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!quote) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{quote.symbol}</CardTitle>
          <div className="flex items-center gap-2">
            {quote.change > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
            )}
            {showAddToWatchlist && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleWatchlistToggle}
                className="h-8 w-8 p-0"
              >
                {isInWatchlist ? (
                  <Minus className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4" onClick={onViewDetails}>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
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
            <span className={`text-sm font-medium ${changeColor}`}>
              {formatPercentage(quote.changePercent)}
            </span>
          </div>
        </div>

        {!compact && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Open</div>
              <div className="font-medium">{formatCurrency(quote.open)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">High</div>
              <div className="font-medium">{formatCurrency(quote.high)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Low</div>
              <div className="font-medium">{formatCurrency(quote.low)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Volume</div>
              <div className="font-medium">{quote.volume.toLocaleString()}</div>
            </div>
          </div>
        )}

        {onViewDetails && (
          <Button variant="outline" className="w-full" onClick={onViewDetails}>
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  )
}