export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  peRatio: number | null
  eps: number | null
  high52Week: number | null
  low52Week: number | null
  avgVolume: number | null
  dividendYield: number | null
  beta: number | null
  roe: number | null
  debtToEquity: number | null
  sector: string | null
  industry: string | null
  logo: string | null
  lastUpdated: string
}

export interface StockQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  previousClose: number
  open: number
  high: number
  low: number
  marketCap: number
  lastUpdated: string
}

export interface StockSearchResult {
  symbol: string
  name: string
  type: string
  region: string
  marketOpen: string
  marketClose: string
  timezone: string
  currency: string
  matchScore: number
}

export interface ChartData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface CompanyOverview {
  symbol: string
  name: string
  description: string
  cik: string
  exchange: string
  currency: string
  country: string
  sector: string
  industry: string
  address: string
  fiscalYearEnd: string
  latestQuarter: string
  marketCapitalization: number
  ebitda: number
  peRatio: number
  pegRatio: number
  bookValue: number
  dividendPerShare: number
  dividendYield: number
  eps: number
  revenuePerShareTTM: number
  profitMargin: number
  operatingMarginTTM: number
  returnOnAssetsTTM: number
  returnOnEquityTTM: number
  revenueTTM: number
  grossProfitTTM: number
  dilutedEPSTTM: number
  quarterlyEarningsGrowthYOY: number
  quarterlyRevenueGrowthYOY: number
  analystTargetPrice: number
  trailingPE: number
  forwardPE: number
  priceToSalesRatioTTM: number
  priceToBookRatio: number
  evToRevenue: number
  evToEbitda: number
  beta: number
  high52Week: number
  low52Week: number
  movingAverage50Day: number
  movingAverage200Day: number
  sharesOutstanding: number
  dividendDate: string
  exDividendDate: string
}

export interface NewsItem {
  title: string
  url: string
  time_published: string
  authors: string[]
  summary: string
  banner_image: string
  source: string
  category_within_source: string
  source_domain: string
  topics: Array<{
    topic: string
    relevance_score: string
  }>
  overall_sentiment_score: number
  overall_sentiment_label: string
  ticker_sentiment: Array<{
    ticker: string
    relevance_score: string
    ticker_sentiment_score: string
    ticker_sentiment_label: string
  }>
}

export interface MarketStatus {
  isOpen: boolean
  nextOpenTime: string
  nextCloseTime: string
  timezone: string
  currentTime: string
}

export interface WatchlistItem {
  symbol: string
  name: string
  addedAt: string
  price?: number
  change?: number
  changePercent?: number
}

export interface MarketMover {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
}

export interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  lastUpdated: string
}

export type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX'

export type ChartType = 'line' | 'candlestick' | 'volume'

export interface ApiResponse<T> {
  data: T
  error: string | null
  success: boolean
}

export interface StockMetrics {
  symbol: string
  marketCap: number
  peRatio: number | null
  eps: number | null
  high52Week: number | null
  low52Week: number | null
  volume: number
  avgVolume: number | null
  dividendYield: number | null
  beta: number | null
  roe: number | null
  debtToEquity: number | null
}

export interface TechnicalIndicators {
  sma50: number | null
  sma200: number | null
  rsi: number | null
  macd: {
    value: number
    signal: number
    histogram: number
  } | null
}

export interface StockStore {
  watchlist: WatchlistItem[]
  recentSearches: string[]
  selectedTimeRange: TimeRange
  selectedChartType: ChartType
  isDarkMode: boolean
  addToWatchlist: (item: WatchlistItem) => void
  removeFromWatchlist: (symbol: string) => void
  addRecentSearch: (symbol: string) => void
  clearRecentSearches: () => void
  setTimeRange: (range: TimeRange) => void
  setChartType: (type: ChartType) => void
  toggleDarkMode: () => void
}