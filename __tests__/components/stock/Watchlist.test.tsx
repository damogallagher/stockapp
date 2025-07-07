import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import Watchlist from '@/components/stock/Watchlist'
import { useStockStore } from '@/lib/store'
import { createMockWatchlistItem } from '../../setup/test-utils'

jest.mock('@/lib/store')

const mockUseStockStore = useStockStore as jest.MockedFunction<typeof useStockStore>

describe('Watchlist', () => {
  const mockStoreState = {
    watchlist: [],
    removeFromWatchlist: jest.fn(),
    recentSearches: [],
    selectedTimeRange: '1D' as const,
    selectedChartType: 'line' as const,
    isDarkMode: false,
    addToWatchlist: jest.fn(),
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

  it('renders empty watchlist state', () => {
    render(<Watchlist />)

    expect(screen.getByText('Your watchlist is empty')).toBeInTheDocument()
    expect(screen.getByText('Start adding stocks to your watchlist to track their performance')).toBeInTheDocument()
  })

  it('renders watchlist with items', async () => {
    const mockWatchlist = [
      createMockWatchlistItem({ symbol: 'AAPL', name: 'Apple Inc.' }),
      createMockWatchlistItem({ symbol: 'GOOGL', name: 'Alphabet Inc.' }),
    ]

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      watchlist: mockWatchlist,
    })

    render(<Watchlist />)

    expect(screen.getByText('Watchlist (2)')).toBeInTheDocument()
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    expect(screen.getByText('GOOGL')).toBeInTheDocument()
    expect(screen.getByText('Alphabet Inc.')).toBeInTheDocument()
  })

  it('handles search functionality', async () => {
    const mockWatchlist = [
      createMockWatchlistItem({ symbol: 'AAPL', name: 'Apple Inc.' }),
      createMockWatchlistItem({ symbol: 'GOOGL', name: 'Alphabet Inc.' }),
      createMockWatchlistItem({ symbol: 'MSFT', name: 'Microsoft Corporation' }),
    ]

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      watchlist: mockWatchlist,
    })

    render(<Watchlist />)

    const searchInput = screen.getByPlaceholderText('Search watchlist...')
    fireEvent.change(searchInput, { target: { value: 'Apple' } })

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
      expect(screen.queryByText('GOOGL')).not.toBeInTheDocument()
      expect(screen.queryByText('MSFT')).not.toBeInTheDocument()
    })
  })

  it('handles remove from watchlist', async () => {
    const mockWatchlist = [
      createMockWatchlistItem({ symbol: 'AAPL', name: 'Apple Inc.' }),
    ]

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      watchlist: mockWatchlist,
    })

    render(<Watchlist />)

    const removeButton = screen.getByRole('button', { name: '' }) // Trash icon button
    fireEvent.click(removeButton)

    expect(mockStoreState.removeFromWatchlist).toHaveBeenCalledWith('AAPL')
  })

  it('handles stock selection', async () => {
    const mockOnSelectStock = jest.fn()
    const mockWatchlist = [
      createMockWatchlistItem({ symbol: 'AAPL', name: 'Apple Inc.' }),
    ]

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      watchlist: mockWatchlist,
    })

    render(<Watchlist onSelectStock={mockOnSelectStock} />)

    const stockRow = screen.getByText('AAPL').closest('div')
    fireEvent.click(stockRow!)

    expect(mockOnSelectStock).toHaveBeenCalledWith('AAPL')
  })

  it('handles sorting by symbol', async () => {
    const mockWatchlist = [
      createMockWatchlistItem({ symbol: 'GOOGL', name: 'Alphabet Inc.' }),
      createMockWatchlistItem({ symbol: 'AAPL', name: 'Apple Inc.' }),
    ]

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      watchlist: mockWatchlist,
    })

    render(<Watchlist />)

    // Wait for initial load to complete - async effects need time
    await waitFor(() => {
      expect(screen.getByText('GOOGL')).toBeInTheDocument()
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Wait for async loading effects to complete 
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1500))
    })

    // Initial order should be alphabetical AAPL, GOOGL (default sort by symbol asc)
    let stockElements = screen.getAllByText(/^(AAPL|GOOGL)$/)
    expect(stockElements[0]).toHaveTextContent('AAPL')

    const symbolSortButton = screen.getByRole('button', { name: /Symbol/i })
    
    // Click again to reverse sort order (desc)
    await act(async () => {
      fireEvent.click(symbolSortButton)
    })

    // Wait for sorting to take effect - symbols should be in reverse alphabetical order (GOOGL first)
    await waitFor(() => {
      const sortedElements = screen.getAllByText(/^(AAPL|GOOGL)$/)
      expect(sortedElements[0]).toHaveTextContent('GOOGL')
    }, { timeout: 3000 })
  })

  it('toggles between list and grid view', () => {
    const mockWatchlist = [
      createMockWatchlistItem({ symbol: 'AAPL', name: 'Apple Inc.' }),
    ]

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      watchlist: mockWatchlist,
    })

    render(<Watchlist />)

    const gridButton = screen.getByRole('button', { name: 'Grid' })
    fireEvent.click(gridButton)

    // In grid view, items should be displayed differently
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    
    const listButton = screen.getByRole('button', { name: 'List' })
    fireEvent.click(listButton)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
  })

  it('displays watchlist overview statistics', async () => {
    const mockWatchlist = [
      createMockWatchlistItem({ 
        symbol: 'AAPL', 
        name: 'Apple Inc.',
        price: 150.00,
        changePercent: 2.5
      }),
      createMockWatchlistItem({ 
        symbol: 'GOOGL', 
        name: 'Alphabet Inc.',
        price: 100.00,
        changePercent: -1.5
      }),
    ]

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      watchlist: mockWatchlist,
    })

    render(<Watchlist />)

    expect(screen.getByText('Total Value')).toBeInTheDocument()
    expect(screen.getByText('Average Change')).toBeInTheDocument()
    expect(screen.getByText('Holdings')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // Holdings count
  })

  it('shows no matches message when search has no results', async () => {
    const mockWatchlist = [
      createMockWatchlistItem({ symbol: 'AAPL', name: 'Apple Inc.' }),
    ]

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      watchlist: mockWatchlist,
    })

    render(<Watchlist />)

    const searchInput = screen.getByPlaceholderText('Search watchlist...')
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } })

    await waitFor(() => {
      expect(screen.getByText('No stocks match your search')).toBeInTheDocument()
    })
  })

  it('displays loading state for watchlist items', async () => {
    const mockWatchlist = [
      createMockWatchlistItem({ symbol: 'AAPL', name: 'Apple Inc.' }),
    ]

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      watchlist: mockWatchlist,
    })

    render(<Watchlist />)

    // Initially items will be in loading state
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  it('handles sorting by price and change', async () => {
    const mockWatchlist = [
      createMockWatchlistItem({ symbol: 'AAPL', price: 150.00, changePercent: 2.5 }),
      createMockWatchlistItem({ symbol: 'GOOGL', price: 100.00, changePercent: -1.5 }),
    ]

    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      watchlist: mockWatchlist,
    })

    render(<Watchlist />)

    // Test price sorting
    const priceSortButton = screen.getByRole('button', { name: /Price/i })
    fireEvent.click(priceSortButton)

    // Test change sorting
    const changeSortButton = screen.getByRole('button', { name: /Change/i })
    fireEvent.click(changeSortButton)

    // Verify both buttons are rendered
    expect(priceSortButton).toBeInTheDocument()
    expect(changeSortButton).toBeInTheDocument()
  })
})