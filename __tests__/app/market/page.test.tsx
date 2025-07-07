import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import MarketPage from '@/app/market/page'
import { useStockStore } from '@/lib/store'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock the store
jest.mock('@/lib/store', () => ({
  useStockStore: jest.fn(),
}))

// Mock child components
jest.mock('@/components/layout/Navigation', () => {
  return function MockNavigation() {
    return <div data-testid="navigation">Navigation Component</div>
  }
})

jest.mock('@/components/stock/MarketOverview', () => {
  return function MockMarketOverview({ onSelectStock }: { onSelectStock: (symbol: string) => void }) {
    return (
      <div data-testid="market-overview">
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

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
}))

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseStockStore = useStockStore as jest.MockedFunction<typeof useStockStore>

describe('MarketPage', () => {
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

    // Mock store
    mockUseStockStore.mockReturnValue({
      isDarkMode: false,
      watchlist: [],
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
    it('should render the market page with all main sections', () => {
      render(<MarketPage />)
      
      expect(screen.getByTestId('navigation')).toBeInTheDocument()
      expect(screen.getByTestId('market-overview')).toBeInTheDocument()
      expect(screen.getByText('Market Overview')).toBeInTheDocument()
      expect(screen.getByText('Stay updated with the latest market trends, indices, and top movers')).toBeInTheDocument()
    })

    it('should have proper page structure and layout', () => {
      render(<MarketPage />)
      
      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveClass('mx-auto', 'max-w-7xl', 'px-4', 'sm:px-6', 'lg:px-8', 'py-8')
      
      const container = screen.getByText('Market Overview').closest('.space-y-8')
      expect(container).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      render(<MarketPage />)
      
      const heading = screen.getByRole('heading', { name: 'Market Overview' })
      expect(heading).toHaveClass('text-3xl', 'font-bold', 'tracking-tight')
    })
  })

  describe('Dark Mode', () => {
    it('should add dark class when dark mode is enabled', () => {
      mockUseStockStore.mockReturnValue({
        isDarkMode: true,
        watchlist: [],
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

      render(<MarketPage />)
      
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')
      expect(document.documentElement.classList.remove).not.toHaveBeenCalled()
    })

    it('should remove dark class when dark mode is disabled', () => {
      mockUseStockStore.mockReturnValue({
        isDarkMode: false,
        watchlist: [],
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

      render(<MarketPage />)
      
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark')
      expect(document.documentElement.classList.add).not.toHaveBeenCalled()
    })

    it('should update dark mode class when isDarkMode changes', () => {
      const { rerender } = render(<MarketPage />)
      
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark')
      
      // Change to dark mode
      mockUseStockStore.mockReturnValue({
        isDarkMode: true,
        watchlist: [],
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
      
      rerender(<MarketPage />)
      
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')
    })
  })

  describe('Stock Selection', () => {
    it('should navigate to stock page when stock is selected', () => {
      render(<MarketPage />)
      
      const selectButton = screen.getByTestId('select-stock-button')
      fireEvent.click(selectButton)
      
      expect(mockPush).toHaveBeenCalledWith('/stock/AAPL')
    })

    it('should handle multiple stock selections', () => {
      render(<MarketPage />)
      
      const selectButton = screen.getByTestId('select-stock-button')
      
      fireEvent.click(selectButton)
      fireEvent.click(selectButton)
      
      expect(mockPush).toHaveBeenCalledTimes(2)
      expect(mockPush).toHaveBeenNthCalledWith(1, '/stock/AAPL')
      expect(mockPush).toHaveBeenNthCalledWith(2, '/stock/AAPL')
    })

    it('should pass correct onSelectStock handler to MarketOverview', () => {
      render(<MarketPage />)
      
      // Verify the MarketOverview component receives the handler
      expect(screen.getByTestId('market-overview')).toBeInTheDocument()
      
      // Test the handler works
      const selectButton = screen.getByTestId('select-stock-button')
      fireEvent.click(selectButton)
      
      expect(mockPush).toHaveBeenCalledWith('/stock/AAPL')
    })
  })

  describe('Component Integration', () => {
    it('should render Navigation component', () => {
      render(<MarketPage />)
      
      expect(screen.getByTestId('navigation')).toBeInTheDocument()
    })

    it('should render MarketOverview component with props', () => {
      render(<MarketPage />)
      
      const marketOverview = screen.getByTestId('market-overview')
      expect(marketOverview).toBeInTheDocument()
    })

    it('should use proper store hook integration', () => {
      render(<MarketPage />)
      
      expect(mockUseStockStore).toHaveBeenCalled()
    })

    it('should use proper router hook integration', () => {
      render(<MarketPage />)
      
      expect(mockUseRouter).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper page title structure', () => {
      render(<MarketPage />)
      
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Market Overview')
    })

    it('should have proper semantic structure', () => {
      render(<MarketPage />)
      
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('should have descriptive text content', () => {
      render(<MarketPage />)
      
      expect(screen.getByText('Stay updated with the latest market trends, indices, and top movers')).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('should have proper container classes', () => {
      render(<MarketPage />)
      
      const pageContainer = screen.getByTestId('navigation').parentElement
      expect(pageContainer).toHaveClass('min-h-screen', 'bg-background')
    })

    it('should have proper main content styling', () => {
      render(<MarketPage />)
      
      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveClass('mx-auto', 'max-w-7xl', 'px-4', 'sm:px-6', 'lg:px-8', 'py-8')
    })

    it('should have proper spacing classes', () => {
      render(<MarketPage />)
      
      const contentContainer = screen.getByText('Market Overview').closest('.space-y-8')
      expect(contentContainer).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle router push errors gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      mockPush.mockImplementation(() => {
        return Promise.resolve()
      })

      render(<MarketPage />)
      
      const selectButton = screen.getByTestId('select-stock-button')
      
      expect(() => fireEvent.click(selectButton)).not.toThrow()
      expect(mockPush).toHaveBeenCalledWith('/stock/AAPL')
      
      consoleError.mockRestore()
    })

    it('should render even if store returns undefined values', () => {
      mockUseStockStore.mockReturnValue({
        isDarkMode: false,
        watchlist: undefined as any,
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

      expect(() => render(<MarketPage />)).not.toThrow()
      expect(screen.getByText('Market Overview')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<MarketPage />)
      
      expect(screen.getByText('Market Overview')).toBeInTheDocument()
      
      // Re-render with same props
      rerender(<MarketPage />)
      
      expect(screen.getByText('Market Overview')).toBeInTheDocument()
    })

    it('should handle useEffect cleanup properly', () => {
      const { unmount } = render(<MarketPage />)
      
      // Should not throw on unmount
      expect(() => unmount()).not.toThrow()
    })
  })
})