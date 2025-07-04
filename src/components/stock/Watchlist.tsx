'use client'

import { useState, useEffect } from 'react'
import { Trash2, TrendingUp, TrendingDown, Star, Search, SortAsc, SortDesc } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useStockStore } from '@/lib/store'
import { useStockQuote } from '@/hooks/useStockData'
import { formatCurrency, formatPercentage, getPriceChangeColor } from '@/lib/utils'
import { WatchlistItem } from '@/lib/types'

interface WatchlistProps {
  onSelectStock?: (symbol: string) => void
}

interface WatchlistItemWithQuote extends WatchlistItem {
  currentPrice?: number
  currentChange?: number
  currentChangePercent?: number
  loading?: boolean
  error?: string
}

function WatchlistItemRow({ 
  item, 
  onRemove, 
  onSelect 
}: { 
  item: WatchlistItemWithQuote
  onRemove: (symbol: string) => void
  onSelect?: (symbol: string) => void
}) {
  const changeColor = getPriceChangeColor(item.currentChange || 0)

  return (
    <div 
      className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={() => onSelect?.(item.symbol)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="font-medium">{item.symbol}</div>
            <div className="text-sm text-muted-foreground truncate">{item.name}</div>
          </div>
          
          <div className="text-right">
            {item.loading ? (
              <div className="space-y-1">
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
            ) : item.error ? (
              <div className="text-xs text-destructive">Error</div>
            ) : (
              <div className="space-y-1">
                <div className="font-medium">
                  {item.currentPrice ? formatCurrency(item.currentPrice) : formatCurrency(item.price || 0)}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {(item.currentChangePercent !== undefined ? item.currentChangePercent : (item.changePercent || 0)) >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`${changeColor} text-xs`}>
                    {formatPercentage(item.currentChangePercent !== undefined ? item.currentChangePercent : (item.changePercent || 0))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onRemove(item.symbol)
        }}
        className="ml-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

function WatchlistItemCard({ 
  item, 
  onRemove, 
  onSelect 
}: { 
  item: WatchlistItemWithQuote
  onRemove: (symbol: string) => void
  onSelect?: (symbol: string) => void
}) {
  const changeColor = getPriceChangeColor(item.currentChange || 0)

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect?.(item.symbol)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold text-lg">{item.symbol}</div>
            <div className="text-sm text-muted-foreground truncate">{item.name}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(item.symbol)
            }}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {item.loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ) : item.error ? (
          <div className="text-sm text-destructive">Error loading data</div>
        ) : (
          <div className="space-y-2">
            <div className="text-xl font-bold">
              {item.currentPrice ? formatCurrency(item.currentPrice) : formatCurrency(item.price || 0)}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                (item.currentChangePercent !== undefined ? item.currentChangePercent : (item.changePercent || 0)) >= 0 
                  ? "success" : "destructive"
              } className="flex items-center gap-1">
                {(item.currentChangePercent !== undefined ? item.currentChangePercent : (item.changePercent || 0)) >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {formatCurrency(Math.abs(item.currentChange !== undefined ? item.currentChange : item.change || 0))}
              </Badge>
              <span className={`text-sm font-medium ${changeColor}`}>
                {formatPercentage(item.currentChangePercent !== undefined ? item.currentChangePercent : (item.changePercent || 0))}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function Watchlist({ onSelectStock }: WatchlistProps) {
  const { watchlist, removeFromWatchlist } = useStockStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'symbol' | 'change' | 'price'>('symbol')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Enhanced watchlist items with current quotes
  const [enhancedItems, setEnhancedItems] = useState<WatchlistItemWithQuote[]>([])

  // Filter watchlist based on search query
  const filteredItems = enhancedItems.filter(item =>
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue: number | string
    let bValue: number | string

    switch (sortBy) {
      case 'symbol':
        aValue = a.symbol
        bValue = b.symbol
        break
      case 'change':
        aValue = a.currentChangePercent !== undefined ? a.currentChangePercent : a.changePercent || 0
        bValue = b.currentChangePercent !== undefined ? b.currentChangePercent : b.changePercent || 0
        break
      case 'price':
        aValue = a.currentPrice !== undefined ? a.currentPrice : a.price || 0
        bValue = b.currentPrice !== undefined ? b.currentPrice : b.price || 0
        break
      default:
        aValue = a.symbol
        bValue = b.symbol
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('asc')
    }
  }

  const handleRemove = (symbol: string) => {
    removeFromWatchlist(symbol)
  }

  // Initialize enhanced items when watchlist changes
  useEffect(() => {
    setEnhancedItems(watchlist.map(item => ({ ...item, loading: true })))
  }, [watchlist])

  // Load quotes for watchlist items
  useEffect(() => {
    const loadQuotes = async () => {
      const promises = watchlist.map(async (item) => {
        try {
          // Simulate quote loading - in real app, you'd fetch actual quotes
          await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))
          
          // For demo, add some mock price movement
          const mockChange = (Math.random() - 0.5) * 10
          const mockChangePercent = (Math.random() - 0.5) * 5
          const mockPrice = (item.price || 100) + mockChange
          
          return {
            ...item,
            currentPrice: mockPrice,
            currentChange: mockChange,
            currentChangePercent: mockChangePercent,
            loading: false,
            error: undefined
          }
        } catch (error) {
          return {
            ...item,
            loading: false,
            error: 'Failed to load'
          }
        }
      })

      const results = await Promise.all(promises)
      setEnhancedItems(results)
    }

    if (watchlist.length > 0) {
      loadQuotes()
    } else {
      setEnhancedItems([])
    }
  }, [watchlist])

  if (watchlist.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Your watchlist is empty</h3>
            <p className="text-muted-foreground mb-4">
              Start adding stocks to your watchlist to track their performance
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalValue = sortedItems.reduce((sum, item) => 
    sum + (item.currentPrice !== undefined ? item.currentPrice : item.price || 0), 0
  )
  const totalChange = sortedItems.reduce((sum, item) => 
    sum + (item.currentChangePercent !== undefined ? item.currentChangePercent : item.changePercent || 0), 0
  )
  const avgChange = totalChange / sortedItems.length

  return (
    <div className="space-y-6">
      {/* Watchlist Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Watchlist ({watchlist.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getPriceChangeColor(avgChange)}`}>
                {formatPercentage(avgChange)}
              </div>
              <div className="text-sm text-muted-foreground">Average Change</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{watchlist.length}</div>
              <div className="text-sm text-muted-foreground">Holdings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search watchlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('symbol')}
                className="flex items-center gap-1"
              >
                Symbol
                {sortBy === 'symbol' && (
                  sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('price')}
                className="flex items-center gap-1"
              >
                Price
                {sortBy === 'price' && (
                  sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('change')}
                className="flex items-center gap-1"
              >
                Change
                {sortBy === 'change' && (
                  sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watchlist Items */}
      <Card>
        <CardContent className="p-0">
          {sortedItems.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No stocks match your search
            </div>
          ) : viewMode === 'list' ? (
            <div>
              {sortedItems.map((item) => (
                <WatchlistItemRow
                  key={item.symbol}
                  item={item}
                  onRemove={handleRemove}
                  onSelect={onSelectStock}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {sortedItems.map((item) => (
                <WatchlistItemCard
                  key={item.symbol}
                  item={item}
                  onRemove={handleRemove}
                  onSelect={onSelectStock}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}