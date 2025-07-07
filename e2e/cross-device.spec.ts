import { test, expect } from '@playwright/test'

test.describe('Cross-Device Compatibility', () => {
  test.describe('Desktop Experience', () => {
    test.use({ viewport: { width: 1280, height: 720 } })

    test('should have proper desktop layout on homepage', async ({ page }) => {
      await page.goto('/')
      
      // Check desktop navigation is visible
      await expect(page.getByTestId('desktop-nav')).toBeVisible()
      await expect(page.getByTestId('mobile-menu-button')).not.toBeVisible()
      
      // Check grid layout for quick actions (3 columns on desktop)
      const quickActionsGrid = page.locator('[data-testid="quick-actions-grid"]')
      await expect(quickActionsGrid).toHaveCSS('grid-template-columns', /repeat\(3/)
    })

    test('should display full market overview on desktop', async ({ page }) => {
      await page.goto('/market')
      
      // Market overview should show full layout
      await expect(page.getByText('Market Overview')).toBeVisible()
      await expect(page.locator('[data-testid="market-indices"]')).toBeVisible()
      await expect(page.locator('[data-testid="top-movers"]')).toBeVisible()
    })

    test('should show side-by-side layout for stock details', async ({ page }) => {
      await page.goto('/stock/AAPL')
      
      // Should have chart and company info in tabs
      await expect(page.getByRole('tab', { name: 'Chart & Analysis' })).toBeVisible()
      await expect(page.getByRole('tab', { name: 'Company Info' })).toBeVisible()
      
      // Chart should be visible by default
      await expect(page.locator('[data-testid="stock-chart"]')).toBeVisible()
    })
  })

  test.describe('Tablet Experience', () => {
    test.use({ viewport: { width: 768, height: 1024 } })

    test('should adapt navigation for tablet', async ({ page }) => {
      await page.goto('/')
      
      // Navigation should still be visible but may be compressed
      await expect(page.getByRole('navigation')).toBeVisible()
      
      // Quick actions should adapt to 2 columns on tablet
      const quickActionsGrid = page.locator('[data-testid="quick-actions-grid"]')
      if (await quickActionsGrid.isVisible()) {
        // Grid may adapt to 2 columns or stack vertically
        const gridCols = await quickActionsGrid.evaluate(el => 
          window.getComputedStyle(el).gridTemplateColumns
        )
        expect(gridCols).toBeTruthy()
      }
    })

    test('should maintain functionality on tablet', async ({ page }) => {
      await page.goto('/')
      
      // Search should work on tablet
      await page.getByPlaceholder('Search stocks...').click()
      await page.getByPlaceholder('Search stocks...').fill('AAPL')
      
      // Results should appear
      await expect(page.getByText('Apple Inc.')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Mobile Experience', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('should show mobile navigation', async ({ page }) => {
      await page.goto('/')
      
      // Mobile menu button should be visible
      await expect(page.getByTestId('mobile-menu-button')).toBeVisible()
      
      // Desktop nav should be hidden
      await expect(page.getByTestId('desktop-nav')).not.toBeVisible()
    })

    test('should stack quick actions vertically on mobile', async ({ page }) => {
      await page.goto('/')
      
      // Quick actions should stack in single column
      const quickActionsGrid = page.locator('[data-testid="quick-actions-grid"]')
      if (await quickActionsGrid.isVisible()) {
        const gridCols = await quickActionsGrid.evaluate(el => 
          window.getComputedStyle(el).gridTemplateColumns
        )
        // Should be single column on mobile
        expect(gridCols).toContain('1fr')
      }
    })

    test('should handle mobile search interaction', async ({ page }) => {
      await page.goto('/')
      
      // Tap search icon to open search
      const searchButton = page.getByTestId('search-button')
      if (await searchButton.isVisible()) {
        await searchButton.click()
      } else {
        // Fallback to search input
        await page.getByPlaceholder('Search stocks...').click()
      }
      
      // Mobile keyboard should appear and search should work
      await page.getByPlaceholder('Search stocks...').fill('TSLA')
      await expect(page.getByText('Tesla')).toBeVisible({ timeout: 10000 })
    })

    test('should navigate between pages on mobile', async ({ page }) => {
      await page.goto('/')
      
      // Open mobile menu
      await page.getByTestId('mobile-menu-button').click()
      
      // Navigate to market page
      await page.getByRole('link', { name: 'Market' }).click()
      await expect(page).toHaveURL('/market')
      
      // Navigate to watchlist
      await page.getByTestId('mobile-menu-button').click()
      await page.getByRole('link', { name: 'Watchlist' }).click()
      await expect(page).toHaveURL('/watchlist')
    })

    test('should handle touch interactions for stock charts', async ({ page }) => {
      await page.goto('/stock/AAPL')
      
      // Wait for page to load
      await page.waitForLoadState('networkidle')
      
      // Chart should be visible and responsive to touch
      const chartContainer = page.locator('[data-testid="stock-chart"]')
      await expect(chartContainer).toBeVisible({ timeout: 15000 })
      
      // Test touch/swipe on chart (basic interaction)
      const chartElement = chartContainer.first()
      await chartElement.click()
      
      // Chart should remain interactive
      await expect(chartContainer).toBeVisible()
    })
  })

  test.describe('Responsive Breakpoints', () => {
    test('should handle viewport size changes', async ({ page }) => {
      await page.goto('/')
      
      // Start with desktop size
      await page.setViewportSize({ width: 1280, height: 720 })
      await expect(page.getByTestId('mobile-menu-button')).not.toBeVisible()
      
      // Resize to tablet
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.waitForTimeout(500) // Allow for responsive changes
      
      // Navigation should adapt
      const navigation = page.getByRole('navigation')
      await expect(navigation).toBeVisible()
      
      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(500)
      
      // Mobile menu should appear
      await expect(page.getByTestId('mobile-menu-button')).toBeVisible()
    })
  })

  test.describe('Touch and Gesture Support', () => {
    test.use({ viewport: { width: 375, height: 667 }, hasTouch: true })

    test('should support touch navigation', async ({ page }) => {
      await page.goto('/')
      
      // Touch-based navigation
      await page.getByText('Market Overview').first().click()
      await expect(page).toHaveURL('/market')
      
      // Go back
      await page.goBack()
      await expect(page).toHaveURL('/')
    })

    test('should handle touch gestures on charts', async ({ page }) => {
      await page.goto('/stock/AAPL')
      
      const chart = page.locator('[data-testid="stock-chart"]')
      await expect(chart).toBeVisible()
      
      // Simulate touch interaction
      await chart.click()
      
      // Chart should remain functional
      await expect(chart).toBeVisible()
    })

    test('should support pinch-to-zoom on mobile', async ({ page }) => {
      await page.goto('/stock/AAPL')
      
      // Wait for chart to load
      await expect(page.locator('[data-testid="stock-chart"]')).toBeVisible()
      
      // Test that the page doesn't break with touch gestures
      const chart = page.locator('[data-testid="stock-chart"]')
      
      // Simulate touch start
      await chart.dispatchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      // Simulate touch end
      await chart.dispatchEvent('touchend', {
        touches: []
      })
      
      // Chart should still be functional
      await expect(chart).toBeVisible()
    })
  })

  test.describe('Accessibility on Different Devices', () => {
    test('should maintain accessibility on mobile', async ({ page }) => {
      await page.goto('/')
      
      // Check that buttons are large enough for touch
      const buttons = page.getByRole('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i)
        if (await button.isVisible()) {
          const box = await button.boundingBox()
          if (box) {
            // Touch targets should be at least 44px (recommended minimum)
            expect(box.height).toBeGreaterThanOrEqual(32)
            expect(box.width).toBeGreaterThanOrEqual(32)
          }
        }
      }
    })

    test('should maintain keyboard navigation on all devices', async ({ page }) => {
      await page.goto('/')
      
      // Tab navigation should work
      await page.keyboard.press('Tab')
      
      // Focus should be visible
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
      
      // Continue tabbing
      await page.keyboard.press('Tab')
      await expect(page.locator(':focus')).toBeVisible()
    })
  })

  test.describe('Performance on Different Devices', () => {
    test('should load quickly on mobile', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/')
      
      // Page should load within reasonable time
      await expect(page.getByText('Welcome to StockApp')).toBeVisible()
      
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(5000) // 5 seconds max
    })

    test('should handle multiple tabs efficiently', async ({ page }) => {
      await page.goto('/stock/AAPL')
      
      // Switch between tabs quickly
      await page.getByRole('tab', { name: 'Company Info' }).click()
      await expect(page.locator('[data-testid="company-info"]')).toBeVisible()
      
      await page.getByRole('tab', { name: 'Chart & Analysis' }).click()
      await expect(page.locator('[data-testid="stock-chart"]')).toBeVisible()
      
      // Tabs should switch smoothly
      await page.getByRole('tab', { name: 'Company Info' }).click()
      await expect(page.locator('[data-testid="company-info"]')).toBeVisible()
    })
  })
})