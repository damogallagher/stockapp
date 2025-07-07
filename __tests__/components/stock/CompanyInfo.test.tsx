import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useCompanyOverview, useMarketNews } from '@/hooks/useStockData'
import CompanyInfo from '@/components/stock/CompanyInfo'
import { CompanyOverview, NewsItem } from '@/lib/types'

// Mock the custom hooks
jest.mock('@/hooks/useStockData', () => ({
  useCompanyOverview: jest.fn(),
  useMarketNews: jest.fn(),
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'MMM dd, HH:mm') {
      return 'Jan 15, 10:30'
    }
    return date
  }),
}))

// Mock utility functions
jest.mock('@/lib/utils', () => ({
  formatCurrency: jest.fn((value) => `$${value}`),
  formatPercentage: jest.fn((value) => `${value}%`),
  formatMarketCap: jest.fn((value) => `$${value}B`),
}))

const mockUseCompanyOverview = useCompanyOverview as jest.MockedFunction<typeof useCompanyOverview>
const mockUseMarketNews = useMarketNews as jest.MockedFunction<typeof useMarketNews>

describe('CompanyInfo', () => {
  const mockCompanyOverview: CompanyOverview = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
    cik: '0000320193',
    exchange: 'NASDAQ',
    currency: 'USD',
    country: 'United States',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    address: '1 Apple Park Way Cupertino CA',
    fiscalYearEnd: '2024-09-30',
    latestQuarter: '2024-06-30',
    marketCapitalization: 2500000000000,
    ebitda: 125000000000,
    peRatio: 25.5,
    pegRatio: 1.8,
    bookValue: 4.25,
    dividendPerShare: 0.96,
    dividendYield: 0.0064,
    eps: 6.13,
    revenuePerShareTTM: 25.47,
    profitMargin: 0.24,
    operatingMarginTTM: 0.27,
    returnOnAssetsTTM: 0.17,
    returnOnEquityTTM: 0.53,
    revenueTTM: 394000000000,
    grossProfitTTM: 170000000000,
    dilutedEPSTTM: 6.13,
    quarterlyEarningsGrowthYOY: 0.05,
    quarterlyRevenueGrowthYOY: 0.02,
    analystTargetPrice: 160.00,
    trailingPE: 24.5,
    forwardPE: 22.8,
    priceToSalesRatioTTM: 6.35,
    priceToBookRatio: 35.4,
    evToRevenue: 6.2,
    evToEbitda: 18.5,
    beta: 1.24,
    high52Week: 198.23,
    low52Week: 124.17,
    movingAverage50Day: 145.67,
    movingAverage200Day: 156.89,
    sharesOutstanding: 15728000000,
    dividendDate: '2024-05-16',
    exDividendDate: '2024-05-10',
  }

  const mockNewsItems: NewsItem[] = [
    {
      title: 'Apple Reports Strong Q4 Earnings',
      url: 'https://example.com/apple-earnings',
      time_published: '2024-01-15T10:30:00Z',
      authors: ['John Doe'],
      summary: 'Apple reported better than expected earnings for Q4 2024.',
      banner_image: 'https://example.com/apple-banner.jpg',
      source: 'TechNews',
      category_within_source: 'Earnings',
      source_domain: 'technews.com',
      topics: [
        {
          topic: 'Earnings',
          relevance_score: '0.95',
        },
      ],
      overall_sentiment_score: 0.75,
      overall_sentiment_label: 'Bullish',
      ticker_sentiment: [
        {
          ticker: 'AAPL',
          relevance_score: '0.95',
          ticker_sentiment_score: '0.75',
          ticker_sentiment_label: 'Positive',
        },
      ],
    },
    {
      title: 'Apple Announces New Product Line',
      url: 'https://example.com/apple-products',
      time_published: '2024-01-14T14:20:00Z',
      authors: ['Jane Smith'],
      summary: 'Apple unveiled new products in their latest event.',
      banner_image: 'https://example.com/apple-products.jpg',
      source: 'TechCrunch',
      category_within_source: 'Products',
      source_domain: 'techcrunch.com',
      topics: [
        {
          topic: 'Technology',
          relevance_score: '0.90',
        },
      ],
      overall_sentiment_score: 0.65,
      overall_sentiment_label: 'Neutral',
      ticker_sentiment: [
        {
          ticker: 'AAPL',
          relevance_score: '0.90',
          ticker_sentiment_score: '0.65',
          ticker_sentiment_label: 'Neutral',
        },
      ],
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading States', () => {
    it('should show loading skeleton when overview is loading', () => {
      mockUseCompanyOverview.mockReturnValue({
        data: null,
        loading: true,
        error: null,
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: null,
      })

      render(<CompanyInfo symbol="AAPL" />)

      // Should show skeleton loading components
      expect(screen.getAllByTestId('skeleton')).toHaveLength(7) // 6 fields + 1 description
    })

    it('should show loading skeleton in news tab when news is loading', async () => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null,
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: true,
        error: null,
      })

      render(<CompanyInfo symbol="AAPL" />)

      // Switch to news tab
      fireEvent.click(screen.getByRole('tab', { name: /news/i }))

      await waitFor(() => {
        expect(screen.getAllByTestId('skeleton')).toHaveLength(9) // 3 news items * 3 skeletons each
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error message when overview fails to load', () => {
      mockUseCompanyOverview.mockReturnValue({
        data: null,
        loading: false,
        error: 'Failed to load company data',
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: null,
      })

      render(<CompanyInfo symbol="AAPL" />)

      expect(screen.getByText('Failed to load company data')).toBeInTheDocument()
    })

    it('should display error message when news fails to load', async () => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null,
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: 'Failed to load news',
      })

      render(<CompanyInfo symbol="AAPL" />)

      // Switch to news tab
      fireEvent.click(screen.getByRole('tab', { name: /news/i }))

      await waitFor(() => {
        expect(screen.getByText('Failed to load news')).toBeInTheDocument()
      })
    })

    it('should display fallback message when no overview data is available', () => {
      mockUseCompanyOverview.mockReturnValue({
        data: null,
        loading: false,
        error: null,
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: null,
      })

      render(<CompanyInfo symbol="AAPL" />)

      expect(screen.getByText('No company information available')).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    beforeEach(() => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null,
      })
      mockUseMarketNews.mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
      })
    })

    it('should display company basic information correctly', () => {
      render(<CompanyInfo symbol="AAPL" />)

      expect(screen.getByText('Company Information')).toBeInTheDocument()
      expect(screen.getByText('Technology')).toBeInTheDocument()
      expect(screen.getByText('Consumer Electronics')).toBeInTheDocument()
      expect(screen.getByText('United States')).toBeInTheDocument()
      expect(screen.getByText('NASDAQ')).toBeInTheDocument()
      expect(screen.getByText('USD')).toBeInTheDocument()
      expect(screen.getByText('2024-09-30')).toBeInTheDocument()
    })

    it('should display company description when available', () => {
      render(<CompanyInfo symbol="AAPL" />)

      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText(mockCompanyOverview.description!)).toBeInTheDocument()
    })

    it('should display company address when available', () => {
      render(<CompanyInfo symbol="AAPL" />)

      expect(screen.getByText('Address')).toBeInTheDocument()
      expect(screen.getByText(mockCompanyOverview.address!)).toBeInTheDocument()
    })

    it('should display key statistics correctly', () => {
      render(<CompanyInfo symbol="AAPL" />)

      expect(screen.getByText('Key Statistics')).toBeInTheDocument()
      expect(screen.getByText('Market Cap')).toBeInTheDocument()
      expect(screen.getByText('Shares Outstanding')).toBeInTheDocument()
      expect(screen.getByText('52W High')).toBeInTheDocument()
      expect(screen.getByText('52W Low')).toBeInTheDocument()
    })

    it('should handle missing optional data gracefully', () => {
      const incompleteOverview = {
        ...mockCompanyOverview,
        description: null,
        address: null,
        marketCapitalization: null,
      }

      mockUseCompanyOverview.mockReturnValue({
        data: incompleteOverview,
        loading: false,
        error: null,
      })

      render(<CompanyInfo symbol="AAPL" />)

      expect(screen.queryByText('Description')).not.toBeInTheDocument()
      expect(screen.queryByText('Address')).not.toBeInTheDocument()
      expect(screen.getAllByText('N/A')).toHaveLength(1) // Market Cap should show N/A
    })
  })

  describe('Tab Navigation', () => {
    beforeEach(() => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null,
      })
      mockUseMarketNews.mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
      })
    })

    it('should render all tabs correctly', () => {
      render(<CompanyInfo symbol="AAPL" />)

      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /financials/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /news/i })).toBeInTheDocument()
    })

    it('should show overview tab by default', () => {
      render(<CompanyInfo symbol="AAPL" />)

      expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText('Company Information')).toBeInTheDocument()
    })

    it('should switch to financials tab when clicked', async () => {
      render(<CompanyInfo symbol="AAPL" />)

      fireEvent.click(screen.getByRole('tab', { name: /financials/i }))

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /financials/i })).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByText('Valuation Metrics')).toBeInTheDocument()
        expect(screen.getByText('Financial Performance')).toBeInTheDocument()
        expect(screen.getByText('Dividend & Growth')).toBeInTheDocument()
        expect(screen.getByText('Risk Metrics')).toBeInTheDocument()
      })
    })

    it('should switch to news tab when clicked', async () => {
      render(<CompanyInfo symbol="AAPL" />)

      fireEvent.click(screen.getByRole('tab', { name: /news/i }))

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /news/i })).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByText('Apple Reports Strong Q4 Earnings')).toBeInTheDocument()
        expect(screen.getByText('Apple Announces New Product Line')).toBeInTheDocument()
      })
    })
  })

  describe('Financial Data Display', () => {
    beforeEach(() => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null,
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: null,
      })
    })

    it('should display valuation metrics correctly', async () => {
      render(<CompanyInfo symbol="AAPL" />)

      fireEvent.click(screen.getByRole('tab', { name: /financials/i }))

      await waitFor(() => {
        expect(screen.getByText('Valuation Metrics')).toBeInTheDocument()
        expect(screen.getByText('P/E Ratio')).toBeInTheDocument()
        expect(screen.getByText('PEG Ratio')).toBeInTheDocument()
        expect(screen.getByText('Price to Book')).toBeInTheDocument()
        expect(screen.getByText('Price to Sales')).toBeInTheDocument()
        expect(screen.getByText('EV/Revenue')).toBeInTheDocument()
        expect(screen.getByText('EV/EBITDA')).toBeInTheDocument()
      })
    })

    it('should display financial performance metrics correctly', async () => {
      render(<CompanyInfo symbol="AAPL" />)

      fireEvent.click(screen.getByRole('tab', { name: /financials/i }))

      await waitFor(() => {
        expect(screen.getByText('Financial Performance')).toBeInTheDocument()
        expect(screen.getByText('Revenue (TTM)')).toBeInTheDocument()
        expect(screen.getByText('Gross Profit (TTM)')).toBeInTheDocument()
        expect(screen.getByText('EBITDA')).toBeInTheDocument()
        expect(screen.getByText('Profit Margin')).toBeInTheDocument()
        expect(screen.getByText('Operating Margin')).toBeInTheDocument()
        expect(screen.getByText('ROE')).toBeInTheDocument()
      })
    })

    it('should display dividend and growth metrics correctly', async () => {
      render(<CompanyInfo symbol="AAPL" />)

      fireEvent.click(screen.getByRole('tab', { name: /financials/i }))

      await waitFor(() => {
        expect(screen.getByText('Dividend & Growth')).toBeInTheDocument()
        expect(screen.getByText('Dividend Yield')).toBeInTheDocument()
        expect(screen.getByText('Dividend Per Share')).toBeInTheDocument()
        expect(screen.getByText('Ex-Dividend Date')).toBeInTheDocument()
        expect(screen.getByText('Earnings Growth (YoY)')).toBeInTheDocument()
        expect(screen.getByText('Revenue Growth (YoY)')).toBeInTheDocument()
      })
    })

    it('should display risk metrics correctly', async () => {
      render(<CompanyInfo symbol="AAPL" />)

      fireEvent.click(screen.getByRole('tab', { name: /financials/i }))

      await waitFor(() => {
        expect(screen.getByText('Risk Metrics')).toBeInTheDocument()
        expect(screen.getByText('Beta')).toBeInTheDocument()
        expect(screen.getByText('50 Day MA')).toBeInTheDocument()
        expect(screen.getByText('200 Day MA')).toBeInTheDocument()
        expect(screen.getByText('Book Value')).toBeInTheDocument()
        expect(screen.getByText('Analyst Target')).toBeInTheDocument()
      })
    })
  })

  describe('News Display', () => {
    beforeEach(() => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null,
      })
      mockUseMarketNews.mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
      })
    })

    it('should display news items correctly', async () => {
      render(<CompanyInfo symbol="AAPL" />)

      fireEvent.click(screen.getByRole('tab', { name: /news/i }))

      await waitFor(() => {
        expect(screen.getByText('Apple Reports Strong Q4 Earnings')).toBeInTheDocument()
        expect(screen.getByText('Apple Announces New Product Line')).toBeInTheDocument()
        expect(screen.getByText('Apple reported better than expected earnings for Q4 2024.')).toBeInTheDocument()
        expect(screen.getByText('Apple unveiled new products in their latest event.')).toBeInTheDocument()
      })
    })

    it('should display news source and timestamp correctly', async () => {
      render(<CompanyInfo symbol="AAPL" />)

      fireEvent.click(screen.getByRole('tab', { name: /news/i }))

      await waitFor(() => {
        expect(screen.getByText('TechNews')).toBeInTheDocument()
        expect(screen.getByText('TechCrunch')).toBeInTheDocument()
        expect(screen.getAllByText('Jan 15, 10:30')).toHaveLength(2) // Mocked date format
      })
    })

    it('should display sentiment badges correctly', async () => {
      render(<CompanyInfo symbol="AAPL" />)

      fireEvent.click(screen.getByRole('tab', { name: /news/i }))

      await waitFor(() => {
        expect(screen.getByText('Bullish')).toBeInTheDocument()
        expect(screen.getByText('Neutral')).toBeInTheDocument()
      })
    })

    it('should display topic badges correctly', async () => {
      render(<CompanyInfo symbol="AAPL" />)

      fireEvent.click(screen.getByRole('tab', { name: /news/i }))

      await waitFor(() => {
        expect(screen.getByText('Earnings')).toBeInTheDocument()
        expect(screen.getByText('Technology')).toBeInTheDocument()
      })
    })

    it('should make news titles clickable links', async () => {
      render(<CompanyInfo symbol="AAPL" />)

      fireEvent.click(screen.getByRole('tab', { name: /news/i }))

      await waitFor(() => {
        const newsLink = screen.getByRole('link', { name: /Apple Reports Strong Q4 Earnings/i })
        expect(newsLink).toHaveAttribute('href', 'https://example.com/apple-earnings')
        expect(newsLink).toHaveAttribute('target', '_blank')
        expect(newsLink).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })

    it('should display message when no news is available', async () => {
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: null,
      })

      render(<CompanyInfo symbol="AAPL" />)

      fireEvent.click(screen.getByRole('tab', { name: /news/i }))

      await waitFor(() => {
        expect(screen.getByText('No news available for this stock')).toBeInTheDocument()
      })
    })

    it('should limit news items to 10', async () => {
      const manyNewsItems = Array.from({ length: 15 }, (_, i) => ({
        ...mockNewsItems[0],
        title: `News Item ${i + 1}`,
        url: `https://example.com/news-${i + 1}`,
      }))

      mockUseMarketNews.mockReturnValue({
        data: manyNewsItems,
        loading: false,
        error: null,
      })

      render(<CompanyInfo symbol="AAPL" />)

      fireEvent.click(screen.getByRole('tab', { name: /news/i }))

      await waitFor(() => {
        expect(screen.getByText('News Item 1')).toBeInTheDocument()
        expect(screen.getByText('News Item 10')).toBeInTheDocument()
        expect(screen.queryByText('News Item 11')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null,
      })
      mockUseMarketNews.mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
      })
    })

    it('should have proper ARIA attributes for tabs', () => {
      render(<CompanyInfo symbol="AAPL" />)

      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(3)
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-selected')
      })
    })

    it('should have proper heading structure', () => {
      render(<CompanyInfo symbol="AAPL" />)

      expect(screen.getByText('Company Information')).toBeInTheDocument()
      expect(screen.getByText('Key Statistics')).toBeInTheDocument()
    })

    it('should have accessible news links', async () => {
      render(<CompanyInfo symbol="AAPL" />)

      fireEvent.click(screen.getByRole('tab', { name: /news/i }))

      await waitFor(() => {
        const newsLinks = screen.getAllByRole('link')
        newsLinks.forEach((link) => {
          expect(link).toHaveAttribute('href')
          expect(link).toHaveAttribute('target', '_blank')
          expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        })
      })
    })
  })
})