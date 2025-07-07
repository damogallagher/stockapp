import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load and display main navigation', async ({ page }) => {
    // Check that the main navigation is present
    await expect(page.locator('nav')).toBeVisible()
    
    // Check for key navigation links
    await expect(page.getByRole('link', { name: /home|dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /market/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /watchlist/i })).toBeVisible()
  })

  test('should display stock search functionality', async ({ page }) => {
    // Look for search card in the quick actions section (heading level)
    const searchCard = page.getByRole('heading', { name: 'Search Stocks' })
    const searchInNavigation = page.getByRole('button', { name: /search/i })
    
    // Either search card or navigation search should be visible
    const hasSearchCard = await searchCard.isVisible().catch(() => false)
    const hasSearchInNav = await searchInNavigation.isVisible().catch(() => false)
    
    expect(hasSearchCard || hasSearchInNav).toBeTruthy()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that the page still loads properly
    await expect(page.locator('body')).toBeVisible()
    
    // Navigation should still be accessible (might be in a mobile menu)
    const nav = page.locator('nav')
    const mobileMenu = page.getByRole('button', { name: /menu/i })
    
    const hasVisibleNav = await nav.isVisible().catch(() => false)
    const hasMobileMenu = await mobileMenu.isVisible().catch(() => false)
    
    expect(hasVisibleNav || hasMobileMenu).toBeTruthy()
  })

  test('should have proper page title and meta information', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/stock.*app/i)
    
    // Check for main heading
    await expect(page.getByRole('heading', { name: /welcome to stockapp/i })).toBeVisible()
  })

  test('should load without JavaScript errors', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.goto('/')
    
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

  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate network failure for API calls
    await page.route('**/api/**', route => route.abort())
    
    await page.goto('/')
    
    // Page should still load even if API calls fail
    await expect(page.locator('body')).toBeVisible()
    
    // Main UI should still be functional - check for welcome message and quick actions
    await expect(page.getByText('Welcome to StockApp')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Search Stocks' })).toBeVisible()
    
    // The page should gracefully handle API failures without breaking the UI
    const welcomeMessage = await page.getByText('Welcome to StockApp').isVisible().catch(() => false)
    expect(welcomeMessage).toBeTruthy()
  })

  test('should have accessibility features', async ({ page }) => {
    // Check for skip link
    const skipLink = page.getByRole('link', { name: /skip.*content/i })
    const hasSkipLink = await skipLink.isVisible().catch(() => false)
    
    // Check for proper heading structure
    const h1 = page.locator('h1')
    const h1Count = await h1.count()
    
    // Should have at least one h1 or have skip navigation
    expect(h1Count > 0 || hasSkipLink).toBeTruthy()
    
    // Check for alt text on images
    const images = page.locator('img')
    const imageCount = await images.count()
    
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i)
        const alt = await img.getAttribute('alt')
        const ariaLabel = await img.getAttribute('aria-label')
        const role = await img.getAttribute('role')
        
        // Images should have alt text unless they're decorative
        expect(alt !== null || ariaLabel !== null || role === 'presentation').toBeTruthy()
      }
    }
  })

  test('should show appropriate loading states', async ({ page }) => {
    // Slow down network to see loading states
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.continue()
    })
    
    await page.goto('/')
    
    // Should show loading indicators while data is being fetched
    const loadingIndicators = page.locator(
      '[data-testid*="loading"], [class*="loading"], [class*="spinner"], [class*="skeleton"]'
    )
    
    // Check if loading states appear (at least briefly)
    const hasLoadingState = await loadingIndicators.first().isVisible().catch(() => false)
    
    // If there are API calls, there should be loading states
    if (hasLoadingState) {
      await expect(loadingIndicators.first()).toBeVisible()
    }
  })

  test('should persist user preferences', async ({ page }) => {
    // Set a user preference (like dark mode if available)
    const darkModeToggle = page.getByRole('button', { name: /dark.*mode|theme/i })
    const themeToggle = page.getByRole('switch', { name: /dark|theme/i })
    
    const hasDarkModeToggle = await darkModeToggle.isVisible().catch(() => false)
    const hasThemeToggle = await themeToggle.isVisible().catch(() => false)
    
    if (hasDarkModeToggle || hasThemeToggle) {
      if (hasDarkModeToggle) {
        await darkModeToggle.click()
      } else {
        await themeToggle.click()
      }
      
      // Reload the page
      await page.reload()
      
      // Preference should be persisted
      const body = page.locator('body')
      const bodyClass = await body.getAttribute('class')
      const htmlClass = await page.locator('html').getAttribute('class')
      
      // Should have dark mode class or similar
      expect(bodyClass?.includes('dark') || htmlClass?.includes('dark')).toBeTruthy()
    }
  })
})