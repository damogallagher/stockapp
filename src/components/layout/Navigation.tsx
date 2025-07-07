'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Search, 
  TrendingUp, 
  Star, 
  Menu, 
  X, 
  BarChart3, 
  Moon, 
  Sun,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useStockStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Market', href: '/market', icon: BarChart3 },
  { name: 'Watchlist', href: '/watchlist', icon: Star },
]

interface NavigationProps {
  onSearch?: () => void
}

export default function Navigation({ onSearch }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isDarkMode, toggleDarkMode } = useStockStore()
  const pathname = usePathname()

  return (
    <>
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            {/* Logo and primary nav */}
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/" className="flex items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <span className="text-xl font-bold">StockApp</span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8" data-testid="desktop-nav">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'inline-flex items-center gap-2 px-1 pt-1 text-sm font-medium transition-colors border-b-2',
                        isActive
                          ? 'border-primary text-foreground'
                          : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right side items */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSearch}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search stocks...
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="h-9 w-9 p-0"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="h-9 w-9 p-0 mr-2"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-9 w-9 p-0"
                data-testid="mobile-menu-button"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary border-r-2 border-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
              
              <button
                onClick={() => {
                  onSearch?.()
                  setMobileMenuOpen(false)
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Search className="h-5 w-5" />
                Search Stocks
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-25 sm:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

export function NavigationSkeleton() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
            <div className="h-9 w-9 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex items-center sm:hidden">
            <div className="h-9 w-9 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    </nav>
  )
}