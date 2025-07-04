// Mock yahoo-finance2 module
export const mockYahooFinance = {
  search: jest.fn(),
  quote: jest.fn(),
  quoteSummary: jest.fn(),
  historical: jest.fn(),
}

// Mock the default export
const yahooFinanceMock = {
  default: mockYahooFinance,
  ...mockYahooFinance,
}

export default yahooFinanceMock

// Setup mock implementations
beforeEach(() => {
  // Mock search
  mockYahooFinance.search.mockResolvedValue({
    quotes: [
      {
        symbol: 'AAPL',
        shortname: 'Apple Inc.',
        longname: 'Apple Inc.',
        quoteType: 'EQUITY',
        region: 'United States',
        currency: 'USD',
        score: 0.95,
      },
    ],
  })

  // Mock quote
  mockYahooFinance.quote.mockResolvedValue({
    symbol: 'AAPL',
    shortName: 'Apple Inc.',
    longName: 'Apple Inc.',
    regularMarketPrice: 150.25,
    regularMarketPreviousClose: 147.75,
    regularMarketChange: 2.50,
    regularMarketChangePercent: 1.69,
    regularMarketVolume: 50000000,
    regularMarketOpen: 148.00,
    regularMarketDayHigh: 151.00,
    regularMarketDayLow: 147.50,
    marketCap: 2500000000000,
    fullExchangeName: 'NASDAQ',
    currency: 'USD',
  })

  // Mock quoteSummary
  mockYahooFinance.quoteSummary.mockResolvedValue({
    summaryProfile: {
      longBusinessSummary: 'Apple Inc. designs, manufactures, and markets smartphones...',
      country: 'United States',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      address1: '1 Apple Park Way',
      city: 'Cupertino',
      state: 'CA',
    },
    financialData: {
      totalRevenue: 394000000000,
      profitMargins: 0.24,
      operatingMargins: 0.27,
      returnOnAssets: 0.17,
      returnOnEquity: 0.53,
      revenuePerShare: 25.47,
      earningsGrowth: 0.05,
      revenueGrowth: 0.02,
      targetMeanPrice: 160.00,
      grossProfits: 170000000000,
    },
    defaultKeyStatistics: {
      trailingEps: 6.13,
      pegRatio: 1.8,
      bookValue: 4.25,
      beta: 1.24,
      enterpriseValue: 2600000000000,
      enterpriseToRevenue: 6.2,
      enterpriseToEbitda: 18.5,
      priceToBook: 35.4,
      sharesOutstanding: 15728000000,
      lastFiscalYearEnd: 1696204800, // Unix timestamp
      mostRecentQuarter: 1688169600, // Unix timestamp
    },
    summaryDetail: {
      trailingPE: 24.5,
      forwardPE: 22.8,
      priceToSalesTrailing12Months: 6.35,
      fiftyDayAverage: 145.67,
      twoHundredDayAverage: 156.89,
    },
  })

  // Mock historical
  mockYahooFinance.historical.mockResolvedValue([
    {
      date: new Date('2024-01-10'),
      open: 148.00,
      high: 151.00,
      low: 147.50,
      close: 150.25,
      volume: 50000000,
    },
    {
      date: new Date('2024-01-11'),
      open: 150.25,
      high: 152.50,
      low: 149.75,
      close: 151.75,
      volume: 48000000,
    },
  ])
})

// Mock the module
jest.mock('yahoo-finance2', () => mockYahooFinance)