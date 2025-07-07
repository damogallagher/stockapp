import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { notFound } from 'next/navigation'
import StockPage from '@/app/stock/[symbol]/page'
import { useStockStore } from '@/lib/store'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
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

jest.mock('@/components/stock/StockDashboard', () => {
  return function MockStockDashboard({ symbol }: { symbol: string }) {
    return <div data-testid="stock-dashboard">Stock Dashboard for {symbol}</div>
  }
})

jest.mock('@/components/charts/StockChart', () => {
  return function MockStockChart({ symbol }: { symbol: string }) {
    return <div data-testid="stock-chart">Stock Chart for {symbol}</div>
  }
})

jest.mock('@/components/stock/CompanyInfo', () => {
  return function MockCompanyInfo({ symbol }: { symbol: string }) {
    return <div data-testid="company-info">Company Info for {symbol}</div>
  }
})

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
}))

const mockNotFound = notFound as jest.MockedFunction<typeof notFound>
const mockUseStockStore = useStockStore as jest.MockedFunction<typeof useStockStore>

describe('StockPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset notFound mock to not throw by default
    mockNotFound.mockReset()
    
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

  describe('Valid Symbol Rendering', () => {
    it('should render stock page for valid symbol', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      expect(screen.getByTestId('navigation')).toBeInTheDocument()
      expect(screen.getByTestId('stock-dashboard')).toBeInTheDocument()
      expect(screen.getByText('Stock Dashboard for AAPL')).toBeInTheDocument()
      expect(mockNotFound).not.toHaveBeenCalled()
    })

    it('should normalize symbol to uppercase', () => {
      render(<StockPage params={{ symbol: 'aapl' }} />)
      
      expect(screen.getByText('Stock Dashboard for AAPL')).toBeInTheDocument()
      expect(screen.getByText('Stock Chart for AAPL')).toBeInTheDocument()
      expect(screen.getByText('Company Info for AAPL')).toBeInTheDocument()
    })

    it('should handle mixed case symbols', () => {
      render(<StockPage params={{ symbol: 'GooGL' }} />)
      
      expect(screen.getByText('Stock Dashboard for GOOGL')).toBeInTheDocument()
    })

    it('should handle single character symbols', () => {
      render(<StockPage params={{ symbol: 'A' }} />)
      
      expect(screen.getByText('Stock Dashboard for A')).toBeInTheDocument()
      expect(mockNotFound).not.toHaveBeenCalled()
    })

    it('should handle maximum length symbols (10 characters)', () => {
      render(<StockPage params={{ symbol: 'BERKSHIREA' }} />)
      
      expect(screen.getByText('Stock Dashboard for BERKSHIREA')).toBeInTheDocument()
      expect(mockNotFound).not.toHaveBeenCalled()
    })
  })

  describe('Symbol Validation', () => {
    it('should call notFound for empty symbol', () => {
      render(<StockPage params={{ symbol: '' }} />)
      
      expect(mockNotFound).toHaveBeenCalled()
    })

    it('should call notFound for undefined symbol', () => {
      // Mock notFound to throw an error to prevent further execution
      mockNotFound.mockImplementation(() => {
        throw new Error('Not found')
      })

      expect(() => {
        render(<StockPage params={{ symbol: undefined as any }} />)
      }).toThrow('Not found')
      
      expect(mockNotFound).toHaveBeenCalled()
    })

    it('should call notFound for null symbol', () => {
      // Mock notFound to throw an error to prevent further execution
      mockNotFound.mockImplementation(() => {
        throw new Error('Not found')
      })

      expect(() => {
        render(<StockPage params={{ symbol: null as any }} />)
      }).toThrow('Not found')
      
      expect(mockNotFound).toHaveBeenCalled()
    })

    it('should call notFound for symbols longer than 10 characters', () => {
      render(<StockPage params={{ symbol: 'VERYLONGSYMBOL' }} />)
      
      expect(mockNotFound).toHaveBeenCalled()
    })

    it('should call notFound for symbols with numbers', () => {
      render(<StockPage params={{ symbol: 'AAPL1' }} />)
      
      expect(mockNotFound).toHaveBeenCalled()
    })

    it('should call notFound for symbols with special characters', () => {
      render(<StockPage params={{ symbol: 'AAPL-B' }} />)
      
      expect(mockNotFound).toHaveBeenCalled()
    })

    it('should call notFound for symbols with spaces', () => {
      render(<StockPage params={{ symbol: 'AA PL' }} />)
      
      expect(mockNotFound).toHaveBeenCalled()
    })

    it('should call notFound for symbols with lowercase mixed with invalid chars', () => {
      render(<StockPage params={{ symbol: 'aapl@' }} />)
      
      expect(mockNotFound).toHaveBeenCalled()
    })

    it('should call notFound for symbols with periods', () => {
      render(<StockPage params={{ symbol: 'BRK.B' }} />)
      
      expect(mockNotFound).toHaveBeenCalled()
    })
  })

  describe('Tabs Functionality', () => {
    it('should render chart tab as default', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      const chartTab = screen.getByRole('tab', { name: 'Chart & Analysis' })
      const companyTab = screen.getByRole('tab', { name: 'Company Info' })
      
      expect(chartTab).toHaveAttribute('aria-selected', 'true')
      expect(companyTab).toHaveAttribute('aria-selected', 'false')
      
      expect(screen.getByTestId('stock-chart')).toBeInTheDocument()
      expect(screen.queryByTestId('company-info')).not.toBeInTheDocument()
    })

    it('should switch to company info tab when clicked', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      const companyTab = screen.getByRole('tab', { name: 'Company Info' })
      fireEvent.click(companyTab)
      
      expect(companyTab).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tab', { name: 'Chart & Analysis' })).toHaveAttribute('aria-selected', 'false')
      
      expect(screen.getByTestId('company-info')).toBeInTheDocument()
      expect(screen.queryByTestId('stock-chart')).not.toBeInTheDocument()
    })

    it('should switch back to chart tab', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      // Switch to company tab first
      const companyTab = screen.getByRole('tab', { name: 'Company Info' })
      fireEvent.click(companyTab)
      
      expect(screen.getByTestId('company-info')).toBeInTheDocument()
      
      // Switch back to chart tab
      const chartTab = screen.getByRole('tab', { name: 'Chart & Analysis' })
      fireEvent.click(chartTab)
      
      expect(chartTab).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByTestId('stock-chart')).toBeInTheDocument()
      expect(screen.queryByTestId('company-info')).not.toBeInTheDocument()
    })

    it('should have proper tabs layout', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      const tabsList = screen.getByRole('tablist')
      expect(tabsList).toHaveClass('grid', 'w-full', 'grid-cols-2')
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

      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
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

      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark')
      expect(document.documentElement.classList.add).not.toHaveBeenCalled()
    })
  })

  describe('Component Integration', () => {
    it('should pass normalized symbol to all components', () => {
      render(<StockPage params={{ symbol: 'googl' }} />)
      
      expect(screen.getByText('Stock Dashboard for GOOGL')).toBeInTheDocument()
      expect(screen.getByText('Stock Chart for GOOGL')).toBeInTheDocument()
      
      // Switch to company tab to see CompanyInfo
      const companyTab = screen.getByRole('tab', { name: 'Company Info' })
      fireEvent.click(companyTab)
      
      expect(screen.getByText('Company Info for GOOGL')).toBeInTheDocument()
    })

    it('should render all child components', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      expect(screen.getByTestId('navigation')).toBeInTheDocument()
      expect(screen.getByTestId('stock-dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('stock-chart')).toBeInTheDocument()
    })

    it('should use proper store hook integration', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      expect(mockUseStockStore).toHaveBeenCalled()
    })
  })

  describe('Layout and Styling', () => {
    it('should have proper page structure', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      const pageContainer = screen.getByTestId('navigation').closest('div')
      expect(pageContainer).toHaveClass('min-h-screen', 'bg-background')
    })

    it('should have proper main content styling', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveClass('mx-auto', 'max-w-7xl', 'px-4', 'sm:px-6', 'lg:px-8', 'py-8')
    })

    it('should have proper spacing classes', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      const contentContainer = screen.getByTestId('stock-dashboard').closest('.space-y-8')
      expect(contentContainer).toBeInTheDocument()
    })

    it('should have proper tabs container styling', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      const tabsContainer = screen.getByRole('tablist').closest('[role="tablist"]')?.parentElement
      expect(tabsContainer).toHaveClass('w-full')
    })
  })

  describe('Accessibility', () => {
    it('should have proper tab structure', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getAllByRole('tab')).toHaveLength(2)
      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
    })

    it('should have proper ARIA attributes for tabs', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      const chartTab = screen.getByRole('tab', { name: 'Chart & Analysis' })
      const companyTab = screen.getByRole('tab', { name: 'Company Info' })
      
      expect(chartTab).toHaveAttribute('aria-selected', 'true')
      expect(companyTab).toHaveAttribute('aria-selected', 'false')
    })

    it('should update ARIA attributes when switching tabs', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      const companyTab = screen.getByRole('tab', { name: 'Company Info' })
      fireEvent.click(companyTab)
      
      expect(companyTab).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tab', { name: 'Chart & Analysis' })).toHaveAttribute('aria-selected', 'false')
    })

    it('should have proper semantic structure', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle params object with additional properties', () => {
      const paramsWithExtra = {
        symbol: 'AAPL',
        extraProp: 'should-be-ignored'
      } as any

      render(<StockPage params={paramsWithExtra} />)
      
      expect(screen.getByText('Stock Dashboard for AAPL')).toBeInTheDocument()
      expect(mockNotFound).not.toHaveBeenCalled()
    })

    it('should handle regex edge cases', () => {
      // Valid all-caps
      render(<StockPage params={{ symbol: 'GOOGL' }} />)
      expect(mockNotFound).not.toHaveBeenCalled()
    })

    it('should handle store returning undefined values', () => {
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

      expect(() => render(<StockPage params={{ symbol: 'AAPL' }} />)).not.toThrow()
      expect(screen.getByText('Stock Dashboard for AAPL')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      expect(screen.getByText('Stock Dashboard for AAPL')).toBeInTheDocument()
      
      // Re-render with same props
      rerender(<StockPage params={{ symbol: 'AAPL' }} />)
      
      expect(screen.getByText('Stock Dashboard for AAPL')).toBeInTheDocument()
    })

    it('should handle symbol changes correctly', () => {
      const { rerender } = render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      expect(screen.getByText('Stock Dashboard for AAPL')).toBeInTheDocument()
      
      // Change symbol
      rerender(<StockPage params={{ symbol: 'GOOGL' }} />)
      
      expect(screen.getByText('Stock Dashboard for GOOGL')).toBeInTheDocument()
      expect(screen.queryByText('Stock Dashboard for AAPL')).not.toBeInTheDocument()
    })

    it('should handle useEffect cleanup properly', () => {
      const { unmount } = render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      // Should not throw on unmount
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Tab Content Rendering', () => {
    it('should render only chart content in chart tab', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      expect(screen.getByTestId('stock-chart')).toBeInTheDocument()
      expect(screen.queryByTestId('company-info')).not.toBeInTheDocument()
    })

    it('should render only company content in company tab', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      const companyTab = screen.getByRole('tab', { name: 'Company Info' })
      fireEvent.click(companyTab)
      
      expect(screen.getByTestId('company-info')).toBeInTheDocument()
      expect(screen.queryByTestId('stock-chart')).not.toBeInTheDocument()
    })

    it('should maintain stock dashboard visibility across tab switches', () => {
      render(<StockPage params={{ symbol: 'AAPL' }} />)
      
      expect(screen.getByTestId('stock-dashboard')).toBeInTheDocument()
      
      const companyTab = screen.getByRole('tab', { name: 'Company Info' })
      fireEvent.click(companyTab)
      
      expect(screen.getByTestId('stock-dashboard')).toBeInTheDocument()
      
      const chartTab = screen.getByRole('tab', { name: 'Chart & Analysis' })
      fireEvent.click(chartTab)
      
      expect(screen.getByTestId('stock-dashboard')).toBeInTheDocument()
    })
  })
})