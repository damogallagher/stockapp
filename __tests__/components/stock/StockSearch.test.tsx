import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import StockSearch from '@/components/stock/StockSearch'
import { searchStocks } from '@/lib/api'
import { useStockStore } from '@/lib/store'

jest.mock('@/lib/api')
jest.mock('@/lib/store')

const mockSearchStocks = searchStocks as jest.MockedFunction<typeof searchStocks>
const mockUseStockStore = useStockStore as jest.MockedFunction<typeof useStockStore>

describe('StockSearch', () => {
  const mockStoreState = {
    recentSearches: [],
    addRecentSearch: jest.fn(),
    clearRecentSearches: jest.fn(),
    watchlist: [],
    selectedTimeRange: '1D' as const,
    selectedChartType: 'line' as const,
    isDarkMode: false,
    removeFromWatchlist: jest.fn(),
    addToWatchlist: jest.fn(),
    setTimeRange: jest.fn(),
    setChartType: jest.fn(),
    toggleDarkMode: jest.fn(),
    clearWatchlist: jest.fn(),
  }

  const mockOnSelectStock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseStockStore.mockReturnValue(mockStoreState)
  })

  it('renders search input with placeholder', () => {
    render(<StockSearch onSelectStock={mockOnSelectStock} />)

    expect(screen.getByPlaceholderText('Search stocks...')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<StockSearch onSelectStock={mockOnSelectStock} placeholder="Find a stock" />)

    expect(screen.getByPlaceholderText('Find a stock')).toBeInTheDocument()
  })

  it('shows popular stocks when input is focused', async () => {
    render(<StockSearch onSelectStock={mockOnSelectStock} />)

    const input = screen.getByPlaceholderText('Search stocks...')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByText('Popular Stocks')).toBeInTheDocument()
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
      expect(screen.getByText('AAPL')).toBeInTheDocument()
      expect(screen.getByText('Microsoft Corporation')).toBeInTheDocument()
      expect(screen.getByText('MSFT')).toBeInTheDocument()
    })
  })

  it('shows recent searches when available', async () => {
    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      recentSearches: ['AAPL', 'GOOGL', 'MSFT'],
    })

    render(<StockSearch onSelectStock={mockOnSelectStock} />)

    const input = screen.getByPlaceholderText('Search stocks...')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByText('Recent Searches')).toBeInTheDocument()
    })
    
    // Check for recent search badges - there might be duplicates in popular stocks
    expect(screen.getAllByText('AAPL').length).toBeGreaterThan(0)
    expect(screen.getAllByText('GOOGL').length).toBeGreaterThan(0)
    expect(screen.getAllByText('MSFT').length).toBeGreaterThan(0)
  })

  it('handles recent search clear', async () => {
    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      recentSearches: ['AAPL', 'GOOGL'],
    })

    render(<StockSearch onSelectStock={mockOnSelectStock} />)

    const input = screen.getByPlaceholderText('Search stocks...')
    fireEvent.focus(input)

    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: 'Clear' })
      fireEvent.click(clearButton)
    })

    expect(mockStoreState.clearRecentSearches).toHaveBeenCalledTimes(1)
  })

  it('performs search on input change', async () => {
    const mockSearchResults = [
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States', marketOpen: "true", marketClose: "false", timezone: "GMT-5", currency: "USD",matchScore: 0.95 },
      { symbol: 'AAPLW', name: 'Apple Warrant', type: 'Warrant', region: 'United States', marketOpen: "true", marketClose: "false", timezone: "GMT-5", currency: "USD", matchScore: 0.85 },
    ]

    mockSearchStocks.mockResolvedValue({
      success: true,
      data: mockSearchResults,
      error: null, // No error
    })

    render(<StockSearch onSelectStock={mockOnSelectStock} />)

    const input = screen.getByPlaceholderText('Search stocks...')
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'AAPL' } })
    })

    await waitFor(() => {
      expect(mockSearchStocks).toHaveBeenCalledWith('AAPL')
    })
  })

  it('shows search results', async () => {
    const mockSearchResults = [
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States', marketOpen: "true", marketClose: "false", timezone: "GMT-5", currency: "USD", matchScore: 0.95 },
    ]

    mockSearchStocks.mockResolvedValue({
      success: true,
      data: mockSearchResults,
      error: null, // No error
    })

    render(<StockSearch onSelectStock={mockOnSelectStock} />)

    const input = screen.getByPlaceholderText('Search stocks...')
    
    // Focus the input first to show results
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'AAPL' } })

    // Wait for search to complete
    await waitFor(() => {
      expect(mockSearchStocks).toHaveBeenCalledWith('AAPL')
    })

    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
      expect(screen.getByText('Equity')).toBeInTheDocument()
      expect(screen.getByText('United States')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('shows loading state during search', async () => {
    let resolveSearch: any
    mockSearchStocks.mockImplementation(() => new Promise(resolve => {
      resolveSearch = resolve
    }))

    render(<StockSearch onSelectStock={mockOnSelectStock} />)

    const input = screen.getByPlaceholderText('Search stocks...')
    
    // Focus the input first to show results
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'AAPL' } })

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument()
    }, { timeout: 1000 })

    // Resolve the search to clean up
    resolveSearch({ success: true, data: [] })
  })

  it('shows error state when search fails', async () => {
    mockSearchStocks.mockResolvedValue({
      success: false,
      data: [], // No up
      error: 'API limit exceeded',
    })

    render(<StockSearch onSelectStock={mockOnSelectStock} />)

    const input = screen.getByPlaceholderText('Search stocks...')
    
    // Focus the input first to show results
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'AAPL' } })

    await waitFor(() => {
      expect(screen.getByText('API limit exceeded')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('shows no results message when search returns empty', async () => {
    mockSearchStocks.mockResolvedValue({
      success: true,
      data: [],
      error: null, // No error  
    })

    render(<StockSearch onSelectStock={mockOnSelectStock} />)

    const input = screen.getByPlaceholderText('Search stocks...')
    
    // Focus the input first to show results
    fireEvent.focus(input)
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'NONEXISTENT' } })
    })

    // Wait for debounced search to complete
    await waitFor(() => {
      expect(mockSearchStocks).toHaveBeenCalledWith('NONEXISTENT')
    }, { timeout: 1000 })

    await waitFor(() => {
      expect(screen.getByText('No stocks found for "NONEXISTENT"')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('handles stock selection from search results', async () => {
    const mockSearchResults = [
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States', marketOpen: "true", marketClose: "false", timezone: "GMT-5", currency: "USD",matchScore: 0.95  },
    ]

    mockSearchStocks.mockResolvedValue({
      success: true,
      data: mockSearchResults,
      error: null, // No error
    })

    render(<StockSearch onSelectStock={mockOnSelectStock} />)

    const input = screen.getByPlaceholderText('Search stocks...')
    
    // Focus the input first to show results
    fireEvent.focus(input)
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'AAPL' } })
    })

    // Wait for debounced search to complete
    await waitFor(() => {
      expect(mockSearchStocks).toHaveBeenCalledWith('AAPL')
    }, { timeout: 1000 })

    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    }, { timeout: 2000 })

    const resultItem = screen.getByText('Apple Inc.')
    fireEvent.click(resultItem)

    expect(mockOnSelectStock).toHaveBeenCalledWith('AAPL')
    expect(mockStoreState.addRecentSearch).toHaveBeenCalledWith('AAPL')
  })

  it('handles stock selection from popular stocks', async () => {
    render(<StockSearch onSelectStock={mockOnSelectStock} />)

    const input = screen.getByPlaceholderText('Search stocks...')
    fireEvent.focus(input)

    await waitFor(() => {
      const appleStock = screen.getByText('Apple Inc.')
      fireEvent.click(appleStock)
    })

    expect(mockOnSelectStock).toHaveBeenCalledWith('AAPL')
    expect(mockStoreState.addRecentSearch).toHaveBeenCalledWith('AAPL')
  })

  it('handles stock selection from recent searches', async () => {
    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      recentSearches: ['AAPL', 'GOOGL'],
    })

    render(<StockSearch onSelectStock={mockOnSelectStock} />)

    const input = screen.getByPlaceholderText('Search stocks...')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByText('Recent Searches')).toBeInTheDocument()
    })

    // Find the AAPL badge in recent searches section
    const recentSearchesSection = screen.getByText('Recent Searches').closest('div')
    const recentAAPL = recentSearchesSection?.querySelector('[role="button"]') || 
                       screen.getAllByText('AAPL')[0] // Get the first AAPL (recent searches)
    
    fireEvent.click(recentAAPL)

    expect(mockOnSelectStock).toHaveBeenCalledWith('AAPL')
  })

  it('shows clear button when input has value', () => {
    render(<StockSearch onSelectStock={mockOnSelectStock} />)

    const input = screen.getByPlaceholderText('Search stocks...')
    fireEvent.change(input, { target: { value: 'AAPL' } })

    expect(screen.getByRole('button')).toBeInTheDocument() // Clear button (X)
  })

  it('clears input when clear button is clicked', () => {
    render(<StockSearch onSelectStock={mockOnSelectStock} />)

    const input = screen.getByPlaceholderText('Search stocks...')
    fireEvent.change(input, { target: { value: 'AAPL' } })

    const clearButton = screen.getByRole('button')
    fireEvent.click(clearButton)

    expect(input).toHaveValue('')
  })

  it('closes results when clicking outside', async () => {
    render(
      <div>
        <StockSearch onSelectStock={mockOnSelectStock} />
        <div data-testid="outside">Outside element</div>
      </div>
    )

    const input = screen.getByPlaceholderText('Search stocks...')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByText('Popular Stocks')).toBeInTheDocument()
    })

    const outsideElement = screen.getByTestId('outside')
    fireEvent.mouseDown(outsideElement)

    await waitFor(() => {
      expect(screen.queryByText('Popular Stocks')).not.toBeInTheDocument()
    })
  })

  it('debounces search input', async () => {
    mockSearchStocks.mockResolvedValue({
      success: true,
      data: [],
      error: null,
    })

    render(<StockSearch onSelectStock={mockOnSelectStock} />)

    const input = screen.getByPlaceholderText('Search stocks...')
    
    // Type quickly
    await act(async () => {
      fireEvent.change(input, { target: { value: 'A' } })
      fireEvent.change(input, { target: { value: 'AA' } })
      fireEvent.change(input, { target: { value: 'AAP' } })
      fireEvent.change(input, { target: { value: 'AAPL' } })
    })

    // Wait for debounce
    await waitFor(() => {
      expect(mockSearchStocks).toHaveBeenCalledTimes(1)
      expect(mockSearchStocks).toHaveBeenCalledWith('AAPL')
    })
  })
})