import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { StockStore, WatchlistItem, TimeRange, ChartType } from './types'

export const useStockStore = create<StockStore>()(
  persist(
    (set, get) => ({
      watchlist: [],
      recentSearches: [],
      selectedTimeRange: '1D',
      selectedChartType: 'line',
      isDarkMode: false,
      
      addToWatchlist: (item: WatchlistItem) => {
        const { watchlist } = get()
        const exists = watchlist.find(w => w.symbol === item.symbol)
        if (!exists) {
          set({ watchlist: [...watchlist, item] })
        }
      },
      
      removeFromWatchlist: (symbol: string) => {
        const { watchlist } = get()
        set({ watchlist: watchlist.filter(w => w.symbol !== symbol) })
      },
      
      addRecentSearch: (symbol: string) => {
        const { recentSearches } = get()
        const filtered = recentSearches.filter(s => s !== symbol)
        const updated = [symbol, ...filtered].slice(0, 10) // Keep last 10 searches
        set({ recentSearches: updated })
      },
      
      clearRecentSearches: () => {
        set({ recentSearches: [] })
      },
      
      clearWatchlist: () => {
        set({ watchlist: [] })
      },
      
      setTimeRange: (range: TimeRange) => {
        set({ selectedTimeRange: range })
      },
      
      setChartType: (type: ChartType) => {
        set({ selectedChartType: type })
      },
      
      toggleDarkMode: () => {
        set(state => ({ isDarkMode: !state.isDarkMode }))
      }
    }),
    {
      name: 'stock-app-storage',
      partialize: (state) => ({
        watchlist: state.watchlist,
        recentSearches: state.recentSearches,
        selectedTimeRange: state.selectedTimeRange,
        selectedChartType: state.selectedChartType,
        isDarkMode: state.isDarkMode
      })
    }
  )
)