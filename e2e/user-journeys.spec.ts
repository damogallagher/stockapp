import { test, expect } from '@playwright/test'

test.describe('Complete User Journeys', () => {
  test.describe('New User Discovery Journey', () => {
    test('should guide new user through app discovery', async ({ page }) => {
      // Start at homepage
      await page.goto('/')
      
      // User sees welcome message
      await expect(page.getByText('Welcome to StockApp')).toBeVisible()
      await expect(page.getByText('Your comprehensive platform for stock market analysis')).toBeVisible()
      
      // User explores quick actions
      await expect(page.getByText('Search Stocks')).toBeVisible()
      await expect(page.getByText('Market Overview')).toBeVisible()
      await expect(page.getByText('My Watchlist')).toBeVisible()
      
      // User clicks on popular stock
      await page.getByText('AAPL').click()
      await expect(page).toHaveURL('/stock/AAPL')
      
      // User views stock details
      await expect(page.locator('[data-testid="stock-dashboard"]')).toBeVisible()
      await expect(page.getByRole('tab', { name: 'Chart & Analysis' })).toBeVisible()
      
      // User adds to watchlist
      const addToWatchlistButton = page.getByTestId('add-to-watchlist')
      if (await addToWatchlistButton.isVisible()) {
        await addToWatchlistButton.click()
        await expect(page.getByText('Added to watchlist')).toBeVisible({ timeout: 5000 })
      }
      
      // User navigates to watchlist
      await page.getByRole('link', { name: 'Watchlist' }).click()
      await expect(page).toHaveURL('/watchlist')
      await expect(page.getByText('My Watchlist')).toBeVisible()
    })

    test('should help user discover search functionality', async ({ page }) => {
      await page.goto('/')
      
      // User tries search from homepage
      await page.getByText('Find and analyze any stock').click()
      
      // Search modal should open
      await expect(page.getByPlaceholder('Search for stocks, ETFs, or indices...')).toBeVisible()
      
      // User searches for a stock
      await page.getByPlaceholder('Search for stocks, ETFs, or indices...').fill('TSLA')
      
      // Results appear
      await expect(page.getByText('Tesla')).toBeVisible({ timeout: 10000 })
      
      // User selects result
      await page.getByText('Tesla').click()
      await expect(page).toHaveURL('/stock/TSLA')
      
      // Stock details load
      await expect(page.locator('[data-testid="stock-dashboard"]')).toBeVisible()
    })
  })

  test.describe('Active Trader Workflow', () => {
    test('should support active trader analysis workflow', async ({ page }) => {
      // Trader starts with market overview
      await page.goto('/market')
      await expect(page.getByText('Market Overview')).toBeVisible()
      
      // Views market indices
      await expect(page.locator('[data-testid="market-indices"]')).toBeVisible()
      
      // Checks top movers
      const topMoversSection = page.locator('[data-testid="top-movers"]')
      if (await topMoversSection.isVisible()) {
        await topMoversSection.locator('text=AAPL').first().click()
      } else {
        // Fallback: navigate directly to stock
        await page.goto('/stock/AAPL')
      }
      
      // Analyzes stock chart
      await expect(page.locator('[data-testid="stock-chart"]')).toBeVisible()
      
      // Changes time range
      const timeRangeButtons = page.locator('[data-testid="time-range-selector"]')
      if (await timeRangeButtons.isVisible()) {
        await timeRangeButtons.getByText('1M').click()
        await page.waitForTimeout(1000) // Allow chart to update
      }
      
      // Views company fundamentals
      await page.getByRole('tab', { name: 'Company Info' }).click()
      await expect(page.locator('[data-testid="company-info"]')).toBeVisible()
      
      // Checks financial metrics
      await expect(page.getByText('P/E Ratio')).toBeVisible()
      await expect(page.getByText('Market Cap')).toBeVisible()
      
      // Adds to watchlist for monitoring
      await page.getByRole('tab', { name: 'Chart & Analysis' }).click()
      const addButton = page.getByTestId('add-to-watchlist')
      if (await addButton.isVisible()) {
        await addButton.click()
      }
      
      // Goes to watchlist to manage positions
      await page.getByRole('link', { name: 'Watchlist' }).click()
      await expect(page).toHaveURL('/watchlist')
    })

    test('should handle rapid stock lookup workflow', async ({ page }) => {
      await page.goto('/')
      
      const stockSymbols = ['AAPL', 'GOOGL', 'MSFT']
      
      for (const symbol of stockSymbols) {
        // Quick search
        await page.getByPlaceholder('Search stocks...').click()
        await page.getByPlaceholder('Search stocks...').fill(symbol)
        
        // Wait for results and click
        await page.waitForSelector(`text=${symbol}`, { timeout: 10000 })
        await page.getByText(symbol).first().click()
        
        // Verify navigation
        await expect(page).toHaveURL(`/stock/${symbol}`)
        await expect(page.locator('[data-testid="stock-dashboard"]')).toBeVisible()
        
        // Quick add to watchlist
        const addButton = page.getByTestId('add-to-watchlist')
        if (await addButton.isVisible()) {
          await addButton.click()
          await page.waitForTimeout(500)
        }
        
        // Return to home for next search (unless last item)
        if (symbol !== stockSymbols[stockSymbols.length - 1]) {
          await page.goto('/')
        }
      }
      
      // Check watchlist has all added stocks
      await page.getByRole('link', { name: 'Watchlist' }).click()
      for (const symbol of stockSymbols) {
        await expect(page.getByText(symbol)).toBeVisible()
      }
    })
  })

  test.describe('Research & Analysis Journey', () => {
    test('should support comprehensive research workflow', async ({ page }) => {
      // Start with specific stock research
      await page.goto('/stock/AAPL')
      
      // Comprehensive chart analysis
      await expect(page.locator('[data-testid="stock-chart"]')).toBeVisible()
      
      // Test different chart types if available
      const chartTypeSelector = page.locator('[data-testid="chart-type-selector"]')
      if (await chartTypeSelector.isVisible()) {
        await chartTypeSelector.getByText('Candlestick').click()
        await page.waitForTimeout(1000)
        
        await chartTypeSelector.getByText('Line').click()
        await page.waitForTimeout(1000)
      }
      
      // Analyze different timeframes
      const timeFrames = ['1D', '1W', '1M', '3M', '1Y']
      const timeSelector = page.locator('[data-testid="time-range-selector"]')
      
      for (const timeFrame of timeFrames) {
        if (await timeSelector.isVisible()) {
          const timeButton = timeSelector.getByText(timeFrame)
          if (await timeButton.isVisible()) {
            await timeButton.click()
            await page.waitForTimeout(500) // Allow chart to update
          }
        }
      }
      
      // Deep dive into company information
      await page.getByRole('tab', { name: 'Company Info' }).click()
      await expect(page.locator('[data-testid="company-info"]')).toBeVisible()
      
      // Review all financial tabs/sections
      const financialSections = [
        'Overview',
        'Financials', 
        'News'
      ]
      
      for (const section of financialSections) {
        const sectionTab = page.getByRole('tab', { name: section })
        if (await sectionTab.isVisible()) {
          await sectionTab.click()
          await page.waitForTimeout(500)
        }
      }
      
      // Read recent news if available
      const newsSection = page.locator('[data-testid="news-section"]')
      if (await newsSection.isVisible()) {
        const newsArticles = newsSection.locator('article')
        const articleCount = await newsArticles.count()
        
        if (articleCount > 0) {
          // Click on first news article
          await newsArticles.first().click()
          // Should open in new tab - verify link works
        }
      }
      
      // Compare with similar stocks
      await page.goto('/stock/GOOGL') // Similar tech stock
      await expect(page.locator('[data-testid="stock-dashboard"]')).toBeVisible()
      
      // Add both to watchlist for comparison
      const addButton = page.getByTestId('add-to-watchlist')
      if (await addButton.isVisible()) {
        await addButton.click()
      }
      
      // View comparison in watchlist
      await page.getByRole('link', { name: 'Watchlist' }).click()
      await expect(page.getByText('AAPL')).toBeVisible()
      await expect(page.getByText('GOOGL')).toBeVisible()
    })
  })

  test.describe('Portfolio Monitoring Journey', () => {
    test('should support ongoing portfolio monitoring', async ({ page }) => {
      // User builds a diversified watchlist
      const stocks = [
        { symbol: 'AAPL', sector: 'Technology' },
        { symbol: 'JNJ', sector: 'Healthcare' },
        { symbol: 'JPM', sector: 'Finance' }
      ]
      
      // Add multiple stocks to watchlist
      for (const stock of stocks) {
        await page.goto(`/stock/${stock.symbol}`)
        await expect(page.locator('[data-testid="stock-dashboard"]')).toBeVisible()
        
        const addButton = page.getByTestId('add-to-watchlist')
        if (await addButton.isVisible()) {
          await addButton.click()
          await page.waitForTimeout(500)
        }
      }
      
      // Monitor watchlist
      await page.goto('/watchlist')
      await expect(page.getByText('My Watchlist')).toBeVisible()
      
      // Verify all stocks are present
      for (const stock of stocks) {
        await expect(page.getByText(stock.symbol)).toBeVisible()
      }
      
      // Test sorting and filtering if available
      const sortButton = page.getByTestId('sort-watchlist')
      if (await sortButton.isVisible()) {
        await sortButton.click()
        
        const sortOptions = page.locator('[data-testid="sort-options"]')
        if (await sortOptions.isVisible()) {
          await sortOptions.getByText('Price').click()
          await page.waitForTimeout(500)
        }
      }
      
      // Remove a stock from watchlist
      const removeButton = page.getByTestId('remove-from-watchlist').first()
      if (await removeButton.isVisible()) {
        await removeButton.click()
        
        // Confirm removal
        const confirmButton = page.getByTestId('confirm-remove')
        if (await confirmButton.isVisible()) {
          await confirmButton.click()
        }
      }
      
      // Refresh market data
      const refreshButton = page.getByTestId('refresh-data')
      if (await refreshButton.isVisible()) {
        await refreshButton.click()
        await page.waitForTimeout(1000)
      }
      
      // Navigate to individual stocks for detailed view
      await page.getByText('AAPL').click()
      await expect(page).toHaveURL('/stock/AAPL')
      
      // Return to watchlist
      await page.goBack()
      await expect(page).toHaveURL('/watchlist')
    })
  })

  test.describe('Dark Mode User Journey', () => {
    test('should maintain consistent experience in dark mode', async ({ page }) => {
      await page.goto('/')
      
      // Toggle dark mode
      const darkModeToggle = page.getByTestId('dark-mode-toggle')
      if (await darkModeToggle.isVisible()) {
        await darkModeToggle.click()
        
        // Verify dark mode is applied
        await expect(page.locator('html')).toHaveClass(/dark/)
        
        // Navigate through app in dark mode
        await page.getByText('Market Overview').click()
        await expect(page).toHaveURL('/market')
        await expect(page.locator('html')).toHaveClass(/dark/)
        
        // Check stock page in dark mode
        await page.goto('/stock/AAPL')
        await expect(page.locator('html')).toHaveClass(/dark/)
        await expect(page.locator('[data-testid="stock-chart"]')).toBeVisible()
        
        // Check watchlist in dark mode
        await page.goto('/watchlist')
        await expect(page.locator('html')).toHaveClass(/dark/)
        
        // Toggle back to light mode
        await darkModeToggle.click()
        await expect(page.locator('html')).not.toHaveClass(/dark/)
      }
    })
  })

  test.describe('Error Recovery Journey', () => {
    test('should handle and recover from errors gracefully', async ({ page }) => {
      // Test invalid stock symbol
      await page.goto('/stock/INVALIDSTOCK123')
      
      // Should show 404 or redirect
      const pageContent = await page.textContent('body')
      expect(pageContent).toBeTruthy()
      
      // Navigate back to working page
      await page.goto('/')
      await expect(page.getByText('Welcome to StockApp')).toBeVisible()
      
      // Test search with no results
      await page.getByPlaceholder('Search stocks...').click()
      await page.getByPlaceholder('Search stocks...').fill('NONEXISTENTSTOCK')
      
      // Should show no results message
      await expect(page.getByText('No stocks found')).toBeVisible({ timeout: 5000 })
      
      // Clear search and try valid search
      await page.getByPlaceholder('Search stocks...').clear()
      await page.getByPlaceholder('Search stocks...').fill('AAPL')
      await expect(page.getByText('Apple')).toBeVisible({ timeout: 10000 })
      
      // Test navigation recovery
      await page.goto('/nonexistentpage')
      // Should handle gracefully (404 or redirect)
      
      await page.goto('/')
      await expect(page.getByText('Welcome to StockApp')).toBeVisible()
    })
  })

  test.describe('Performance and Reliability Journey', () => {
    test('should maintain performance during extended use', async ({ page }) => {
      const startTime = Date.now()
      
      // Simulate extended usage session
      const testPages = [
        '/',
        '/market',
        '/stock/AAPL',
        '/stock/GOOGL', 
        '/stock/MSFT',
        '/watchlist'
      ]
      
      for (const testPage of testPages) {
        await page.goto(testPage)
        
        // Wait for page to load
        await page.waitForLoadState('networkidle')
        
        // Verify page is functional
        await expect(page.locator('body')).toBeVisible()
        
        // Interact with the page
        if (testPage.includes('/stock/')) {
          await expect(page.locator('[data-testid="stock-dashboard"]')).toBeVisible()
          
          // Switch tabs if available
          const companyTab = page.getByRole('tab', { name: 'Company Info' })
          if (await companyTab.isVisible()) {
            await companyTab.click()
            await page.waitForTimeout(500)
          }
        }
      }
      
      const totalTime = Date.now() - startTime
      
      // Extended session should complete in reasonable time
      expect(totalTime).toBeLessThan(30000) // 30 seconds max for full journey
      
      // App should still be responsive
      await page.goto('/')
      await expect(page.getByText('Welcome to StockApp')).toBeVisible()
    })
  })
})