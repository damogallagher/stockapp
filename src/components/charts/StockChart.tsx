'use client'

import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useStockChart } from '@/hooks/useStockData'
import { useStockStore } from '@/lib/store'
import { TimeRange, ChartType } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

interface StockChartProps {
  symbol: string
  height?: number
}

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: '1D', label: '1D' },
  { value: '5D', label: '5D' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: '1Y', label: '1Y' },
  { value: '5Y', label: '5Y' },
  { value: 'MAX', label: 'MAX' }
]

const chartTypes: { value: ChartType; label: string }[] = [
  { value: 'line', label: 'Line' },
  { value: 'candlestick', label: 'Area' }, // Using area instead of candlestick for simplicity
  { value: 'volume', label: 'Volume' }
]

export default function StockChart({ symbol, height = 400 }: StockChartProps) {
  const { selectedTimeRange, selectedChartType, setTimeRange, setChartType } = useStockStore()
  const { data, loading, error } = useStockChart(symbol, selectedTimeRange)
  
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range)
  }

  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type)
  }

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'volume') {
      return [value?.toLocaleString(), 'Volume']
    }
    return [formatCurrency(value), name]
  }

  const formatTooltipLabel = (label: string) => {
    try {
      const date = new Date(label)
      if (selectedTimeRange === '1D') {
        return format(date, 'MMM dd, HH:mm')
      }
      return format(date, 'MMM dd, yyyy')
    } catch {
      return label
    }
  }

  const getDateFormat = () => {
    switch (selectedTimeRange) {
      case '1D':
        return 'HH:mm'
      case '5D':
      case '1M':
        return 'MMM dd'
      case '3M':
      case '6M':
        return 'MMM dd'
      case '1Y':
      case '5Y':
      case 'MAX':
        return 'MMM yyyy'
      default:
        return 'MMM dd'
    }
  }

  const formatXAxisTick = (tickItem: string) => {
    try {
      const date = new Date(tickItem)
      return format(date, getDateFormat())
    } catch {
      return tickItem
    }
  }

  const renderChart = () => {
    if (!data.length) return null

    const chartData = data.map(item => ({
      ...item,
      date: new Date(item.date).getTime()
    }))

    const isPositive = data.length > 1 && data[data.length - 1].close > data[0].close

    switch (selectedChartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatXAxisTick}
                fontSize={12}
              />
              <YAxis 
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => formatCurrency(value)}
                fontSize={12}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelFormatter={formatTooltipLabel}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke={isPositive ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                dot={false}
                name="Price"
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'candlestick': // Using area chart as alternative
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatXAxisTick}
                fontSize={12}
              />
              <YAxis 
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => formatCurrency(value)}
                fontSize={12}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelFormatter={formatTooltipLabel}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke={isPositive ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                fill="url(#colorPrice)"
                name="Price"
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'volume':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatXAxisTick}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => (value / 1000000).toFixed(0) + 'M'}
                fontSize={12}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelFormatter={formatTooltipLabel}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar 
                dataKey="volume" 
                fill="hsl(var(--primary))"
                name="volume"
              />
            </BarChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stock Chart</CardTitle>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height }} />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center text-destructive">
              {error}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-testid="stock-chart">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Stock Chart - {symbol}</CardTitle>
          <div className="flex gap-2">
            {data.length > 1 && (
              <Badge variant={data[data.length - 1].close > data[0].close ? "success" : "destructive"}>
                {data[data.length - 1].close > data[0].close ? '↗' : '↘'} 
                {' '}
                {selectedTimeRange}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Time Range Tabs */}
          <Tabs value={selectedTimeRange} onValueChange={(value) => handleTimeRangeChange(value as TimeRange)}>
            <TabsList className="grid grid-cols-4 lg:grid-cols-8">
              {timeRanges.map((range) => (
                <TabsTrigger key={range.value} value={range.value} className="text-xs">
                  {range.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          {/* Chart Type Buttons */}
          <div className="flex gap-1 bg-muted p-1 rounded-md">
            {chartTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedChartType === type.value ? "default" : "ghost"}
                size="sm"
                onClick={() => handleChartTypeChange(type.value)}
                className="text-xs"
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="w-full">
          {data.length > 0 ? (
            renderChart()
          ) : (
            <div className="flex items-center justify-center" style={{ height }}>
              <div className="text-center text-muted-foreground">
                No chart data available for this time range
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}