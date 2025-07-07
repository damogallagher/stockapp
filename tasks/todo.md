# Unit Tests for Page Components - Todo List

## Initial Analysis

I've analyzed the following page components that currently have 0% coverage:

1. **MarketPage** (`/src/app/market/page.tsx`):
   - Uses `useStockStore` for dark mode
   - Uses `useRouter` for navigation
   - Renders `Navigation` and `MarketOverview` components
   - Has `handleSelectStock` function for navigation

2. **StockPage** (`/src/app/stock/[symbol]/page.tsx`):
   - Uses `useStockStore` for dark mode
   - Takes `params.symbol` as prop
   - Validates symbol with regex and length check
   - Uses `notFound()` for invalid symbols
   - Renders multiple components: `Navigation`, `StockDashboard`, `StockChart`, `CompanyInfo`
   - Uses `Tabs` component for chart/company info switching

3. **WatchlistPage** (`/src/app/watchlist/page.tsx`):
   - Uses `useStockStore` for dark mode
   - Uses `useRouter` for navigation
   - Renders `Navigation` and `Watchlist` components
   - Has `handleSelectStock` function for navigation

4. **ApiTestPage** (`/src/app/api-test/page.tsx`):
   - Uses `useState` for result and loading states
   - Has `testYahooFinanceApi` async function
   - Makes fetch request to `/api/test-yahoo-finance`
   - Renders UI cards and buttons
   - Has complex conditional rendering based on result state

## Implementation Plan

### Task Checklist

- [ ] Create MarketPage test file (`__tests__/app/market/page.test.tsx`)
  - [ ] Mock all dependencies (useStockStore, useRouter, child components)
  - [ ] Test component rendering
  - [ ] Test dark mode functionality
  - [ ] Test navigation handling
  - [ ] Test accessibility features
  - [ ] Test user interactions

- [ ] Create StockPage test file (`__tests__/app/stock/[symbol]/page.test.tsx`)
  - [ ] Mock all dependencies (useStockStore, notFound, child components)
  - [ ] Test component rendering with valid symbol
  - [ ] Test symbol validation logic
  - [ ] Test notFound() calls for invalid symbols
  - [ ] Test dark mode functionality
  - [ ] Test tabs functionality
  - [ ] Test accessibility features
  - [ ] Test edge cases (empty symbol, long symbol, invalid characters)

- [ ] Create WatchlistPage test file (`__tests__/app/watchlist/page.test.tsx`)
  - [ ] Mock all dependencies (useStockStore, useRouter, child components)
  - [ ] Test component rendering
  - [ ] Test dark mode functionality
  - [ ] Test navigation handling
  - [ ] Test accessibility features
  - [ ] Test user interactions

- [ ] Create ApiTestPage test file (`__tests__/app/api-test/page.test.tsx`)
  - [ ] Mock fetch API
  - [ ] Test component rendering
  - [ ] Test loading states
  - [ ] Test successful API response
  - [ ] Test error handling
  - [ ] Test user interactions (button clicks)
  - [ ] Test conditional rendering based on result state
  - [ ] Test accessibility features

## Test Patterns to Follow

Based on the existing HomePage test, I'll follow these patterns:

1. **Mock Strategy**: Mock all external dependencies (hooks, Next.js functions, child components)
2. **Test Structure**: Organize tests by functionality (rendering, interactions, accessibility, etc.)
3. **Mocking Child Components**: Create simple mock components that accept props and render test-ids
4. **Dark Mode Testing**: Test document.documentElement.classList manipulation
5. **Navigation Testing**: Test router.push calls with correct parameters
6. **Accessibility Testing**: Test heading structure, keyboard navigation, button roles
7. **Error Handling**: Test edge cases and error scenarios
8. **Coverage**: Ensure all code paths are tested for 100% coverage

## Key Mock Requirements

- `useStockStore` with all store properties
- `useRouter` with navigation functions
- `notFound` from Next.js (for StockPage)
- `fetch` API (for ApiTestPage)
- All child components with proper prop interfaces
- `document.documentElement.classList` for dark mode
- Lucide React icons
- `@/lib/utils` cn function

## Expected Outcomes

- 100% test coverage for all four page components
- Comprehensive test suites following existing patterns
- Proper mocking to avoid external dependencies
- Tests that cover all conditional logic and edge cases
- Accessibility and user interaction testing
- Error handling and validation testing