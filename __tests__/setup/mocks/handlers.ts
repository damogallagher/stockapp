import { http, HttpResponse } from 'msw'
import { StockQuote, StockSearchResult, CompanyOverview, ChartData, NewsItem } from '@/lib/types'

// Mock data
const mockStockQuote: StockQuote = {
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
  lastUpdated: '2024-01-15'
}

const mockSearchResults: StockSearchResult[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'EQUITY',
    region: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-05',
    currency: 'USD',
    matchScore: 0.95
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    type: 'EQUITY',
    region: 'United States',
    marketOpen: '09:30',
    marketClose: '16:00',
    timezone: 'UTC-05',
    currency: 'USD',
    matchScore: 0.90
  }
]

const mockCompanyOverview: CompanyOverview = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
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
  exDividendDate: '2024-05-10'
}

const mockChartData: ChartData[] = [
  {
    date: '2024-01-10',
    open: 148.00,
    high: 151.00,
    low: 147.50,
    close: 150.25,
    volume: 50000000
  },
  {
    date: '2024-01-11',
    open: 150.25,
    high: 152.50,
    low: 149.75,
    close: 151.75,
    volume: 48000000
  },
  {
    date: '2024-01-12',
    open: 151.75,
    high: 153.00,
    low: 150.50,
    close: 152.30,
    volume: 52000000
  }
]

const mockNewsItems: NewsItem[] = [
  {
    title: 'Apple Reports Strong Q4 Earnings',
    url: 'https://example.com/apple-earnings',
    time_published: '2024-01-15T10:30:00Z',
    authors: ['John Doe'],
    summary: 'Apple reported better than expected earnings for Q4 2024.',
    banner_image: 'https://example.com/apple-banner.jpg',
    source: 'TechNews',
    category_within_source: 'Earnings',
    source_domain: 'technews.com',
    topics: [
      {
        topic: 'Earnings',
        relevance_score: '0.95'
      }
    ],
    overall_sentiment_score: 0.75,
    overall_sentiment_label: 'Positive',
    ticker_sentiment: [
      {
        ticker: 'AAPL',
        relevance_score: '0.95',
        ticker_sentiment_score: '0.75',
        ticker_sentiment_label: 'Positive'
      }
    ]
  }
]

export const handlers = [
  // Mock Yahoo Finance API calls (these would actually be internal API calls)
  http.get('*/api/test-yahoo-finance', () => {
    return HttpResponse.json({
      success: true,
      data: mockStockQuote,
      error: null,
      timestamp: new Date().toISOString(),
      provider: 'Yahoo Finance (yahoo-finance2)'
    })
  }),

  // Mock search functionality
  http.get('*/search', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    
    if (!query) {
      return HttpResponse.json({
        data: [],
        error: 'No search query provided',
        success: false
      }, { status: 400 })
    }

    // Filter mock results based on query
    const filteredResults = mockSearchResults.filter(result => 
      result.symbol.toLowerCase().includes(query.toLowerCase()) ||
      result.name.toLowerCase().includes(query.toLowerCase())
    )

    return HttpResponse.json({
      data: filteredResults,
      error: null,
      success: true
    })
  }),

  // Mock stock quote
  http.get('*/quote/:symbol', ({ params }) => {
    const { symbol } = params as { symbol: string }
    
    if (symbol === 'INVALID') {
      return HttpResponse.json({
        data: null,
        error: 'Invalid symbol',
        success: false
      }, { status: 404 })
    }

    const quote = { ...mockStockQuote, symbol: symbol.toUpperCase() }
    return HttpResponse.json({
      data: quote,
      error: null,
      success: true
    })
  }),

  // Mock company overview
  http.get('*/overview/:symbol', ({ params }) => {
    const { symbol } = params as { symbol: string }
    
    if (symbol === 'INVALID') {
      return HttpResponse.json({
        data: null,
        error: 'Invalid symbol',
        success: false
      }, { status: 404 })
    }

    const overview = { ...mockCompanyOverview, symbol: symbol.toUpperCase() }
    return HttpResponse.json({
      data: overview,
      error: null,
      success: true
    })
  }),

  // Mock chart data
  http.get('*/chart/:symbol', ({ params, request }) => {
    const { symbol } = params as { symbol: string }
    const url = new URL(request.url)
    const timeRange = url.searchParams.get('timeRange') || '1D'
    
    if (symbol === 'INVALID') {
      return HttpResponse.json({
        data: [],
        error: 'Invalid symbol',
        success: false
      }, { status: 404 })
    }

    return HttpResponse.json({
      data: mockChartData,
      error: null,
      success: true
    })
  }),

  // Mock news
  http.get('*/news', ({ request }) => {
    const url = new URL(request.url)
    const symbol = url.searchParams.get('symbol')
    
    return HttpResponse.json({
      data: mockNewsItems,
      error: null,
      success: true
    })
  })
]