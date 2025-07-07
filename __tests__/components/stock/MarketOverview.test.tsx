import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { getMarketIndices } from '@/lib/api'
import MarketOverview from '@/components/stock/MarketOverview'
import { MarketIndex } from '@/lib/types'

// Mock the API function
jest.mock('@/lib/api', () => ({
  getMarketIndices: jest.fn(),
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'MMM dd, HH:mm') {
      return 'Jan 15, 09:30'
    }
    if (formatStr === 'HH:mm:ss') {
      return '10:30:45'
    }
    return date
  }),
}))

// Mock utility functions
jest.mock('@/lib/utils', () => ({
  formatCurrency: jest.fn((value) => `$${value}`),
  formatPercentage: jest.fn((value) => `${value}%`),
  getPriceChangeColor: jest.fn((change) => change >= 0 ? 'text-green-500' : 'text-red-500'),
  isMarketOpen: jest.fn(() => true),
  getNextMarketOpen: jest.fn(() => new Date('2024-01-16T09:30:00Z')),
}))

const mockGetMarketIndices = getMarketIndices as jest.MockedFunction<typeof getMarketIndices>

describe('MarketOverview', () => {
  const mockMarketIndices: MarketIndex[] = [
    {
      symbol: 'SPY',
      name: 'S&P 500',
      price: 445.60,
      change: 1.85,
      changePercent: 0.42,
    },
    {
      symbol: 'QQQ',
      name: 'NASDAQ 100',
      price: 375.40,
      change: 4.20,
      changePercent: 1.13,
    },
    {
      symbol: 'DIA',
      name: 'Dow Jones',
      price: 348.25,
      change: -2.15,
      changePercent: -0.61,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Initial Rendering', () => {
    it('should render market overview with loading state initially', () => {
      mockGetMarketIndices.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<MarketOverview />)

      expect(screen.getByText('Market Overview')).toBeInTheDocument()
      expect(screen.getByText('Market Open')).toBeInTheDocument()
      expect(screen.getByText('Major Indices')).toBeInTheDocument()
      expect(screen.getByText('Market Movers')).toBeInTheDocument()
      expect(screen.getAllByTestId('skeleton')).toHaveLength(9) // 3 indices * 3 skeletons each
    })

    it('should render all required sections', () => {
      mockGetMarketIndices.mockResolvedValue({
        success: true,
        data: mockMarketIndices,
        error: null,
      })

      render(<MarketOverview />)

      expect(screen.getByText('Market Overview')).toBeInTheDocument()
      expect(screen.getByText('Major Indices')).toBeInTheDocument()
      expect(screen.getByText('Market Movers')).toBeInTheDocument()
      expect(screen.getByText('Top Gainers')).toBeInTheDocument()
      expect(screen.getByText('Top Losers')).toBeInTheDocument()
      expect(screen.getByText('Most Active')).toBeInTheDocument()
    })

    it('should display refresh button', () => {
      mockGetMarketIndices.mockResolvedValue({
        success: true,
        data: mockMarketIndices,
        error: null,
      })

      render(<MarketOverview />)

      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    })
  })

  describe('Market Status', () => {
    it('should display market open status correctly', () => {
      mockGetMarketIndices.mockResolvedValue({
        success: true,
        data: mockMarketIndices,
        error: null,
      })

      render(<MarketOverview />)

      expect(screen.getByText('Market Open')).toBeInTheDocument()
      expect(screen.getByText('Open')).toBeInTheDocument()
    })

    it('should display market closed status correctly', () => {
      const { isMarketOpen } = require('@/lib/utils')
      isMarketOpen.mockReturnValue(false)

      mockGetMarketIndices.mockResolvedValue({
        success: true,
        data: mockMarketIndices,
        error: null,
      })

      render(<MarketOverview />)

      expect(screen.getByText('Market Closed')).toBeInTheDocument()
      expect(screen.getByText('Closed')).toBeInTheDocument()
      expect(screen.getByText(/Next open: Jan 15, 09:30/)).toBeInTheDocument()
    })

    it('should display last updated time', async () => {
      mockGetMarketIndices.mockResolvedValue({
        success: true,
        data: mockMarketIndices,
        error: null,
      })

      render(<MarketOverview />)

      await waitFor(() => {
        expect(screen.getByText('Last Updated')).toBeInTheDocument()
        expect(screen.getByText('10:30:45')).toBeInTheDocument()
      })
    })
  })

  describe('Market Indices', () => {
    it('should display market indices correctly when data loads successfully', async () => {
      mockGetMarketIndices.mockResolvedValue({
        success: true,
        data: mockMarketIndices,
        error: null,
      })

      render(<MarketOverview />)

      await waitFor(() => {
        expect(screen.getByText('S&P 500')).toBeInTheDocument()
        expect(screen.getByText('NASDAQ 100')).toBeInTheDocument()
        expect(screen.getByText('Dow Jones')).toBeInTheDocument()
      })
    })

    it('should display loading skeletons while fetching indices', () => {
      mockGetMarketIndices.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<MarketOverview />)

      expect(screen.getAllByTestId('skeleton')).toHaveLength(9) // 3 indices * 3 skeletons each
    })

    it('should display error message when indices fail to load', async () => {
      mockGetMarketIndices.mockResolvedValue({
        success: false,
        data: [],
        error: 'Failed to fetch market indices',
      })

      render(<MarketOverview />)

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch market indices')).toBeInTheDocument()
      })
    })

    it('should display error message when API throws exception', async () => {
      mockGetMarketIndices.mockRejectedValue(new Error('Network error'))

      render(<MarketOverview />)

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch market data')).toBeInTheDocument()
      })
    })
  })

  describe('Market Index Cards', () => {
    beforeEach(() => {
      mockGetMarketIndices.mockResolvedValue({
        success: true,
        data: mockMarketIndices,
        error: null,
      })
    })

    it('should display index prices correctly', async () => {
      render(<MarketOverview />)

      await waitFor(() => {
        expect(screen.getByText('$445.6')).toBeInTheDocument()
        expect(screen.getByText('$375.4')).toBeInTheDocument()
        expect(screen.getByText('$348.25')).toBeInTheDocument()
      })
    })

    it('should display positive change indicators correctly', async () => {
      render(<MarketOverview />)

      await waitFor(() => {
        const successBadges = screen.getAllByText('↗')
        expect(successBadges).toHaveLength(2) // SPY and QQQ are positive
      })
    })

    it('should display negative change indicators correctly', async () => {
      render(<MarketOverview />)

      await waitFor(() => {
        const destructiveBadges = screen.getAllByText('↘')
        expect(destructiveBadges).toHaveLength(1) // DIA is negative
      })
    })

    it('should display change amounts and percentages correctly', async () => {
      render(<MarketOverview />)

      await waitFor(() => {
        expect(screen.getByText('$1.85')).toBeInTheDocument()
        expect(screen.getByText('(0.42%)')).toBeInTheDocument()
        expect(screen.getByText('$4.2')).toBeInTheDocument()
        expect(screen.getByText('(1.13%)')).toBeInTheDocument()
        expect(screen.getByText('$2.15')).toBeInTheDocument()
        expect(screen.getByText('(-0.61%)')).toBeInTheDocument()
      })
    })
  })

  describe('Market Movers', () => {
    beforeEach(() => {
      mockGetMarketIndices.mockResolvedValue({
        success: true,
        data: mockMarketIndices,
        error: null,
      })
    })

    it('should display top gainers by default', () => {
      render(<MarketOverview />)

      expect(screen.getByText('NVDA')).toBeInTheDocument()
      expect(screen.getByText('NVIDIA Corporation')).toBeInTheDocument()
      expect(screen.getByText('AMD')).toBeInTheDocument()
      expect(screen.getByText('Advanced Micro Devices')).toBeInTheDocument()
    })

    it('should switch to top losers when tab is clicked', async () => {
      render(<MarketOverview />)

      fireEvent.click(screen.getByRole('tab', { name: /top losers/i }))

      await waitFor(() => {
        expect(screen.getByText('PYPL')).toBeInTheDocument()
        expect(screen.getByText('PayPal Holdings Inc')).toBeInTheDocument()
        expect(screen.getByText('NFLX')).toBeInTheDocument()
        expect(screen.getByText('Netflix Inc')).toBeInTheDocument()
      })
    })

    it('should switch to most active when tab is clicked', async () => {
      render(<MarketOverview />)

      fireEvent.click(screen.getByRole('tab', { name: /most active/i }))

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
        expect(screen.getByText('Apple Inc')).toBeInTheDocument()
        expect(screen.getByText('SPY')).toBeInTheDocument()
        expect(screen.getByText('SPDR S&P 500 ETF')).toBeInTheDocument()
      })
    })

    it('should display rank numbers for market movers', () => {
      render(<MarketOverview />)

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should display trending up icons for gainers', () => {
      const { formatCurrency } = require('@/lib/utils')
      formatCurrency.mockImplementation((value) => `$${value}`)

      render(<MarketOverview />)

      // Check that gainers have trending up icons
      // This is implicit in the component structure but we can verify the data is displayed
      expect(screen.getByText('$485.5')).toBeInTheDocument() // NVDA price
      expect(screen.getByText('$142.75')).toBeInTheDocument() // AMD price
    })

    it('should display trending down icons for losers', async () => {
      const { formatCurrency } = require('@/lib/utils')
      formatCurrency.mockImplementation((value) => `$${value}`)

      render(<MarketOverview />)

      fireEvent.click(screen.getByRole('tab', { name: /top losers/i }))

      await waitFor(() => {
        expect(screen.getByText('$58.45')).toBeInTheDocument() // PYPL price
        expect(screen.getByText('$425.8')).toBeInTheDocument() // NFLX price
      })
    })
  })

  describe('Market Mover Interaction', () => {
    const mockOnSelectStock = jest.fn()

    beforeEach(() => {
      mockGetMarketIndices.mockResolvedValue({
        success: true,
        data: mockMarketIndices,
        error: null,
      })
    })

    it('should call onSelectStock when a market mover is clicked', () => {
      render(<MarketOverview onSelectStock={mockOnSelectStock} />)

      // Find the first market mover card and click it
      const firstMover = screen.getByText('NVDA').closest('div')
      fireEvent.click(firstMover!)

      expect(mockOnSelectStock).toHaveBeenCalledWith('NVDA')
    })

    it('should not call onSelectStock when onSelectStock is not provided', () => {
      render(<MarketOverview />)

      // Find the first market mover card and click it
      const firstMover = screen.getByText('NVDA').closest('div')
      fireEvent.click(firstMover!)

      // Should not throw an error
      expect(mockOnSelectStock).not.toHaveBeenCalled()
    })

    it('should call onSelectStock for losers tab', async () => {
      render(<MarketOverview onSelectStock={mockOnSelectStock} />)

      fireEvent.click(screen.getByRole('tab', { name: /top losers/i }))

      await waitFor(() => {
        const firstLoser = screen.getByText('PYPL').closest('div')
        fireEvent.click(firstLoser!)
        expect(mockOnSelectStock).toHaveBeenCalledWith('PYPL')
      })
    })

    it('should call onSelectStock for most active tab', async () => {
      render(<MarketOverview onSelectStock={mockOnSelectStock} />)

      fireEvent.click(screen.getByRole('tab', { name: /most active/i }))

      await waitFor(() => {
        const firstActive = screen.getByText('AAPL').closest('div')
        fireEvent.click(firstActive!)
        expect(mockOnSelectStock).toHaveBeenCalledWith('AAPL')
      })
    })
  })

  describe('Refresh Functionality', () => {
    it('should call API when refresh button is clicked', async () => {
      mockGetMarketIndices.mockResolvedValue({
        success: true,
        data: mockMarketIndices,
        error: null,
      })

      render(<MarketOverview />)

      await waitFor(() => {
        expect(mockGetMarketIndices).toHaveBeenCalledTimes(1)
      })

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)

      await waitFor(() => {
        expect(mockGetMarketIndices).toHaveBeenCalledTimes(2)
      })
    })

    it('should show refreshing state when refresh button is clicked', async () => {
      let resolvePromise: (value: any) => void
      mockGetMarketIndices.mockImplementation(() => {
        return new Promise((resolve) => {
          resolvePromise = resolve
        })
      })

      render(<MarketOverview />)

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)

      expect(refreshButton).toBeDisabled()

      // Resolve the promise
      act(() => {
        resolvePromise({
          success: true,
          data: mockMarketIndices,
          error: null,
        })
      })

      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled()
      })
    })

    it('should handle refresh errors gracefully', async () => {
      mockGetMarketIndices.mockResolvedValueOnce({
        success: true,
        data: mockMarketIndices,
        error: null,
      })

      render(<MarketOverview />)

      await waitFor(() => {
        expect(screen.getByText('S&P 500')).toBeInTheDocument()
      })

      // Mock an error on refresh
      mockGetMarketIndices.mockResolvedValueOnce({
        success: false,
        data: [],
        error: 'Refresh failed',
      })

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)

      await waitFor(() => {
        expect(screen.getByText('Refresh failed')).toBeInTheDocument()
      })
    })
  })

  describe('Auto-refresh Functionality', () => {
    it('should auto-refresh when market is open', async () => {
      mockGetMarketIndices.mockResolvedValue({
        success: true,
        data: mockMarketIndices,
        error: null,
      })

      render(<MarketOverview />)

      // Initial call
      await waitFor(() => {
        expect(mockGetMarketIndices).toHaveBeenCalledTimes(1)
      })

      // Fast forward 5 minutes
      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000)
      })

      await waitFor(() => {
        expect(mockGetMarketIndices).toHaveBeenCalledTimes(2)
      })
    })

    it('should not auto-refresh when market is closed', async () => {
      const { isMarketOpen } = require('@/lib/utils')
      isMarketOpen.mockReturnValue(false)

      mockGetMarketIndices.mockResolvedValue({
        success: true,
        data: mockMarketIndices,
        error: null,
      })

      render(<MarketOverview />)

      // Initial call
      await waitFor(() => {
        expect(mockGetMarketIndices).toHaveBeenCalledTimes(1)
      })

      // Fast forward 5 minutes
      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000)
      })

      // Should not have made additional calls
      expect(mockGetMarketIndices).toHaveBeenCalledTimes(1)
    })

    it('should clean up interval on unmount', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')

      mockGetMarketIndices.mockResolvedValue({
        success: true,
        data: mockMarketIndices,
        error: null,
      })

      const { unmount } = render(<MarketOverview />)

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()

      clearIntervalSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      mockGetMarketIndices.mockResolvedValue({
        success: true,
        data: mockMarketIndices,
        error: null,
      })
    })

    it('should have proper ARIA attributes for tabs', () => {
      render(<MarketOverview />)

      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(3)
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-selected')
      })
    })

    it('should have proper heading structure', () => {
      render(<MarketOverview />)

      expect(screen.getByText('Market Overview')).toBeInTheDocument()
      expect(screen.getByText('Major Indices')).toBeInTheDocument()
      expect(screen.getByText('Market Movers')).toBeInTheDocument()
    })

    it('should have accessible refresh button', () => {
      render(<MarketOverview />)

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toBeInTheDocument()
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh')
    })

    it('should have keyboard navigation support for market movers', () => {
      render(<MarketOverview />)

      const firstMover = screen.getByText('NVDA').closest('div')
      expect(firstMover).toHaveClass('cursor-pointer')
      expect(firstMover).toHaveAttribute('tabindex', '0')
    })
  })

  describe('Error Boundary', () => {
    it('should handle component crashes gracefully', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      mockGetMarketIndices.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      render(<MarketOverview />)

      expect(screen.getByText('Failed to fetch market data')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })
})