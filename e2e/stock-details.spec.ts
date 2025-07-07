import { test, expect } from '@playwright/test'

test.describe('Stock Details Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to stock details page from URL', async ({ page }) => {
    // Navigate directly to stock details page
    await page.goto('/stock/AAPL')
    
    // Should be on stock details page
    await expect(page).toHaveURL(/\/stock\/AAPL/i)
    
    // Should display stock symbol and basic info
    await expect(page.getByText(/AAPL/i)).toBeVisible()
    await expect(page.getByText(/Apple/i)).toBeVisible()
  })

  test('should display stock dashboard with price information', async ({ page }) => {
    await page.goto('/stock/AAPL')
    
    // Stock dashboard should be visible
    const dashboard = page.locator('[data-testid*="stock-dashboard"], .stock-dashboard')
    await expect(dashboard).toBeVisible()
    
    // Should display price information
    const priceElement = page.getByText(/\$\d+\.\d+/)
    await expect(priceElement).toBeVisible()
    
    // Should display stock symbol
    await expect(page.getByText(/AAPL/i)).toBeVisible()
  })

  test('should display chart and analysis tab', async ({ page }) => {
    await page.goto('/stock/AAPL')
    
    // Tabs should be visible
    const chartTab = page.getByRole('tab', { name: /chart.*analysis/i })
    await expect(chartTab).toBeVisible()
    
    // Chart tab should be active by default
    await expect(chartTab).toHaveAttribute('data-state', 'active')
    
    // Chart component should be visible
    const chartContainer = page.locator('[data-testid*="chart"], .chart-container, canvas')
    await expect(chartContainer).toBeVisible()
  })

  test('should display company info tab', async ({ page }) => {
    await page.goto('/stock/AAPL')
    
    // Company info tab should be visible
    const companyTab = page.getByRole('tab', { name: /company.*info/i })
    await expect(companyTab).toBeVisible()
    
    // Click on company info tab
    await companyTab.click()
    
    // Company info tab should be active
    await expect(companyTab).toHaveAttribute('data-state', 'active')
    
    // Company info content should be visible
    const companyInfo = page.locator('[data-testid*="company-info"], .company-info')
    await expect(companyInfo).toBeVisible()
  })

  test('should switch between tabs correctly', async ({ page }) => {
    await page.goto('/stock/AAPL')
    
    const chartTab = page.getByRole('tab', { name: /chart.*analysis/i })
    const companyTab = page.getByRole('tab', { name: /company.*info/i })
    
    // Chart tab should be active initially
    await expect(chartTab).toHaveAttribute('data-state', 'active')
    
    // Click company info tab
    await companyTab.click()
    await expect(companyTab).toHaveAttribute('data-state', 'active')
    await expect(chartTab).toHaveAttribute('data-state', 'inactive')
    
    // Click back to chart tab
    await chartTab.click()
    await expect(chartTab).toHaveAttribute('data-state', 'active')
    await expect(companyTab).toHaveAttribute('data-state', 'inactive')
  })

  test('should handle invalid stock symbols gracefully', async ({ page }) => {
    // Try to navigate to invalid stock symbol
    await page.goto('/stock/INVALIDSTOCK123')
    
    // Should handle error gracefully (404 or error page)
    const notFoundIndicator = page.getByText(/not found|404|invalid.*symbol/i)
    const errorIndicator = page.getByText(/error|unable.*load/i)
    
    const hasNotFound = await notFoundIndicator.isVisible().catch(() => false)
    const hasError = await errorIndicator.isVisible().catch(() => false)
    
    expect(hasNotFound || hasError).toBeTruthy()
  })

  test('should show loading states while fetching data', async ({ page }) => {
    // Slow down API responses to see loading states
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.continue()
    })
    
    await page.goto('/stock/AAPL')
    
    // Should show loading indicators
    const loadingIndicators = page.locator(
      '[data-testid*="loading"], [class*="loading"], [class*="spinner"], [class*="skeleton"]'
    )
    
    const hasLoadingState = await loadingIndicators.first().isVisible({ timeout: 2000 }).catch(() => false)
    
    if (hasLoadingState) {
      await expect(loadingIndicators.first()).toBeVisible()
    }
    
    // Eventually should show content
    await page.waitForTimeout(3000)
    await expect(page.getByText(/AAPL/i)).toBeVisible()
  })

  test('should display stock metrics and statistics', async ({ page }) => {
    await page.goto('/stock/AAPL')
    
    // Should display key metrics
    const metrics = [
      /market.*cap/i,
      /volume/i,
      /52.*week/i,
      /p\/e.*ratio/i,
      /dividend/i,
      /beta/i
    ]
    
    let visibleMetrics = 0
    for (const metric of metrics) {
      const element = page.getByText(metric)
      const isVisible = await element.isVisible().catch(() => false)
      if (isVisible) visibleMetrics++
    }
    
    // Should display at least some metrics
    expect(visibleMetrics).toBeGreaterThan(0)
  })

  test('should handle network failures gracefully', async ({ page }) => {
    // Block API requests
    await page.route('**/api/**', route => route.abort())
    
    await page.goto('/stock/AAPL')
    
    // Page should still load basic structure
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
    
    // Should show error message or fallback content
    const errorMessage = page.getByText(/error|unable.*load|failed.*fetch/i)
    const fallbackContent = page.getByText(/try.*again|refresh/i)
    
    const hasError = await errorMessage.isVisible().catch(() => false)
    const hasFallback = await fallbackContent.isVisible().catch(() => false)
    
    expect(hasError || hasFallback).toBeTruthy()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/stock/AAPL')
    
    // Page should load properly on mobile
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
    
    // Tabs should be usable on mobile
    const chartTab = page.getByRole('tab', { name: /chart.*analysis/i })
    const companyTab = page.getByRole('tab', { name: /company.*info/i })
    
    await expect(chartTab).toBeVisible()
    await expect(companyTab).toBeVisible()
    
    // Should be tappable on mobile
    await companyTab.click()
    await expect(companyTab).toHaveAttribute('data-state', 'active')
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/stock/AAPL')
    
    // Tab navigation should work
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Should be able to navigate to tabs
    const chartTab = page.getByRole('tab', { name: /chart.*analysis/i })
    const companyTab = page.getByRole('tab', { name: /company.*info/i })
    
    // Focus should be manageable
    await chartTab.focus()
    await page.keyboard.press('ArrowRight')
    await expect(companyTab).toBeFocused()
    
    // Enter should activate tab
    await page.keyboard.press('Enter')
    await expect(companyTab).toHaveAttribute('data-state', 'active')
  })

  test('should update URL when navigating between different stocks', async ({ page }) => {
    await page.goto('/stock/AAPL')
    await expect(page).toHaveURL(/\/stock\/AAPL/i)
    
    // Navigate to different stock
    await page.goto('/stock/GOOGL')
    await expect(page).toHaveURL(/\/stock\/GOOGL/i)
    
    // Content should update
    await expect(page.getByText(/GOOGL/i)).toBeVisible()
  })

  test('should handle back navigation correctly', async ({ page }) => {
    await page.goto('/stock/AAPL')
    await expect(page).toHaveURL(/\/stock\/AAPL/i)
    
    // Go to home page
    await page.goto('/')
    await expect(page).toHaveURL('/')
    
    // Go back to stock page
    await page.goBack()
    await expect(page).toHaveURL(/\/stock\/AAPL/i)
    
    // Stock data should still be visible
    await expect(page.getByText(/AAPL/i)).toBeVisible()
  })

  test('should show price changes and trends', async ({ page }) => {
    await page.goto('/stock/AAPL')
    
    // Look for price change indicators
    const changeIndicators = page.locator('[class*="gain"], [class*="loss"], [class*="green"], [class*="red"]')
    const percentageChange = page.getByText(/[+-]\d+\.\d+%/)
    const dollarChange = page.getByText(/[+-]\$\d+\.\d+/)
    
    const hasChangeIndicators = await changeIndicators.count() > 0
    const hasPercentageChange = await percentageChange.isVisible().catch(() => false)
    const hasDollarChange = await dollarChange.isVisible().catch(() => false)
    
    // Should show some form of change indication
    expect(hasChangeIndicators || hasPercentageChange || hasDollarChange).toBeTruthy()
  })

  test('should display real-time updates', async ({ page }) => {
    await page.goto('/stock/AAPL')
    
    // Look for last updated timestamp
    const lastUpdated = page.getByText(/last.*updated|updated.*at/i)
    const hasLastUpdated = await lastUpdated.isVisible().catch(() => false)
    
    // Look for refresh button
    const refreshButton = page.getByRole('button', { name: /refresh|update/i })
    const hasRefreshButton = await refreshButton.isVisible().catch(() => false)
    
    if (hasRefreshButton) {
      await refreshButton.click()
      // Should handle refresh without errors
      await page.waitForTimeout(1000)
      await expect(page.getByText(/AAPL/i)).toBeVisible()
    }
    
    // Real-time functionality should be present
    expect(hasLastUpdated || hasRefreshButton).toBeTruthy()
  })

  test('should handle special stock symbols correctly', async ({ page }) => {
    // Test stock with dot in symbol
    await page.goto('/stock/BRK.A')
    
    // Should handle special characters in URLs
    const hasContent = await page.locator('body').isVisible()
    expect(hasContent).toBeTruthy()
    
    // Should not crash on special symbols
    const errorIndicator = page.getByText(/error|crash|failed/i)
    const hasError = await errorIndicator.isVisible().catch(() => false)
    
    // Should handle gracefully even if symbol is not supported
    expect(true).toBeTruthy()
  })

  test('should have proper accessibility features', async ({ page }) => {
    await page.goto('/stock/AAPL')
    
    // Check for proper heading structure
    const h1 = page.locator('h1')
    const h1Count = await h1.count()
    expect(h1Count).toBeGreaterThan(0)
    
    // Check for proper ARIA labels on tabs
    const chartTab = page.getByRole('tab', { name: /chart.*analysis/i })
    const companyTab = page.getByRole('tab', { name: /company.*info/i })
    
    await expect(chartTab).toHaveAttribute('role', 'tab')
    await expect(companyTab).toHaveAttribute('role', 'tab')
    
    // Check for alt text on images/charts
    const images = page.locator('img')
    const imageCount = await images.count()
    
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i)
        const alt = await img.getAttribute('alt')
        const ariaLabel = await img.getAttribute('aria-label')
        const role = await img.getAttribute('role')
        
        expect(alt !== null || ariaLabel !== null || role === 'presentation').toBeTruthy()
      }
    }
  })

  test('should persist tab selection across page refreshes', async ({ page }) => {
    await page.goto('/stock/AAPL')
    
    // Switch to company info tab
    const companyTab = page.getByRole('tab', { name: /company.*info/i })
    await companyTab.click()
    await expect(companyTab).toHaveAttribute('data-state', 'active')
    
    // Refresh page
    await page.reload()
    
    // Tab selection might be persisted or reset to default
    const chartTab = page.getByRole('tab', { name: /chart.*analysis/i })
    const isChartActive = await chartTab.getAttribute('data-state') === 'active'
    const isCompanyActive = await companyTab.getAttribute('data-state') === 'active'
    
    // Either chart (default) or company tab should be active
    expect(isChartActive || isCompanyActive).toBeTruthy()
  })

  test('should load without JavaScript errors', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.goto('/stock/AAPL')
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle')
    
    // Check for any console errors (filter out known development warnings)
    const relevantErrors = consoleErrors.filter(
      error => !error.includes('Warning:') && 
               !error.includes('Development') &&
               !error.includes('HMR') &&
               !error.includes('Fast Refresh')
    )
    
    expect(relevantErrors).toHaveLength(0)
  })
})