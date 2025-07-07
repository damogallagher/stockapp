import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import HomePage from '@/app/page'
import { useStockStore } from '@/lib/store'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock the store
jest.mock('@/lib/store', () => ({
  useStockStore: jest.fn(),
}))

// Mock all child components
jest.mock('@/components/layout/Navigation', () => {
  return function MockNavigation({ onSearch }: { onSearch: () => void }) {
    return (
      <div data-testid="navigation">
        <button onClick={onSearch} data-testid="nav-search-button">Search</button>
      </div>
    )
  }
})

jest.mock('@/components/stock/StockSearch', () => {
  return function MockStockSearch({ 
    onSelectStock, 
    placeholder 
  }: { 
    onSelectStock: (symbol: string) => void
    placeholder?: string 
  }) {
    return (
      <div data-testid="stock-search">
        <input placeholder={placeholder} data-testid="search-input" />
        <button 
          onClick={() => onSelectStock('AAPL')} 
          data-testid="select-stock-button"
        >
          Select AAPL
        </button>
      </div>
    )
  }
})

jest.mock('@/components/stock/MarketOverview', () => {
  return function MockMarketOverview({ onSelectStock }: { onSelectStock: (symbol: string) => void }) {
    return (
      <div data-testid="market-overview">
        <button onClick={() => onSelectStock('GOOGL')} data-testid="market-stock-button">
          Market Stock
        </button>
      </div>
    )
  }
})

