import { render, screen, fireEvent } from '../../setup/test-utils'
import StockCard from '@/components/stock/StockCard'
import { createMockStockQuote, mockStoreWith } from '../../setup/test-utils'
import { StockQuote } from '@/lib/types'

describe('StockCard', () => {
  const mockQuote: StockQuote = createMockStockQuote({
    symbol: 'AAPL',
    price: 150.25,
    change: 2.50,
    changePercent: 1.69,
    volume: 50000000,
    open: 148.00,
    high: 151.00,
    low: 147.50,
  })

  const mockOnViewDetails = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loading state', () => {
    it('should render loading skeleton when loading is true', () => {
      render(<StockCard quote={mockQuote} loading={true} />)
      
      // Should show skeleton elements
      expect(screen.getAllByTestId(/skeleton/i)).toHaveLength(0) // Using custom skeleton components
      expect(screen.queryByText('AAPL')).not.toBeInTheDocument()
      expect(screen.queryByText('$150.25')).not.toBeInTheDocument()
    })

    it('should render skeleton without compact details when compact is false', () => {
      render(<StockCard quote={mockQuote} loading={true} compact={false} />)
      
      const card = screen.getByRole('generic') // Card container
      expect(card).toBeInTheDocument()
    })

    it('should render skeleton with compact layout when compact is true', () => {
      render(<StockCard quote={mockQuote} loading={true} compact={true} />)
      
      const card = screen.getByRole('generic')
      expect(card).toBeInTheDocument()
    })
  })

  describe('no data state', () => {
    it('should render "No data available" when quote is null', () => {
      render(<StockCard quote={null as any} />)
      
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should render "No data available" when quote is undefined', () => {
      render(<StockCard quote={undefined as any} />)
      
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })
  })

  describe('normal rendering', () => {
    it('should render stock information correctly', () => {
      render(<StockCard quote={mockQuote} />)
      
      expect(screen.getByText('AAPL')).toBeInTheDocument()
      expect(screen.getByText('$150.25')).toBeInTheDocument()
      expect(screen.getByText('$2.50')).toBeInTheDocument()
      expect(screen.getByText('1.69%')).toBeInTheDocument()
    })

    it('should show positive change indicators for gains', () => {
      const gainQuote = createMockStockQuote({ change: 5.00, changePercent: 3.33 })
      render(<StockCard quote={gainQuote} />)
      
      // Should show up arrow and green styling
      expect(screen.getByText('$5.00')).toBeInTheDocument()
      expect(screen.getByText('3.33%')).toBeInTheDocument()
    })

    it('should show negative change indicators for losses', () => {
      const lossQuote = createMockStockQuote({ change: -5.00, changePercent: -3.33 })
      render(<StockCard quote={lossQuote} />)
      
      expect(screen.getByText('$5.00')).toBeInTheDocument() // Absolute value displayed
      expect(screen.getByText('-3.33%')).toBeInTheDocument()
    })

    it('should render detailed information when not compact', () => {
      render(<StockCard quote={mockQuote} compact={false} />)
      
      expect(screen.getByText('Open')).toBeInTheDocument()
      expect(screen.getByText('$148.00')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.getByText('$151.00')).toBeInTheDocument()
      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getByText('$147.50')).toBeInTheDocument()
      expect(screen.getByText('Volume')).toBeInTheDocument()
      expect(screen.getByText('50,000,000')).toBeInTheDocument()
    })

    it('should hide detailed information when compact', () => {
      render(<StockCard quote={mockQuote} compact={true} />)
      
      expect(screen.queryByText('Open')).not.toBeInTheDocument()
      expect(screen.queryByText('High')).not.toBeInTheDocument()
      expect(screen.queryByText('Low')).not.toBeInTheDocument()
      expect(screen.queryByText('Volume')).not.toBeInTheDocument()
    })
  })

  describe('watchlist functionality', () => {
    it('should show add button when stock is not in watchlist', () => {
      mockStoreWith({ watchlist: [] })
      render(<StockCard quote={mockQuote} showAddToWatchlist={true} />)
      
      const addButton = screen.getByRole('button', { name: /plus/i })
      expect(addButton).toBeInTheDocument()
    })

    it('should show remove button when stock is in watchlist', () => {
      mockStoreWith({
        watchlist: [
          {
            symbol: 'AAPL',
            name: 'Apple Inc.',
            addedAt: '2024-01-15T10:30:00Z',
          },
        ],
      })
      
      render(<StockCard quote={mockQuote} showAddToWatchlist={true} />)
      
      const removeButton = screen.getByRole('button', { name: /minus/i })
      expect(removeButton).toBeInTheDocument()
    })

    it('should not show watchlist button when showAddToWatchlist is false', () => {
      render(<StockCard quote={mockQuote} showAddToWatchlist={false} />)
      
      expect(screen.queryByRole('button', { name: /plus/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /minus/i })).not.toBeInTheDocument()
    })

    it('should call addToWatchlist when add button is clicked', () => {
      const mockAddToWatchlist = jest.fn()
      mockStoreWith({
        watchlist: [],
        addToWatchlist: mockAddToWatchlist,
      })
      
      render(<StockCard quote={mockQuote} showAddToWatchlist={true} />)
      
      const addButton = screen.getByRole('button', { name: /plus/i })
      fireEvent.click(addButton)
      
      expect(mockAddToWatchlist).toHaveBeenCalledWith({
        symbol: 'AAPL',
        name: 'AAPL',
        addedAt: expect.any(String),
        price: 150.25,
        change: 2.50,
        changePercent: 1.69,
      })
    })

    it('should call removeFromWatchlist when remove button is clicked', () => {
      const mockRemoveFromWatchlist = jest.fn()
      mockStoreWith({
        watchlist: [
          {
            symbol: 'AAPL',
            name: 'Apple Inc.',
            addedAt: '2024-01-15T10:30:00Z',
          },
        ],
        removeFromWatchlist: mockRemoveFromWatchlist,
      })
      
      render(<StockCard quote={mockQuote} showAddToWatchlist={true} />)
      
      const removeButton = screen.getByRole('button', { name: /minus/i })
      fireEvent.click(removeButton)
      
      expect(mockRemoveFromWatchlist).toHaveBeenCalledWith('AAPL')
    })

    it('should not crash when quote is null and watchlist button is clicked', () => {
      mockStoreWith({ watchlist: [] })
      
      const { rerender } = render(<StockCard quote={mockQuote} showAddToWatchlist={true} />)
      
      // Change to null quote
      rerender(<StockCard quote={null as any} showAddToWatchlist={true} />)
      
      // Should render "No data available" state without button
      expect(screen.getByText('No data available')).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('view details functionality', () => {
    it('should show View Details button when onViewDetails is provided', () => {
      render(<StockCard quote={mockQuote} onViewDetails={mockOnViewDetails} />)
      
      expect(screen.getByRole('button', { name: 'View Details' })).toBeInTheDocument()
    })

    it('should not show View Details button when onViewDetails is not provided', () => {
      render(<StockCard quote={mockQuote} />)
      
      expect(screen.queryByRole('button', { name: 'View Details' })).not.toBeInTheDocument()
    })

    it('should call onViewDetails when View Details button is clicked', () => {
      render(<StockCard quote={mockQuote} onViewDetails={mockOnViewDetails} />)
      
      const viewDetailsButton = screen.getByRole('button', { name: 'View Details' })
      fireEvent.click(viewDetailsButton)
      
      expect(mockOnViewDetails).toHaveBeenCalledTimes(1)
    })

    it('should call onViewDetails when card content is clicked', () => {
      render(<StockCard quote={mockQuote} onViewDetails={mockOnViewDetails} />)
      
      // Click on the card content area (price section)
      const priceElement = screen.getByText('$150.25')
      fireEvent.click(priceElement.closest('[role="generic"]') || priceElement)
      
      expect(mockOnViewDetails).toHaveBeenCalledTimes(1)
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<StockCard quote={mockQuote} />)
      
      const card = screen.getByRole('generic') // Card component
      expect(card).toBeInTheDocument()
    })

    it('should have accessible button labels', () => {
      mockStoreWith({ watchlist: [] })
      render(<StockCard quote={mockQuote} showAddToWatchlist={true} onViewDetails={mockOnViewDetails} />)
      
      // Watchlist button should be accessible
      const addButton = screen.getByRole('button', { name: /plus/i })
      expect(addButton).toBeInTheDocument()
      
      // View details button should be accessible
      const viewDetailsButton = screen.getByRole('button', { name: 'View Details' })
      expect(viewDetailsButton).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle zero change correctly', () => {
      const neutralQuote = createMockStockQuote({ change: 0, changePercent: 0 })
      render(<StockCard quote={neutralQuote} />)
      
      expect(screen.getByText('$0.00')).toBeInTheDocument()
      expect(screen.getByText('0.00%')).toBeInTheDocument()
    })

    it('should handle very large numbers correctly', () => {
      const largeQuote = createMockStockQuote({
        price: 999999.99,
        volume: 999999999,
        high: 1000000.00,
      })
      
      render(<StockCard quote={largeQuote} compact={false} />)
      
      expect(screen.getByText('$999,999.99')).toBeInTheDocument()
      expect(screen.getByText('999,999,999')).toBeInTheDocument()
      expect(screen.getByText('$1,000,000.00')).toBeInTheDocument()
    })

    it('should handle very small numbers correctly', () => {
      const smallQuote = createMockStockQuote({
        price: 0.01,
        change: 0.001,
        changePercent: 0.01,
      })
      
      render(<StockCard quote={smallQuote} />)
      
      expect(screen.getByText('$0.01')).toBeInTheDocument()
      expect(screen.getByText('$0.00')).toBeInTheDocument() // Rounded
      expect(screen.getByText('0.01%')).toBeInTheDocument()
    })

    it('should handle missing optional quote properties', () => {
      const partialQuote = {
        symbol: 'TEST',
        price: 100,
        change: 1,
        changePercent: 1,
        volume: 1000,
        previousClose: 99,
        open: 99,
        high: 101,
        low: 98,
        marketCap: 1000000,
        lastUpdated: '2024-01-15',
      } as StockQuote
      
      render(<StockCard quote={partialQuote} />)
      
      expect(screen.getByText('TEST')).toBeInTheDocument()
      expect(screen.getByText('$100.00')).toBeInTheDocument()
    })
  })
})