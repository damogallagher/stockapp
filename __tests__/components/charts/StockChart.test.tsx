import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import StockChart from '@/components/charts/StockChart'
import { useStockChart } from '@/hooks/useStockData'
import { useStockStore } from '@/lib/store'
import { createMockChartData } from '../../setup/test-utils'

// Mock recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}))

// Mock HTML elements that Recharts creates
Object.defineProperty(window, 'SVGElement', {
  writable: true,
  value: class SVGElement {}
})

// Mock createElementNS for SVG elements
document.createElementNS = jest.fn().mockImplementation((namespaceURI, qualifiedName) => {
  const element = document.createElement(qualifiedName)
  return element
})

// Suppress console warnings for SVG elements in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('unrecognized in this browser')) {
      return
    }
    if (typeof args[0] === 'string' && args[0].includes('using incorrect casing')) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

jest.mock('@/hooks/useStockData')
jest.mock('@/lib/store')

const mockUseStockChart = useStockChart as jest.MockedFunction<typeof useStockChart>
const mockUseStockStore = useStockStore as jest.MockedFunction<typeof useStockStore>

describe('StockChart', () => {
  const mockStoreState = {
    selectedTimeRange: '1D' as const,
    selectedChartType: 'line' as const,
    setTimeRange: jest.fn(),
    setChartType: jest.fn(),
    watchlist: [],
    recentSearches: [],
    isDarkMode: false,
    addToWatchlist: jest.fn(),
    removeFromWatchlist: jest.fn(),
    addRecentSearch: jest.fn(),
    clearRecentSearches: jest.fn(),
    toggleDarkMode: jest.fn(),
    clearWatchlist: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseStockStore.mockReturnValue(mockStoreState)
  })

  it('renders loading state', () => {
    mockUseStockChart.mockReturnValue({
      data: [],
      loading: true,
      error: null,
    })

    render(<StockChart symbol="AAPL" />)

    expect(screen.getByText('Stock Chart')).toBeInTheDocument()
    // Loading skeletons should be present
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders error state', () => {
    mockUseStockChart.mockReturnValue({
      data: [],
      loading: false,
      error: 'Failed to fetch chart data',
    })

    render(<StockChart symbol="AAPL" />)

    expect(screen.getByText('Stock Chart')).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch chart data')).toBeInTheDocument()
  })

  it('renders no data state', () => {
    mockUseStockChart.mockReturnValue({
      data: [],
      loading: false,
      error: null,
    })

    render(<StockChart symbol="AAPL" />)

    expect(screen.getByText('No chart data available for this time range')).toBeInTheDocument()
  })

  it('renders chart with data', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    render(<StockChart symbol="AAPL" />)

    expect(screen.getByText('Stock Chart - AAPL')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('renders time range tabs', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    render(<StockChart symbol="AAPL" />)

    expect(screen.getByRole('tab', { name: '1D' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '5D' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '1M' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '3M' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '6M' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '1Y' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '5Y' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'MAX' })).toBeInTheDocument()
  })

  it('renders chart type buttons', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    render(<StockChart symbol="AAPL" />)

    expect(screen.getByRole('button', { name: 'Line' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Area' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Volume' })).toBeInTheDocument()
  })

  it('handles time range change', async () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    render(<StockChart symbol="AAPL" />)

    // Initially, 1D should be selected (default state)
    expect(screen.getByRole('tab', { name: '1D' })).toHaveAttribute('aria-selected', 'true')
    
    // Find and click the 5D tab
    const fiveDayTab = screen.getByRole('tab', { name: '5D' })
    
    // Click the tab - this should trigger Radix UI's internal state change
    fireEvent.click(fiveDayTab)
    
    // Use keyboard navigation which often works better with Radix UI
    fireEvent.keyDown(fiveDayTab, { key: 'Enter' })

    // The setTimeRange should be called through the handleTimeRangeChange function
    await waitFor(() => {
      expect(mockStoreState.setTimeRange).toHaveBeenCalledWith('5D')
    })
  })

  it('handles chart type change', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    render(<StockChart symbol="AAPL" />)

    const areaButton = screen.getByRole('button', { name: 'Area' })
    fireEvent.click(areaButton)

    expect(mockStoreState.setChartType).toHaveBeenCalledWith('candlestick')
  })

  it('renders area chart when candlestick type is selected', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      selectedChartType: 'candlestick',
    })

    render(<StockChart symbol="AAPL" />)

    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    expect(screen.getByTestId('area')).toBeInTheDocument()
  })

  it('renders volume chart when volume type is selected', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      selectedChartType: 'volume',
    })

    render(<StockChart symbol="AAPL" />)

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar')).toBeInTheDocument()
  })

  it('displays trend badge for positive change', () => {
    const mockChartData = [
      createMockChartData()[0],
      { ...createMockChartData()[0], date: '2024-01-11', close: 155.00 }
    ]
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    render(<StockChart symbol="AAPL" />)

    expect(screen.getByText('↗ 1D')).toBeInTheDocument()
  })

  it('displays trend badge for negative change', () => {
    const mockChartData = [
      createMockChartData()[0],
      { ...createMockChartData()[0], date: '2024-01-11', close: 145.00 }
    ]
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    render(<StockChart symbol="AAPL" />)

    expect(screen.getByText('↘ 1D')).toBeInTheDocument()
  })

  it('renders with custom height', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    render(<StockChart symbol="AAPL" height={500} />)

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('shows active time range and chart type', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      selectedTimeRange: '1M',
      selectedChartType: 'volume',
    })

    render(<StockChart symbol="AAPL" />)

    // Check that the active time range tab is shown
    const oneMonthTab = screen.getByRole('tab', { name: '1M' })
    expect(oneMonthTab).toHaveAttribute('data-state', 'active')

    // Check that the active chart type button is shown
    const volumeButton = screen.getByRole('button', { name: 'Volume' })
    expect(volumeButton).toBeInTheDocument()
  })

  it('renders chart axes and tooltip', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    render(<StockChart symbol="AAPL" />)

    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
    expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
  })

  it('does not render badge when data length is 1', () => {
    const mockChartData = [createMockChartData()[0]] // Only one data point
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    render(<StockChart symbol="AAPL" />)

    expect(screen.queryByText('↗ 1D')).not.toBeInTheDocument()
    expect(screen.queryByText('↘ 1D')).not.toBeInTheDocument()
  })

  it('handles different time ranges for date formatting', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    // Test 5D range
    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      selectedTimeRange: '5D',
    })
    
    render(<StockChart symbol="AAPL" />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles 3M time range for date formatting', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      selectedTimeRange: '3M',
    })
    
    render(<StockChart symbol="AAPL" />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles 6M time range for date formatting', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      selectedTimeRange: '6M',
    })
    
    render(<StockChart symbol="AAPL" />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles 1Y time range for date formatting', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      selectedTimeRange: '1Y',
    })
    
    render(<StockChart symbol="AAPL" />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles 5Y time range for date formatting', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      selectedTimeRange: '5Y',
    })
    
    render(<StockChart symbol="AAPL" />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles MAX time range for date formatting', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      selectedTimeRange: 'MAX',
    })
    
    render(<StockChart symbol="AAPL" />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles default case for unknown time range', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      selectedTimeRange: 'UNKNOWN' as any,
    })
    
    render(<StockChart symbol="AAPL" />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles default case for unknown chart type', () => {
    const mockChartData = createMockChartData()
    mockUseStockChart.mockReturnValue({
      data: mockChartData,
      loading: false,
      error: null,
    })

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      selectedChartType: 'unknown' as any,
    })
    
    render(<StockChart symbol="AAPL" />)
    
    // Should not render any chart for unknown type
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument()
    expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
  })

  it('returns null when data is empty in renderChart', () => {
    mockUseStockChart.mockReturnValue({
      data: [],
      loading: false,
      error: null,
    })

    render(<StockChart symbol="AAPL" />)
    
    expect(screen.getByText('No chart data available for this time range')).toBeInTheDocument()
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument()
  })
})