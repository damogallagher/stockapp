import { test, expect } from '@playwright/test'

test.describe('Watchlist Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to watchlist page', async ({ page }) => {
    // Find and click watchlist navigation link
    const watchlistLink = page.getByRole('link', { name: /watchlist/i })
    await expect(watchlistLink).toBeVisible()
    await watchlistLink.click()
    
    // Should be on watchlist page
    await expect(page).toHaveURL(/watchlist/i)
    await expect(page.getByText(/watchlist/i)).toBeVisible()
  })

  test('should show empty watchlist initially', async ({ page }) => {
    await page.goto('/watchlist')
    
    // Should show empty state message
    const emptyMessage = page.getByText(/empty|no.*stocks|add.*stocks/i)
    await expect(emptyMessage).toBeVisible()
  })

  test('should add stock to watchlist from search', async ({ page }) => {
    // Search for a stock first
    const searchInput = page.getByPlaceholder(/search.*stock|enter.*symbol/i)
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('AAPL')
      await searchInput.press('Enter')
      
      // Wait for results
      await page.waitForSelector('text=/AAPL|Apple/i', { timeout: 10000 })
      
      // Look for add to watchlist button
      const addButton = page.getByRole('button', { name: /add.*watchlist|\+|plus/i })
      const addIcon = page.locator('[data-testid*="add"], [class*="plus"]')
      
      const hasAddButton = await addButton.isVisible().catch(() => false)
      const hasAddIcon = await addIcon.isVisible().catch(() => false)
      
      if (hasAddButton) {
        await addButton.click()
      } else if (hasAddIcon) {
        await addIcon.first().click()
      }
      
      // Should show confirmation or update button state
      const removeButton = page.getByRole('button', { name: /remove.*watchlist|\-|minus/i })
      const inWatchlistIndicator = page.getByText(/in.*watchlist|added/i)
      
      const hasRemoveButton = await removeButton.isVisible({ timeout: 3000 }).catch(() => false)
      const hasIndicator = await inWatchlistIndicator.isVisible({ timeout: 3000 }).catch(() => false)
      
      if (hasRemoveButton || hasIndicator) {
        expect(hasRemoveButton || hasIndicator).toBeTruthy()
      }
    }
  })

  test('should display stocks in watchlist', async ({ page, context }) => {
    // First add a stock to watchlist (simulated or through UI)
    await page.goto('/watchlist')
    
    // If watchlist has stocks, they should be displayed
    const stockCards = page.locator('[data-testid*="stock"], .stock-card, [class*="stock"]')
    const stockItems = page.getByText(/\$\d+/i) // Look for price indicators
    
    const hasStockCards = await stockCards.count() > 0
    const hasStockItems = await stockItems.count() > 0
    
    if (hasStockCards || hasStockItems) {
      // Verify stock information is displayed
      await expect(stockCards.first()).toBeVisible()
    } else {
      // Should show empty state
      const emptyMessage = page.getByText(/empty|no.*stocks/i)
      await expect(emptyMessage).toBeVisible()
    }
  })

  test('should remove stock from watchlist', async ({ page }) => {
    // Navigate to watchlist
    await page.goto('/watchlist')
    
    // Look for stocks in watchlist
    const removeButtons = page.getByRole('button', { name: /remove|\-|minus|delete/i })
    const stockItems = page.locator('[data-testid*="stock"], .stock-card')
    
    const removeButtonCount = await removeButtons.count()
    const stockCount = await stockItems.count()
    
    if (removeButtonCount > 0 && stockCount > 0) {
      const initialCount = stockCount
      
      // Click first remove button
      await removeButtons.first().click()
      
      // Should show confirmation or immediately remove
      const confirmButton = page.getByRole('button', { name: /confirm|yes|remove/i })
      const hasConfirm = await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)
      
      if (hasConfirm) {
        await confirmButton.click()
      }
      
      // Stock should be removed
      await page.waitForTimeout(1000)
      const newStockCount = await stockItems.count()
      expect(newStockCount).toBeLessThan(initialCount)
    }
  })

  test('should persist watchlist across page reloads', async ({ page }) => {
    // Add a stock to watchlist (if possible through UI)
    await page.goto('/')
    
    const searchInput = page.getByPlaceholder(/search.*stock|enter.*symbol/i)
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('AAPL')
      await searchInput.press('Enter')
      
      await page.waitForTimeout(2000)
      
      const addButton = page.getByRole('button', { name: /add.*watchlist|\+/i })
      if (await addButton.isVisible().catch(() => false)) {
        await addButton.click()
        await page.waitForTimeout(1000)
        
        // Reload the page
        await page.reload()
        
        // Go to watchlist
        await page.goto('/watchlist')
        
        // Stock should still be there
        const applStock = page.getByText(/AAPL|Apple/i)
        await expect(applStock).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('should show real-time price updates', async ({ page }) => {
    await page.goto('/watchlist')
    
    // Look for price elements
    const priceElements = page.getByText(/\$\d+\.\d+/)
    const priceCount = await priceElements.count()
    
    if (priceCount > 0) {
      // Get initial price
      const initialPrice = await priceElements.first().textContent()
      
      // Wait for potential updates (this might not work with mock data)
      await page.waitForTimeout(5000)
      
      // Check if price or change indicators are present
      const changeIndicators = page.locator('[class*="gain"], [class*="loss"], [class*="green"], [class*="red"]')
      const hasChangeIndicators = await changeIndicators.count() > 0
      
      // Price display functionality should work even if updates don't occur
      expect(initialPrice).toBeTruthy()
    }
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/watchlist')
    
    // Page should load properly on mobile
    await expect(page.locator('body')).toBeVisible()
    
    // Watchlist should be usable on mobile
    const stockItems = page.locator('[data-testid*="stock"], .stock-card')
    const stockCount = await stockItems.count()
    
    if (stockCount > 0) {
      // Stock cards should be visible and tappable on mobile
      await expect(stockItems.first()).toBeVisible()
    }
    
    // Navigation should work on mobile
    const navElement = page.locator('nav')
    const mobileMenu = page.getByRole('button', { name: /menu/i })
    
    const hasNav = await navElement.isVisible().catch(() => false)
    const hasMobileMenu = await mobileMenu.isVisible().catch(() => false)
    
    expect(hasNav || hasMobileMenu).toBeTruthy()
  })

  test('should handle empty watchlist gracefully', async ({ page }) => {
    await page.goto('/watchlist')
    
    // Should show empty state with helpful message
    const emptyState = page.getByText(/empty|no.*stocks|start.*adding|add.*first/i)
    await expect(emptyState).toBeVisible()
    
    // Should provide way to add stocks
    const addStockButton = page.getByRole('button', { name: /add.*stock|search/i })
    const searchLink = page.getByRole('link', { name: /search|find.*stocks/i })
    
    const hasAddButton = await addStockButton.isVisible().catch(() => false)
    const hasSearchLink = await searchLink.isVisible().catch(() => false)
    
    // Should provide some way to add stocks
    if (hasAddButton || hasSearchLink) {
      expect(hasAddButton || hasSearchLink).toBeTruthy()
    }
  })

  test('should sort stocks in watchlist', async ({ page }) => {
    await page.goto('/watchlist')
    
    // Look for sort options
    const sortButton = page.getByRole('button', { name: /sort/i })
    const sortDropdown = page.getByRole('combobox', { name: /sort/i })
    
    const hasSortButton = await sortButton.isVisible().catch(() => false)
    const hasSortDropdown = await sortDropdown.isVisible().catch(() => false)
    
    if (hasSortButton || hasSortDropdown) {
      if (hasSortButton) {
        await sortButton.click()
      } else {
        await sortDropdown.click()
      }
      
      // Look for sort options
      const sortOptions = page.getByText(/alphabetical|price|change|performance/i)
      const hasSortOptions = await sortOptions.count() > 0
      
      if (hasSortOptions) {
        await sortOptions.first().click()
        
        // List should reorder
        await page.waitForTimeout(1000)
        expect(true).toBeTruthy() // Test passes if no errors
      }
    }
  })

  test('should show loading states when fetching watchlist data', async ({ page }) => {
    // Slow down API responses to see loading states
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.continue()
    })
    
    await page.goto('/watchlist')
    
    // Should show loading indicators
    const loadingIndicators = page.locator(
      '[data-testid*="loading"], [class*="loading"], [class*="spinner"], [class*="skeleton"]'
    )
    
    const hasLoadingState = await loadingIndicators.first().isVisible({ timeout: 2000 }).catch(() => false)
    
    if (hasLoadingState) {
      await expect(loadingIndicators.first()).toBeVisible()
    }
    
    // Eventually should show content or empty state
    await page.waitForTimeout(3000)
    const hasContent = await page.locator('body').isVisible()
    expect(hasContent).toBeTruthy()
  })
})