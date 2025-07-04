'use client'

import { useEffect } from 'react'
import { notFound } from 'next/navigation'
import Navigation from '@/components/layout/Navigation'
import StockDashboard from '@/components/stock/StockDashboard'
import StockChart from '@/components/charts/StockChart'
import CompanyInfo from '@/components/stock/CompanyInfo'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStockStore } from '@/lib/store'

interface StockPageProps {
  params: {
    symbol: string
  }
}

export default function StockPage({ params }: StockPageProps) {
  const { symbol } = params
  const { isDarkMode } = useStockStore()

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Validate symbol
  if (!symbol || symbol.length > 10 || !/^[A-Z]+$/.test(symbol.toUpperCase())) {
    notFound()
  }

  const normalizedSymbol = symbol.toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stock Dashboard */}
          <StockDashboard symbol={normalizedSymbol} />

          {/* Tabs for Chart and Company Info */}
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Chart & Analysis</TabsTrigger>
              <TabsTrigger value="company">Company Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="space-y-6">
              <StockChart symbol={normalizedSymbol} />
            </TabsContent>
            
            <TabsContent value="company" className="space-y-6">
              <CompanyInfo symbol={normalizedSymbol} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

