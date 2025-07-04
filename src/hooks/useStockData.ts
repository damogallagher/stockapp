import { useState, useEffect } from 'react'
import { 
  getStockQuote, 
  getCompanyOverview, 
  getStockChart, 
  getMarketNews,
  getCachedData,
  setCachedData
} from '@/lib/api'
import { StockQuote, CompanyOverview, ChartData, NewsItem, TimeRange } from '@/lib/types'

export function useStockQuote(symbol: string) {
  const [data, setData] = useState<StockQuote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!symbol) return

    const fetchQuote = async () => {
      setLoading(true)
      setError(null)
      
      // Check cache first
      const cacheKey = `quote-${symbol}`
      const cached = getCachedData<StockQuote>(cacheKey)
      if (cached) {
        setData(cached)
        setLoading(false)
        return
      }

      try {
        const result = await getStockQuote(symbol)
        if (result.success) {
          setData(result.data)
          setCachedData(cacheKey, result.data)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quote')
      } finally {
        setLoading(false)
      }
    }

    fetchQuote()
  }, [symbol])

  return { data, loading, error }
}

export function useCompanyOverview(symbol: string) {
  const [data, setData] = useState<CompanyOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!symbol) return

    const fetchOverview = async () => {
      setLoading(true)
      setError(null)
      
      // Check cache first
      const cacheKey = `overview-${symbol}`
      const cached = getCachedData<CompanyOverview>(cacheKey)
      if (cached) {
        setData(cached)
        setLoading(false)
        return
      }

      try {
        const result = await getCompanyOverview(symbol)
        if (result.success) {
          setData(result.data)
          setCachedData(cacheKey, result.data)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch company overview')
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [symbol])

  return { data, loading, error }
}

export function useStockChart(symbol: string, timeRange: TimeRange) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!symbol) return

    const fetchChart = async () => {
      setLoading(true)
      setError(null)
      
      // Check cache first
      const cacheKey = `chart-${symbol}-${timeRange}`
      const cached = getCachedData<ChartData[]>(cacheKey)
      if (cached) {
        setData(cached)
        setLoading(false)
        return
      }

      try {
        const result = await getStockChart(symbol, timeRange)
        if (result.success) {
          setData(result.data)
          setCachedData(cacheKey, result.data)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chart data')
      } finally {
        setLoading(false)
      }
    }

    fetchChart()
  }, [symbol, timeRange])

  return { data, loading, error }
}

export function useMarketNews(symbol?: string) {
  const [data, setData] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      setError(null)
      
      // Check cache first
      const cacheKey = `news-${symbol || 'general'}`
      const cached = getCachedData<NewsItem[]>(cacheKey)
      if (cached) {
        setData(cached)
        setLoading(false)
        return
      }

      try {
        const result = await getMarketNews(symbol)
        if (result.success) {
          setData(result.data)
          setCachedData(cacheKey, result.data)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news')
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [symbol])

  return { data, loading, error }
}

export function useStockData(symbol: string) {
  const quote = useStockQuote(symbol)
  const overview = useCompanyOverview(symbol)
  const news = useMarketNews(symbol)

  const loading = quote.loading || overview.loading || news.loading
  const error = quote.error || overview.error || news.error

  return {
    quote: quote.data,
    overview: overview.data,
    news: news.data,
    loading,
    error
  }
}