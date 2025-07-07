import { render, screen } from '@testing-library/react'
import RootLayout, { metadata } from '@/app/layout'

// Mock Next.js font module
jest.mock('next/font/google', () => ({
  Inter: jest.fn(() => ({
    className: 'mocked-inter-font',
  })),
}))

describe('RootLayout', () => {
  describe('Component Rendering', () => {
    it('should render children within the layout structure', () => {
      const testChild = <div data-testid="test-child">Test Child Content</div>
      
      render(<RootLayout>{testChild}</RootLayout>)
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument()
      expect(screen.getByText('Test Child Content')).toBeInTheDocument()
    })

    it('should render proper HTML structure with semantic elements', () => {
      const testChild = <div data-testid="test-child">Test Content</div>
      
      const { container } = render(<RootLayout>{testChild}</RootLayout>)
      
      // Check for proper HTML structure
      const html = container.querySelector('html')
      const body = container.querySelector('body')
      const mainDiv = container.querySelector('div.min-h-full')
      
      expect(html).toBeInTheDocument()
      expect(body).toBeInTheDocument()
      expect(mainDiv).toBeInTheDocument()
    })

    it('should apply correct CSS classes to HTML elements', () => {
      const testChild = <div data-testid="test-child">Test Content</div>
      
      const { container } = render(<RootLayout>{testChild}</RootLayout>)
      
      const html = container.querySelector('html')
      const body = container.querySelector('body')
      const mainDiv = container.querySelector('div.min-h-full')
      
      expect(html).toHaveClass('h-full')
      expect(html).toHaveAttribute('lang', 'en')
      expect(body).toHaveClass('h-full', 'mocked-inter-font')
      expect(mainDiv).toHaveClass('min-h-full', 'bg-background', 'text-foreground')
    })

    it('should apply Inter font class from Next.js font optimization', () => {
      const testChild = <div data-testid="test-child">Test Content</div>
      
      const { container } = render(<RootLayout>{testChild}</RootLayout>)
      
      const body = container.querySelector('body')
      expect(body).toHaveClass('mocked-inter-font')
    })
  })

  describe('Accessibility', () => {
    it('should have proper language attribute on HTML element', () => {
      const testChild = <div data-testid="test-child">Test Content</div>
      
      const { container } = render(<RootLayout>{testChild}</RootLayout>)
      
      const html = container.querySelector('html')
      expect(html).toHaveAttribute('lang', 'en')
    })

    it('should provide proper semantic structure for screen readers', () => {
      const testChild = <div data-testid="test-child">Test Content</div>
      
      const { container } = render(<RootLayout>{testChild}</RootLayout>)
      
      // Check that the layout provides a proper document structure
      const html = container.querySelector('html')
      const body = container.querySelector('body')
      
      expect(html).toBeInTheDocument()
      expect(body).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should apply responsive height classes', () => {
      const testChild = <div data-testid="test-child">Test Content</div>
      
      const { container } = render(<RootLayout>{testChild}</RootLayout>)
      
      const html = container.querySelector('html')
      const body = container.querySelector('body')
      const mainDiv = container.querySelector('div.min-h-full')
      
      expect(html).toHaveClass('h-full')
      expect(body).toHaveClass('h-full')
      expect(mainDiv).toHaveClass('min-h-full')
    })

    it('should apply background and text color classes for theming', () => {
      const testChild = <div data-testid="test-child">Test Content</div>
      
      const { container } = render(<RootLayout>{testChild}</RootLayout>)
      
      const mainDiv = container.querySelector('div.min-h-full')
      expect(mainDiv).toHaveClass('bg-background', 'text-foreground')
    })
  })

  describe('Multiple Children Support', () => {
    it('should render multiple children correctly', () => {
      const multipleChildren = (
        <>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
          <div data-testid="child-3">Third Child</div>
        </>
      )
      
      render(<RootLayout>{multipleChildren}</RootLayout>)
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
      expect(screen.getByTestId('child-3')).toBeInTheDocument()
    })

    it('should handle empty children', () => {
      const { container } = render(<RootLayout>{null}</RootLayout>)
      
      const mainDiv = container.querySelector('div.min-h-full')
      expect(mainDiv).toBeInTheDocument()
      expect(mainDiv).toBeEmptyDOMElement()
    })
  })

  describe('Font Loading', () => {
    it('should load and apply Inter font correctly', () => {
      const testChild = <div data-testid="test-child">Test Content</div>
      
      const { container } = render(<RootLayout>{testChild}</RootLayout>)
      
      const body = container.querySelector('body')
      expect(body).toHaveClass('mocked-inter-font')
    })
  })
})

describe('Metadata Export', () => {
  describe('Basic Metadata', () => {
    it('should export correct title', () => {
      expect(metadata.title).toBe('Stock App - Professional Stock Market Analytics')
    })

    it('should export correct description', () => {
      expect(metadata.description).toBe('Comprehensive stock market analysis tools for investors and traders. Real-time quotes, interactive charts, company financials, and portfolio tracking.')
    })

    it('should export correct keywords', () => {
      expect(metadata.keywords).toBe('stocks, investing, finance, stock market, portfolio, trading, financial analysis')
    })

    it('should export correct authors', () => {
      expect(metadata.authors).toEqual([{ name: 'Stock App' }])
    })

    it('should export correct viewport', () => {
      expect(metadata.viewport).toBe('width=device-width, initial-scale=1')
    })

    it('should export correct robots directive', () => {
      expect(metadata.robots).toBe('index, follow')
    })
  })

  describe('Open Graph Metadata', () => {
    it('should have correct Open Graph title', () => {
      expect(metadata.openGraph?.title).toBe('Stock App - Professional Stock Market Analytics')
    })

    it('should have correct Open Graph description', () => {
      expect(metadata.openGraph?.description).toBe('Comprehensive stock market analysis tools for investors and traders.')
    })

    it('should have correct Open Graph type', () => {
      expect((metadata.openGraph as any)?.type).toBe('website')
    })

    it('should have correct Open Graph images', () => {
      expect(metadata.openGraph?.images).toEqual([
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Stock App - Market Analytics Platform'
        }
      ])
    })
  })

  describe('Twitter Card Metadata', () => {
    it('should have correct Twitter card type', () => {
      expect((metadata.twitter as any)?.card).toBe('summary_large_image')
    })

    it('should have correct Twitter title', () => {
      expect(metadata.twitter?.title).toBe('Stock App - Professional Stock Market Analytics')
    })

    it('should have correct Twitter description', () => {
      expect(metadata.twitter?.description).toBe('Comprehensive stock market analysis tools for investors and traders.')
    })
  })

  describe('SEO Optimization', () => {
    it('should have all required SEO metadata fields', () => {
      expect(metadata.title).toBeTruthy()
      expect(metadata.description).toBeTruthy()
      expect(metadata.keywords).toBeTruthy()
      expect(metadata.authors).toBeTruthy()
      expect(metadata.viewport).toBeTruthy()
      expect(metadata.robots).toBeTruthy()
    })

    it('should have social media sharing metadata', () => {
      expect(metadata.openGraph).toBeTruthy()
      expect(metadata.twitter).toBeTruthy()
    })

    it('should have proper image specifications for social sharing', () => {
      const images = metadata.openGraph?.images
      const ogImage = Array.isArray(images) ? images[0] : images
      expect((ogImage as any)?.url).toBe('/og-image.png')
      expect((ogImage as any)?.width).toBe(1200)
      expect((ogImage as any)?.height).toBe(630)
      expect((ogImage as any)?.alt).toBeTruthy()
    })
  })
})