import {
  cn,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatMarketCap,
  getPriceChangeColor,
  isMarketOpen,
  getNextMarketOpen
} from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })

    it('should handle conditional classes', () => {
      expect(cn('text-red-500', true && 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
      expect(cn('text-red-500', false && 'bg-blue-500')).toBe('text-red-500')
    })

    it('should merge conflicting Tailwind classes', () => {
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500') // Later class should win
    })

    it('should handle empty or undefined inputs', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
      expect(cn(undefined, null)).toBe('')
    })
  })

  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      expect(formatCurrency(123.45)).toBe('$123.45')
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('should handle negative values', () => {
      expect(formatCurrency(-123.45)).toBe('-$123.45')
    })

    it('should handle different currencies', () => {
      expect(formatCurrency(123.45, 'EUR')).toContain('123.45')
      expect(formatCurrency(123.45, 'GBP')).toContain('123.45')
    })

    it('should round to 2 decimal places', () => {
      expect(formatCurrency(123.456)).toBe('$123.46')
      expect(formatCurrency(123.454)).toBe('$123.45')
    })

    it('should handle large numbers', () => {
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1234)).toBe('1,234')
      expect(formatNumber(1234567)).toBe('1,234,567')
      expect(formatNumber(123)).toBe('123')
    })

    it('should handle negative numbers', () => {
      expect(formatNumber(-1234)).toBe('-1,234')
    })

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0')
    })

    it('should handle decimal numbers', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(12.34)).toBe('12.34%')
      expect(formatPercentage(0.5)).toBe('0.50%')
      expect(formatPercentage(100)).toBe('100.00%')
    })

    it('should handle negative percentages', () => {
      expect(formatPercentage(-5.67)).toBe('-5.67%')
    })

    it('should handle zero', () => {
      expect(formatPercentage(0)).toBe('0.00%')
    })

    it('should handle very small numbers', () => {
      expect(formatPercentage(0.01)).toBe('0.01%')
    })

    it('should round to 2 decimal places', () => {
      expect(formatPercentage(12.345)).toBe('12.35%')
      expect(formatPercentage(12.344)).toBe('12.34%')
    })
  })

  describe('formatMarketCap', () => {
    it('should format trillions correctly', () => {
      expect(formatMarketCap(2500000000000)).toBe('2.50T')
      expect(formatMarketCap(1000000000000)).toBe('1.00T')
    })

    it('should format billions correctly', () => {
      expect(formatMarketCap(500000000000)).toBe('500.00B')
      expect(formatMarketCap(1500000000)).toBe('1.50B')
    })

    it('should format millions correctly', () => {
      expect(formatMarketCap(500000000)).toBe('500.00M')
      expect(formatMarketCap(1500000)).toBe('1.50M')
    })

    it('should format thousands correctly', () => {
      expect(formatMarketCap(500000)).toBe('500.00K')
      expect(formatMarketCap(1500)).toBe('1.50K')
    })

    it('should handle small numbers', () => {
      expect(formatMarketCap(500)).toBe('500')
      expect(formatMarketCap(0)).toBe('0')
    })

    it('should handle edge cases', () => {
      expect(formatMarketCap(999999999999)).toBe('1000.00B')
      expect(formatMarketCap(1000000000000)).toBe('1.00T')
    })
  })

  describe('getPriceChangeColor', () => {
    it('should return "gain" for positive changes', () => {
      expect(getPriceChangeColor(5.67)).toBe('gain')
      expect(getPriceChangeColor(0.01)).toBe('gain')
      expect(getPriceChangeColor(100)).toBe('gain')
    })

    it('should return "loss" for negative changes', () => {
      expect(getPriceChangeColor(-5.67)).toBe('loss')
      expect(getPriceChangeColor(-0.01)).toBe('loss')
      expect(getPriceChangeColor(-100)).toBe('loss')
    })

    it('should return "neutral" for zero change', () => {
      expect(getPriceChangeColor(0)).toBe('neutral')
    })
  })

  describe('isMarketOpen', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return true during market hours on weekdays', () => {
      // Tuesday at 10:00 AM (market hours)
      const marketHours = new Date('2024-01-16T10:00:00')
      jest.setSystemTime(marketHours)
      
      expect(isMarketOpen()).toBe(true)
    })

    it('should return true at market open (9:30 AM)', () => {
      // Tuesday at 9:30 AM
      const marketOpen = new Date('2024-01-16T09:30:00')
      jest.setSystemTime(marketOpen)
      
      expect(isMarketOpen()).toBe(true)
    })

    it('should return true at market close (4:00 PM)', () => {
      // Tuesday at 4:00 PM
      const marketClose = new Date('2024-01-16T16:00:00')
      jest.setSystemTime(marketClose)
      
      expect(isMarketOpen()).toBe(true)
    })

    it('should return false before market open', () => {
      // Tuesday at 8:00 AM
      const beforeOpen = new Date('2024-01-16T08:00:00')
      jest.setSystemTime(beforeOpen)
      
      expect(isMarketOpen()).toBe(false)
    })

    it('should return false after market close', () => {
      // Tuesday at 5:00 PM
      const afterClose = new Date('2024-01-16T17:00:00')
      jest.setSystemTime(afterClose)
      
      expect(isMarketOpen()).toBe(false)
    })

    it('should return false on weekends', () => {
      // Saturday at 10:00 AM
      const saturday = new Date('2024-01-13T10:00:00')
      jest.setSystemTime(saturday)
      
      expect(isMarketOpen()).toBe(false)
      
      // Sunday at 10:00 AM
      const sunday = new Date('2024-01-14T10:00:00')
      jest.setSystemTime(sunday)
      
      expect(isMarketOpen()).toBe(false)
    })
  })

  describe('getNextMarketOpen', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return next market open during weekdays before market hours', () => {
      // Tuesday at 8:00 AM
      const beforeMarket = new Date('2024-01-16T08:00:00')
      jest.setSystemTime(beforeMarket)
      
      const nextOpen = getNextMarketOpen()
      expect(nextOpen.getDay()).toBe(2) // Tuesday
      expect(nextOpen.getHours()).toBe(9)
      expect(nextOpen.getMinutes()).toBe(30)
    })

    it('should return next market open during weekdays after market hours', () => {
      // Tuesday at 6:00 PM
      const afterMarket = new Date('2024-01-16T18:00:00')
      jest.setSystemTime(afterMarket)
      
      const nextOpen = getNextMarketOpen()
      expect(nextOpen.getDay()).toBe(3) // Wednesday
      expect(nextOpen.getHours()).toBe(9)
      expect(nextOpen.getMinutes()).toBe(30)
    })

    it('should skip weekends', () => {
      // Friday at 6:00 PM
      const fridayEvening = new Date('2024-01-19T18:00:00')
      jest.setSystemTime(fridayEvening)
      
      const nextOpen = getNextMarketOpen()
      expect(nextOpen.getDay()).toBe(1) // Monday
      expect(nextOpen.getHours()).toBe(9)
      expect(nextOpen.getMinutes()).toBe(30)
    })

    it('should handle Saturday correctly', () => {
      // Saturday at 10:00 AM
      const saturday = new Date('2024-01-13T10:00:00')
      jest.setSystemTime(saturday)
      
      const nextOpen = getNextMarketOpen()
      expect(nextOpen.getDay()).toBe(1) // Monday
      expect(nextOpen.getHours()).toBe(9)
      expect(nextOpen.getMinutes()).toBe(30)
    })

    it('should handle Sunday correctly', () => {
      // Sunday at 10:00 AM
      const sunday = new Date('2024-01-14T10:00:00')
      jest.setSystemTime(sunday)
      
      const nextOpen = getNextMarketOpen()
      expect(nextOpen.getDay()).toBe(1) // Monday
      expect(nextOpen.getHours()).toBe(9)
      expect(nextOpen.getMinutes()).toBe(30)
    })

    it('should return a future date', () => {
      const now = new Date()
      jest.setSystemTime(now)
      
      const nextOpen = getNextMarketOpen()
      expect(nextOpen.getTime()).toBeGreaterThan(now.getTime())
    })
  })
})