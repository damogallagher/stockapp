import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { StockStore } from '@/lib/types'

// Mock Zustand store with default values
const mockStoreValues: StockStore = {
  watchlist: [],
  recentSearches: [],
  selectedTimeRange: '1D',
  selectedChartType: 'line',
  isDarkMode: false,
  addToWatchlist: jest.fn(),
  removeFromWatchlist: jest.fn(),
  addRecentSearch: jest.fn(),
  clearRecentSearches: jest.fn(),
  setTimeRange: jest.fn(),
  setChartType: jest.fn(),
  toggleDarkMode: jest.fn(),
  clearWatchlist: jest.fn(),
}

// Mock the store hook
jest.mock('@/lib/store', () => ({
  useStockStore: () => mockStoreValues,
}))

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper functions for testing
export const createMockStockQuote = (overrides = {}) => ({
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
})

export const createMockCompanyOverview = (overrides = {}) => ({
  symbol: 'AAPL',
  name: 'Apple Inc.',
  description: 'Apple Inc. designs, manufactures, and markets smartphones...',
  cik: '0000320193',
  exchange: 'NASDAQ',
  currency: 'USD',
  country: 'United States',
  sector: 'Technology',
  industry: 'Consumer Electronics',
  address: '1 Apple Park Way Cupertino CA',
  fiscalYearEnd: '2024-09-30',
  latestQuarter: '2024-06-30',
  marketCapitalization: 2500000000000,
  ebitda: 125000000000,
  peRatio: 25.5,
  pegRatio: 1.8,
  bookValue: 4.25,
  dividendPerShare: 0.96,
  dividendYield: 0.0064,
  eps: 6.13,
  revenuePerShareTTM: 25.47,
  profitMargin: 0.24,
  operatingMarginTTM: 0.27,
  returnOnAssetsTTM: 0.17,
  returnOnEquityTTM: 0.53,
  revenueTTM: 394000000000,
  grossProfitTTM: 170000000000,
  dilutedEPSTTM: 6.13,
  quarterlyEarningsGrowthYOY: 0.05,
  quarterlyRevenueGrowthYOY: 0.02,
  analystTargetPrice: 160.00,
  trailingPE: 24.5,
  forwardPE: 22.8,
  priceToSalesRatioTTM: 6.35,
  priceToBookRatio: 35.4,
  evToRevenue: 6.2,
  evToEbitda: 18.5,
  beta: 1.24,
  high52Week: 198.23,
  low52Week: 124.17,
  movingAverage50Day: 145.67,
  movingAverage200Day: 156.89,
  sharesOutstanding: 15728000000,
  dividendDate: '2024-05-16',
  exDividendDate: '2024-05-10',
  ...overrides,
})

export const createMockChartData = (overrides = {}) => ([
  {
    date: '2024-01-10',
    open: 148.00,
    high: 151.00,
    low: 147.50,
    close: 150.25,
    volume: 50000000,
    ...overrides,
  },
])

export const createMockWatchlistItem = (overrides = {}) => ({
  symbol: 'AAPL',
  name: 'Apple Inc.',
  addedAt: '2024-01-15T10:30:00Z',
  price: 150.25,
  change: 2.50,
  changePercent: 1.69,
  ...overrides,
})

// Mock store with custom values
export const mockStoreWith = (overrides: Partial<StockStore>) => {
  const mockStore = { ...mockStoreValues, ...overrides }
  const { useStockStore } = require('@/lib/store')
  useStockStore.mockReturnValue(mockStore)
  return mockStore
}

// Reset all mocks
export const resetMocks = () => {
  jest.clearAllMocks()
}