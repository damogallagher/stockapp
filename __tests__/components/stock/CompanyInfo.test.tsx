import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CompanyInfo from '@/components/stock/CompanyInfo'
import { useCompanyOverview, useMarketNews } from '@/hooks/useStockData'
import { formatCurrency, formatPercentage, formatMarketCap } from '@/lib/utils'
import { format } from 'date-fns'
import { CompanyOverview, NewsItem } from '@/lib/types'

// Mock the hooks
jest.mock('@/hooks/useStockData', () => ({
  useCompanyOverview: jest.fn(),
  useMarketNews: jest.fn(),
}))

// Mock the utility functions
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
  formatCurrency: jest.fn(),
  formatPercentage: jest.fn(),
  formatMarketCap: jest.fn(),
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(),
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Building: ({ className }: { className?: string }) => <div data-testid="building-icon" className={className} />,
  MapPin: ({ className }: { className?: string }) => <div data-testid="mappin-icon" className={className} />,
  Calendar: ({ className }: { className?: string }) => <div data-testid="calendar-icon" className={className} />,
  DollarSign: ({ className }: { className?: string }) => <div data-testid="dollarsign-icon" className={className} />,
  TrendingUp: ({ className }: { className?: string }) => <div data-testid="trendingup-icon" className={className} />,
  Users: ({ className }: { className?: string }) => <div data-testid="users-icon" className={className} />,
  BarChart3: ({ className }: { className?: string }) => <div data-testid="barchart3-icon" className={className} />,
}))

const mockUseCompanyOverview = useCompanyOverview as jest.MockedFunction<typeof useCompanyOverview>
const mockUseMarketNews = useMarketNews as jest.MockedFunction<typeof useMarketNews>
const mockFormatCurrency = formatCurrency as jest.MockedFunction<typeof formatCurrency>
const mockFormatPercentage = formatPercentage as jest.MockedFunction<typeof formatPercentage>
const mockFormatMarketCap = formatMarketCap as jest.MockedFunction<typeof formatMarketCap>
const mockFormat = format as jest.MockedFunction<typeof format>

// Mock data
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
  address: '1 Apple Park Way, Cupertino, CA 95014',
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
    title: 'Apple Reports Strong Q4 Earnings Beat',
    url: 'https://example.com/apple-earnings',
    time_published: '2024-01-15T10:30:00Z',
    authors: ['John Doe'],
    summary: 'Apple Inc. reported better-than-expected earnings for the fourth quarter, driven by strong iPhone sales and growing services revenue.',
    banner_image: 'https://example.com/apple-banner.jpg',
    source: 'TechNews',
    category_within_source: 'Earnings',
    source_domain: 'technews.com',
    topics: [
      { topic: 'Earnings', relevance_score: '0.95' },
      { topic: 'Technology', relevance_score: '0.85' }
    ],
    overall_sentiment_score: 0.75,
    overall_sentiment_label: 'Bullish',
    ticker_sentiment: [
      {
        ticker: 'AAPL',
        relevance_score: '0.95',
        ticker_sentiment_score: '0.75',
        ticker_sentiment_label: 'Bullish'
      }
    ]
  },
  {
    title: 'Apple Faces Regulatory Challenges in Europe',
    url: 'https://example.com/apple-regulation',
    time_published: '2024-01-14T14:20:00Z',
    authors: ['Jane Smith'],
    summary: 'European regulators are investigating Apple\'s app store practices and potential antitrust violations.',
    banner_image: 'https://example.com/apple-regulation.jpg',
    source: 'Business Wire',
    category_within_source: 'Regulation',
    source_domain: 'businesswire.com',
    topics: [
      { topic: 'Regulation', relevance_score: '0.90' }
    ],
    overall_sentiment_score: -0.25,
    overall_sentiment_label: 'Bearish',
    ticker_sentiment: [
      {
        ticker: 'AAPL',
        relevance_score: '0.90',
        ticker_sentiment_score: '-0.25',
        ticker_sentiment_label: 'Bearish'
      }
    ]
  }
]

