# Unit Testing Audit - React/TypeScript Stock Application

## Executive Summary

This document provides a comprehensive audit of all source files in the React/TypeScript stock application to identify unit testing requirements. The analysis covers 45+ source files across components, hooks, utilities, services, and types.

## Project Structure Overview

```
src/
├── app/                    # Next.js app router (6 files)
├── components/
│   ├── charts/            # Chart components (1 file)
│   ├── layout/            # Navigation components (1 file)
│   ├── stock/             # Stock-related components (6 files)
│   └── ui/                # UI library components (6 files)
├── hooks/                 # Custom React hooks (1 file)
├── lib/                   # Utilities and services (5 files)
└── types/                 # TypeScript definitions (1 file)
```

## Detailed File Analysis by Category

### 1. COMPONENTS - React Components Testing Requirements

#### Chart Components

**📁 `/src/components/charts/StockChart.tsx`**
- **Functions to test**:
  - `handleTimeRangeChange(range: TimeRange)` - Time range selection
  - `handleChartTypeChange(type: ChartType)` - Chart type switching  
  - `formatTooltipValue(value: any, name: string)` - Tooltip formatting
  - `formatTooltipLabel(label: string)` - Date label formatting
  - `getDateFormat()` - Date format selection based on time range
  - `formatXAxisTick(tickItem: string)` - X-axis tick formatting
  - `renderChart()` - Chart rendering logic with conditional types
- **React component tests**:
  - Props: `symbol: string`, `height?: number`
  - State integration with Zustand store
  - Conditional rendering for loading/error/empty states
  - Chart type switching (line, area, volume)
  - Time range interactions
- **Complex logic**:
  - Recharts integration and configuration
  - Date formatting with date-fns
  - Responsive container behavior
  - Chart data transformation
- **Edge cases**:
  - Empty data arrays
  - Invalid date formats
  - Network failures
  - Malformed chart data

#### Layout Components

**📁 `/src/components/layout/Navigation.tsx`**
- **Functions to test**:
  - Mobile menu toggle
  - Dark mode toggle handler
  - Active link detection logic
  - Navigation item mapping
- **React component tests**:
  - Props: `onSearch?: () => void`
  - State: `mobileMenuOpen: boolean`
  - Responsive navigation rendering
  - Mobile menu backdrop functionality
  - Icon state changes (sun/moon for dark mode)
- **Complex logic**:
  - usePathname hook integration for active states
  - Mobile breakpoint handling
  - Event propagation for search trigger
- **Edge cases**:
  - Missing onSearch callback
  - Long navigation labels
  - Screen size transitions

#### Stock-Related Components

**📁 `/src/components/stock/StockSearch.tsx`**
- **Functions to test**:
  - `handleSelectStock(symbol: string)` - Stock selection with recent search tracking
  - `handleClearSearch()` - Search input clearing
  - `handleInputFocus()` - Focus event handling
  - Click outside handler (useEffect)
  - Debounced search (useEffect with timeout)
- **React component tests**:
  - Props: `onSelectStock`, `placeholder?`, `className?`
  - State: `query`, `results`, `loading`, `showResults`, `error`
  - Popular stocks rendering
  - Recent searches display and management
  - Search results with loading/error states
- **Complex logic**:
  - 300ms debounced API calls
  - Click outside detection with refs
  - Results dropdown positioning
  - Popular vs search results conditional rendering
- **Dependencies**: 
  - `searchStocks` API function
  - Zustand store for recent searches
- **Edge cases**:
  - Empty search queries
  - No search results
  - API failures
  - Rapid typing scenarios

**📁 `/src/components/stock/StockCard.tsx`**
- **Functions to test**:
  - `handleWatchlistToggle(e: React.MouseEvent)` - Watchlist add/remove with event handling
  - Price change color determination
  - Conditional rendering logic
- **React component tests**:
  - Props: `quote`, `loading?`, `onViewDetails?`, `showAddToWatchlist?`, `compact?`
  - Watchlist state integration
  - Loading skeleton rendering
  - Error state display
  - Compact mode differences
- **Complex logic**:
  - Event propagation handling (stopPropagation)
  - Conditional button rendering
  - Price formatting and color coding
- **Edge cases**:
  - Missing quote data
  - Zero/negative prices
  - Very large numbers

**📁 `/src/components/stock/StockDashboard.tsx`**
- **Functions to test**:
  - `handleWatchlistToggle()` - Watchlist management
  - Data formatting and display logic
  - Conditional rendering based on data availability
- **React component tests**:
  - Props: `symbol: string`
  - Integration with `useStockData` hook
  - Loading states for multiple data sources
  - Error handling and display
  - Metrics calculation and display
