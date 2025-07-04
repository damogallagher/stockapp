'use client'

import { Building, MapPin, Calendar, DollarSign, TrendingUp, Users, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCompanyOverview, useMarketNews } from '@/hooks/useStockData'
import { formatCurrency, formatPercentage, formatMarketCap } from '@/lib/utils'
import { format } from 'date-fns'

interface CompanyInfoProps {
  symbol: string
}

export default function CompanyInfo({ symbol }: CompanyInfoProps) {
  const { data: overview, loading: overviewLoading, error: overviewError } = useCompanyOverview(symbol)
  const { data: news, loading: newsLoading, error: newsError } = useMarketNews(symbol)

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (overviewError || !overview) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            {overviewError || 'No company information available'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Company Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    Sector
                  </div>
                  <div className="font-medium">{overview.sector || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Industry
                  </div>
                  <div className="font-medium">{overview.industry || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Country
                  </div>
                  <div className="font-medium">{overview.country || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Exchange
                  </div>
                  <div className="font-medium">{overview.exchange || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Currency
                  </div>
                  <div className="font-medium">{overview.currency || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Fiscal Year End
                  </div>
                  <div className="font-medium">{overview.fiscalYearEnd || 'N/A'}</div>
                </div>
              </div>

              {overview.description && (
                <div className="space-y-3">
                  <h4 className="font-medium">Description</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {overview.description}
                  </p>
                </div>
              )}

              {overview.address && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </h4>
                  <p className="text-sm text-muted-foreground">{overview.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Key Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Market Cap</div>
                  <div className="text-lg font-semibold">
                    {overview.marketCapitalization ? formatMarketCap(overview.marketCapitalization) : 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Shares Outstanding</div>
                  <div className="text-lg font-semibold">
                    {overview.sharesOutstanding ? formatMarketCap(overview.sharesOutstanding) : 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">52W High</div>
                  <div className="text-lg font-semibold">
                    {overview.high52Week ? formatCurrency(overview.high52Week) : 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">52W Low</div>
                  <div className="text-lg font-semibold">
                    {overview.low52Week ? formatCurrency(overview.low52Week) : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Valuation Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Valuation Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">P/E Ratio</span>
                    <span className="font-medium">{overview.peRatio || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">PEG Ratio</span>
                    <span className="font-medium">{overview.pegRatio || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price to Book</span>
                    <span className="font-medium">{overview.priceToBookRatio || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price to Sales</span>
                    <span className="font-medium">{overview.priceToSalesRatioTTM || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">EV/Revenue</span>
                    <span className="font-medium">{overview.evToRevenue || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">EV/EBITDA</span>
                    <span className="font-medium">{overview.evToEbitda || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Revenue (TTM)</span>
                    <span className="font-medium">
                      {overview.revenueTTM ? formatMarketCap(overview.revenueTTM) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gross Profit (TTM)</span>
                    <span className="font-medium">
                      {overview.grossProfitTTM ? formatMarketCap(overview.grossProfitTTM) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">EBITDA</span>
                    <span className="font-medium">
                      {overview.ebitda ? formatMarketCap(overview.ebitda) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Profit Margin</span>
                    <span className="font-medium">
                      {overview.profitMargin ? formatPercentage(overview.profitMargin * 100) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Operating Margin</span>
                    <span className="font-medium">
                      {overview.operatingMarginTTM ? formatPercentage(overview.operatingMarginTTM * 100) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">ROE</span>
                    <span className="font-medium">
                      {overview.returnOnEquityTTM ? formatPercentage(overview.returnOnEquityTTM * 100) : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dividend & Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Dividend & Growth</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Dividend Yield</span>
                    <span className="font-medium">
                      {overview.dividendYield ? formatPercentage(overview.dividendYield * 100) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Dividend Per Share</span>
                    <span className="font-medium">
                      {overview.dividendPerShare ? formatCurrency(overview.dividendPerShare) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ex-Dividend Date</span>
                    <span className="font-medium">{overview.exDividendDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Earnings Growth (YoY)</span>
                    <span className="font-medium">
                      {overview.quarterlyEarningsGrowthYOY ? formatPercentage(overview.quarterlyEarningsGrowthYOY * 100) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Revenue Growth (YoY)</span>
                    <span className="font-medium">
                      {overview.quarterlyRevenueGrowthYOY ? formatPercentage(overview.quarterlyRevenueGrowthYOY * 100) : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Beta</span>
                    <span className="font-medium">{overview.beta || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">50 Day MA</span>
                    <span className="font-medium">
                      {overview.movingAverage50Day ? formatCurrency(overview.movingAverage50Day) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">200 Day MA</span>
                    <span className="font-medium">
                      {overview.movingAverage200Day ? formatCurrency(overview.movingAverage200Day) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Book Value</span>
                    <span className="font-medium">
                      {overview.bookValue ? formatCurrency(overview.bookValue) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Analyst Target</span>
                    <span className="font-medium">
                      {overview.analystTargetPrice ? formatCurrency(overview.analystTargetPrice) : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          {newsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : newsError ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-destructive">
                  {newsError}
                </div>
              </CardContent>
            </Card>
          ) : news.length > 0 ? (
            <div className="space-y-4">
              {news.slice(0, 10).map((item, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-medium leading-tight">
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            {item.title}
                          </a>
                        </h3>
                        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground whitespace-nowrap">
                          <span>{item.source}</span>
                          <span>
                            {format(new Date(item.time_published), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.summary}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            item.overall_sentiment_label === 'Bullish' ? 'success' :
                            item.overall_sentiment_label === 'Bearish' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {item.overall_sentiment_label}
                        </Badge>
                        {item.topics.slice(0, 2).map((topic, topicIndex) => (
                          <Badge key={topicIndex} variant="outline">
                            {topic.topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  No news available for this stock
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}