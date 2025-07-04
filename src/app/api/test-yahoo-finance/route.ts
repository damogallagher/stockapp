import { NextResponse } from 'next/server'
import { getStockQuote } from '@/lib/api'

export async function GET() {
  try {
    // Test the Yahoo Finance API with AAPL
    const result = await getStockQuote('AAPL')
    
    return NextResponse.json({
      success: result.success,
      data: result.data,
      error: result.error,
      timestamp: new Date().toISOString(),
      provider: 'Yahoo Finance (yahoo-finance2)'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      provider: 'Yahoo Finance (yahoo-finance2)'
    }, { status: 500 })
  }
}