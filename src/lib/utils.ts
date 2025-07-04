import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

export function formatMarketCap(value: number): string {
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(2)}T`
  } else if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`
  }
  return value.toString()
}

export function getPriceChangeColor(change: number): string {
  if (change > 0) return 'gain'
  if (change < 0) return 'loss'
  return 'neutral'
}

export function isMarketOpen(): boolean {
  const now = new Date()
  const day = now.getDay()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const time = hours * 60 + minutes
  
  // Monday to Friday (1-5), 9:30 AM to 4:00 PM EST
  return day >= 1 && day <= 5 && time >= 570 && time <= 960
}

export function getNextMarketOpen(): Date {
  const now = new Date()
  const nextOpen = new Date(now)
  
  // Find next weekday at 9:30 AM
  while (nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
    nextOpen.setDate(nextOpen.getDate() + 1)
  }
  
  nextOpen.setHours(9, 30, 0, 0)
  
  // If it's already past market hours today, move to tomorrow
  if (nextOpen <= now) {
    nextOpen.setDate(nextOpen.getDate() + 1)
    while (nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
      nextOpen.setDate(nextOpen.getDate() + 1)
    }
  }
  
  return nextOpen
}