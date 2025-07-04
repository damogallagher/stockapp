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

import yahooFinance from 'yahoo-finance2'

class StockApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'StockApiError'
  }
}


export async function searchStocks(query: string): Promise<ApiResponse<StockSearchResult[]>> {
  try {
    const searchResults = await yahooFinance.search(query, {
      quotesCount: 10,
      newsCount: 0,
      enableFuzzyQuery: true,
      quotesQueryId: 'tss_match_phrase_query'
    })

    if (!searchResults.quotes || searchResults.quotes.length === 0) {
      return {
        data: [],
        error: `No stocks found matching "${query}". Try a different search term.`,
        success: false
      }
    }

    const results: StockSearchResult[] = searchResults.quotes.map((quote: any) => ({
      symbol: quote.symbol,
      name: quote.shortname || quote.longname || quote.symbol,
      type: quote.quoteType || 'EQUITY',
      region: quote.region || 'United States',
      marketOpen: '09:30',
      marketClose: '16:00',
      timezone: 'UTC-05', // EST
      currency: quote.currency || 'USD',
      matchScore: quote.score || 0.9
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
    const quote = await yahooFinance.quote(symbol)

    if (!quote) {
      return {
        data: {} as StockQuote,
        error: `No stock data found for symbol "${symbol}". Please verify the symbol is correct.`,
        success: false
      }
    }

    const currentPrice = quote.regularMarketPrice || quote.postMarketPrice || quote.preMarketPrice || 0
    const previousClose = quote.regularMarketPreviousClose || 0
    const change = quote.regularMarketChange || 0
    const changePercent = quote.regularMarketChangePercent || 0

    const stockQuote: StockQuote = {
      symbol: symbol.toUpperCase(),
      price: Number(currentPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      volume: quote.regularMarketVolume || 0,
      previousClose: Number(previousClose.toFixed(2)),
      open: quote.regularMarketOpen || 0,
      high: quote.regularMarketDayHigh || 0,
      low: quote.regularMarketDayLow || 0,
      marketCap: quote.marketCap || 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    return {
      data: stockQuote,
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
    const [quote, summaryDetail] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.quoteSummary(symbol, { modules: ['summaryDetail', 'summaryProfile', 'financialData', 'defaultKeyStatistics'] })
    ])

    if (!quote) {
      return {
        data: {} as CompanyOverview,
        error: `No company data found for symbol "${symbol}". Please verify the symbol is correct.`,
        success: false
      }
    }

    const profile = summaryDetail.summaryProfile
    const financial = summaryDetail.financialData
    const keyStats = summaryDetail.defaultKeyStatistics
    const summary = summaryDetail.summaryDetail

    const result: CompanyOverview = {
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || quote.symbol,
      description: profile?.longBusinessSummary || `${quote.shortName || quote.symbol} is a publicly traded company.`,
      cik: '',
      exchange: quote.fullExchangeName || '',
      currency: quote.currency || 'USD',
      country: profile?.country || 'United States',
      sector: profile?.sector || '',
      industry: profile?.industry || '',
      address: `${profile?.address1 || ''} ${profile?.city || ''} ${profile?.state || ''}`.trim(),
      fiscalYearEnd: keyStats?.lastFiscalYearEnd ? new Date(Number(keyStats.lastFiscalYearEnd) * 1000).toISOString().split('T')[0] : '',
      latestQuarter: keyStats?.mostRecentQuarter ? new Date(Number(keyStats.mostRecentQuarter) * 1000).toISOString().split('T')[0] : '',
      marketCapitalization: quote.marketCap || 0,
      ebitda: keyStats?.enterpriseValue || 0,
      peRatio: summary?.trailingPE || 0,
      pegRatio: keyStats?.pegRatio || 0,
      bookValue: keyStats?.bookValue || 0,
      dividendPerShare: (keyStats as any)?.trailingAnnualDividendRate || 0,
      dividendYield: (keyStats as any)?.dividendYield || 0,
      eps: keyStats?.trailingEps || 0,
      revenuePerShareTTM: financial?.revenuePerShare || 0,
      profitMargin: financial?.profitMargins || 0,
      operatingMarginTTM: financial?.operatingMargins || 0,
      returnOnAssetsTTM: financial?.returnOnAssets || 0,
      returnOnEquityTTM: financial?.returnOnEquity || 0,
      revenueTTM: financial?.totalRevenue || 0,
      grossProfitTTM: financial?.grossProfits || 0,
      dilutedEPSTTM: keyStats?.trailingEps || 0,
      quarterlyEarningsGrowthYOY: financial?.earningsGrowth || 0,
      quarterlyRevenueGrowthYOY: financial?.revenueGrowth || 0,
      analystTargetPrice: financial?.targetMeanPrice || 0,
      trailingPE: summary?.trailingPE || 0,
      forwardPE: summary?.forwardPE || 0,
      priceToSalesRatioTTM: summary?.priceToSalesTrailing12Months || 0,
      priceToBookRatio: keyStats?.priceToBook || 0,
      evToRevenue: keyStats?.enterpriseToRevenue || 0,
      evToEbitda: keyStats?.enterpriseToEbitda || 0,
      beta: keyStats?.beta || 0,
      high52Week: (keyStats as any)?.fiftyTwoWeekHigh || 0,
      low52Week: (keyStats as any)?.fiftyTwoWeekLow || 0,
      movingAverage50Day: summary?.fiftyDayAverage || 0,
      movingAverage200Day: summary?.twoHundredDayAverage || 0,
      sharesOutstanding: keyStats?.sharesOutstanding || 0,
      dividendDate: (keyStats as any)?.lastDividendDate ? new Date(((keyStats as any).lastDividendDate as number) * 1000).toISOString().split('T')[0] : '',
      exDividendDate: (keyStats as any)?.exDividendDate ? new Date(((keyStats as any).exDividendDate as number) * 1000).toISOString().split('T')[0] : ''
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
    // Calculate date range and interval based on timeRange
    const now = new Date()
    let period1: Date
    let interval: string

    switch (timeRange) {
      case '1D':
        interval = '5m'
        period1 = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '5D':
        interval = '1h'
        period1 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
        break
      case '1M':
        interval = '1d'
        period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '3M':
        interval = '1d'
        period1 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '6M':
        interval = '1d'
        period1 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      case '1Y':
        interval = '1wk'
        period1 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case '5Y':
        interval = '1mo'
        period1 = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000)
        break
      case 'MAX':
        interval = '1mo'
        period1 = new Date(now.getTime() - 10 * 365 * 24 * 60 * 60 * 1000)
        break
      default:
        interval = '1d'
        period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const historical = await yahooFinance.historical(symbol, {
      period1: period1.toISOString().split('T')[0],
      period2: now.toISOString().split('T')[0],
      interval: interval as any
    })

    if (!historical || historical.length === 0) {
      return {
        data: [],
        error: `No chart data available for symbol "${symbol}". Please verify the symbol is correct.`,
        success: false
      }
    }

    const chartData: ChartData[] = historical.map((bar: any) => ({
      date: new Date(bar.date).toISOString().split('T')[0],
      open: Number(bar.open.toFixed(2)),
      high: Number(bar.high.toFixed(2)),
      low: Number(bar.low.toFixed(2)),
      close: Number(bar.close.toFixed(2)),
      volume: bar.volume
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
    // Note: Yahoo Finance doesn't provide a direct news API through yahoo-finance2
    // For this implementation, we'll return a limited set of mock news data
    // In a real implementation, you might use a different news API or scraping service
    
    const mockNews: NewsItem[] = [
      {
        title: `Market Update: ${symbol ? `${symbol} stock movement` : 'General market trends'}`,
        url: 'https://finance.yahoo.com',
        time_published: new Date().toISOString(),
        authors: ['Yahoo Finance'],
        summary: `Latest market news and analysis ${symbol ? `for ${symbol}` : 'for the general market'}.`,
        banner_image: '',
        source: 'Yahoo Finance',
        category_within_source: 'Market News',
        source_domain: 'finance.yahoo.com',
        topics: [],
        overall_sentiment_score: 0,
        overall_sentiment_label: 'Neutral',
        ticker_sentiment: symbol ? [{
          ticker: symbol,
          relevance_score: '0.8',
          ticker_sentiment_score: '0.0',
          ticker_sentiment_label: 'Neutral'
        }] : []
      }
    ]

    return {
      data: mockNews,
      error: 'Note: News functionality is limited with Yahoo Finance API. Consider integrating a dedicated news API for better coverage.',
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
    // Use major ETFs that track indices
    const indexInfo = [
      { symbol: 'SPY', name: 'S&P 500' },
      { symbol: 'QQQ', name: 'NASDAQ-100' },
      { symbol: 'DIA', name: 'Dow Jones' }
    ]

    const results: MarketIndex[] = []

    for (const index of indexInfo) {
      try {
        const quote = await yahooFinance.quote(index.symbol)
        
        if (quote) {
          const currentPrice = quote.regularMarketPrice || 0
          const change = quote.regularMarketChange || 0
          const changePercent = quote.regularMarketChangePercent || 0

          results.push({
            symbol: index.symbol,
            name: index.name,
            price: Number(currentPrice.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            lastUpdated: new Date().toISOString().split('T')[0]
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