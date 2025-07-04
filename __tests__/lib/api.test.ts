import { searchStocks, getStockQuote, getCompanyOverview, getStockChart } from '@/lib/api'
import { mockYahooFinance } from '../setup/mocks/yahoo-finance'

// Import and setup MSW
import { server } from '../setup/mocks/server'

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  jest.clearAllMocks()
})

afterAll(() => {
  server.close()
})

describe('API Functions', () => {
  describe('searchStocks', () => {
    it('should return search results for valid query', async () => {
      const result = await searchStocks('Apple')
      
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toMatchObject({
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'EQUITY',
        region: 'United States',
        currency: 'USD'
      })
      expect(result.error).toBeNull()
    })

    it('should return empty array for query with no results', async () => {
      mockYahooFinance.search.mockResolvedValueOnce({ quotes: [] })
      
      const result = await searchStocks('NONEXISTENT')
      
      expect(result.success).toBe(false)
      expect(result.data).toHaveLength(0)
      expect(result.error).toContain('No stocks found matching')
    })

    it('should handle search API errors', async () => {
      mockYahooFinance.search.mockRejectedValueOnce(new Error('API Error'))
      
      const result = await searchStocks('AAPL')
      
      expect(result.success).toBe(false)
      expect(result.data).toHaveLength(0)
      expect(result.error).toContain('API Error')
    })

    it('should map quote properties correctly', async () => {
      const mockSearchResult = {
        quotes: [{
          symbol: 'GOOGL',
          shortname: 'Alphabet Inc.',
          longname: 'Alphabet Inc. Class A',
          quoteType: 'EQUITY',
          region: 'US',
          currency: 'USD',
          score: 0.85
        }]
      }
      
      mockYahooFinance.search.mockResolvedValueOnce(mockSearchResult)
      
      const result = await searchStocks('Google')
      
      expect(result.success).toBe(true)
      expect(result.data[0]).toMatchObject({
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        type: 'EQUITY',
        region: 'US',
        currency: 'USD',
        matchScore: 0.85
      })
    })
  })

  describe('getStockQuote', () => {
    it('should return stock quote for valid symbol', async () => {
      const result = await getStockQuote('AAPL')
      
      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        symbol: 'AAPL',
        price: 150.25,
        change: 2.50,
        changePercent: 1.69,
        volume: 50000000,
        previousClose: 147.75,
        open: 148.00,
        high: 151.00,
        low: 147.50,
        marketCap: 2500000000000
      })
      expect(result.error).toBeNull()
    })

    it('should handle invalid symbol', async () => {
      mockYahooFinance.quote.mockResolvedValueOnce(null)
      
      const result = await getStockQuote('INVALID')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('No stock data found')
    })

    it('should handle API errors', async () => {
      mockYahooFinance.quote.mockRejectedValueOnce(new Error('Network error'))
      
      const result = await getStockQuote('AAPL')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })

    it('should calculate price change correctly', async () => {
      const mockQuote = {
        symbol: 'AAPL',
        regularMarketPrice: 155.00,
        regularMarketPreviousClose: 150.00,
        regularMarketChange: 5.00,
        regularMarketChangePercent: 3.33,
        regularMarketVolume: 45000000,
        regularMarketOpen: 151.00,
        regularMarketDayHigh: 156.00,
        regularMarketDayLow: 150.50,
        marketCap: 2600000000000
      }
      
      mockYahooFinance.quote.mockResolvedValueOnce(mockQuote)
      
      const result = await getStockQuote('AAPL')
      
      expect(result.success).toBe(true)
      expect(result.data.price).toBe(155.00)
      expect(result.data.change).toBe(5.00)
      expect(result.data.changePercent).toBe(3.33)
    })

    it('should handle missing price data gracefully', async () => {
      const mockQuote = {
        symbol: 'AAPL',
        regularMarketPrice: null,
        postMarketPrice: 150.25,
        regularMarketPreviousClose: 147.75,
        regularMarketChange: 2.50,
        regularMarketChangePercent: 1.69
      }
      
      mockYahooFinance.quote.mockResolvedValueOnce(mockQuote)
      
      const result = await getStockQuote('AAPL')
      
      expect(result.success).toBe(true)
      expect(result.data.price).toBe(150.25) // Should use postMarketPrice
    })
  })

  describe('getCompanyOverview', () => {
    it('should return company overview for valid symbol', async () => {
      const result = await getCompanyOverview('AAPL')
      
      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        symbol: 'AAPL',
        name: 'Apple Inc.',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        country: 'United States',
        currency: 'USD'
      })
      expect(result.data.description).toContain('Apple Inc.')
      expect(result.error).toBeNull()
    })

    it('should handle invalid symbol', async () => {
      mockYahooFinance.quote.mockResolvedValueOnce(null)
      
      const result = await getCompanyOverview('INVALID')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('No company data found')
    })

    it('should handle API errors', async () => {
      mockYahooFinance.quote.mockRejectedValueOnce(new Error('API Error'))
      
      const result = await getCompanyOverview('AAPL')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('API Error')
    })

    it('should map financial metrics correctly', async () => {
      const result = await getCompanyOverview('AAPL')
      
      expect(result.success).toBe(true)
      expect(result.data.marketCapitalization).toBeGreaterThan(0)
      expect(result.data.peRatio).toBeGreaterThan(0)
      expect(result.data.eps).toBeGreaterThan(0)
      expect(typeof result.data.beta).toBe('number')
    })
  })

  describe('getStockChart', () => {
    it('should return chart data for valid symbol and time range', async () => {
      const result = await getStockChart('AAPL', '1D')
      
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toMatchObject({
        date: expect.any(String),
        open: expect.any(Number),
        high: expect.any(Number),
        low: expect.any(Number),
        close: expect.any(Number),
        volume: expect.any(Number)
      })
      expect(result.error).toBeNull()
    })

    it('should handle different time ranges', async () => {
      const timeRanges = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'MAX'] as const
      
      for (const timeRange of timeRanges) {
        const result = await getStockChart('AAPL', timeRange)
        expect(result.success).toBe(true)
        expect(result.data.length).toBeGreaterThan(0)
      }
    })

    it('should handle invalid symbol', async () => {
      mockYahooFinance.historical.mockResolvedValueOnce([])
      
      const result = await getStockChart('INVALID', '1D')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('No chart data available')
    })

    it('should handle API errors', async () => {
      mockYahooFinance.historical.mockRejectedValueOnce(new Error('Historical data error'))
      
      const result = await getStockChart('AAPL', '1D')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Historical data error')
    })

    it('should format chart data correctly', async () => {
      const result = await getStockChart('AAPL', '1D')
      
      expect(result.success).toBe(true)
      result.data.forEach(dataPoint => {
        expect(dataPoint.date).toMatch(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD format
        expect(dataPoint.open).toBeGreaterThan(0)
        expect(dataPoint.high).toBeGreaterThanOrEqual(dataPoint.open)
        expect(dataPoint.low).toBeLessThanOrEqual(dataPoint.open)
        expect(dataPoint.volume).toBeGreaterThan(0)
      })
    })
  })
})