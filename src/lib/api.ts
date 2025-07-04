import { 
  StockData, 
  StockQuote, 
  StockSearchResult, 
  ChartData, 
  CompanyOverview, 
  NewsItem, 
  MarketMover, 
  MarketIndex,
  ApiResponse,
  TimeRange 
} from './types'

const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY
const BASE_URL = process.env.NEXT_PUBLIC_POLYGON_BASE_URL || 'https://api.polygon.io'

class StockApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'StockApiError'
  }
}

async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
      
      if (response.status === 429) {
        // Rate limit exceeded, wait before retry
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        continue
      }
      
      throw new StockApiError(`HTTP ${response.status}: ${response.statusText}`, response.status)
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new StockApiError('Max retries exceeded')
}

export async function searchStocks(query: string): Promise<ApiResponse<StockSearchResult[]>> {
  try {
    if (!API_KEY) {
      return {
        data: [],
        error: 'API key not configured. Please add NEXT_PUBLIC_POLYGON_API_KEY to your environment variables.',
        success: false
      }
    }

    const url = `${BASE_URL}/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&market=stocks&limit=10&apikey=${API_KEY}`
    const response = await fetchWithRetry(url)
    const data = await response.json()

    if (data.status === 'ERROR') {
      return {
        data: [],
        error: `API Error: ${data.error}`,
        success: false
      }
    }

    if (!data.results || data.results.length === 0) {
      return {
        data: [],
        error: `No stocks found matching "${query}". Try a different search term.`,
        success: false
      }
    }

    const results: StockSearchResult[] = data.results.map((ticker: any) => ({
      symbol: ticker.ticker,
      name: ticker.name,
      type: ticker.type || 'CS', // Common Stock
      region: 'United States',
      marketOpen: ticker.market === 'stocks' ? '09:30' : '09:30',
      marketClose: ticker.market === 'stocks' ? '16:00' : '16:00',
      timezone: 'UTC-05', // EST
      currency: ticker.currency_name || 'USD',
      matchScore: 0.9 // Polygon doesn't provide match score
    }))

    return {
      data: results,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Network error occurred while searching stocks',
      success: false
    }
  }
}

