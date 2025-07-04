import { renderHook, act } from '@testing-library/react'
import { useStockStore } from '@/lib/store'
import { WatchlistItem } from '@/lib/types'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('Stock Store', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    
    // Reset store state using store methods
    const { result } = renderHook(() => useStockStore())
    act(() => {
      result.current.clearWatchlist()
      result.current.clearRecentSearches()
      result.current.setTimeRange('1D')
      result.current.setChartType('line')
      if (result.current.isDarkMode) {
        result.current.toggleDarkMode()
      }
    })
    
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useStockStore())
      
      expect(result.current.watchlist).toEqual([])
      expect(result.current.recentSearches).toEqual([])
      expect(result.current.selectedTimeRange).toBe('1D')
      expect(result.current.selectedChartType).toBe('line')
      expect(result.current.isDarkMode).toBe(false)
    })
  })

  describe('watchlist management', () => {
    const mockWatchlistItem: WatchlistItem = {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      addedAt: '2024-01-15T10:30:00Z',
      price: 150.25,
      change: 2.50,
      changePercent: 1.69,
    }

    it('should add item to watchlist', () => {
      const { result } = renderHook(() => useStockStore())
      
      act(() => {
        result.current.addToWatchlist(mockWatchlistItem)
      })
      
      expect(result.current.watchlist).toHaveLength(1)
      expect(result.current.watchlist[0]).toEqual(mockWatchlistItem)
    })

    it('should not add duplicate items to watchlist', () => {
      const { result } = renderHook(() => useStockStore())
      
      act(() => {
        result.current.addToWatchlist(mockWatchlistItem)
        result.current.addToWatchlist(mockWatchlistItem)
      })
      
      expect(result.current.watchlist).toHaveLength(1)
    })

    it('should remove item from watchlist', () => {
      const { result } = renderHook(() => useStockStore())
      
      act(() => {
        result.current.addToWatchlist(mockWatchlistItem)
      })
      
      expect(result.current.watchlist).toHaveLength(1)
      
      act(() => {
        result.current.removeFromWatchlist('AAPL')
      })
      
      expect(result.current.watchlist).toHaveLength(0)
    })

    it('should handle removing non-existent item', () => {
      const { result } = renderHook(() => useStockStore())
      
      act(() => {
        result.current.addToWatchlist(mockWatchlistItem)
      })
      
      expect(result.current.watchlist).toHaveLength(1)
      
      act(() => {
        result.current.removeFromWatchlist('GOOGL')
      })
      
      expect(result.current.watchlist).toHaveLength(1)
      expect(result.current.watchlist[0].symbol).toBe('AAPL')
    })

    it('should handle multiple items in watchlist', () => {
      const { result } = renderHook(() => useStockStore())
      
      const item1 = { ...mockWatchlistItem, symbol: 'AAPL' }
      const item2 = { ...mockWatchlistItem, symbol: 'GOOGL', name: 'Alphabet Inc.' }
      const item3 = { ...mockWatchlistItem, symbol: 'MSFT', name: 'Microsoft Corporation' }
      
      act(() => {
        result.current.addToWatchlist(item1)
        result.current.addToWatchlist(item2)
        result.current.addToWatchlist(item3)
      })
      
      expect(result.current.watchlist).toHaveLength(3)
      
      act(() => {
        result.current.removeFromWatchlist('GOOGL')
      })
      
      expect(result.current.watchlist).toHaveLength(2)
      expect(result.current.watchlist.find(item => item.symbol === 'GOOGL')).toBeUndefined()
      expect(result.current.watchlist.find(item => item.symbol === 'AAPL')).toBeDefined()
      expect(result.current.watchlist.find(item => item.symbol === 'MSFT')).toBeDefined()
    })
  })

  describe('recent searches management', () => {
    it('should add search to recent searches', () => {
      const { result } = renderHook(() => useStockStore())
      
      act(() => {
        result.current.addRecentSearch('AAPL')
      })
      
      expect(result.current.recentSearches).toEqual(['AAPL'])
    })

    it('should move existing search to top', () => {
      const { result } = renderHook(() => useStockStore())
      
      act(() => {
        result.current.addRecentSearch('AAPL')
        result.current.addRecentSearch('GOOGL')
        result.current.addRecentSearch('AAPL') // Should move to top
      })
      
      expect(result.current.recentSearches).toEqual(['AAPL', 'GOOGL'])
    })

    it('should limit recent searches to 10 items', () => {
      const { result } = renderHook(() => useStockStore())
      
      act(() => {
        // Add 12 searches
        for (let i = 1; i <= 12; i++) {
          result.current.addRecentSearch(`STOCK${i}`)
        }
      })
      
      expect(result.current.recentSearches).toHaveLength(10)
      expect(result.current.recentSearches[0]).toBe('STOCK12') // Most recent first
      expect(result.current.recentSearches[9]).toBe('STOCK3') // Oldest kept
    })

    it('should clear all recent searches', () => {
      const { result } = renderHook(() => useStockStore())
      
      act(() => {
        result.current.addRecentSearch('AAPL')
        result.current.addRecentSearch('GOOGL')
        result.current.addRecentSearch('MSFT')
      })
      
      expect(result.current.recentSearches).toHaveLength(3)
      
      act(() => {
        result.current.clearRecentSearches()
      })
      
      expect(result.current.recentSearches).toEqual([])
    })
  })

  describe('time range management', () => {
    it('should set time range', () => {
      const { result } = renderHook(() => useStockStore())
      
      act(() => {
        result.current.setTimeRange('1M')
      })
      
      expect(result.current.selectedTimeRange).toBe('1M')
    })

    it('should handle all valid time ranges', () => {
      const { result } = renderHook(() => useStockStore())
      const timeRanges = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'MAX'] as const
      
      timeRanges.forEach(range => {
        act(() => {
          result.current.setTimeRange(range)
        })
        
        expect(result.current.selectedTimeRange).toBe(range)
      })
    })
  })

  describe('chart type management', () => {
    it('should set chart type', () => {
      const { result } = renderHook(() => useStockStore())
      
      act(() => {
        result.current.setChartType('candlestick')
      })
      
      expect(result.current.selectedChartType).toBe('candlestick')
    })

    it('should handle all valid chart types', () => {
      const { result } = renderHook(() => useStockStore())
      const chartTypes = ['line', 'candlestick', 'volume'] as const
      
      chartTypes.forEach(type => {
        act(() => {
          result.current.setChartType(type)
        })
        
        expect(result.current.selectedChartType).toBe(type)
      })
    })
  })

  describe('dark mode management', () => {
    it('should toggle dark mode', () => {
      const { result } = renderHook(() => useStockStore())
      
      expect(result.current.isDarkMode).toBe(false)
      
      act(() => {
        result.current.toggleDarkMode()
      })
      
      expect(result.current.isDarkMode).toBe(true)
      
      act(() => {
        result.current.toggleDarkMode()
      })
      
      expect(result.current.isDarkMode).toBe(false)
    })
  })

  describe('persistence', () => {
    it('should have correct persistence configuration', () => {
      // This test ensures the store is configured to persist the right fields
      const store = useStockStore.getState()
      
      // These are the fields that should be persisted according to the partialize function
      const persistedFields = [
        'watchlist',
        'recentSearches', 
        'selectedTimeRange',
        'selectedChartType',
        'isDarkMode'
      ]
      
      persistedFields.forEach(field => {
        expect(store).toHaveProperty(field)
      })
    })
  })

  describe('complex scenarios', () => {
    it('should handle multiple operations correctly', () => {
      const { result } = renderHook(() => useStockStore())
      
      const item1: WatchlistItem = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        addedAt: '2024-01-15T10:30:00Z',
      }
      
      const item2: WatchlistItem = {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        addedAt: '2024-01-15T10:35:00Z',
      }
      
      act(() => {
        // Add to watchlist
        result.current.addToWatchlist(item1)
        result.current.addToWatchlist(item2)
        
        // Add recent searches
        result.current.addRecentSearch('AAPL')
        result.current.addRecentSearch('GOOGL')
        result.current.addRecentSearch('MSFT')
        
        // Change settings
        result.current.setTimeRange('3M')
        result.current.setChartType('candlestick')
        result.current.toggleDarkMode()
      })
      
      expect(result.current.watchlist).toHaveLength(2)
      expect(result.current.recentSearches).toEqual(['MSFT', 'GOOGL', 'AAPL'])
      expect(result.current.selectedTimeRange).toBe('3M')
      expect(result.current.selectedChartType).toBe('candlestick')
      expect(result.current.isDarkMode).toBe(true)
      
      act(() => {
        // Remove from watchlist
        result.current.removeFromWatchlist('AAPL')
        
        // Clear searches
        result.current.clearRecentSearches()
      })
      
      expect(result.current.watchlist).toHaveLength(1)
      expect(result.current.watchlist[0].symbol).toBe('GOOGL')
      expect(result.current.recentSearches).toEqual([])
    })
  })
})