import { GET } from '@/app/api/test-yahoo-finance/route'
import { NextRequest } from 'next/server'
import * as api from '@/lib/api'

// Mock the API module
jest.mock('@/lib/api', () => ({
  getStockQuote: jest.fn(),
}))

const mockApi = api as jest.Mocked<typeof api>

describe('/api/test-yahoo-finance route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return successful response when API call succeeds', async () => {
    const mockQuoteData = {
      symbol: 'AAPL',
      price: 150.25,
      change: 2.50,
      changePercent: 1.69,
      volume: 50000000,
      previousClose: 147.75,
      open: 148.00,
      high: 151.00,
      low: 147.50,
      marketCap: 2500000000000,
      lastUpdated: '2024-01-15'
    }

    mockApi.getStockQuote.mockResolvedValue({
      data: mockQuoteData,
      error: null,
      success: true,
    })

    const response = await GET()
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData).toMatchObject({
      success: true,
      data: mockQuoteData,
      error: null,
      timestamp: expect.any(String),
      provider: 'Yahoo Finance (yahoo-finance2)'
    })
    
    expect(mockApi.getStockQuote).toHaveBeenCalledWith('AAPL')
  })

  it('should return error response when API call fails', async () => {
    const errorMessage = 'Failed to fetch quote'
    
    mockApi.getStockQuote.mockResolvedValue({
      data: {} as any,
      error: errorMessage,
      success: false,
    })

    const response = await GET()
    const responseData = await response.json()

    expect(response.status).toBe(200) // Still returns 200 but with success: false
    expect(responseData).toMatchObject({
      success: false,
      error: errorMessage,
      timestamp: expect.any(String),
      provider: 'Yahoo Finance (yahoo-finance2)'
    })
  })

  it('should handle API exceptions with 500 status', async () => {
    const errorMessage = 'Network error'
    
    mockApi.getStockQuote.mockRejectedValue(new Error(errorMessage))

    const response = await GET()
    const responseData = await response.json()

    expect(response.status).toBe(500)
    expect(responseData).toMatchObject({
      success: false,
      error: errorMessage,
      timestamp: expect.any(String),
      provider: 'Yahoo Finance (yahoo-finance2)'
    })
  })

  it('should handle unknown errors gracefully', async () => {
    mockApi.getStockQuote.mockRejectedValue('Unknown error type')

    const response = await GET()
    const responseData = await response.json()

    expect(response.status).toBe(500)
    expect(responseData).toMatchObject({
      success: false,
      error: 'Unknown error',
      timestamp: expect.any(String),
      provider: 'Yahoo Finance (yahoo-finance2)'
    })
  })

  it('should include valid timestamp in response', async () => {
    mockApi.getStockQuote.mockResolvedValue({
      data: {} as any,
      error: null,
      success: true,
    })

    const beforeCall = new Date()
    const response = await GET()
    const afterCall = new Date()
    const responseData = await response.json()

    const timestamp = new Date(responseData.timestamp)
    expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime())
    expect(timestamp.getTime()).toBeLessThanOrEqual(afterCall.getTime())
  })

  it('should always include provider information', async () => {
    mockApi.getStockQuote.mockResolvedValue({
      data: {} as any,
      error: null,
      success: true,
    })

    const response = await GET()
    const responseData = await response.json()

    expect(responseData.provider).toBe('Yahoo Finance (yahoo-finance2)')
  })

  it('should handle empty response data', async () => {
    mockApi.getStockQuote.mockResolvedValue({
      data: null as any,
      error: null,
      success: true,
    })

    const response = await GET()
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(responseData.data).toBe(null)
  })

  it('should preserve all quote data properties', async () => {
    const completeQuoteData = {
      symbol: 'AAPL',
      price: 150.25,
      change: 2.50,
      changePercent: 1.69,
      volume: 50000000,
      previousClose: 147.75,
      open: 148.00,
      high: 151.00,
      low: 147.50,
      marketCap: 2500000000000,
      lastUpdated: '2024-01-15'
    }

    mockApi.getStockQuote.mockResolvedValue({
      data: completeQuoteData,
      error: null,
      success: true,
    })

    const response = await GET()
    const responseData = await response.json()

    expect(responseData.data).toEqual(completeQuoteData)
  })

  it('should be callable without parameters', async () => {
    mockApi.getStockQuote.mockResolvedValue({
      data: {} as any,
      error: null,
      success: true,
    })

    // Should not throw when called without any parameters
    expect(async () => {
      await GET()
    }).not.toThrow()
  })

  it('should handle multiple concurrent calls', async () => {
    mockApi.getStockQuote.mockResolvedValue({
      data: { symbol: 'AAPL', price: 150 } as any,
      error: null,
      success: true,
    })

    // Make multiple concurrent calls
    const promises = Array(5).fill(null).map(() => GET())
    const responses = await Promise.all(promises)

    // All should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200)
    })

    // Should have called the API for each request
    expect(mockApi.getStockQuote).toHaveBeenCalledTimes(5)
  })
})