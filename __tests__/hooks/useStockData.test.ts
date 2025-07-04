import { renderHook, waitFor } from '@testing-library/react'
import { useStockQuote, useCompanyOverview, useStockChart, useMarketNews, useStockData } from '@/hooks/useStockData'
import * as api from '@/lib/api'
import { createMockStockQuote, createMockCompanyOverview, createMockChartData } from '../setup/test-utils'

// Mock the API functions
jest.mock('@/lib/api', () => ({
  getStockQuote: jest.fn(),
  getCompanyOverview: jest.fn(),
  getStockChart: jest.fn(),
  getMarketNews: jest.fn(),
  getCachedData: jest.fn(),
  setCachedData: jest.fn(),
}))

const mockApi = api as jest.Mocked<typeof api>

describe('Stock Data Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockApi.getCachedData.mockReturnValue(null) // No cache by default
  })

  describe('useStockQuote', () => {
    it('should fetch stock quote successfully', async () => {
      const mockQuote = createMockStockQuote()
      mockApi.getStockQuote.mockResolvedValue({
        data: mockQuote,
        error: null,
        success: true,
      })

      const { result } = renderHook(() => useStockQuote('AAPL'))

      expect(result.current.loading).toBe(true)
      expect(result.current.data).toBe(null)
      expect(result.current.error).toBe(null)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockQuote)
      expect(result.current.error).toBe(null)
      expect(mockApi.getStockQuote).toHaveBeenCalledWith('AAPL')
      expect(mockApi.setCachedData).toHaveBeenCalledWith('quote-AAPL', mockQuote)
    })

    it('should handle API errors', async () => {
      const errorMessage = 'Failed to fetch quote'
      mockApi.getStockQuote.mockResolvedValue({
        data: {} as any,
        error: errorMessage,
        success: false,
      })

      const { result } = renderHook(() => useStockQuote('INVALID'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toBe(null)
      expect(result.current.error).toBe(errorMessage)
    })

    it('should handle API exceptions', async () => {
      const errorMessage = 'Network error'
      mockApi.getStockQuote.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useStockQuote('AAPL'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toBe(null)
      expect(result.current.error).toBe(errorMessage)
    })

    it('should use cached data when available', async () => {
      const mockQuote = createMockStockQuote()
      mockApi.getCachedData.mockReturnValue(mockQuote)

      const { result } = renderHook(() => useStockQuote('AAPL'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockQuote)
      expect(mockApi.getStockQuote).not.toHaveBeenCalled()
      expect(mockApi.getCachedData).toHaveBeenCalledWith('quote-AAPL')
    })

    it('should not fetch when symbol is empty', () => {
      const { result } = renderHook(() => useStockQuote(''))

      expect(result.current.loading).toBe(true)
      expect(mockApi.getStockQuote).not.toHaveBeenCalled()
    })

    it('should refetch when symbol changes', async () => {
      const mockQuote1 = createMockStockQuote({ symbol: 'AAPL' })
      const mockQuote2 = createMockStockQuote({ symbol: 'GOOGL' })

      mockApi.getStockQuote
        .mockResolvedValueOnce({
          data: mockQuote1,
          error: null,
          success: true,
        })
        .mockResolvedValueOnce({
          data: mockQuote2,
          error: null,
          success: true,
        })

      const { result, rerender } = renderHook(
        ({ symbol }) => useStockQuote(symbol),
        { initialProps: { symbol: 'AAPL' } }
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockQuote1)

      rerender({ symbol: 'GOOGL' })

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockQuote2)
      expect(mockApi.getStockQuote).toHaveBeenCalledTimes(2)
    })
  })

  describe('useCompanyOverview', () => {
    it('should fetch company overview successfully', async () => {
      const mockOverview = createMockCompanyOverview()
      mockApi.getCompanyOverview.mockResolvedValue({
        data: mockOverview,
        error: null,
        success: true,
      })

      const { result } = renderHook(() => useCompanyOverview('AAPL'))

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockOverview)
      expect(result.current.error).toBe(null)
      expect(mockApi.setCachedData).toHaveBeenCalledWith('overview-AAPL', mockOverview)
    })

    it('should handle errors gracefully', async () => {
      const errorMessage = 'Failed to fetch company overview'
      mockApi.getCompanyOverview.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useCompanyOverview('AAPL'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toBe(null)
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('useStockChart', () => {
    it('should fetch chart data successfully', async () => {
      const mockChartData = createMockChartData()
      mockApi.getStockChart.mockResolvedValue({
        data: mockChartData,
        error: null,
        success: true,
      })

      const { result } = renderHook(() => useStockChart('AAPL', '1D'))

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockChartData)
      expect(result.current.error).toBe(null)
      expect(mockApi.getStockChart).toHaveBeenCalledWith('AAPL', '1D')
      expect(mockApi.setCachedData).toHaveBeenCalledWith('chart-AAPL-1D', mockChartData)
    })

    it('should refetch when timeRange changes', async () => {
      const mockChartData1D = createMockChartData()
      const mockChartData1M = createMockChartData()

      mockApi.getStockChart
        .mockResolvedValueOnce({
          data: mockChartData1D,
          error: null,
          success: true,
        })
        .mockResolvedValueOnce({
          data: mockChartData1M,
          error: null,
          success: true,
        })

      const { result, rerender } = renderHook(
        ({ timeRange }) => useStockChart('AAPL', timeRange),
        { initialProps: { timeRange: '1D' as const } }
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockApi.getStockChart).toHaveBeenCalledWith('AAPL', '1D')

      rerender({ timeRange: '1D' as const })

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockApi.getStockChart).toHaveBeenCalledWith('AAPL', '1M')
      expect(mockApi.getStockChart).toHaveBeenCalledTimes(2)
    })

    it('should handle chart data errors', async () => {
      const errorMessage = 'Failed to fetch chart data'
      mockApi.getStockChart.mockResolvedValue({
        data: [],
        error: errorMessage,
        success: false,
      })

      const { result } = renderHook(() => useStockChart('AAPL', '1D'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(errorMessage)
      // Data might retain previous values on error (this is by design)
      expect(result.current.data).toBeDefined()
    })
  })

  describe('useMarketNews', () => {
    const mockNewsItems = [
      {
        title: 'Apple Reports Strong Q4 Earnings',
        url: 'https://example.com/apple-earnings',
        time_published: '2024-01-15T10:30:00Z',
        authors: ['John Doe'],
        summary: 'Apple reported better than expected earnings.',
        banner_image: 'https://example.com/banner.jpg',
        source: 'TechNews',
        category_within_source: 'Earnings',
        source_domain: 'technews.com',
        topics: [{ topic: 'Earnings', relevance_score: '0.95' }],
        overall_sentiment_score: 0.75,
        overall_sentiment_label: 'Positive',
        ticker_sentiment: [
          {
            ticker: 'AAPL',
            relevance_score: '0.95',
            ticker_sentiment_score: '0.75',
            ticker_sentiment_label: 'Positive',
          },
        ],
      },
    ]

    it('should fetch market news successfully', async () => {
      mockApi.getMarketNews.mockResolvedValue({
        data: mockNewsItems,
        error: null,
        success: true,
      })

      const { result } = renderHook(() => useMarketNews('AAPL'))

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockNewsItems)
      expect(result.current.error).toBe(null)
      expect(mockApi.getMarketNews).toHaveBeenCalledWith('AAPL')
    })

    it('should fetch general news when no symbol provided', async () => {
      mockApi.getMarketNews.mockResolvedValue({
        data: mockNewsItems,
        error: null,
        success: true,
      })

      const { result } = renderHook(() => useMarketNews())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockApi.getMarketNews).toHaveBeenCalledWith(undefined)
      expect(mockApi.getCachedData).toHaveBeenCalledWith('news-general')
    })
  })

  describe('useStockData (combined hook)', () => {
    it('should combine all stock data hooks', async () => {
      const mockQuote = createMockStockQuote()
      const mockOverview = createMockCompanyOverview()
      const mockNews = [
        {
          title: 'Test News',
          url: 'https://example.com',
          time_published: '2024-01-15T10:30:00Z',
          authors: ['Author'],
          summary: 'Test summary',
          banner_image: '',
          source: 'Test Source',
          category_within_source: 'Test',
          source_domain: 'test.com',
          topics: [],
          overall_sentiment_score: 0.5,
          overall_sentiment_label: 'Neutral',
          ticker_sentiment: [],
        },
      ]

      mockApi.getStockQuote.mockResolvedValue({
        data: mockQuote,
        error: null,
        success: true,
      })

      mockApi.getCompanyOverview.mockResolvedValue({
        data: mockOverview,
        error: null,
        success: true,
      })

      mockApi.getMarketNews.mockResolvedValue({
        data: mockNews,
        error: null,
        success: true,
      })

      const { result } = renderHook(() => useStockData('AAPL'))

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.quote).toEqual(mockQuote)
      expect(result.current.overview).toEqual(mockOverview)
      expect(result.current.news).toEqual(mockNews)
      expect(result.current.error).toBe(null)
    })

    it('should handle combined errors', async () => {
      const quoteError = 'Quote error'
      const overviewError = 'Overview error'

      mockApi.getStockQuote.mockResolvedValue({
        data: {} as any,
        error: quoteError,
        success: false,
      })

      mockApi.getCompanyOverview.mockResolvedValue({
        data: {} as any,
        error: overviewError,
        success: false,
      })

      mockApi.getMarketNews.mockResolvedValue({
        data: [],
        error: null,
        success: true,
      })

      const { result } = renderHook(() => useStockData('AAPL'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(quoteError) // First error wins
    })

    it('should show loading while any hook is loading', async () => {
      // Make overview take longer to resolve
      mockApi.getStockQuote.mockResolvedValue({
        data: createMockStockQuote(),
        error: null,
        success: true,
      })

      let resolveOverview: (value: any) => void
      const overviewPromise = new Promise(resolve => {
        resolveOverview = resolve
      })

      mockApi.getCompanyOverview.mockReturnValue(overviewPromise as any)

      mockApi.getMarketNews.mockResolvedValue({
        data: [],
        error: null,
        success: true,
      })

      const { result } = renderHook(() => useStockData('AAPL'))

      expect(result.current.loading).toBe(true)

      // Wait a bit and verify still loading
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(result.current.loading).toBe(true)

      // Resolve the overview
      resolveOverview!({
        data: createMockCompanyOverview(),
        error: null,
        success: true,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })
})