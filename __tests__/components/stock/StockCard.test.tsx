import { render, screen, fireEvent, act } from '@testing-library/react';
import StockCard from '@/components/stock/StockCard';
import { StockQuote, StockStore, WatchlistItem } from '@/lib/types';
import { create, StoreApi } from 'zustand';

// This will hold the mock store for each test
let mockStore: StoreApi<StockStore>;

// Mock the store module
jest.mock('@/lib/store', () => ({
  // The useStockStore hook will now use our mockStore
  useStockStore: (selector: (state: StockStore) => any) => {
    const { useStore } = jest.requireActual('zustand');
    return useStore(mockStore, selector);
  },
}));

// Helper function to create mock stock quote
const createMockStockQuote = (overrides = {}): StockQuote => ({
  symbol: 'AAPL',
  price: 150.25,
  change: 2.50,
  changePercent: 1.69,
  volume: 50000000,
  previousClose: 147.75,
  open: 148.00,
  high: 151.00,
  low: 147.50,
  marketCap: 2500000000000,
  lastUpdated: '2024-01-15',
  ...overrides,
});

describe('StockCard', () => {
  const mockQuote: StockQuote = createMockStockQuote({ symbol: 'AAPL' });

  beforeEach(() => {
    // Create a new store for each test to ensure isolation
    mockStore = create<StockStore>((set, get) => ({
      watchlist: [],
      recentSearches: [],
      selectedTimeRange: '1D',
      selectedChartType: 'line',
      isDarkMode: false,
      addToWatchlist: (item: WatchlistItem) => {
        const { watchlist } = get();
        if (!watchlist.some(w => w.symbol === item.symbol)) {
          set({ watchlist: [...watchlist, item] });
        }
      },
      removeFromWatchlist: (symbol: string) => {
        set(state => ({
          watchlist: state.watchlist.filter(item => item.symbol !== symbol),
        }));
      },
      addRecentSearch: jest.fn(),
      clearRecentSearches: jest.fn(),
      setTimeRange: jest.fn(),
      setChartType: jest.fn(),
      toggleDarkMode: jest.fn(),
      clearWatchlist: jest.fn(),
    }));

    // Spy on the actual methods of the mock store
    jest.spyOn(mockStore.getState(), 'addToWatchlist');
    jest.spyOn(mockStore.getState(), 'removeFromWatchlist');
  });

  describe('watchlist functionality', () => {
    it('should show add button when stock is not in watchlist', () => {
      render(<StockCard quote={mockQuote} showAddToWatchlist={true} />);
      expect(screen.getByRole('button', { name: /Add to watchlist/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Remove from watchlist/i })).not.toBeInTheDocument();
    });

    it('should show remove button when stock is in watchlist', () => {
      // Add an item to the watchlist before rendering
      act(() => {
        mockStore.setState({ watchlist: [{ symbol: 'AAPL', name: 'Apple Inc.', addedAt: '2024-01-01' }] });
      });

      render(<StockCard quote={mockQuote} showAddToWatchlist={true} />);
      
      expect(screen.getByRole('button', { name: /Remove from watchlist/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Add to watchlist/i })).not.toBeInTheDocument();
    });

    it('should call addToWatchlist and update the button when add is clicked', () => {
      const { rerender } = render(<StockCard quote={mockQuote} showAddToWatchlist={true} />);
      
      const addButton = screen.getByRole('button', { name: /Add to watchlist/i });
      
      act(() => {
        fireEvent.click(addButton);
      });

      // After clicking, the item should be in the watchlist
      expect(mockStore.getState().watchlist).toEqual(
        expect.arrayContaining([expect.objectContaining({ symbol: 'AAPL' })])
      );

      // Re-render the component to reflect the store change
      rerender(<StockCard quote={mockQuote} showAddToWatchlist={true} />);
      
      // The button should now be the remove button
      expect(screen.getByRole('button', { name: /Remove from watchlist/i })).toBeInTheDocument();
    });

    it('should call removeFromWatchlist and update the button when remove is clicked', () => {
      // Start with the item in the watchlist
      act(() => {
        mockStore.setState({ watchlist: [{ symbol: 'AAPL', name: 'Apple Inc.', addedAt: '2024-01-01' }] });
      });

      const { rerender } = render(<StockCard quote={mockQuote} showAddToWatchlist={true} />);
      
      const removeButton = screen.getByRole('button', { name: /Remove from watchlist/i });
      
      act(() => {
        fireEvent.click(removeButton);
      });

      // After clicking, the item should be removed from the watchlist
      expect(mockStore.getState().watchlist).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ symbol: 'AAPL' })])
      );

      // Re-render the component to reflect the store change
      rerender(<StockCard quote={mockQuote} showAddToWatchlist={true} />);
      
      // The button should now be the add button
      expect(screen.getByRole('button', { name: /Add to watchlist/i })).toBeInTheDocument();
    });
  });
});