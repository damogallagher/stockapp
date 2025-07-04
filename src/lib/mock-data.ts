import { 
  StockQuote, 
  StockSearchResult, 
  CompanyOverview, 
  ChartData, 
  NewsItem, 
  MarketIndex 
} from './types'

export const mockStockQuote: StockQuote = {
  symbol: 'AAPL',
  price: 185.20,
  change: 2.15,
  changePercent: 1.17,
  volume: 89500000,
  previousClose: 183.05,
  open: 184.50,
  high: 186.10,
  low: 183.80,
  marketCap: 2800000000000,
  lastUpdated: new Date().toISOString().split('T')[0]
}

export const mockSearchResults: StockSearchResult[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'Equity',
    region: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: 1.0
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    type: 'Equity',
    region: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: 0.9
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'Equity',
    region: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-04',
    currency: 'USD',
    matchScore: 0.8
  }
]

export const mockCompanyOverview: CompanyOverview = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
  cik: '320193',
  exchange: 'NASDAQ',
  currency: 'USD',
  country: 'USA',
  sector: 'Technology',
  industry: 'Consumer Electronics',
  address: 'One Apple Park Way, Cupertino, CA 95014, United States',
  fiscalYearEnd: 'September',
  latestQuarter: '2024-06-30',
  marketCapitalization: 2800000000000,
  ebitda: 123000000000,
  peRatio: 28.5,
  pegRatio: 2.1,
  bookValue: 4.25,
  dividendPerShare: 0.96,
  dividendYield: 0.52,
  eps: 6.43,
  revenuePerShareTTM: 25.1,
  profitMargin: 0.251,
  operatingMarginTTM: 0.298,
  returnOnAssetsTTM: 0.202,
  returnOnEquityTTM: 1.566,
  revenueTTM: 385700000000,
  grossProfitTTM: 169100000000,
  dilutedEPSTTM: 6.43,
  quarterlyEarningsGrowthYOY: 0.051,
  quarterlyRevenueGrowthYOY: 0.049,
  analystTargetPrice: 195.0,
  trailingPE: 28.8,
  forwardPE: 26.2,
  priceToSalesRatioTTM: 7.25,
  priceToBookRatio: 43.6,
  evToRevenue: 7.0,
  evToEbitda: 21.8,
  beta: 1.24,
  high52Week: 199.62,
  low52Week: 164.08,
  movingAverage50Day: 182.45,
  movingAverage200Day: 178.90,
  sharesOutstanding: 15334100000,
  dividendDate: '2024-05-16',
  exDividendDate: '2024-05-10'
}

export const mockChartData: ChartData[] = [
  { date: '2024-01-01', open: 180.0, high: 185.0, low: 178.0, close: 183.0, volume: 50000000 },
  { date: '2024-01-02', open: 183.0, high: 186.0, low: 181.0, close: 184.5, volume: 45000000 },
  { date: '2024-01-03', open: 184.5, high: 187.0, low: 182.0, close: 185.2, volume: 52000000 },
  { date: '2024-01-04', open: 185.2, high: 188.0, low: 183.0, close: 186.8, volume: 48000000 },
  { date: '2024-01-05', open: 186.8, high: 189.0, low: 184.0, close: 187.5, volume: 55000000 }
]

export const mockNews: NewsItem[] = [
  {
    title: 'Apple Reports Strong Q3 Earnings',
    url: 'https://example.com/news/1',
    time_published: '20240704T140000',
    authors: ['Tech Reporter'],
    summary: 'Apple Inc. reported better-than-expected quarterly earnings driven by strong iPhone sales.',
    banner_image: '',
    source: 'Tech News',
    category_within_source: 'earnings',
    source_domain: 'technews.com',
    topics: [{ topic: 'earnings', relevance_score: '0.9' }],
    overall_sentiment_score: 0.3,
    overall_sentiment_label: 'Bullish',
    ticker_sentiment: [{ 
      ticker: 'AAPL', 
      relevance_score: '0.9', 
      ticker_sentiment_score: '0.3', 
      ticker_sentiment_label: 'Bullish' 
    }]
  }
]

export const mockMarketIndices: MarketIndex[] = [
  {
    symbol: 'SPY',
    name: 'S&P 500',
    price: 445.60,
    change: 1.85,
    changePercent: 0.42,
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'QQQ',
    name: 'NASDAQ 100',
    price: 375.40,
    change: 4.20,
    changePercent: 1.13,
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'DIA',
    name: 'Dow Jones',
    price: 338.50,
    change: -2.15,
    changePercent: -0.63,
    lastUpdated: new Date().toISOString()
  }
]