- **Dependencies**:
  - `useStockData` custom hook
  - Zustand store for watchlist
  - Multiple utility functions for formatting
- **Edge cases**:
  - Missing company data
  - Invalid stock symbols
  - Partial data scenarios

**📁 `/src/components/stock/MarketOverview.tsx`**
- **Functions to test**:
  - `fetchIndices()` - API data fetching with error handling
  - `handleRefresh()` - Manual refresh functionality
  - Auto-refresh logic (useEffect with interval)
  - `MarketMoverCard` component rendering
  - `MarketIndexCard` component rendering
- **React component tests**:
  - Props: `onSelectStock?: (symbol: string) => void`
  - State: `indices`, `loading`, `error`, `lastUpdated`, `refreshing`
  - Market status calculation and display
  - Tabbed interface for market movers
  - Auto-refresh during market hours
- **Complex logic**:
  - Market hours detection
  - Interval management for auto-refresh
  - Mock data vs real data handling
  - Market status badges and indicators
- **Edge cases**:
  - Weekend/holiday handling
  - API failures
  - Empty market data

**📁 `/src/components/stock/Watchlist.tsx`**
- **Functions to test**:
  - `handleSort(newSortBy)` - Sorting logic with direction toggle
  - `handleRemove(symbol: string)` - Item removal
  - Filtering logic for search queries
  - Quote loading simulation
  - View mode switching (list/grid)
- **React component tests**:
  - Props: `onSelectStock?: (symbol: string) => void`
  - State: `searchQuery`, `sortBy`, `sortOrder`, `viewMode`, `enhancedItems`
  - Empty state rendering
  - Search and filter functionality
  - List vs grid view rendering
  - Summary statistics calculation
- **Complex logic**:
  - Multi-field sorting algorithms
  - Async quote loading with Promise.all
  - Search filtering across multiple fields
  - Dynamic statistics calculation
- **Edge cases**:
  - Empty watchlist
  - Large watchlists (performance)
  - Quote loading failures

**📁 `/src/components/stock/CompanyInfo.tsx`**
- **Functions to test**:
  - Tabbed interface navigation
  - Financial data formatting and display
  - News item rendering
- **React component tests**:
  - Props: `symbol: string`
  - Integration with multiple hooks
  - Loading states for different data types
  - Error handling for missing data
  - Tabbed content switching
- **Dependencies**:
  - `useCompanyOverview` hook
  - `useMarketNews` hook
  - Multiple formatting utilities
- **Edge cases**:
  - Missing company information
  - No news available
  - Incomplete financial data

#### UI Components (shadcn/ui based)

**📁 `/src/components/ui/button.tsx`**
- **Functions to test**:
  - Variant rendering (default, destructive, outline, secondary, ghost, link)
  - Size variations (default, sm, lg, icon)
  - `asChild` prop functionality with Radix Slot
- **React component tests**:
  - Props: extends HTMLButtonElement + VariantProps
  - Class variance authority integration
  - Forward ref functionality
  - Accessibility attributes

**📁 `/src/components/ui/card.tsx`**
- **Functions to test**:
  - Card component composition
  - ClassName merging with cn utility
- **React component tests**:
  - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
  - Forward ref functionality
  - Props spreading

**📁 Additional UI Components** (badge.tsx, input.tsx, skeleton.tsx, tabs.tsx)
- Similar testing patterns for variant props
- Forward ref functionality
- ClassName merging
- Accessibility considerations

### 2. HOOKS - Custom React Hooks Testing Requirements

**📁 `/src/hooks/useStockData.ts`**
- **Functions to test**:
  - `useStockQuote(symbol: string)` - Single stock quote fetching
  - `useCompanyOverview(symbol: string)` - Company information fetching
  - `useStockChart(symbol: string, timeRange: TimeRange)` - Chart data fetching
  - `useMarketNews(symbol?: string)` - News data fetching
  - `useStockData(symbol: string)` - Combined data fetching
- **Custom hook tests**:
  - Return values: `{ data, loading, error }`
  - Cache integration testing
  - Dependency change handling
  - Error state management
  - Loading state transitions
- **Complex logic**:
  - Cache-first data fetching
  - Error handling and propagation
  - Multiple API call coordination
  - useEffect dependency management
- **Dependencies**:
  - API functions from `/lib/api.ts`
  - Cache utilities
- **Edge cases**:
  - Empty symbols
  - Network failures
  - Cache misses/hits
  - Rapid symbol changes

### 3. SERVICES & UTILITIES - Core Logic Testing Requirements

#### API Services

