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

const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY
const BASE_URL = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_BASE_URL || 'https://www.alphavantage.co/query'

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
        error: 'API key not configured. Please add NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY to your environment variables.',
        success: false
      }
    }

    const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${API_KEY}`
    const response = await fetchWithRetry(url)
    const data = await response.json()

    if (data['Error Message']) {
      return {
        data: [],
        error: `API Error: ${data['Error Message']}`,
        success: false
      }
    }

    if (data.Note) {
      return {
        data: [],
        error: 'API rate limit exceeded. Alpha Vantage free tier allows 5 calls per minute and 500 calls per day. Please wait and try again.',
        success: false
      }
    }

    const results: StockSearchResult[] = data.bestMatches?.map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      marketOpen: match['5. marketOpen'],
      marketClose: match['6. marketClose'],
      timezone: match['7. timezone'],
      currency: match['8. currency'],
      matchScore: parseFloat(match['9. matchScore'])
    })) || []

    if (results.length === 0) {
      return {
        data: [],
        error: `No stocks found matching "${query}". Try a different search term.`,
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
        error: 'API key not configured. Please add NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY to your environment variables.',
        success: false
      }
    }

    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    const response = await fetchWithRetry(url)
    const data = await response.json()

    if (data['Error Message']) {
      return {
        data: {} as StockQuote,
        error: `API Error: ${data['Error Message']}`,
        success: false
      }
    }

    if (data.Note) {
      return {
        data: {} as StockQuote,
        error: 'API rate limit exceeded. Alpha Vantage free tier allows 5 calls per minute and 500 calls per day. Please wait and try again.',
        success: false
      }
    }

    const quote = data['Global Quote']
    if (!quote || Object.keys(quote).length === 0) {
      return {
        data: {} as StockQuote,
        error: `No stock data found for symbol "${symbol}". Please verify the symbol is correct.`,
        success: false
      }
    }

    const result: StockQuote = {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      previousClose: parseFloat(quote['08. previous close']),
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      marketCap: 0, // Not available in this endpoint
      lastUpdated: quote['07. latest trading day']
    }

    return {
      data: result,
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
        error: 'API key not configured. Please add NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY to your environment variables.',
        success: false
      }
    }

    const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    const response = await fetchWithRetry(url)
    const data = await response.json()

    if (data['Error Message']) {
      return {
        data: {} as CompanyOverview,
        error: `API Error: ${data['Error Message']}`,
        success: false
      }
    }

    if (data.Note) {
      return {
        data: {} as CompanyOverview,
        error: 'API rate limit exceeded. Alpha Vantage free tier allows 5 calls per minute and 500 calls per day. Please wait and try again.',
        success: false
      }
    }

    if (!data.Symbol) {
      return {
        data: {} as CompanyOverview,
        error: `No company data found for symbol "${symbol}". Please verify the symbol is correct.`,
        success: false
      }
    }

    const result: CompanyOverview = {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      cik: data.CIK,
      exchange: data.Exchange,
      currency: data.Currency,
      country: data.Country,
      sector: data.Sector,
      industry: data.Industry,
      address: data.Address,
      fiscalYearEnd: data.FiscalYearEnd,
      latestQuarter: data.LatestQuarter,
      marketCapitalization: parseFloat(data.MarketCapitalization) || 0,
      ebitda: parseFloat(data.EBITDA) || 0,
      peRatio: parseFloat(data.PERatio) || 0,
      pegRatio: parseFloat(data.PEGRatio) || 0,
      bookValue: parseFloat(data.BookValue) || 0,
      dividendPerShare: parseFloat(data.DividendPerShare) || 0,
      dividendYield: parseFloat(data.DividendYield) || 0,
      eps: parseFloat(data.EPS) || 0,
      revenuePerShareTTM: parseFloat(data.RevenuePerShareTTM) || 0,
      profitMargin: parseFloat(data.ProfitMargin) || 0,
      operatingMarginTTM: parseFloat(data.OperatingMarginTTM) || 0,
      returnOnAssetsTTM: parseFloat(data.ReturnOnAssetsTTM) || 0,
      returnOnEquityTTM: parseFloat(data.ReturnOnEquityTTM) || 0,
      revenueTTM: parseFloat(data.RevenueTTM) || 0,
      grossProfitTTM: parseFloat(data.GrossProfitTTM) || 0,
      dilutedEPSTTM: parseFloat(data.DilutedEPSTTM) || 0,
      quarterlyEarningsGrowthYOY: parseFloat(data.QuarterlyEarningsGrowthYOY) || 0,
      quarterlyRevenueGrowthYOY: parseFloat(data.QuarterlyRevenueGrowthYOY) || 0,
      analystTargetPrice: parseFloat(data.AnalystTargetPrice) || 0,
      trailingPE: parseFloat(data.TrailingPE) || 0,
      forwardPE: parseFloat(data.ForwardPE) || 0,
      priceToSalesRatioTTM: parseFloat(data.PriceToSalesRatioTTM) || 0,
      priceToBookRatio: parseFloat(data.PriceToBookRatio) || 0,
      evToRevenue: parseFloat(data.EVToRevenue) || 0,
      evToEbitda: parseFloat(data.EVToEBITDA) || 0,
      beta: parseFloat(data.Beta) || 0,
      high52Week: parseFloat(data['52WeekHigh']) || 0,
      low52Week: parseFloat(data['52WeekLow']) || 0,
      movingAverage50Day: parseFloat(data['50DayMovingAverage']) || 0,
      movingAverage200Day: parseFloat(data['200DayMovingAverage']) || 0,
      sharesOutstanding: parseFloat(data.SharesOutstanding) || 0,
      dividendDate: data.DividendDate,
      exDividendDate: data.ExDividendDate
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
        error: 'API key not configured. Please add NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY to your environment variables.',
        success: false
      }
    }

    let functionName = 'TIME_SERIES_DAILY'
    let outputSize = 'compact'

    switch (timeRange) {
      case '1D':
        functionName = 'TIME_SERIES_INTRADAY'
        break
      case '5D':
        functionName = 'TIME_SERIES_DAILY'
        outputSize = 'compact'
        break
      case '1M':
      case '3M':
      case '6M':
        functionName = 'TIME_SERIES_DAILY'
        outputSize = 'full'
        break
      case '1Y':
      case '5Y':
      case 'MAX':
        functionName = 'TIME_SERIES_WEEKLY'
        outputSize = 'full'
        break
    }

    let url = `${BASE_URL}?function=${functionName}&symbol=${symbol}&outputsize=${outputSize}&apikey=${API_KEY}`
    
    if (functionName === 'TIME_SERIES_INTRADAY') {
      url += '&interval=5min'
    }

    const response = await fetchWithRetry(url)
    const data = await response.json()

    if (data['Error Message']) {
      return {
        data: [],
        error: `API Error: ${data['Error Message']}`,
        success: false
      }
    }

    if (data.Note) {
      return {
        data: [],
        error: 'API rate limit exceeded. Alpha Vantage free tier allows 5 calls per minute and 500 calls per day. Please wait and try again.',
        success: false
      }
    }

    let timeSeries: any = null
    if (functionName === 'TIME_SERIES_INTRADAY') {
      timeSeries = data['Time Series (5min)']
    } else if (functionName === 'TIME_SERIES_DAILY') {
      timeSeries = data['Time Series (Daily)']
    } else if (functionName === 'TIME_SERIES_WEEKLY') {
      timeSeries = data['Weekly Time Series']
    }

    if (!timeSeries) {
      return {
        data: [],
        error: `No chart data available for symbol "${symbol}". Please verify the symbol is correct.`,
        success: false
      }
    }

    const chartData: ChartData[] = Object.entries(timeSeries)
      .map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Filter data based on time range
    const now = new Date()
    let filteredData = chartData

    switch (timeRange) {
      case '1D':
        // Keep only today's data
        filteredData = chartData.filter(item => 
          new Date(item.date).toDateString() === now.toDateString()
        )
        break
      case '5D':
        // Keep last 5 trading days
        filteredData = chartData.slice(-5)
        break
      case '1M':
        // Keep last 30 days
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filteredData = chartData.filter(item => new Date(item.date) >= oneMonthAgo)
        break
      case '3M':
        // Keep last 90 days
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        filteredData = chartData.filter(item => new Date(item.date) >= threeMonthsAgo)
        break
      case '6M':
        // Keep last 180 days
        const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        filteredData = chartData.filter(item => new Date(item.date) >= sixMonthsAgo)
        break
      case '1Y':
        // Keep last 365 days
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        filteredData = chartData.filter(item => new Date(item.date) >= oneYearAgo)
        break
      case '5Y':
        // Keep last 5 years
        const fiveYearsAgo = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000)
        filteredData = chartData.filter(item => new Date(item.date) >= fiveYearsAgo)
        break
      case 'MAX':
        // Keep all data
        filteredData = chartData
        break
    }

    return {
      data: filteredData,
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
        error: 'API key not configured. Please add NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY to your environment variables.',
        success: false
      }
    }

    let url = `${BASE_URL}?function=NEWS_SENTIMENT&apikey=${API_KEY}`
    if (symbol) {
      url += `&tickers=${symbol}`
    }

    const response = await fetchWithRetry(url)
    const data = await response.json()

    if (data['Error Message']) {
      return {
        data: [],
        error: `API Error: ${data['Error Message']}`,
        success: false
      }
    }

    if (data.Note) {
      return {
        data: [],
        error: 'API rate limit exceeded. Alpha Vantage free tier allows 5 calls per minute and 500 calls per day. Please wait and try again.',
        success: false
      }
    }

    const newsItems: NewsItem[] = data.feed?.slice(0, 20).map((item: any) => ({
      title: item.title,
      url: item.url,
      time_published: item.time_published,
      authors: item.authors,
      summary: item.summary,
      banner_image: item.banner_image,
      source: item.source,
      category_within_source: item.category_within_source,
      source_domain: item.source_domain,
      topics: item.topics || [],
      overall_sentiment_score: item.overall_sentiment_score,
      overall_sentiment_label: item.overall_sentiment_label,
      ticker_sentiment: item.ticker_sentiment || []
    })) || []

    if (newsItems.length === 0) {
      return {
        data: [],
        error: `No news found${symbol ? ` for symbol "${symbol}"` : ''}. Please try again later.`,
        success: false
      }
    }

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
        error: 'API key not configured. Please add NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY to your environment variables.',
        success: false
      }
    }

    // Alpha Vantage doesn't have a direct market indices endpoint in the free tier
    // We would need to make multiple calls to get index data
    // For now, return an error message explaining the limitation
    return {
      data: [],
      error: 'Market indices are not available in the Alpha Vantage free tier. Please upgrade to a paid plan or configure a different data source.',
      success: false
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