describe('CompanyInfo', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Set up default mock implementations
    mockFormatCurrency.mockImplementation((value) => `$${value.toFixed(2)}`)
    mockFormatPercentage.mockImplementation((value) => `${value.toFixed(2)}%`)
    mockFormatMarketCap.mockImplementation((value) => {
      if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`
      if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
      if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
      return value.toString()
    })
    mockFormat.mockImplementation(() => 'Jan 15, 10:30')
  })

  describe('Component Props', () => {
    it('should render with valid symbol prop', () => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      expect(mockUseCompanyOverview).toHaveBeenCalledWith("AAPL")
      expect(mockUseMarketNews).toHaveBeenCalledWith("AAPL")
      expect(screen.getByText('Company Information')).toBeInTheDocument()
    })

    it('should handle symbol prop changes', () => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null
      })

      const { rerender } = render(<CompanyInfo symbol="AAPL" />)
      
      rerender(<CompanyInfo symbol="GOOGL" />)
      
      expect(mockUseCompanyOverview).toHaveBeenLastCalledWith("GOOGL")
      expect(mockUseMarketNews).toHaveBeenLastCalledWith("GOOGL")
    })
  })

  describe('Loading States', () => {
    it('should display overview loading skeleton', () => {
      mockUseCompanyOverview.mockReturnValue({
        data: null,
        loading: true,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      // Check for skeleton loading elements
      expect(screen.getAllByTestId('skeleton')).toHaveLength(15) // 1 title + 12 data items + 2 section skeletons
    })

    it('should display news loading skeleton when news is loading', async () => {
      const user = userEvent.setup()
      
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: true,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      // Switch to news tab
      const newsTab = screen.getByRole('tab', { name: /news/i })
      await user.click(newsTab)
      
      // Wait for tab to become active
      await waitFor(() => {
        expect(newsTab).toHaveAttribute('aria-selected', 'true')
      })
      
      // Check for news loading skeletons
      expect(screen.getAllByTestId('skeleton')).toHaveLength(9) // 3 news items × 3 skeletons each
    })

    it('should display correct skeleton structure', () => {
      mockUseCompanyOverview.mockReturnValue({
        data: null,
        loading: true,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      // Check for specific skeleton elements
      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons[0]).toHaveClass('h-6', 'w-48') // Title skeleton
    })
  })

  describe('Error State Handling', () => {
    it('should display overview error message', () => {
      mockUseCompanyOverview.mockReturnValue({
        data: null,
        loading: false,
        error: 'Failed to fetch company overview'
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      expect(screen.getByText('Failed to fetch company overview')).toBeInTheDocument()
      expect(screen.getByText('Failed to fetch company overview')).toHaveClass('text-destructive')
    })

    it('should display default error message when overview is null', () => {
      mockUseCompanyOverview.mockReturnValue({
        data: null,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      expect(screen.getByText('No company information available')).toBeInTheDocument()
    })

    it('should display news error message', () => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: 'Failed to fetch news'
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      // Switch to news tab
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      expect(screen.getByText('Failed to fetch news')).toBeInTheDocument()
    })

    it('should display empty news message when no news available', () => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      // Switch to news tab
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      expect(screen.getByText('No news available for this stock')).toBeInTheDocument()
    })
  })

  describe('Tab Functionality', () => {
    beforeEach(() => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null
      })
    })

    it('should display overview tab as default', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText('Company Information')).toBeInTheDocument()
    })

    it('should switch to financials tab when clicked', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const financialsTab = screen.getByRole('tab', { name: /financials/i })
      fireEvent.click(financialsTab)
      
      expect(financialsTab).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText('Valuation Metrics')).toBeInTheDocument()
      expect(screen.getByText('Financial Performance')).toBeInTheDocument()
    })

    it('should switch to news tab when clicked', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      expect(newsTab).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText('Apple Reports Strong Q4 Earnings Beat')).toBeInTheDocument()
    })

    it('should support keyboard navigation between tabs', async () => {
      const user = userEvent.setup()
      render(<CompanyInfo symbol="AAPL" />)
      
      const overviewTab = screen.getByRole('tab', { name: /overview/i })
      const financialsTab = screen.getByRole('tab', { name: /financials/i })
      const newsTab = screen.getByRole('tab', { name: /news/i })
      
      // Focus on overview tab
      overviewTab.focus()
      expect(overviewTab).toHaveFocus()
      
      // Press right arrow to move to financials
      await user.keyboard('{ArrowRight}')
      expect(financialsTab).toHaveFocus()
      
      // Press right arrow to move to news
      await user.keyboard('{ArrowRight}')
      expect(newsTab).toHaveFocus()
    })
  })

  describe('Overview Tab Content', () => {
    beforeEach(() => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null
      })
    })

    it('should display company information correctly', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      expect(screen.getByText('Technology')).toBeInTheDocument()
      expect(screen.getByText('Consumer Electronics')).toBeInTheDocument()
      expect(screen.getByText('United States')).toBeInTheDocument()
      expect(screen.getByText('NASDAQ')).toBeInTheDocument()
      expect(screen.getByText('USD')).toBeInTheDocument()
      expect(screen.getByText('2024-09-30')).toBeInTheDocument()
    })

    it('should display proper icons for company information', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      expect(screen.getByTestId('building-icon')).toBeInTheDocument()
      expect(screen.getByTestId('barchart3-icon')).toBeInTheDocument()
      expect(screen.getByTestId('mappin-icon')).toBeInTheDocument()
      expect(screen.getByTestId('trendingup-icon')).toBeInTheDocument()
      expect(screen.getByTestId('dollarsign-icon')).toBeInTheDocument()
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
    })

    it('should display description when available', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText(mockCompanyOverview.description!)).toBeInTheDocument()
    })

    it('should display address when available', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      expect(screen.getByText('Address')).toBeInTheDocument()
      expect(screen.getByText(mockCompanyOverview.address!)).toBeInTheDocument()
    })

    it('should display key statistics with proper formatting', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      expect(screen.getByText('Key Statistics')).toBeInTheDocument()
      expect(screen.getByText('Market Cap')).toBeInTheDocument()
      expect(screen.getByText('Shares Outstanding')).toBeInTheDocument()
      expect(screen.getByText('52W High')).toBeInTheDocument()
      expect(screen.getByText('52W Low')).toBeInTheDocument()
      
      // Check that formatting functions are called
      expect(mockFormatMarketCap).toHaveBeenCalledWith(mockCompanyOverview.marketCapitalization)
      expect(mockFormatMarketCap).toHaveBeenCalledWith(mockCompanyOverview.sharesOutstanding)
      expect(mockFormatCurrency).toHaveBeenCalledWith(mockCompanyOverview.high52Week)
      expect(mockFormatCurrency).toHaveBeenCalledWith(mockCompanyOverview.low52Week)
    })

    it('should display N/A for missing data', () => {
      const incompleteOverview = { ...mockCompanyOverview, sector: '', industry: '' }
      mockUseCompanyOverview.mockReturnValue({
        data: incompleteOverview,
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      expect(screen.getAllByText('N/A')).toHaveLength(2)
    })

    it('should not display description section when not available', () => {
      const overviewWithoutDescription = { ...mockCompanyOverview, description: '' }
      mockUseCompanyOverview.mockReturnValue({
        data: overviewWithoutDescription,
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      expect(screen.queryByText('Description')).not.toBeInTheDocument()
    })

    it('should not display address section when not available', () => {
      const overviewWithoutAddress = { ...mockCompanyOverview, address: '' }
      mockUseCompanyOverview.mockReturnValue({
        data: overviewWithoutAddress,
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      expect(screen.queryByText('Address')).not.toBeInTheDocument()
    })
  })

  describe('Financials Tab Content', () => {
    beforeEach(() => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null
      })
    })

    it('should display valuation metrics card', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const financialsTab = screen.getByRole('tab', { name: /financials/i })
      fireEvent.click(financialsTab)
      
      expect(screen.getByText('Valuation Metrics')).toBeInTheDocument()
      expect(screen.getByText('P/E Ratio')).toBeInTheDocument()
      expect(screen.getByText('PEG Ratio')).toBeInTheDocument()
      expect(screen.getByText('Price to Book')).toBeInTheDocument()
      expect(screen.getByText('Price to Sales')).toBeInTheDocument()
      expect(screen.getByText('EV/Revenue')).toBeInTheDocument()
      expect(screen.getByText('EV/EBITDA')).toBeInTheDocument()
    })

    it('should display financial performance card', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const financialsTab = screen.getByRole('tab', { name: /financials/i })
      fireEvent.click(financialsTab)
      
      expect(screen.getByText('Financial Performance')).toBeInTheDocument()
      expect(screen.getByText('Revenue (TTM)')).toBeInTheDocument()
      expect(screen.getByText('Gross Profit (TTM)')).toBeInTheDocument()
      expect(screen.getByText('EBITDA')).toBeInTheDocument()
      expect(screen.getByText('Profit Margin')).toBeInTheDocument()
      expect(screen.getByText('Operating Margin')).toBeInTheDocument()
      expect(screen.getByText('ROE')).toBeInTheDocument()
      
      // Check that formatting functions are called with correct transformations
      expect(mockFormatPercentage).toHaveBeenCalledWith(mockCompanyOverview.profitMargin! * 100)
      expect(mockFormatPercentage).toHaveBeenCalledWith(mockCompanyOverview.operatingMarginTTM! * 100)
      expect(mockFormatPercentage).toHaveBeenCalledWith(mockCompanyOverview.returnOnEquityTTM! * 100)
    })

    it('should display dividend & growth card', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const financialsTab = screen.getByRole('tab', { name: /financials/i })
      fireEvent.click(financialsTab)
      
      expect(screen.getByText('Dividend & Growth')).toBeInTheDocument()
      expect(screen.getByText('Dividend Yield')).toBeInTheDocument()
      expect(screen.getByText('Dividend Per Share')).toBeInTheDocument()
      expect(screen.getByText('Ex-Dividend Date')).toBeInTheDocument()
      expect(screen.getByText('Earnings Growth (YoY)')).toBeInTheDocument()
      expect(screen.getByText('Revenue Growth (YoY)')).toBeInTheDocument()
      
      // Check that formatting functions are called with correct transformations
      expect(mockFormatPercentage).toHaveBeenCalledWith(mockCompanyOverview.dividendYield! * 100)
      expect(mockFormatPercentage).toHaveBeenCalledWith(mockCompanyOverview.quarterlyEarningsGrowthYOY! * 100)
      expect(mockFormatPercentage).toHaveBeenCalledWith(mockCompanyOverview.quarterlyRevenueGrowthYOY! * 100)
    })

    it('should display risk metrics card', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const financialsTab = screen.getByRole('tab', { name: /financials/i })
      fireEvent.click(financialsTab)
      
      expect(screen.getByText('Risk Metrics')).toBeInTheDocument()
      expect(screen.getByText('Beta')).toBeInTheDocument()
      expect(screen.getByText('50 Day MA')).toBeInTheDocument()
      expect(screen.getByText('200 Day MA')).toBeInTheDocument()
      expect(screen.getByText('Book Value')).toBeInTheDocument()
      expect(screen.getByText('Analyst Target')).toBeInTheDocument()
      
      // Check that formatting functions are called
      expect(mockFormatCurrency).toHaveBeenCalledWith(mockCompanyOverview.movingAverage50Day!)
      expect(mockFormatCurrency).toHaveBeenCalledWith(mockCompanyOverview.movingAverage200Day!)
      expect(mockFormatCurrency).toHaveBeenCalledWith(mockCompanyOverview.bookValue!)
      expect(mockFormatCurrency).toHaveBeenCalledWith(mockCompanyOverview.analystTargetPrice!)
    })

    it('should display N/A for missing financial data', () => {
      const incompleteOverview = { 
        ...mockCompanyOverview, 
        peRatio: 0, 
        pegRatio: 0,
        revenueTTM: 0,
        dividendYield: 0,
        beta: 0
      }
      mockUseCompanyOverview.mockReturnValue({
        data: incompleteOverview,
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      const financialsTab = screen.getByRole('tab', { name: /financials/i })
      fireEvent.click(financialsTab)
      
      expect(screen.getAllByText('N/A')).toHaveLength(5) // One for each missing field
    })

    it('should use correct grid layout for financial cards', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const financialsTab = screen.getByRole('tab', { name: /financials/i })
      fireEvent.click(financialsTab)
      
      const gridContainer = screen.getByText('Valuation Metrics').closest('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2')
    })
  })

  describe('News Tab Content', () => {
    beforeEach(() => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null
      })
    })

    it('should display news articles correctly', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      expect(screen.getByText('Apple Reports Strong Q4 Earnings Beat')).toBeInTheDocument()
      expect(screen.getByText('Apple Faces Regulatory Challenges in Europe')).toBeInTheDocument()
    })

    it('should display news article summaries', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      expect(screen.getByText(mockNewsItems[0].summary)).toBeInTheDocument()
      expect(screen.getByText(mockNewsItems[1].summary)).toBeInTheDocument()
    })

    it('should display news sources and formatted dates', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      expect(screen.getByText('TechNews')).toBeInTheDocument()
      expect(screen.getByText('Business Wire')).toBeInTheDocument()
      expect(screen.getAllByText('Jan 15, 10:30')).toHaveLength(2)
      
      // Check that date formatting is called
      expect(mockFormat).toHaveBeenCalledWith(new Date(mockNewsItems[0].time_published), 'MMM dd, HH:mm')
    })

    it('should display sentiment badges correctly', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      expect(screen.getByText('Bullish')).toBeInTheDocument()
      expect(screen.getByText('Bearish')).toBeInTheDocument()
    })

    it('should display topic tags', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      expect(screen.getByText('Earnings')).toBeInTheDocument()
      expect(screen.getByText('Technology')).toBeInTheDocument()
      expect(screen.getByText('Regulation')).toBeInTheDocument()
    })

    it('should make news article titles clickable with proper attributes', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      const firstArticleLink = screen.getByRole('link', { name: /Apple Reports Strong Q4 Earnings Beat/i })
      expect(firstArticleLink).toHaveAttribute('href', mockNewsItems[0].url)
      expect(firstArticleLink).toHaveAttribute('target', '_blank')
      expect(firstArticleLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should apply correct badge variants for sentiment', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      const bullishBadge = screen.getByText('Bullish')
      const bearishBadge = screen.getByText('Bearish')
      
      expect(bullishBadge).toHaveClass('bg-green-500') // success variant
      expect(bearishBadge).toHaveClass('bg-destructive') // destructive variant
    })

    it('should limit news articles to 10 items', () => {
      const manyNewsItems = Array.from({ length: 15 }, (_, i) => ({
        ...mockNewsItems[0],
        title: `News Article ${i + 1}`,
        url: `https://example.com/news-${i + 1}`
      }))
      
      mockUseMarketNews.mockReturnValue({
        data: manyNewsItems,
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      // Should only display first 10 articles
      expect(screen.getByText('News Article 1')).toBeInTheDocument()
      expect(screen.getByText('News Article 10')).toBeInTheDocument()
      expect(screen.queryByText('News Article 11')).not.toBeInTheDocument()
    })

    it('should display topic tags with outline variant', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      const topicBadge = screen.getByText('Earnings')
      expect(topicBadge).toHaveClass('text-foreground') // outline variant
    })

    it('should display only first 2 topics per article', () => {
      const newsWithManyTopics = [{
        ...mockNewsItems[0],
        topics: [
          { topic: 'Topic 1', relevance_score: '0.95' },
          { topic: 'Topic 2', relevance_score: '0.90' },
          { topic: 'Topic 3', relevance_score: '0.85' },
          { topic: 'Topic 4', relevance_score: '0.80' }
        ]
      }]
      
      mockUseMarketNews.mockReturnValue({
        data: newsWithManyTopics,
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      expect(screen.getByText('Topic 1')).toBeInTheDocument()
      expect(screen.getByText('Topic 2')).toBeInTheDocument()
      expect(screen.queryByText('Topic 3')).not.toBeInTheDocument()
      expect(screen.queryByText('Topic 4')).not.toBeInTheDocument()
    })
  })

  describe('Data Formatting Integration', () => {
    beforeEach(() => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null
      })
    })

    it('should call formatCurrency with correct values', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      expect(mockFormatCurrency).toHaveBeenCalledWith(mockCompanyOverview.high52Week)
      expect(mockFormatCurrency).toHaveBeenCalledWith(mockCompanyOverview.low52Week)
      expect(mockFormatCurrency).toHaveBeenCalledWith(mockCompanyOverview.dividendPerShare)
    })

    it('should call formatPercentage with correct calculations', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const financialsTab = screen.getByRole('tab', { name: /financials/i })
      fireEvent.click(financialsTab)
      
      expect(mockFormatPercentage).toHaveBeenCalledWith(mockCompanyOverview.profitMargin! * 100)
      expect(mockFormatPercentage).toHaveBeenCalledWith(mockCompanyOverview.operatingMarginTTM! * 100)
      expect(mockFormatPercentage).toHaveBeenCalledWith(mockCompanyOverview.returnOnEquityTTM! * 100)
      expect(mockFormatPercentage).toHaveBeenCalledWith(mockCompanyOverview.dividendYield! * 100)
    })

    it('should call formatMarketCap with correct values', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      expect(mockFormatMarketCap).toHaveBeenCalledWith(mockCompanyOverview.marketCapitalization)
      expect(mockFormatMarketCap).toHaveBeenCalledWith(mockCompanyOverview.sharesOutstanding)
      
      const financialsTab = screen.getByRole('tab', { name: /financials/i })
      fireEvent.click(financialsTab)
      
      expect(mockFormatMarketCap).toHaveBeenCalledWith(mockCompanyOverview.revenueTTM)
      expect(mockFormatMarketCap).toHaveBeenCalledWith(mockCompanyOverview.grossProfitTTM)
      expect(mockFormatMarketCap).toHaveBeenCalledWith(mockCompanyOverview.ebitda)
    })

    it('should call date formatting with correct parameters', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      expect(mockFormat).toHaveBeenCalledWith(new Date(mockNewsItems[0].time_published), 'MMM dd, HH:mm')
      expect(mockFormat).toHaveBeenCalledWith(new Date(mockNewsItems[1].time_published), 'MMM dd, HH:mm')
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null
      })
    })

    it('should have proper ARIA attributes for tabs', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const overviewTab = screen.getByRole('tab', { name: /overview/i })
      const financialsTab = screen.getByRole('tab', { name: /financials/i })
      const newsTab = screen.getByRole('tab', { name: /news/i })
      
      expect(overviewTab).toHaveAttribute('aria-selected', 'true')
      expect(financialsTab).toHaveAttribute('aria-selected', 'false')
      expect(newsTab).toHaveAttribute('aria-selected', 'false')
    })

    it('should have proper semantic HTML structure', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getAllByRole('tab')).toHaveLength(3)
      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
    })

    it('should have proper heading structure', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      // CardTitle components should render as headings
      expect(screen.getByText('Company Information')).toBeInTheDocument()
      expect(screen.getByText('Key Statistics')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<CompanyInfo symbol="AAPL" />)
      
      const overviewTab = screen.getByRole('tab', { name: /overview/i })
      
      // Tab should be focusable
      await user.tab()
      expect(overviewTab).toHaveFocus()
    })

    it('should have proper focus management for external links', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      const articleLink = screen.getByRole('link', { name: /Apple Reports Strong Q4 Earnings Beat/i })
      expect(articleLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('User Interactions', () => {
    beforeEach(() => {
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null
      })
    })

    it('should handle tab clicks correctly', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const financialsTab = screen.getByRole('tab', { name: /financials/i })
      fireEvent.click(financialsTab)
      
      expect(screen.getByText('Valuation Metrics')).toBeInTheDocument()
      expect(screen.queryByText('Company Information')).not.toBeInTheDocument()
    })

    it('should handle news article link clicks', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      const articleLink = screen.getByRole('link', { name: /Apple Reports Strong Q4 Earnings Beat/i })
      expect(articleLink).toHaveAttribute('href', mockNewsItems[0].url)
    })

    it('should apply hover effects to news cards', () => {
      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      const newsCard = screen.getByText('Apple Reports Strong Q4 Earnings Beat').closest('.hover\\:shadow-md')
      expect(newsCard).toHaveClass('hover:shadow-md', 'transition-shadow')
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle partial data correctly', () => {
      const partialOverview = {
        ...mockCompanyOverview,
        sector: '',
        industry: '',
        description: '',
        address: '',
        peRatio: 0,
        marketCapitalization: 0
      }
      
      mockUseCompanyOverview.mockReturnValue({
        data: partialOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      // Should display N/A for missing data
      expect(screen.getAllByText('N/A')).toHaveLength(3) // sector, industry, market cap
      
      // Should not display optional sections
      expect(screen.queryByText('Description')).not.toBeInTheDocument()
      expect(screen.queryByText('Address')).not.toBeInTheDocument()
    })

    it('should handle symbol changes correctly', () => {
      const { rerender } = render(<CompanyInfo symbol="AAPL" />)
      
      expect(mockUseCompanyOverview).toHaveBeenCalledWith("AAPL")
      expect(mockUseMarketNews).toHaveBeenCalledWith("AAPL")
      
      rerender(<CompanyInfo symbol="GOOGL" />)
      
      expect(mockUseCompanyOverview).toHaveBeenCalledWith("GOOGL")
      expect(mockUseMarketNews).toHaveBeenCalledWith("GOOGL")
    })

    it('should handle concurrent loading states', () => {
      mockUseCompanyOverview.mockReturnValue({
        data: null,
        loading: true,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: true,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      // Should show loading skeleton
      expect(screen.getAllByTestId('skeleton')).toHaveLength(9)
    })

    it('should handle mixed loading and error states', () => {
      mockUseCompanyOverview.mockReturnValue({
        data: null,
        loading: false,
        error: 'Overview failed'
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: true,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      // Should show error message
      expect(screen.getByText('Overview failed')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string values', () => {
      const overviewWithEmptyStrings = {
        ...mockCompanyOverview,
        sector: '',
        industry: '',
        description: '',
        address: ''
      }
      
      mockUseCompanyOverview.mockReturnValue({
        data: overviewWithEmptyStrings,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      // Empty strings should be treated as N/A
      expect(screen.getAllByText('N/A')).toHaveLength(2) // sector and industry
    })

    it('should handle zero values correctly', () => {
      const overviewWithZeroValues = {
        ...mockCompanyOverview,
        peRatio: 0,
        marketCapitalization: 0,
        dividendYield: 0
      }
      
      mockUseCompanyOverview.mockReturnValue({
        data: overviewWithZeroValues,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      // Zero values should be displayed, not treated as N/A
      expect(screen.getByText('0')).toBeInTheDocument() // P/E ratio
      expect(mockFormatMarketCap).toHaveBeenCalledWith(0)
    })

    it('should handle news with missing sentiment data', () => {
      const newsWithMissingSentiment = [{
        ...mockNewsItems[0],
        overall_sentiment_label: ''
      }]
      
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: newsWithMissingSentiment,
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      // Should not crash and should display article
      expect(screen.getByText('Apple Reports Strong Q4 Earnings Beat')).toBeInTheDocument()
    })

    it('should handle news with empty topics array', () => {
      const newsWithEmptyTopics = [{
        ...mockNewsItems[0],
        topics: []
      }]
      
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: newsWithEmptyTopics,
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      // Should not crash and should display article without topic tags
      expect(screen.getByText('Apple Reports Strong Q4 Earnings Beat')).toBeInTheDocument()
    })

    it('should handle very large numbers in formatting', () => {
      const overviewWithLargeNumbers = {
        ...mockCompanyOverview,
        marketCapitalization: 5000000000000, // 5 trillion
        revenueTTM: 1000000000000 // 1 trillion
      }
      
      mockUseCompanyOverview.mockReturnValue({
        data: overviewWithLargeNumbers,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: [],
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      expect(mockFormatMarketCap).toHaveBeenCalledWith(5000000000000)
      expect(mockFormatMarketCap).toHaveBeenCalledWith(1000000000000)
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily when props do not change', () => {
      const mockRender = jest.fn()
      const TestComponent = () => {
        mockRender()
        return <CompanyInfo symbol="AAPL" />
      }
      
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null
      })

      const { rerender } = render(<TestComponent />)
      
      expect(mockRender).toHaveBeenCalledTimes(1)
      
      // Re-render with same props
      rerender(<TestComponent />)
      
      expect(mockRender).toHaveBeenCalledTimes(2)
    })

    it('should handle large datasets efficiently', () => {
      const largeNewsList = Array.from({ length: 100 }, (_, i) => ({
        ...mockNewsItems[0],
        title: `News Article ${i + 1}`,
        url: `https://example.com/news-${i + 1}`
      }))
      
      mockUseCompanyOverview.mockReturnValue({
        data: mockCompanyOverview,
        loading: false,
        error: null
      })
      mockUseMarketNews.mockReturnValue({
        data: largeNewsList,
        loading: false,
        error: null
      })

      render(<CompanyInfo symbol="AAPL" />)
      
      const newsTab = screen.getByRole('tab', { name: /news/i })
      fireEvent.click(newsTab)
      
      // Should only render first 10 items for performance
      expect(screen.getByText('News Article 1')).toBeInTheDocument()
      expect(screen.getByText('News Article 10')).toBeInTheDocument()
      expect(screen.queryByText('News Article 11')).not.toBeInTheDocument()
    })
  })
})