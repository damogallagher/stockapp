import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Default Badge</Badge>)
    
    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'border', 'px-2.5', 'py-0.5', 'text-xs', 'font-semibold')
    expect(badge).toHaveClass('border-transparent', 'bg-primary', 'text-primary-foreground')
  })

  it('renders with custom className', () => {
    render(<Badge className="custom-badge">Test Badge</Badge>)
    
    const badge = screen.getByText('Test Badge')
    expect(badge).toHaveClass('custom-badge')
  })

  it('renders secondary variant', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>)
    
    const badge = screen.getByText('Secondary Badge')
    expect(badge).toHaveClass('border-transparent', 'bg-secondary', 'text-secondary-foreground')
  })

  it('renders destructive variant', () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>)
    
    const badge = screen.getByText('Destructive Badge')
    expect(badge).toHaveClass('border-transparent', 'bg-destructive', 'text-destructive-foreground')
  })

  it('renders outline variant', () => {
    render(<Badge variant="outline">Outline Badge</Badge>)
    
    const badge = screen.getByText('Outline Badge')
    expect(badge).toHaveClass('text-foreground')
  })

  it('renders success variant', () => {
    render(<Badge variant="success">Success Badge</Badge>)
    
    const badge = screen.getByText('Success Badge')
    expect(badge).toHaveClass('border-transparent', 'bg-green-500', 'text-white')
  })

  it('renders warning variant', () => {
    render(<Badge variant="warning">Warning Badge</Badge>)
    
    const badge = screen.getByText('Warning Badge')
    expect(badge).toHaveClass('border-transparent', 'bg-yellow-500', 'text-white')
  })

  it('passes through HTML attributes', () => {
    render(
      <Badge 
        id="test-badge" 
        data-testid="badge"
        aria-label="Status indicator"
        title="Badge tooltip"
      >
        Test Badge
      </Badge>
    )
    
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('id', 'test-badge')
    expect(badge).toHaveAttribute('aria-label', 'Status indicator')
    expect(badge).toHaveAttribute('title', 'Badge tooltip')
  })

  it('renders with complex content', () => {
    render(
      <Badge>
        <span>🎯</span>
        <span>Status</span>
      </Badge>
    )
    
    expect(screen.getByText('🎯')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('can be used with different content types', () => {
    const { rerender } = render(<Badge>Text Badge</Badge>)
    expect(screen.getByText('Text Badge')).toBeInTheDocument()
    
    rerender(<Badge>123</Badge>)
    expect(screen.getByText('123')).toBeInTheDocument()
    
    rerender(<Badge>{'99+'}</Badge>)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('maintains accessibility', () => {
    render(<Badge role="status" aria-live="polite">Live Badge</Badge>)
    
    const badge = screen.getByRole('status')
    expect(badge).toHaveAttribute('aria-live', 'polite')
    expect(badge).toHaveTextContent('Live Badge')
  })
})