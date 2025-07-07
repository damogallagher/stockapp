import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StockDashboard from '@/components/stock/StockDashboard'
import { useStockData } from '@/hooks/useStockData'
import { useStockStore } from '@/lib/store'
import { createMockStockQuote, createMockCompanyOverview } from '../../setup/test-utils'

jest.mock('@/hooks/useStockData')
jest.mock('@/lib/store')

const mockUseStockData = useStockData as jest.MockedFunction<typeof useStockData>
const mockUseStockStore = useStockStore as jest.MockedFunction<typeof useStockStore>

describe('StockDashboard', () => {
  const mockStoreState = {
    watchlist: [],
    addToWatchlist: jest.fn(),
    removeFromWatchlist: jest.fn(),
    recentSearches: [],
    selectedTimeRange: '1D' as const,
    selectedChartType: 'line' as const,
    isDarkMode: false,
    addRecentSearch: jest.fn(),
    clearRecentSearches: jest.fn(),
    setTimeRange: jest.fn(),
    setChartType: jest.fn(),
    toggleDarkMode: jest.fn(),
    clearWatchlist: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseStockStore.mockReturnValue(mockStoreState)
  })

  it('renders loading state', () => {
    mockUseStockData.mockReturnValue({
      quote: null,
      overview: null,
      loading: true,
      error: null,
    })

    render(<StockDashboard symbol="AAPL" />)

    // Check that actual content is not present during loading
    expect(screen.queryByText('AAPL')).not.toBeInTheDocument()
    expect(screen.queryByText('$150.25')).not.toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseStockData.mockReturnValue({
      quote: null,
      overview: null,
      loading: false,
      error: 'Failed to fetch data',
    })

    render(<StockDashboard symbol="AAPL" />)

    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument()
  })

  it('renders no data state', () => {
    mockUseStockData.mockReturnValue({
      quote: null,
      overview: null,
      loading: false,
      error: null,
    })

    render(<StockDashboard symbol="AAPL" />)

    expect(screen.getByText('No data available for AAPL')).toBeInTheDocument()
  })

  it('renders stock dashboard with quote data', () => {
    const mockQuote = createMockStockQuote({
      symbol: 'AAPL',
      price: 150.25,
      change: 2.5,
      changePercent: 1.69,
    })

    mockUseStockData.mockReturnValue({
      quote: mockQuote,
      overview: null,
      loading: false,
      error: null,
    })

    render(<StockDashboard symbol="AAPL" />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('$150.25')).toBeInTheDocument()
    expect(screen.getByText('$2.50')).toBeInTheDocument()
    expect(screen.getByText('1.69%')).toBeInTheDocument()
  })

  it('renders stock dashboard with overview data', () => {
    const mockQuote = createMockStockQuote()
    const mockOverview = createMockCompanyOverview({
      name: 'Apple Inc.',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      exchange: 'NASDAQ',
      country: 'United States',
      description: 'Apple designs and manufactures consumer electronics...',
    })

    mockUseStockData.mockReturnValue({
      quote: mockQuote,
      overview: mockOverview,
      loading: false,
      error: null,
    })

    render(<StockDashboard symbol="AAPL" />)

    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
    expect(screen.getByText('Consumer Electronics')).toBeInTheDocument()
    expect(screen.getByText('NASDAQ')).toBeInTheDocument()
    expect(screen.getByText('United States')).toBeInTheDocument()
    expect(screen.getByText(/Apple designs and manufactures consumer electronics/)).toBeInTheDocument()
  })

  it('shows add to watchlist button when not in watchlist', () => {
    const mockQuote = createMockStockQuote()
    mockUseStockData.mockReturnValue({
      quote: mockQuote,
      overview: null,
      loading: false,
      error: null,
    })

    render(<StockDashboard symbol="AAPL" />)

    expect(screen.getByRole('button', { name: /add to watchlist/i })).toBeInTheDocument()
  })

  it('shows remove from watchlist button when in watchlist', () => {
    const mockQuote = createMockStockQuote()
    mockUseStockData.mockReturnValue({
      quote: mockQuote,
      overview: null,
      loading: false,
      error: null,
    })

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      watchlist: [{ symbol: 'AAPL', name: 'Apple Inc.', addedAt: '2024-01-01' }],
    })

    render(<StockDashboard symbol="AAPL" />)

    expect(screen.getByRole('button', { name: /remove from watchlist/i })).toBeInTheDocument()
  })

  it('handles add to watchlist click', async () => {
    const mockQuote = createMockStockQuote()
    const mockOverview = createMockCompanyOverview({ name: 'Apple Inc.' })
    
    mockUseStockData.mockReturnValue({
      quote: mockQuote,
      overview: mockOverview,
      loading: false,
      error: null,
    })

    render(<StockDashboard symbol="AAPL" />)

    const addButton = screen.getByRole('button', { name: /add to watchlist/i })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(mockStoreState.addToWatchlist).toHaveBeenCalledWith({
        symbol: 'AAPL',
        name: 'Apple Inc.',
        addedAt: expect.any(String),
        price: mockQuote.price,
        change: mockQuote.change,
        changePercent: mockQuote.changePercent,
      })
    })
  })

  it('handles remove from watchlist click', async () => {
    const mockQuote = createMockStockQuote()
    mockUseStockData.mockReturnValue({
      quote: mockQuote,
      overview: null,
      loading: false,
      error: null,
    })

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      watchlist: [{ symbol: 'AAPL', name: 'Apple Inc.', addedAt: '2024-01-01' }],
    })

    render(<StockDashboard symbol="AAPL" />)

    const removeButton = screen.getByRole('button', { name: /remove from watchlist/i })
    fireEvent.click(removeButton)

    await waitFor(() => {
      expect(mockStoreState.removeFromWatchlist).toHaveBeenCalledWith('AAPL')
    })
  })

  it('displays trading data correctly', () => {
    const mockQuote = createMockStockQuote({
      open: 148.00,
      high: 151.00,
      low: 147.50,
      previousClose: 147.75,
      volume: 50000000,
    })

    mockUseStockData.mockReturnValue({
      quote: mockQuote,
      overview: null,
      loading: false,
      error: null,
    })

    render(<StockDashboard symbol="AAPL" />)

    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('$148.00')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('$151.00')).toBeInTheDocument()
    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('$147.50')).toBeInTheDocument()
    expect(screen.getByText('Previous Close')).toBeInTheDocument()
    expect(screen.getByText('$147.75')).toBeInTheDocument()
    expect(screen.getByText('Volume')).toBeInTheDocument()
    expect(screen.getByText('50,000,000')).toBeInTheDocument()
  })

  it('displays key metrics when overview is available', () => {
    const mockQuote = createMockStockQuote()
    const mockOverview = createMockCompanyOverview({
      peRatio: 25.5,
      eps: 6.13,
      high52Week: 198.23,
      low52Week: 124.17,
    })

    mockUseStockData.mockReturnValue({
      quote: mockQuote,
      overview: mockOverview,
      loading: false,
      error: null,
    })

    render(<StockDashboard symbol="AAPL" />)

    expect(screen.getByText('P/E Ratio')).toBeInTheDocument()
    expect(screen.getByText('25.50')).toBeInTheDocument()
    expect(screen.getByText('EPS')).toBeInTheDocument()
    expect(screen.getByText('$6.13')).toBeInTheDocument()
    expect(screen.getByText('52W High')).toBeInTheDocument()
    expect(screen.getByText('$198.23')).toBeInTheDocument()
    expect(screen.getByText('52W Low')).toBeInTheDocument()
    expect(screen.getByText('$124.17')).toBeInTheDocument()
  })

  it('displays positive change with success styling', () => {
    const mockQuote = createMockStockQuote({
      change: 2.5,
      changePercent: 1.69,
    })

    mockUseStockData.mockReturnValue({
      quote: mockQuote,
      overview: null,
      loading: false,
      error: null,
    })

    render(<StockDashboard symbol="AAPL" />)

    const badge = screen.getByText('$2.50').closest('.bg-green-500')
    expect(badge).toBeInTheDocument()
  })

  it('displays negative change with destructive styling', () => {
    const mockQuote = createMockStockQuote({
      change: -2.5,
      changePercent: -1.69,
    })

    mockUseStockData.mockReturnValue({
      quote: mockQuote,
      overview: null,
      loading: false,
      error: null,
    })

    render(<StockDashboard symbol="AAPL" />)

    const badge = screen.getByText('$2.50').closest('.bg-destructive')
    expect(badge).toBeInTheDocument()
  })
})