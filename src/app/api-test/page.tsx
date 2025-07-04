'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ApiTestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testPolygonApi = async () => {
    setLoading(true)
    try {
      const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY
      
      if (!apiKey) {
        setResult({ 
          type: 'CONFIGURATION ERROR', 
          error: 'API key not configured',
          isRealData: false
        })
        return
      }

      // Test direct API call
      const url = `https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2025-07-02/2025-07-04?adjusted=true&sort=desc&limit=5&apikey=${apiKey}`
      
      console.log('Testing Polygon.io API with URL:', url)
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log('Polygon.io API Response:', data)
      setResult({ 
        type: 'POLYGON.IO API', 
        data, 
        isRealData: data.status === 'OK' || data.status === 'DELAYED'
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
          <CardTitle>Polygon.io API Status Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Current Configuration:</h3>
            <div className="text-sm space-y-1 bg-gray-50 p-4 rounded">
              <div><strong>API Key:</strong> {process.env.NEXT_PUBLIC_POLYGON_API_KEY ? 'Configured' : 'Not configured'}</div>
              <div><strong>Base URL:</strong> {process.env.NEXT_PUBLIC_POLYGON_BASE_URL || 'https://api.polygon.io'}</div>
            </div>
          </div>

          <Button onClick={testPolygonApi} disabled={loading}>
            {loading ? 'Testing...' : 'Test Polygon.io API'}
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