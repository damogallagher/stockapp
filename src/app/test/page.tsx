'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { searchStocks, getStockQuote } from '@/lib/api'

export default function TestPage() {
  const [searchResult, setSearchResult] = useState<any>(null)
  const [quoteResult, setQuoteResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSearch = async () => {
    setLoading(true)
    try {
      const result = await searchStocks('AAPL')
      setSearchResult(result)
      console.log('Search result:', result)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testQuote = async () => {
    setLoading(true)
    try {
      const result = await getStockQuote('AAPL')
      setQuoteResult(result)
      console.log('Quote result:', result)
    } catch (error) {
      console.error('Quote error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testSearch} disabled={loading}>
              Test Search
            </Button>
            <Button onClick={testQuote} disabled={loading}>
              Test Quote
            </Button>
          </div>

          {searchResult && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(searchResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {quoteResult && (
            <Card>
              <CardHeader>
                <CardTitle>Quote Results</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(quoteResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}