'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ApiTestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testRealApi = async () => {
    setLoading(true)
    try {
      const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${apiKey}`
      
      console.log('Testing real API with URL:', url)
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log('Real API Response:', data)
      setResult({ 
        type: 'REAL API', 
        data, 
        isRealData: !data.Note && !data['Error Message'] && data['Global Quote']
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
          <CardTitle>API Status Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Current Configuration:</h3>
            <div className="text-sm space-y-1 bg-gray-50 p-4 rounded">
              <div><strong>API Key:</strong> {process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'Not configured'}</div>
              <div><strong>Base URL:</strong> {process.env.NEXT_PUBLIC_ALPHA_VANTAGE_BASE_URL || 'Default'}</div>
            </div>
          </div>

          <Button onClick={testRealApi} disabled={loading}>
            {loading ? 'Testing...' : 'Test Real Alpha Vantage API'}
          </Button>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  API Test Result
                  <span className={`px-2 py-1 text-xs rounded ${
                    result.isRealData ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.isRealData ? 'REAL DATA' : 'FALLBACK/ERROR'}
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