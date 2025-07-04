'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ApiTestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testYahooFinanceApi = async () => {
    setLoading(true)
    try {
      // Test Yahoo Finance API through our API layer
      const response = await fetch('/api/test-yahoo-finance')
      const data = await response.json()
      
      console.log('Yahoo Finance API Response:', data)
      setResult({ 
        type: 'YAHOO FINANCE API', 
        data, 
        isRealData: data.success === true
      })
    } catch (error) {
      console.error('API Error:', error)
      setResult({ type: 'API ERROR', error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Yahoo Finance API Status Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Current Configuration:</h3>
            <div className="text-sm space-y-1 bg-gray-50 p-4 rounded">
              <div><strong>API Provider:</strong> Yahoo Finance (via yahoo-finance2)</div>
              <div><strong>Status:</strong> No API key required</div>
            </div>
          </div>

          <Button onClick={testYahooFinanceApi} disabled={loading}>
            {loading ? 'Testing...' : 'Test Yahoo Finance API'}
          </Button>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.type} Result
                  <span className={`px-2 py-1 text-xs rounded ${
                    result.isRealData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.isRealData ? 'SUCCESS' : 'ERROR/FAILED'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto bg-gray-100 p-4 rounded max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}