export async function getStockQuote(symbol: string): Promise<ApiResponse<StockQuote>> {
  try {
    if (!API_KEY) {
      return {
        data: {} as StockQuote,
        error: 'API key not configured. Please add NEXT_PUBLIC_POLYGON_API_KEY to your environment variables.',
        success: false
      }
    }

    // Use aggregates endpoint for recent data (works with free tier)
    // Get last 2 days of data to calculate change
    const today = new Date()
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
    const from = threeDaysAgo.toISOString().split('T')[0]
    const to = today.toISOString().split('T')[0]
    
    const url = `${BASE_URL}/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=desc&limit=5&apikey=${API_KEY}`
    const response = await fetchWithRetry(url)
    const data = await response.json()

    if (data.status === 'ERROR') {
      return {
        data: {} as StockQuote,
        error: `API Error: ${data.error}`,
        success: false
      }
    }

    if (data.status === 'NOT_AUTHORIZED') {
      return {
        data: {} as StockQuote,
        error: 'Real-time data requires a paid Polygon.io plan. Showing historical data instead.',
        success: false
      }
    }

    if (!data.results || data.results.length === 0) {
      return {
        data: {} as StockQuote,
        error: `No stock data found for symbol "${symbol}". Please verify the symbol is correct.`,
        success: false
      }
    }

    // Get the most recent day's data and previous day for comparison
    const recent = data.results[0] // Most recent day
    const previous = data.results[1] || recent // Previous day or same if only one day

    const currentPrice = recent.c
    const previousClose = previous.c
    const change = currentPrice - previousClose
    const changePercent = previousClose ? (change / previousClose) * 100 : 0

    const quote: StockQuote = {
      symbol: symbol.toUpperCase(),
      price: Number(currentPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      volume: recent.v,
      previousClose: Number(previousClose.toFixed(2)),
      open: recent.o,
      high: recent.h,
      low: recent.l,
      marketCap: 0, // Not available in aggregates endpoint
      lastUpdated: new Date(recent.t).toISOString().split('T')[0]
    }

    return {
      data: quote,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: {} as StockQuote,
      error: error instanceof Error ? error.message : 'Network error occurred while fetching stock quote',
      success: false
    }
  }
}

export async function getCompanyOverview(symbol: string): Promise<ApiResponse<CompanyOverview>> {
  try {
    if (!API_KEY) {
      return {
        data: {} as CompanyOverview,
        error: 'API key not configured. Please add NEXT_PUBLIC_POLYGON_API_KEY to your environment variables.',
        success: false
      }
    }

    const url = `${BASE_URL}/v3/reference/tickers/${symbol}?apikey=${API_KEY}`
    const response = await fetchWithRetry(url)
    const data = await response.json()

    if (data.status === 'ERROR') {
      return {
        data: {} as CompanyOverview,
        error: `API Error: ${data.error}`,
        success: false
      }
    }

    if (!data.results) {
      return {
        data: {} as CompanyOverview,
        error: `No company data found for symbol "${symbol}". Please verify the symbol is correct.`,
        success: false
      }
    }

    const ticker = data.results
    const address = ticker.address || {}

    const result: CompanyOverview = {
      symbol: ticker.ticker,
      name: ticker.name,
      description: ticker.description || `${ticker.name} is a publicly traded company.`,
      cik: ticker.cik || '',
      exchange: ticker.primary_exchange || '',
      currency: ticker.currency_name || 'USD',
      country: 'United States',
      sector: ticker.sic_description || '',
      industry: ticker.sic_description || '',
      address: `${address.address1 || ''} ${address.city || ''} ${address.state || ''}`.trim(),
      fiscalYearEnd: '',
      latestQuarter: '',
      marketCapitalization: ticker.market_cap || 0,
      ebitda: 0, // Not available in basic ticker details
      peRatio: 0,
      pegRatio: 0,
      bookValue: 0,
      dividendPerShare: 0,
      dividendYield: 0,
      eps: 0,
      revenuePerShareTTM: 0,
      profitMargin: 0,
      operatingMarginTTM: 0,
      returnOnAssetsTTM: 0,
      returnOnEquityTTM: 0,
      revenueTTM: 0,
      grossProfitTTM: 0,
      dilutedEPSTTM: 0,
      quarterlyEarningsGrowthYOY: 0,
      quarterlyRevenueGrowthYOY: 0,
      analystTargetPrice: 0,
      trailingPE: 0,
      forwardPE: 0,
      priceToSalesRatioTTM: 0,
      priceToBookRatio: 0,
      evToRevenue: 0,
      evToEbitda: 0,
      beta: 0,
      high52Week: 0,
      low52Week: 0,
      movingAverage50Day: 0,
      movingAverage200Day: 0,
      sharesOutstanding: ticker.share_class_shares_outstanding || 0,
      dividendDate: '',
      exDividendDate: ''
    }

    return {
      data: result,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: {} as CompanyOverview,
      error: error instanceof Error ? error.message : 'Network error occurred while fetching company overview',
      success: false
    }
  }
}

export async function getStockChart(symbol: string, timeRange: TimeRange): Promise<ApiResponse<ChartData[]>> {
  try {
    if (!API_KEY) {
      return {
        data: [],
        error: 'API key not configured. Please add NEXT_PUBLIC_POLYGON_API_KEY to your environment variables.',
        success: false
      }
    }

    // Calculate date range and timespan based on timeRange
    const now = new Date()
    let from: string
    let multiplier = 1
    let timespan = 'day'

    switch (timeRange) {
      case '1D':
        timespan = 'minute'
        multiplier = 5
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '5D':
        timespan = 'hour'
        multiplier = 1
        from = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '1M':
        timespan = 'day'
        multiplier = 1
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '3M':
        timespan = 'day'
        multiplier = 1
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '6M':
        timespan = 'day'
        multiplier = 1
        from = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '1Y':
        timespan = 'week'
        multiplier = 1
        from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '5Y':
        timespan = 'month'
        multiplier = 1
        from = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'MAX':
        timespan = 'month'
        multiplier = 1
        from = new Date(now.getTime() - 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      default:
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    const to = now.toISOString().split('T')[0]
    const url = `${BASE_URL}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=50000&apikey=${API_KEY}`
    
    const response = await fetchWithRetry(url)
    const data = await response.json()

    if (data.status === 'ERROR') {
      return {
        data: [],
        error: `API Error: ${data.error}`,
        success: false
      }
    }

    if (!data.results || data.results.length === 0) {
      return {
        data: [],
        error: `No chart data available for symbol "${symbol}". Please verify the symbol is correct.`,
        success: false
      }
    }

    const chartData: ChartData[] = data.results.map((bar: any) => ({
      date: new Date(bar.t).toISOString().split('T')[0],
      open: Number(bar.o.toFixed(2)),
      high: Number(bar.h.toFixed(2)),
      low: Number(bar.l.toFixed(2)),
      close: Number(bar.c.toFixed(2)),
      volume: bar.v
    }))

    return {
      data: chartData,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Network error occurred while fetching stock chart',
      success: false
    }
  }
}

export async function getMarketNews(symbol?: string): Promise<ApiResponse<NewsItem[]>> {
  try {
    if (!API_KEY) {
      return {
        data: [],
        error: 'API key not configured. Please add NEXT_PUBLIC_POLYGON_API_KEY to your environment variables.',
        success: false
      }
    }

    let url = `${BASE_URL}/v2/reference/news?limit=20&order=desc&sort=published_utc&apikey=${API_KEY}`
    if (symbol) {
      url += `&ticker=${symbol}`
    }

    const response = await fetchWithRetry(url)
    const data = await response.json()

    if (data.status === 'ERROR') {
      return {
        data: [],
        error: `API Error: ${data.error}`,
        success: false
      }
    }

    if (!data.results || data.results.length === 0) {
      return {
        data: [],
        error: `No news found${symbol ? ` for symbol "${symbol}"` : ''}. Please try again later.`,
        success: false
      }
    }

    const newsItems: NewsItem[] = data.results.map((item: any) => ({
      title: item.title,
      url: item.article_url,
      time_published: item.published_utc,
      authors: item.author ? [item.author] : [],
      summary: item.description || item.title,
      banner_image: item.image_url,
      source: item.publisher?.name || 'Unknown',
      category_within_source: item.category || '',
      source_domain: item.publisher?.homepage_url || '',
      topics: item.keywords || [],
      overall_sentiment_score: 0, // Polygon doesn't provide sentiment by default
      overall_sentiment_label: 'Neutral',
      ticker_sentiment: item.tickers?.map((ticker: string) => ({
        ticker,
        relevance_score: 0.5,
        ticker_sentiment_score: 0,
        ticker_sentiment_label: 'Neutral'
      })) || []
    }))

    return {
      data: newsItems,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Network error occurred while fetching market news',
      success: false
    }
  }
}

export async function getMarketIndices(): Promise<ApiResponse<MarketIndex[]>> {
  try {
    if (!API_KEY) {
      return {
        data: [],
        error: 'API key not configured. Please add NEXT_PUBLIC_POLYGON_API_KEY to your environment variables.',
        success: false
      }
    }

    // Polygon.io free tier - use major ETFs that track indices
    const indexInfo = [
      { symbol: 'SPY', name: 'S&P 500' },
      { symbol: 'QQQ', name: 'NASDAQ-100' },
      { symbol: 'DIA', name: 'Dow Jones' }
    ]

    const results: MarketIndex[] = []
    const today = new Date()
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
    const from = threeDaysAgo.toISOString().split('T')[0]
    const to = today.toISOString().split('T')[0]

    for (const index of indexInfo) {
      try {
        const url = `${BASE_URL}/v2/aggs/ticker/${index.symbol}/range/1/day/${from}/${to}?adjusted=true&sort=desc&limit=5&apikey=${API_KEY}`
        const response = await fetchWithRetry(url)
        const data = await response.json()

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const recent = data.results[0]
          const previous = data.results[1] || recent

          const currentPrice = recent.c
          const previousClose = previous.c
          const change = currentPrice - previousClose
          const changePercent = previousClose ? (change / previousClose) * 100 : 0

          results.push({
            symbol: index.symbol,
            name: index.name,
            price: Number(currentPrice.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            lastUpdated: new Date(recent.t).toISOString().split('T')[0]
          })
        }
      } catch (error) {
        console.warn(`Failed to fetch data for ${index.symbol}:`, error)
        // Continue with other indices
      }
    }

    if (results.length === 0) {
      return {
        data: [],
        error: 'Unable to fetch market indices data. Please try again later.',
        success: false
      }
    }

    return {
      data: results,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Network error occurred while fetching market indices',
      success: false
    }
  }
}

// Cache for API calls to prevent excessive requests
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60000 // 1 minute

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

export function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export { StockApiError }