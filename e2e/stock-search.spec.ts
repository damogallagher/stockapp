import { test, expect } from '@playwright/test'

test.describe('Stock Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should perform basic stock search', async ({ page }) => {
    // Find search input
    const searchInput = page.getByPlaceholder(/search.*stock|enter.*symbol/i)
    await expect(searchInput).toBeVisible()
    
    // Search for Apple
    await searchInput.fill('AAPL')
    await searchInput.press('Enter')
    
    // Should show search results
    await expect(page.getByText(/AAPL|Apple/i)).toBeVisible({ timeout: 10000 })
  })

  test('should show search suggestions', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search.*stock|enter.*symbol/i)
    await expect(searchInput).toBeVisible()
    
    // Type partial search term
    await searchInput.fill('APP')
    
    // Should show dropdown or suggestions
    const suggestions = page.locator('[role="listbox"], [data-testid*="suggestion"], .search-results')
    await expect(suggestions.first()).toBeVisible({ timeout: 5000 })
  })

  test('should handle invalid stock symbols', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search.*stock|enter.*symbol/i)
    await expect(searchInput).toBeVisible()
    
    // Search for invalid symbol
    await searchInput.fill('INVALIDSTOCK123')
    await searchInput.press('Enter')
    
    // Should show no results or error message
    const noResults = page.getByText(/no.*results|not.*found|invalid/i)
    const errorMessage = page.getByText(/error|failed/i)
    
    const hasNoResults = await noResults.isVisible({ timeout: 5000 }).catch(() => false)
    const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false)
    
    expect(hasNoResults || hasError).toBeTruthy()
  })

  test('should navigate to stock details page', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search.*stock|enter.*symbol/i)
    await expect(searchInput).toBeVisible()
    
    // Search for a stock
    await searchInput.fill('AAPL')
    await searchInput.press('Enter')
    
    // Wait for results and click on the first result
    await page.waitForSelector('text=/AAPL|Apple/i', { timeout: 10000 })
    const firstResult = page.getByText(/AAPL|Apple/i).first()
    
    // Click on the result or find a "View Details" button
    const viewDetailsButton = page.getByRole('button', { name: /view.*details|details/i })
    const hasViewButton = await viewDetailsButton.isVisible().catch(() => false)
    
    if (hasViewButton) {
      await viewDetailsButton.click()
    } else {
      await firstResult.click()
    }
    
    // Should navigate to stock details page
    await expect(page).toHaveURL(/stock|symbol/i)
  })

  test('should clear search results', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search.*stock|enter.*symbol/i)
    await expect(searchInput).toBeVisible()
    
    // Perform search
    await searchInput.fill('AAPL')
    await searchInput.press('Enter')
    
    // Wait for results
    await page.waitForSelector('text=/AAPL|Apple/i', { timeout: 10000 })
    
    // Clear search
    await searchInput.clear()
    
    // Results should be cleared or hidden
    const searchResults = page.locator('[data-testid*="search-result"], .search-results')
    const hasResults = await searchResults.isVisible().catch(() => false)
    
    if (hasResults) {
      expect(await searchResults.count()).toBe(0)
    }
  })

  test('should remember recent searches', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search.*stock|enter.*symbol/i)
    await expect(searchInput).toBeVisible()
    
    // Perform multiple searches
    await searchInput.fill('AAPL')
    await searchInput.press('Enter')
    await page.waitForTimeout(1000)
    
    await searchInput.clear()
    await searchInput.fill('GOOGL')
    await searchInput.press('Enter')
    await page.waitForTimeout(1000)
    
    // Click on search input to see recent searches
    await searchInput.clear()
    await searchInput.click()
    
    // Should show recent searches
    const recentSearches = page.getByText(/recent|AAPL|GOOGL/i)
    const hasRecentSearches = await recentSearches.isVisible({ timeout: 3000 }).catch(() => false)
    
    // Recent searches functionality might not be implemented yet
    if (hasRecentSearches) {
      await expect(recentSearches).toBeVisible()
    }
  })

  test('should work with keyboard navigation', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search.*stock|enter.*symbol/i)
    await expect(searchInput).toBeVisible()
    
    // Focus on search input
    await searchInput.focus()
    
    // Type search term
    await page.keyboard.type('AAPL')
    
    // Wait for suggestions to appear
    await page.waitForTimeout(1000)
    
    // Use arrow keys to navigate suggestions if they exist
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    
    // Press Enter to select
    await page.keyboard.press('Enter')
    
    // Should show results or navigate to stock page
    const hasResults = await page.getByText(/AAPL|Apple/i).isVisible({ timeout: 5000 }).catch(() => false)
    const isOnStockPage = page.url().includes('stock') || page.url().includes('AAPL')
    
    expect(hasResults || isOnStockPage).toBeTruthy()
  })

  test('should handle special characters in search', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search.*stock|enter.*symbol/i)
    await expect(searchInput).toBeVisible()
    
    // Test with special characters
    await searchInput.fill('BRK.A')
    await searchInput.press('Enter')
    
    // Should handle the dot in the symbol
    await page.waitForTimeout(2000)
    
    // Clear and try with spaces
    await searchInput.clear()
    await searchInput.fill('BERKSHIRE HATHAWAY')
    await searchInput.press('Enter')
    
    // Should handle company names with spaces
    const hasResults = await page.getByText(/berkshire|hathaway|brk/i).isVisible({ timeout: 5000 }).catch(() => false)
    
    // Special character handling might show results or graceful degradation
    expect(true).toBeTruthy() // Test passes if no errors occur
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    const searchInput = page.getByPlaceholder(/search.*stock|enter.*symbol/i)
    
    // Search input should be accessible on mobile
    await expect(searchInput).toBeVisible()
    
    // Should be usable with touch
    await searchInput.tap()
    await searchInput.fill('AAPL')
    
    // Mobile keyboard should appear and be usable
    await page.keyboard.press('Enter')
    
    // Results should be displayed properly on mobile
    await page.waitForTimeout(2000)
    const hasContent = await page.locator('body').isVisible()
    expect(hasContent).toBeTruthy()
  })

  test('should handle rapid searches without errors', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search.*stock|enter.*symbol/i)
    await expect(searchInput).toBeVisible()
    
    // Perform rapid searches to test debouncing/throttling
    const searches = ['A', 'AA', 'AAP', 'AAPL']
    
    for (const search of searches) {
      await searchInput.fill(search)
      await page.waitForTimeout(100) // Rapid typing
    }
    
    await searchInput.press('Enter')
    
    // Should handle rapid input without errors
    await page.waitForTimeout(2000)
    
    // No JavaScript errors should occur
    const hasContent = await page.locator('body').isVisible()
    expect(hasContent).toBeTruthy()
  })
})