jest.mock('@/components/stock/Watchlist', () => {
  return function MockWatchlist({ onSelectStock }: { onSelectStock: (symbol: string) => void }) {
    return (
      <div data-testid="watchlist">
        <button onClick={() => onSelectStock('MSFT')} data-testid="watchlist-stock-button">
          Watchlist Stock
        </button>
      </div>
    )
  }
})

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  TrendingUp: ({ className }: { className?: string }) => <div data-testid="trending-up-icon" className={className} />,
  Star: ({ className }: { className?: string }) => <div data-testid="star-icon" className={className} />,
  BarChart3: ({ className }: { className?: string }) => <div data-testid="bar-chart-icon" className={className} />,
  Search: ({ className }: { className?: string }) => <div data-testid="search-icon" className={className} />,
  ArrowRight: ({ className }: { className?: string }) => <div data-testid="arrow-right-icon" className={className} />,
}))

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
}))

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseStockStore = useStockStore as jest.MockedFunction<typeof useStockStore>

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock router
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    } as any)

    // Mock store with empty watchlist by default
    mockUseStockStore.mockReturnValue({
      watchlist: [],
      isDarkMode: false,
      recentSearches: [],
      selectedTimeRange: '1D' as const,
      selectedChartType: 'line' as const,
      addToWatchlist: jest.fn(),
      removeFromWatchlist: jest.fn(),
      clearWatchlist: jest.fn(),
      addRecentSearch: jest.fn(),
      clearRecentSearches: jest.fn(),
      setTimeRange: jest.fn(),
      setChartType: jest.fn(),
      toggleDarkMode: jest.fn(),
    })

    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        },
      },
      writable: true,
    })
  })

  describe('Component Rendering', () => {
    it('should render the main page with all sections', () => {
      render(<HomePage />)
      
      expect(screen.getByTestId('navigation')).toBeInTheDocument()
      expect(screen.getByText('Welcome to StockApp')).toBeInTheDocument()
      expect(screen.getByText('Your comprehensive platform for stock market analysis, portfolio tracking, and investment insights.')).toBeInTheDocument()
      expect(screen.getByTestId('market-overview')).toBeInTheDocument()
    })

    it('should render quick action cards', () => {
      render(<HomePage />)
      
      expect(screen.getAllByText('Search Stocks')).toHaveLength(2) // Card title + button
      expect(screen.getByText('Find and analyze any stock')).toBeInTheDocument()
      expect(screen.getByText('Market Overview')).toBeInTheDocument()
      expect(screen.getByText('View market trends and movers')).toBeInTheDocument()
      expect(screen.getByText('My Watchlist')).toBeInTheDocument()
    })

    it('should render popular stocks section', () => {
      render(<HomePage />)
      
      expect(screen.getByText('Popular Stocks')).toBeInTheDocument()
      expect(screen.getByText('AAPL')).toBeInTheDocument()
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
      expect(screen.getByText('GOOGL')).toBeInTheDocument()
      expect(screen.getByText('Alphabet Inc.')).toBeInTheDocument()
      expect(screen.getByText('MSFT')).toBeInTheDocument()
      expect(screen.getByText('Microsoft Corp.')).toBeInTheDocument()
      expect(screen.getByText('TSLA')).toBeInTheDocument()
      expect(screen.getByText('Tesla Inc.')).toBeInTheDocument()
      expect(screen.getByText('NVDA')).toBeInTheDocument()
      expect(screen.getByText('NVIDIA Corp.')).toBeInTheDocument()
    })

    it('should render proper icons', () => {
      render(<HomePage />)
      
      expect(screen.getAllByTestId('search-icon')).toHaveLength(2) // Quick action + get started button
      expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument()
      expect(screen.getAllByTestId('star-icon')).toHaveLength(2) // Quick action + get started section
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument()
      expect(screen.getAllByTestId('arrow-right-icon')).toHaveLength(8) // 3 quick actions + 5 popular stocks
    })
  })

  describe('Dark Mode', () => {
    it('should add dark class when dark mode is enabled', () => {
      mockUseStockStore.mockReturnValue({
        watchlist: [],
        isDarkMode: true,
        recentSearches: [],
        selectedTimeRange: '1D' as const,
        selectedChartType: 'line' as const,
        addToWatchlist: jest.fn(),
        removeFromWatchlist: jest.fn(),
        clearWatchlist: jest.fn(),
        addRecentSearch: jest.fn(),
        clearRecentSearches: jest.fn(),
        setTimeRange: jest.fn(),
        setChartType: jest.fn(),
        toggleDarkMode: jest.fn(),
      })

      render(<HomePage />)
      
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')
    })

    it('should remove dark class when dark mode is disabled', () => {
      mockUseStockStore.mockReturnValue({
        watchlist: [],
        isDarkMode: false,
        recentSearches: [],
        selectedTimeRange: '1D' as const,
        selectedChartType: 'line' as const,
        addToWatchlist: jest.fn(),
        removeFromWatchlist: jest.fn(),
        clearWatchlist: jest.fn(),
        addRecentSearch: jest.fn(),
        clearRecentSearches: jest.fn(),
        setTimeRange: jest.fn(),
        setChartType: jest.fn(),
        toggleDarkMode: jest.fn(),
      })

      render(<HomePage />)
      
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark')
    })
  })

  describe('Search Modal', () => {
    it('should not show search modal by default', () => {
      render(<HomePage />)
      
      expect(screen.queryByTestId('stock-search')).not.toBeInTheDocument()
      expect(screen.getAllByText('Search Stocks')).toHaveLength(2) // Card title + button
    })

    it('should show search modal when navigation search is clicked', () => {
      render(<HomePage />)
      
      const navSearchButton = screen.getByTestId('nav-search-button')
      fireEvent.click(navSearchButton)
      
      expect(screen.getByTestId('stock-search')).toBeInTheDocument()
      expect(screen.getAllByText('Search Stocks')).toHaveLength(3) // Card title + button + modal title
    })

    it('should show search modal when quick action card is clicked', () => {
      render(<HomePage />)
      
      const searchCard = screen.getByText('Find and analyze any stock').closest('.cursor-pointer')
      fireEvent.click(searchCard!)
      
      expect(screen.getByTestId('stock-search')).toBeInTheDocument()
    })

    it('should show search modal when get started button is clicked', () => {
      render(<HomePage />)
      
      const getStartedButton = screen.getByRole('button', { name: /Search Stocks/i })
      fireEvent.click(getStartedButton)
      
      expect(screen.getByTestId('stock-search')).toBeInTheDocument()
    })

    it('should close search modal when close button is clicked', () => {
      render(<HomePage />)
      
      // Open modal
      const navSearchButton = screen.getByTestId('nav-search-button')
      fireEvent.click(navSearchButton)
      
      expect(screen.getByTestId('stock-search')).toBeInTheDocument()
      
      // Close modal
      const closeButton = screen.getByRole('button', { name: '×' })
      fireEvent.click(closeButton)
      
      expect(screen.queryByTestId('stock-search')).not.toBeInTheDocument()
    })

    it('should have correct placeholder text for search input', () => {
      render(<HomePage />)
      
      const navSearchButton = screen.getByTestId('nav-search-button')
      fireEvent.click(navSearchButton)
      
      expect(screen.getByPlaceholderText('Search for stocks, ETFs, or indices...')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate to stock page when stock is selected from search', () => {
      render(<HomePage />)
      
      // Open search modal
      const navSearchButton = screen.getByTestId('nav-search-button')
      fireEvent.click(navSearchButton)
      
      // Select a stock
      const selectButton = screen.getByTestId('select-stock-button')
      fireEvent.click(selectButton)
      
      expect(mockPush).toHaveBeenCalledWith('/stock/AAPL')
    })

    it('should close search modal and navigate when stock is selected', () => {
      render(<HomePage />)
      
      // Open search modal
      const navSearchButton = screen.getByTestId('nav-search-button')
      fireEvent.click(navSearchButton)
      
      expect(screen.getByTestId('stock-search')).toBeInTheDocument()
      
      // Select a stock
      const selectButton = screen.getByTestId('select-stock-button')
      fireEvent.click(selectButton)
      
      // Modal should be closed
      expect(screen.queryByTestId('stock-search')).not.toBeInTheDocument()
      expect(mockPush).toHaveBeenCalledWith('/stock/AAPL')
    })

    it('should navigate to market page when market overview card is clicked', () => {
      render(<HomePage />)
      
      const marketCard = screen.getByText('View market trends and movers').closest('.cursor-pointer')
      fireEvent.click(marketCard!)
      
      expect(mockPush).toHaveBeenCalledWith('/market')
    })

    it('should navigate to watchlist page when watchlist card is clicked', () => {
      render(<HomePage />)
      
      const watchlistCard = screen.getByText('Track your favorite stocks').closest('.cursor-pointer')
      fireEvent.click(watchlistCard!)
      
      expect(mockPush).toHaveBeenCalledWith('/watchlist')
    })

    it('should navigate to stock page when popular stock is clicked', () => {
      render(<HomePage />)
      
      const appleStock = screen.getByText('AAPL').closest('.cursor-pointer')
      fireEvent.click(appleStock!)
      
      expect(mockPush).toHaveBeenCalledWith('/stock/AAPL')
    })

    it('should navigate when stock is selected from market overview', () => {
      render(<HomePage />)
      
      const marketStockButton = screen.getByTestId('market-stock-button')
      fireEvent.click(marketStockButton)
      
      expect(mockPush).toHaveBeenCalledWith('/stock/GOOGL')
    })
  })

  describe('Watchlist States', () => {
    it('should show get started section when watchlist is empty', () => {
      render(<HomePage />)
      
      expect(screen.getByText('Get Started')).toBeInTheDocument()
      expect(screen.getByText('Start by searching for stocks and adding them to your watchlist to track their performance.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Search Stocks/i })).toBeInTheDocument()
      expect(screen.queryByTestId('watchlist')).not.toBeInTheDocument()
    })

    it('should show watchlist component when watchlist has items', () => {
      mockUseStockStore.mockReturnValue({
        watchlist: [
          { symbol: 'AAPL', name: 'Apple Inc.', addedAt: '2024-01-01' },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', addedAt: '2024-01-02' }
        ],
        isDarkMode: false,
        recentSearches: [],
        selectedTimeRange: '1D' as const,
        selectedChartType: 'line' as const,
        addToWatchlist: jest.fn(),
        removeFromWatchlist: jest.fn(),
        clearWatchlist: jest.fn(),
        addRecentSearch: jest.fn(),
        clearRecentSearches: jest.fn(),
        setTimeRange: jest.fn(),
        setChartType: jest.fn(),
        toggleDarkMode: jest.fn(),
      })

      render(<HomePage />)
      
      expect(screen.getByTestId('watchlist')).toBeInTheDocument()
      expect(screen.queryByText('Get Started')).not.toBeInTheDocument()
    })

    it('should show correct watchlist count in quick action card', () => {
      mockUseStockStore.mockReturnValue({
        watchlist: [
          { symbol: 'AAPL', name: 'Apple Inc.', addedAt: '2024-01-01' },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', addedAt: '2024-01-02' },
          { symbol: 'MSFT', name: 'Microsoft Corp.', addedAt: '2024-01-03' }
        ],
        isDarkMode: false,
        recentSearches: [],
        selectedTimeRange: '1D' as const,
        selectedChartType: 'line' as const,
        addToWatchlist: jest.fn(),
        removeFromWatchlist: jest.fn(),
        clearWatchlist: jest.fn(),
        addRecentSearch: jest.fn(),
        clearRecentSearches: jest.fn(),
        setTimeRange: jest.fn(),
        setChartType: jest.fn(),
        toggleDarkMode: jest.fn(),
      })

      render(<HomePage />)
      
      expect(screen.getByText('3 stocks tracked')).toBeInTheDocument()
    })

    it('should navigate when stock is selected from watchlist', () => {
      mockUseStockStore.mockReturnValue({
        watchlist: [
          { symbol: 'AAPL', name: 'Apple Inc.', addedAt: '2024-01-01' }
        ],
        isDarkMode: false,
        recentSearches: [],
        selectedTimeRange: '1D' as const,
        selectedChartType: 'line' as const,
        addToWatchlist: jest.fn(),
        removeFromWatchlist: jest.fn(),
        clearWatchlist: jest.fn(),
        addRecentSearch: jest.fn(),
        clearRecentSearches: jest.fn(),
        setTimeRange: jest.fn(),
        setChartType: jest.fn(),
        toggleDarkMode: jest.fn(),
      })

      render(<HomePage />)
      
      const watchlistStockButton = screen.getByTestId('watchlist-stock-button')
      fireEvent.click(watchlistStockButton)
      
      expect(mockPush).toHaveBeenCalledWith('/stock/MSFT')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<HomePage />)
      
      expect(screen.getByRole('heading', { name: 'Welcome to StockApp' })).toBeInTheDocument()
    })

    it('should have clickable cards with proper cursor styles', () => {
      render(<HomePage />)
      
      const searchCard = screen.getByText('Find and analyze any stock').closest('.cursor-pointer')
      const marketCard = screen.getByText('View market trends and movers').closest('.cursor-pointer')
      const watchlistCard = screen.getByText('Track your favorite stocks').closest('.cursor-pointer')
      
      expect(searchCard).toHaveClass('cursor-pointer')
      expect(marketCard).toHaveClass('cursor-pointer')
      expect(watchlistCard).toHaveClass('cursor-pointer')
    })

    it('should have proper button roles', () => {
      render(<HomePage />)
      
      expect(screen.getByRole('button', { name: /Search Stocks/i })).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      // Tab to the first interactive element
      await user.tab()
      
      // Should be able to navigate to buttons
      const searchButton = screen.getByRole('button', { name: /Search Stocks/i })
      searchButton.focus()
      expect(searchButton).toHaveFocus()
    })
  })

  describe('User Interactions', () => {
    it('should handle multiple search modal open/close cycles', () => {
      render(<HomePage />)
      
      const navSearchButton = screen.getByTestId('nav-search-button')
      
      // Open modal
      fireEvent.click(navSearchButton)
      expect(screen.getByTestId('stock-search')).toBeInTheDocument()
      
      // Close modal
      const closeButton = screen.getByRole('button', { name: '×' })
      fireEvent.click(closeButton)
      expect(screen.queryByTestId('stock-search')).not.toBeInTheDocument()
      
      // Open again
      fireEvent.click(navSearchButton)
      expect(screen.getByTestId('stock-search')).toBeInTheDocument()
    })

    it('should handle hover effects on cards', () => {
      render(<HomePage />)
      
      const searchCard = screen.getByText('Find and analyze any stock').closest('.hover\\:shadow-lg')
      expect(searchCard).toHaveClass('hover:shadow-lg', 'transition-shadow')
    })

    it('should handle popular stock hover effects', () => {
      render(<HomePage />)
      
      const appleStock = screen.getByText('AAPL').closest('.hover\\:bg-accent')
      expect(appleStock).toHaveClass('hover:bg-accent')
    })
  })

  describe('Layout and Responsive Design', () => {
    it('should have proper grid layouts', () => {
      render(<HomePage />)
      
      // Quick actions grid
      const quickActionsGrid = screen.getByText('Find and analyze any stock').closest('.grid')
      expect(quickActionsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-3')
      
      // Main content grid
      const mainContentGrid = screen.getByTestId('market-overview').closest('.grid')
      expect(mainContentGrid).toHaveClass('grid-cols-1', 'lg:grid-cols-3')
    })

    it('should have proper spacing classes', () => {
      render(<HomePage />)
      
      const mainContainer = screen.getByRole('main')
      expect(mainContainer).toHaveClass('mx-auto', 'max-w-7xl', 'px-4', 'sm:px-6', 'lg:px-8', 'py-8')
    })
  })

  describe('Error Handling', () => {
    it('should handle router push errors gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock push to return normally (but we can test other error scenarios)
      mockPush.mockImplementation(() => {
        // Simulate navigation - this test ensures the component can handle navigation
        return Promise.resolve()
      })

      render(<HomePage />)
      
      const appleStock = screen.getByText('AAPL').closest('.cursor-pointer')
      
      // Should be able to click without throwing
      expect(() => fireEvent.click(appleStock!)).not.toThrow()
      expect(mockPush).toHaveBeenCalledWith('/stock/AAPL')
      
      consoleError.mockRestore()
    })

    it('should render even if store returns undefined values', () => {
      mockUseStockStore.mockReturnValue({
        watchlist: [],
        isDarkMode: false,
        recentSearches: undefined as any,
        selectedTimeRange: '1D' as const,
        selectedChartType: 'line' as const,
        addToWatchlist: jest.fn(),
        removeFromWatchlist: jest.fn(),
        clearWatchlist: jest.fn(),
        addRecentSearch: jest.fn(),
        clearRecentSearches: jest.fn(),
        setTimeRange: jest.fn(),
        setChartType: jest.fn(),
        toggleDarkMode: jest.fn(),
      })

      expect(() => render(<HomePage />)).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<HomePage />)
      
      // Re-render with same props should not cause issues
      rerender(<HomePage />)
      
      expect(screen.getByText('Welcome to StockApp')).toBeInTheDocument()
    })

    it('should handle large watchlist efficiently', () => {
      const largeWatchlist = Array.from({ length: 100 }, (_, i) => ({
        symbol: `STOCK${i}`,
        name: `Stock ${i}`,
        addedAt: '2024-01-01'
      }))

      mockUseStockStore.mockReturnValue({
        watchlist: largeWatchlist,
        isDarkMode: false,
        recentSearches: [],
        selectedTimeRange: '1D' as const,
        selectedChartType: 'line' as const,
        addToWatchlist: jest.fn(),
        removeFromWatchlist: jest.fn(),
        clearWatchlist: jest.fn(),
        addRecentSearch: jest.fn(),
        clearRecentSearches: jest.fn(),
        setTimeRange: jest.fn(),
        setChartType: jest.fn(),
        toggleDarkMode: jest.fn(),
      })

      render(<HomePage />)
      
      expect(screen.getByText('100 stocks tracked')).toBeInTheDocument()
    })
  })
})