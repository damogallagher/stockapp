'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { searchStocks } from '@/lib/api'
import { useStockStore } from '@/lib/store'
import { StockSearchResult } from '@/lib/types'

interface StockSearchProps {
  onSelectStock: (symbol: string) => void
  placeholder?: string
  className?: string
}

export default function StockSearch({ onSelectStock, placeholder = "Search stocks...", className = "" }: StockSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { recentSearches, addRecentSearch, clearRecentSearches } = useStockStore()

  // Popular stocks for suggestions
  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NFLX', name: 'Netflix Inc.' }
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 1) {
      setResults([])
      setError(null)
      return
    }

    const delayedSearch = setTimeout(async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await searchStocks(query)
        
        if (response.success) {
          setResults(response.data)
        } else {
          setError(response.error)
        }
      } catch (err) {
        setError('Failed to search stocks')
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [query])

  const handleSelectStock = (symbol: string) => {
    addRecentSearch(symbol)
    onSelectStock(symbol)
    setQuery('')
    setShowResults(false)
    setResults([])
  }

  const handleClearSearch = () => {
    setQuery('')
    setResults([])
    setError(null)
    inputRef.current?.focus()
  }

  const handleInputFocus = () => {
    setShowResults(true)
  }

  const showSuggestions = showResults && query.length === 0
  const showSearchResults = showResults && query.length >= 1

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {(showSuggestions || showSearchResults) && (
        <Card className="absolute top-full z-50 mt-1 w-full shadow-lg">
          <CardContent className="p-0">
            {showSuggestions && (
              <div className="p-4">
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Recent Searches
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.slice(0, 5).map((symbol) => (
                        <Badge
                          key={symbol}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => handleSelectStock(symbol)}
                        >
                          {symbol}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Popular Stocks
                  </h4>
                  <div className="space-y-2">
                    {popularStocks.map((stock) => (
                      <div
                        key={stock.symbol}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => handleSelectStock(stock.symbol)}
                      >
                        <div>
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-sm text-muted-foreground">{stock.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showSearchResults && (
              <div className="max-h-96 overflow-y-auto">
                {loading && (
                  <div className="p-4 text-center text-muted-foreground">
                    Searching...
                  </div>
                )}
                
                {error && (
                  <div className="p-4 text-center text-destructive">
                    {error}
                  </div>
                )}
                
                {!loading && !error && results.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No stocks found for &quot;{query}&quot;
                  </div>
                )}
                
                {!loading && !error && results.length > 0 && (
                  <div className="p-2">
                    {results.map((result) => (
                      <div
                        key={result.symbol}
                        className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => handleSelectStock(result.symbol)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{result.symbol}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {result.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {result.type}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.region}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}