**📁 `/src/lib/api.ts`**
- **Functions to test**:
  - `searchStocks(query: string): Promise<ApiResponse<StockSearchResult[]>>`
  - `getStockQuote(symbol: string): Promise<ApiResponse<StockQuote>>`
  - `getCompanyOverview(symbol: string): Promise<ApiResponse<CompanyOverview>>`
  - `getStockChart(symbol: string, timeRange: TimeRange): Promise<ApiResponse<ChartData[]>>`
  - `getMarketNews(symbol?: string): Promise<ApiResponse<NewsItem[]>>`
  - `getMarketIndices(): Promise<ApiResponse<MarketIndex[]>>`
  - `getCachedData<T>(key: string): T | null`
  - `setCachedData<T>(key: string, data: T): void`
- **Service tests**:
  - Yahoo Finance API integration
  - Data transformation and normalization
  - Error handling with custom StockApiError
  - Response format standardization
  - Cache management functionality
- **Complex logic**:
  - Yahoo Finance API data mapping
  - Time range to interval conversion
  - Date format handling and conversion
  - Market cap calculations
  - Financial metrics extraction
- **Edge cases**:
  - Invalid stock symbols
  - Network timeouts
  - Malformed API responses
  - Rate limiting scenarios
  - Cache expiration

#### State Management

**📁 `/src/lib/store.ts`**
- **Functions to test**:
  - `addToWatchlist(item: WatchlistItem)` - Duplicate prevention
  - `removeFromWatchlist(symbol: string)` - Array filtering
  - `addRecentSearch(symbol: string)` - List management with max size
  - `clearRecentSearches()` - Array clearing
  - `clearWatchlist()` - Array clearing
  - `setTimeRange(range: TimeRange)` - State update
  - `setChartType(type: ChartType)` - State update
  - `toggleDarkMode()` - Boolean toggle
- **Store tests**:
  - Zustand state management
  - Persistence with localStorage
  - State mutations and immutability
  - Partialize function for selective persistence
- **Complex logic**:
  - Duplicate detection in watchlist
  - Recent searches deduplication and limiting
  - Persistence configuration
- **Edge cases**:
  - localStorage failures
  - Large data sets
  - Invalid data types

#### Utility Functions

**📁 `/src/lib/utils.ts`**
- **Functions to test**:
  - `cn(...inputs: ClassValue[])` - CSS class merging
  - `formatCurrency(value: number, currency = 'USD'): string` - Currency formatting
  - `formatNumber(value: number): string` - Number formatting
  - `formatPercentage(value: number): string` - Percentage formatting
  - `formatMarketCap(value: number): string` - Large number abbreviation
  - `getPriceChangeColor(change: number): string` - Color determination
  - `isMarketOpen(): boolean` - Market hours calculation
  - `getNextMarketOpen(): Date` - Next market open calculation
- **Utility tests**:
  - Number formatting with localization
  - Date/time calculations
  - CSS class manipulation
  - Business logic for market hours
- **Complex logic**:
  - Market hours calculation with weekends
  - Number abbreviation with proper precision
  - Timezone handling
  - Color coding logic
- **Edge cases**:
  - Negative numbers
  - Very large/small numbers
  - Weekend/holiday edge cases
  - Timezone transitions

#### Type Definitions

**📁 `/src/lib/types.ts`**
- **Testing needs**:
  - Type validation in unit tests
  - Interface completeness verification
  - Mock data type consistency
- **Key interfaces**:
  - Stock data interfaces (StockQuote, CompanyOverview, etc.)
  - API response interfaces
  - Store state interfaces
  - Chart and time range types

**📁 `/src/lib/mock-data.ts`**
- **Testing needs**:
  - Data consistency with type interfaces
  - Realistic value ranges
  - Edge case scenarios in mock data

### 4. APP ROUTER PAGES - Integration Testing Requirements

**📁 `/src/app/layout.tsx`**
- **Functions to test**:
  - Metadata configuration
  - Font loading (Inter)
  - HTML structure and classes
- **Component tests**:
  - Props: `children: React.ReactNode`
  - CSS class application
  - Metadata object structure

**📁 `/src/app/page.tsx`** (Home Page)
- **Functions to test**:
  - `handleSelectStock(symbol: string)` - Navigation logic
  - `handleOpenSearch()` - Modal state management
  - Dark mode effect (useEffect)
- **Component tests**:
  - State: `showSearch: boolean`
  - Store integration for dark mode and watchlist
  - Conditional rendering for search modal
  - Popular stocks interaction

**📁 `/src/app/market/page.tsx`**
- **Functions to test**:
  - `handleSelectStock(symbol: string)` - Navigation
  - Dark mode effect
