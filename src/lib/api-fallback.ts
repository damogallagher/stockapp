import { 
  StockQuote, 
  StockSearchResult, 
  CompanyOverview, 
  ChartData, 
  NewsItem, 
  MarketIndex,
  ApiResponse,
  TimeRange 
} from './types'
import {
  mockStockQuote,
  mockSearchResults,
  mockCompanyOverview,
  mockChartData,
  mockNews,
  mockMarketIndices
} from './mock-data'

// Popular stocks data
const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' }
]

// Generate mock data for any symbol
function generateMockQuote(symbol: string): StockQuote {
  const basePrice = 100 + Math.random() * 400 // Random price between 100-500
  const change = (Math.random() - 0.5) * 20 // Random change between -10 and +10
  const changePercent = (change / basePrice) * 100
  
  return {
    symbol,
    price: Number(basePrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    volume: Math.floor(Math.random() * 50000000) + 10000000,
    previousClose: Number((basePrice - change).toFixed(2)),
    open: Number((basePrice + (Math.random() - 0.5) * 5).toFixed(2)),
    high: Number((basePrice + Math.random() * 10).toFixed(2)),
    low: Number((basePrice - Math.random() * 10).toFixed(2)),
    marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
    lastUpdated: new Date().toISOString().split('T')[0]
  }
}

function generateMockCompany(symbol: string): CompanyOverview {
  const stockInfo = popularStocks.find(s => s.symbol === symbol) || { symbol, name: `${symbol} Corporation` }
  
  return {
    ...mockCompanyOverview,
    symbol,
    name: stockInfo.name,
    description: `${stockInfo.name} is a leading technology company focused on innovation and growth.`,
    marketCapitalization: Math.floor(Math.random() * 1000000000000) + 100000000000,
    peRatio: Number((15 + Math.random() * 20).toFixed(2)),
    eps: Number((Math.random() * 10).toFixed(2)),
    high52Week: Number((150 + Math.random() * 100).toFixed(2)),
    low52Week: Number((80 + Math.random() * 50).toFixed(2))
  }
}

function generateMockChart(symbol: string, timeRange: TimeRange): ChartData[] {
  const data: ChartData[] = []
  const now = new Date()
  let days = 30 // Default to 1 month
  
  switch (timeRange) {
    case '1D': days = 1; break
    case '5D': days = 5; break
    case '1M': days = 30; break
    case '3M': days = 90; break
    case '6M': days = 180; break
    case '1Y': days = 365; break
    case '5Y': days = 1825; break
    case 'MAX': days = 2555; break // ~7 years
  }
  
  let currentPrice = 100 + Math.random() * 300
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const change = (Math.random() - 0.5) * 10
    currentPrice = Math.max(currentPrice + change, 10) // Ensure price doesn't go below 10
    
    const open = Number((currentPrice + (Math.random() - 0.5) * 5).toFixed(2))
    const close = Number(currentPrice.toFixed(2))
    const high = Number((Math.max(open, close) + Math.random() * 5).toFixed(2))
    const low = Number((Math.min(open, close) - Math.random() * 5).toFixed(2))
    
    data.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 50000000) + 5000000
    })
  }
  
  return data
}

export async function searchStocksFallback(query: string): Promise<ApiResponse<StockSearchResult[]>> {
  await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
  
  const results = popularStocks
    .filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    )
    .map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      type: 'Equity' as const,
      region: 'United States',
      marketOpen: '09:30',
      marketClose: '16:00',
      timezone: 'UTC-04',
      currency: 'USD',
      matchScore: stock.symbol.toLowerCase() === query.toLowerCase() ? 1.0 : 0.8
    }))
  
  return {
    data: results,
    error: null,
    success: true
  }
}

export async function getStockQuoteFallback(symbol: string): Promise<ApiResponse<StockQuote>> {
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
  
  return {
    data: generateMockQuote(symbol),
    error: null,
    success: true
  }
}

export async function getCompanyOverviewFallback(symbol: string): Promise<ApiResponse<CompanyOverview>> {
  await new Promise(resolve => setTimeout(resolve, 700)) // Simulate API delay
  
  return {
    data: generateMockCompany(symbol),
    error: null,
    success: true
  }
}

export async function getStockChartFallback(symbol: string, timeRange: TimeRange): Promise<ApiResponse<ChartData[]>> {
  await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
  
  return {
    data: generateMockChart(symbol, timeRange),
    error: null,
    success: true
  }
}

export async function getMarketNewsFallback(symbol?: string): Promise<ApiResponse<NewsItem[]>> {
  await new Promise(resolve => setTimeout(resolve, 400)) // Simulate API delay
  
  return {
    data: mockNews,
    error: null,
    success: true
  }
}

export async function getMarketIndicesFallback(): Promise<ApiResponse<MarketIndex[]>> {
  await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
  
  return {
    data: mockMarketIndices,
    error: null,
    success: true
  }
}