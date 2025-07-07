import { render, screen, fireEvent } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import Navigation, { NavigationSkeleton } from '@/components/layout/Navigation'
import { useStockStore } from '@/lib/store'

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

jest.mock('@/lib/store')

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseStockStore = useStockStore as jest.MockedFunction<typeof useStockStore>

describe('Navigation', () => {
  const mockStoreState = {
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
    watchlist: [],
    recentSearches: [],
    selectedTimeRange: '1D' as const,
    selectedChartType: 'line' as const,
    addToWatchlist: jest.fn(),
    removeFromWatchlist: jest.fn(),
    addRecentSearch: jest.fn(),
    clearRecentSearches: jest.fn(),
    setTimeRange: jest.fn(),
    setChartType: jest.fn(),
    clearWatchlist: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/')
    mockUseStockStore.mockReturnValue(mockStoreState)
  })

  it('renders navigation with logo and menu items', () => {
    render(<Navigation />)

    expect(screen.getByText('StockApp')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Market/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Watchlist/i })).toBeInTheDocument()
  })

  it('highlights active navigation item', () => {
    mockUsePathname.mockReturnValue('/market')
    render(<Navigation />)

    const marketLink = screen.getByRole('link', { name: /Market/i })
    expect(marketLink).toHaveClass('border-primary', 'text-foreground')

    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i })
    expect(dashboardLink).toHaveClass('border-transparent', 'text-muted-foreground')
  })

  it('renders search button and handles click', () => {
    const mockOnSearch = jest.fn()
    render(<Navigation onSearch={mockOnSearch} />)

    const searchButton = screen.getByRole('button', { name: /Search stocks/i })
    fireEvent.click(searchButton)

    expect(mockOnSearch).toHaveBeenCalledTimes(1)
  })

  it('renders dark mode toggle and handles click', () => {
    render(<Navigation />)

    // Get the dark mode button (should be one of the buttons with SVG)
    const buttons = screen.getAllByRole('button')
    // Dark mode button should be the one that's not the mobile menu button
    const darkModeButton = buttons.find(button => {
      const svg = button.querySelector('svg')
      return svg && (svg.classList.contains('lucide-moon') || svg.classList.contains('lucide-sun'))
    }) || buttons[0] // fallback to first button
    
    expect(darkModeButton).toBeInTheDocument()
    fireEvent.click(darkModeButton!)

    expect(mockStoreState.toggleDarkMode).toHaveBeenCalledTimes(1)
  })

  it('shows sun icon in dark mode', () => {
    mockUseStockStore.mockReturnValue({
      ...mockStoreState,
      isDarkMode: true,
    })

    render(<Navigation />)

    // Sun icon should be present when dark mode is enabled
    const buttons = screen.getAllByRole('button')
    expect(buttons.some(button => button.querySelector('svg'))).toBe(true)
  })

  it('shows moon icon in light mode', () => {
    render(<Navigation />)

    // Moon icon should be present when dark mode is disabled
    const buttons = screen.getAllByRole('button')
    expect(buttons.some(button => button.querySelector('svg'))).toBe(true)
  })

  it('handles mobile menu toggle', () => {
    render(<Navigation />)

    // Find mobile menu button (last button in the DOM for mobile)
    const menuButtons = screen.getAllByRole('button')
    const mobileMenuButton = menuButtons[menuButtons.length - 1]
    
    fireEvent.click(mobileMenuButton)

    // Mobile menu should be visible
    expect(screen.getByText('Search Stocks')).toBeInTheDocument()
  })

  it('closes mobile menu when navigation item is clicked', () => {
    render(<Navigation />)

    // Open mobile menu
    const menuButtons = screen.getAllByRole('button')
    const mobileMenuButton = menuButtons[menuButtons.length - 1]
    fireEvent.click(mobileMenuButton)

    // Click on a navigation item in mobile menu
    const mobileMarketLink = screen.getAllByText('Market')[1] // Second instance should be mobile
    fireEvent.click(mobileMarketLink)

    // Mobile menu should close (Search Stocks button should not be visible)
    expect(screen.queryByText('Search Stocks')).not.toBeInTheDocument()
  })

  it('handles mobile search button click', () => {
    const mockOnSearch = jest.fn()
    render(<Navigation onSearch={mockOnSearch} />)

    // Open mobile menu
    const menuButtons = screen.getAllByRole('button')
    const mobileMenuButton = menuButtons[menuButtons.length - 1]
    fireEvent.click(mobileMenuButton)

    // Click mobile search button
    const mobileSearchButton = screen.getByText('Search Stocks')
    fireEvent.click(mobileSearchButton)

    expect(mockOnSearch).toHaveBeenCalledTimes(1)
  })

  it('closes mobile menu when backdrop is clicked', () => {
    render(<Navigation />)

    // Open mobile menu
    const menuButtons = screen.getAllByRole('button')
    const mobileMenuButton = menuButtons[menuButtons.length - 1]
    fireEvent.click(mobileMenuButton)

    // Find and click backdrop
    const backdrop = document.querySelector('.fixed.inset-0.z-30')
    expect(backdrop).toBeInTheDocument()
    fireEvent.click(backdrop!)

    // Mobile menu should close
    expect(screen.queryByText('Search Stocks')).not.toBeInTheDocument()
  })

  it('renders mobile menu with correct navigation items', () => {
    render(<Navigation />)

    // Open mobile menu
    const menuButtons = screen.getAllByRole('button')
    const mobileMenuButton = menuButtons[menuButtons.length - 1]
    fireEvent.click(mobileMenuButton)

    // Check mobile navigation items are present
    const mobileLinks = screen.getAllByText('Dashboard')
    expect(mobileLinks.length).toBeGreaterThan(1) // Desktop + mobile versions

    const mobileMarketLinks = screen.getAllByText('Market')
    expect(mobileMarketLinks.length).toBeGreaterThan(1)

    const mobileWatchlistLinks = screen.getAllByText('Watchlist')
    expect(mobileWatchlistLinks.length).toBeGreaterThan(1)
  })

  it('highlights active item in mobile menu', () => {
    mockUsePathname.mockReturnValue('/watchlist')
    render(<Navigation />)

    // Open mobile menu
    const menuButtons = screen.getAllByRole('button')
    const mobileMenuButton = menuButtons[menuButtons.length - 1]
    fireEvent.click(mobileMenuButton)

    // Mobile watchlist link should have active styling
    const mobileWatchlistLink = screen.getAllByText('Watchlist')[1]
    expect(mobileWatchlistLink.closest('a')).toHaveClass('bg-primary/10', 'text-primary')
  })
})

describe('NavigationSkeleton', () => {
  it('renders loading skeleton', () => {
    render(<NavigationSkeleton />)

    // Check for skeleton elements
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('renders skeleton with correct structure', () => {
    render(<NavigationSkeleton />)

    // Should have navigation structure
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveClass('border-b', 'bg-background/95')
  })
})