- **Component tests**:
  - Store integration
  - Component composition

**📁 `/src/app/watchlist/page.tsx`**
- Similar to market page testing requirements

**📁 `/src/app/stock/[symbol]/page.tsx`**
- **Functions to test**:
  - Symbol validation (`/^[A-Z]+$/.test()`)
  - Symbol normalization (`.toUpperCase()`)
  - `notFound()` call conditions
  - Dark mode effect
- **Component tests**:
  - Props: `params: { symbol: string }`
  - Invalid symbol handling
  - Tab navigation functionality

**📁 `/src/app/api-test/page.tsx`**
- **Functions to test**:
  - `testYahooFinanceApi()` - API testing functionality
- **Component tests**:
  - State: `result`, `loading`
  - API response handling and display
  - Error state management

**📁 `/src/app/api/test-yahoo-finance/route.ts`**
- **Functions to test**:
  - `GET()` API route handler
  - Error handling and response formatting
- **API tests**:
  - Response structure validation
  - Error response handling
  - Integration with `getStockQuote`

## Testing Priority Matrix

### 🔴 Critical Priority (Business Logic Core)
1. **API Services** (`/src/lib/api.ts`) - All financial data operations
2. **Custom Hooks** (`/src/hooks/useStockData.ts`) - Data management layer
3. **Store Management** (`/src/lib/store.ts`) - Application state
4. **Utility Functions** (`/src/lib/utils.ts`) - Formatting and calculations

### 🟡 High Priority (User Interactions)
1. **StockSearch** - Core search functionality
2. **StockChart** - Complex charting logic
3. **Watchlist** - State management and UI logic
4. **MarketOverview** - Real-time data handling
5. **Navigation** - Routing and responsive behavior

### 🟢 Medium Priority (Display Components)
1. **StockCard** - Data presentation with interactions
2. **StockDashboard** - Comprehensive data display
3. **CompanyInfo** - Multi-tabbed information display
4. **Page Components** - Integration and routing

### 🔵 Lower Priority (UI Foundation)
1. **UI Components** - Basic component functionality
2. **Layout Components** - Structural elements
3. **Type Definitions** - Static analysis coverage

## Edge Cases and Error Scenarios

### 🚨 Critical Edge Cases

#### API and Network
- Network connection failures
- Invalid or non-existent stock symbols
- API rate limiting and throttling
- Malformed or incomplete API responses
- Yahoo Finance API service disruptions

#### Data Validation
- Special characters in stock symbols
- Very long search queries
- Empty or null data responses
- Extreme numerical values (very large/small)
- Date format inconsistencies

#### User Experience
- Rapid user interactions (button mashing)
- Browser storage limitations
- Mobile device limitations
- Accessibility requirements
- Dark mode transitions

#### Market Data Specifics
- Weekend and holiday market closures
- After-hours trading scenarios
- Different timezone handling
- Daylight saving time transitions
- Market volatility extremes

### 🛡️ Error Recovery Testing

#### State Management
- localStorage corruption or unavailability
- Large watchlist performance impacts
- Concurrent state modifications
- Store persistence failures

#### Component Lifecycle
- Component unmounting during async operations
- Memory leaks in intervals and timeouts
- Event listener cleanup
- Hook dependency updates

## Recommended Testing Tools and Setup

### Unit Testing Framework
- **Jest** - Primary testing framework
- **React Testing Library** - Component testing
- **MSW (Mock Service Worker)** - API mocking
- **@testing-library/jest-dom** - Custom matchers

### Testing Utilities
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/react-hooks** - Custom hook testing
- **jest-environment-jsdom** - DOM environment
- **whatwg-fetch** - Fetch polyfill for tests

### Coverage Requirements
- **Minimum 80% line coverage** for critical files
- **100% coverage** for utility functions
- **95% coverage** for API services and hooks
- **90% coverage** for component logic

## Implementation Recommendations

### Test Organization
```
__tests__/
├── components/           # Component tests
├── hooks/               # Custom hook tests  
├── lib/                 # Services and utilities
├── app/                 # Page integration tests
├── setup/               # Test configuration
└── utils/               # Test helper functions
```

### Mocking Strategy
- Mock external APIs (Yahoo Finance)
- Mock localStorage and sessionStorage
- Mock date/time functions for consistent testing
- Mock Recharts components for performance
- Mock Next.js navigation hooks

### Test Data Management
- Use factory functions for test data generation
- Maintain realistic test datasets
- Include edge case scenarios in test data
- Version control test fixtures

This comprehensive audit provides a roadmap for implementing thorough unit test coverage across the entire React/TypeScript stock application, ensuring reliability, maintainability, and confidence in the codebase.