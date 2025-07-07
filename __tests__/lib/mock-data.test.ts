import {
  mockStockQuote,
  mockSearchResults,
  mockCompanyOverview,
  mockChartData,
  mockNews,
  mockMarketIndices
} from '@/lib/mock-data'
import {
  StockQuote,
  StockSearchResult,
  CompanyOverview,
  ChartData,
  NewsItem,
  MarketIndex
} from '@/lib/types'

describe('Mock Data', () => {
  describe('mockStockQuote', () => {
    it('should have all required StockQuote properties', () => {
      expect(mockStockQuote).toHaveProperty('symbol')
      expect(mockStockQuote).toHaveProperty('price')
      expect(mockStockQuote).toHaveProperty('change')
      expect(mockStockQuote).toHaveProperty('changePercent')
      expect(mockStockQuote).toHaveProperty('volume')
      expect(mockStockQuote).toHaveProperty('previousClose')
      expect(mockStockQuote).toHaveProperty('open')
      expect(mockStockQuote).toHaveProperty('high')
      expect(mockStockQuote).toHaveProperty('low')
      expect(mockStockQuote).toHaveProperty('marketCap')
      expect(mockStockQuote).toHaveProperty('lastUpdated')
    })

    it('should have correct data types', () => {
      expect(typeof mockStockQuote.symbol).toBe('string')
      expect(typeof mockStockQuote.price).toBe('number')
      expect(typeof mockStockQuote.change).toBe('number')
      expect(typeof mockStockQuote.changePercent).toBe('number')
      expect(typeof mockStockQuote.volume).toBe('number')
      expect(typeof mockStockQuote.previousClose).toBe('number')
      expect(typeof mockStockQuote.open).toBe('number')
      expect(typeof mockStockQuote.high).toBe('number')
      expect(typeof mockStockQuote.low).toBe('number')
      expect(typeof mockStockQuote.marketCap).toBe('number')
      expect(typeof mockStockQuote.lastUpdated).toBe('string')
    })

    it('should have realistic stock data', () => {
      expect(mockStockQuote.symbol).toBe('AAPL')
      expect(mockStockQuote.price).toBeGreaterThan(0)
      expect(mockStockQuote.volume).toBeGreaterThan(0)
      expect(mockStockQuote.marketCap).toBeGreaterThan(0)
      expect(mockStockQuote.high).toBeGreaterThanOrEqual(mockStockQuote.low)
      expect(mockStockQuote.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD format
    })
  })

  describe('mockSearchResults', () => {
    it('should be an array of StockSearchResult objects', () => {
      expect(Array.isArray(mockSearchResults)).toBe(true)
      expect(mockSearchResults.length).toBeGreaterThan(0)
    })

    it('should have all required properties for each result', () => {
      mockSearchResults.forEach((result: StockSearchResult) => {
        expect(result).toHaveProperty('symbol')
        expect(result).toHaveProperty('name')
        expect(result).toHaveProperty('type')
        expect(result).toHaveProperty('region')
        expect(result).toHaveProperty('marketOpen')
        expect(result).toHaveProperty('marketClose')
        expect(result).toHaveProperty('timezone')
        expect(result).toHaveProperty('currency')
        expect(result).toHaveProperty('matchScore')
      })
    })

    it('should have valid symbols and names', () => {
      expect(mockSearchResults[0].symbol).toBe('AAPL')
      expect(mockSearchResults[0].name).toBe('Apple Inc.')
      expect(mockSearchResults[1].symbol).toBe('GOOGL')
      expect(mockSearchResults[1].name).toBe('Alphabet Inc.')
      expect(mockSearchResults[2].symbol).toBe('MSFT')
      expect(mockSearchResults[2].name).toBe('Microsoft Corporation')
    })

    it('should have valid match scores', () => {
      mockSearchResults.forEach((result: StockSearchResult) => {
        expect(result.matchScore).toBeGreaterThanOrEqual(0)
        expect(result.matchScore).toBeLessThanOrEqual(1)
      })
    })
  })

  describe('mockCompanyOverview', () => {
    it('should have all required CompanyOverview properties', () => {
      const requiredProps = [
        'symbol', 'name', 'description', 'cik', 'exchange', 'currency',
        'country', 'sector', 'industry', 'address', 'fiscalYearEnd',
        'latestQuarter', 'marketCapitalization', 'ebitda', 'peRatio',
        'pegRatio', 'bookValue', 'dividendPerShare', 'dividendYield',
        'eps', 'revenuePerShareTTM', 'profitMargin', 'operatingMarginTTM',
        'returnOnAssetsTTM', 'returnOnEquityTTM', 'revenueTTM',
        'grossProfitTTM', 'dilutedEPSTTM', 'quarterlyEarningsGrowthYOY',
        'quarterlyRevenueGrowthYOY', 'analystTargetPrice', 'trailingPE',
        'forwardPE', 'priceToSalesRatioTTM', 'priceToBookRatio',
        'evToRevenue', 'evToEbitda', 'beta', 'high52Week', 'low52Week',
        'movingAverage50Day', 'movingAverage200Day', 'sharesOutstanding',
        'dividendDate', 'exDividendDate'
      ]

      requiredProps.forEach(prop => {
        expect(mockCompanyOverview).toHaveProperty(prop)
      })
    })

    it('should have realistic financial ratios', () => {
      expect(mockCompanyOverview.peRatio).toBeGreaterThan(0)
      expect(mockCompanyOverview.pegRatio).toBeGreaterThan(0)
      expect(mockCompanyOverview.profitMargin).toBeGreaterThan(0)
      expect(mockCompanyOverview.profitMargin).toBeLessThan(1)
      expect(mockCompanyOverview.beta).toBeGreaterThan(0)
      expect(mockCompanyOverview.high52Week).toBeGreaterThan(mockCompanyOverview.low52Week)
    })

    it('should have valid company information', () => {
      expect(mockCompanyOverview.symbol).toBe('AAPL')
      expect(mockCompanyOverview.name).toBe('Apple Inc.')
      expect(mockCompanyOverview.sector).toBe('Technology')
      expect(mockCompanyOverview.industry).toBe('Consumer Electronics')
      expect(mockCompanyOverview.exchange).toBe('NASDAQ')
      expect(mockCompanyOverview.country).toBe('USA')
    })
  })

  describe('mockChartData', () => {
    it('should be an array of ChartData objects', () => {
      expect(Array.isArray(mockChartData)).toBe(true)
      expect(mockChartData.length).toBeGreaterThan(0)
    })

    it('should have all required properties for each data point', () => {
      mockChartData.forEach((data: ChartData) => {
        expect(data).toHaveProperty('date')
        expect(data).toHaveProperty('open')
        expect(data).toHaveProperty('high')
        expect(data).toHaveProperty('low')
        expect(data).toHaveProperty('close')
        expect(data).toHaveProperty('volume')
      })
    })

    it('should have valid OHLC data', () => {
      mockChartData.forEach((data: ChartData) => {
        expect(data.high).toBeGreaterThanOrEqual(data.low)
        expect(data.high).toBeGreaterThanOrEqual(data.open)
        expect(data.high).toBeGreaterThanOrEqual(data.close)
        expect(data.low).toBeLessThanOrEqual(data.open)
        expect(data.low).toBeLessThanOrEqual(data.close)
        expect(data.volume).toBeGreaterThan(0)
      })
    })

    it('should have valid date format', () => {
      mockChartData.forEach((data: ChartData) => {
        expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })

    it('should be in chronological order', () => {
      for (let i = 1; i < mockChartData.length; i++) {
        const prevDate = new Date(mockChartData[i - 1].date)
        const currDate = new Date(mockChartData[i].date)
        expect(currDate.getTime()).toBeGreaterThan(prevDate.getTime())
      }
    })
  })

  describe('mockNews', () => {
    it('should be an array of NewsItem objects', () => {
      expect(Array.isArray(mockNews)).toBe(true)
      expect(mockNews.length).toBeGreaterThan(0)
    })

    it('should have all required properties for each news item', () => {
      mockNews.forEach((news: NewsItem) => {
        expect(news).toHaveProperty('title')
        expect(news).toHaveProperty('url')
        expect(news).toHaveProperty('time_published')
        expect(news).toHaveProperty('authors')
        expect(news).toHaveProperty('summary')
        expect(news).toHaveProperty('banner_image')
        expect(news).toHaveProperty('source')
        expect(news).toHaveProperty('category_within_source')
        expect(news).toHaveProperty('source_domain')
        expect(news).toHaveProperty('topics')
        expect(news).toHaveProperty('overall_sentiment_score')
        expect(news).toHaveProperty('overall_sentiment_label')
        expect(news).toHaveProperty('ticker_sentiment')
      })
    })

    it('should have valid sentiment data', () => {
      mockNews.forEach((news: NewsItem) => {
        expect(news.overall_sentiment_score).toBeGreaterThanOrEqual(-1)
        expect(news.overall_sentiment_score).toBeLessThanOrEqual(1)
        expect(['Bullish', 'Bearish', 'Neutral']).toContain(news.overall_sentiment_label)
      })
    })

    it('should have valid ticker sentiment data', () => {
      mockNews.forEach((news: NewsItem) => {
        expect(Array.isArray(news.ticker_sentiment)).toBe(true)
        news.ticker_sentiment.forEach(sentiment => {
          expect(sentiment).toHaveProperty('ticker')
          expect(sentiment).toHaveProperty('relevance_score')
          expect(sentiment).toHaveProperty('ticker_sentiment_score')
          expect(sentiment).toHaveProperty('ticker_sentiment_label')
        })
      })
    })
  })

  describe('mockMarketIndices', () => {
    it('should be an array of MarketIndex objects', () => {
      expect(Array.isArray(mockMarketIndices)).toBe(true)
      expect(mockMarketIndices.length).toBeGreaterThan(0)
    })

    it('should have all required properties for each index', () => {
      mockMarketIndices.forEach((index: MarketIndex) => {
        expect(index).toHaveProperty('symbol')
        expect(index).toHaveProperty('name')
        expect(index).toHaveProperty('price')
        expect(index).toHaveProperty('change')
        expect(index).toHaveProperty('changePercent')
        expect(index).toHaveProperty('lastUpdated')
      })
    })

    it('should have valid market index symbols', () => {
      const symbols = mockMarketIndices.map(index => index.symbol)
      expect(symbols).toContain('SPY')
      expect(symbols).toContain('QQQ')
      expect(symbols).toContain('DIA')
    })

    it('should have valid price data', () => {
      mockMarketIndices.forEach((index: MarketIndex) => {
        expect(index.price).toBeGreaterThan(0)
        expect(typeof index.change).toBe('number')
        expect(typeof index.changePercent).toBe('number')
      })
    })

    it('should have valid timestamp format', () => {
      mockMarketIndices.forEach((index: MarketIndex) => {
        expect(index.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      })
    })
  })

  describe('Data Consistency', () => {
    it('should have consistent symbols across related data', () => {
      expect(mockStockQuote.symbol).toBe('AAPL')
      expect(mockCompanyOverview.symbol).toBe('AAPL')
      expect(mockSearchResults[0].symbol).toBe('AAPL')
    })

    it('should have realistic numerical relationships', () => {
      // Market cap should be roughly price * shares outstanding
      const estimatedMarketCap = mockStockQuote.price * mockCompanyOverview.sharesOutstanding
      const actualMarketCap = mockCompanyOverview.marketCapitalization
      
      // Allow for some variance (within 20%) due to different data points
      const variance = Math.abs(estimatedMarketCap - actualMarketCap) / actualMarketCap
      expect(variance).toBeLessThan(0.2)
    })
  })
})