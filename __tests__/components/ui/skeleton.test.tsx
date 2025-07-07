import { render, screen } from '@testing-library/react'
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton', () => {
  it('renders with default classes', () => {
    render(<Skeleton data-testid="skeleton" />)
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted')
  })

  it('renders with custom className', () => {
    render(<Skeleton className="custom-skeleton" data-testid="skeleton" />)
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('custom-skeleton')
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted')
  })

  it('passes through HTML attributes', () => {
    render(
      <Skeleton 
        id="test-skeleton" 
        aria-label="Loading content"
        style={{ width: '100px', height: '20px' }}
        data-testid="skeleton"
      />
    )
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveAttribute('id', 'test-skeleton')
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content')
    expect(skeleton).toHaveStyle({ width: '100px', height: '20px' })
  })

  it('renders with children', () => {
    render(
      <Skeleton data-testid="skeleton">
        <span>Loading...</span>
      </Skeleton>
    )
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('can be used with different sizes', () => {
    const { rerender } = render(<Skeleton className="h-4 w-full" data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveClass('h-4', 'w-full')
    
    rerender(<Skeleton className="h-8 w-32" data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveClass('h-8', 'w-32')
    
    rerender(<Skeleton className="h-12 w-12 rounded-full" data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveClass('h-12', 'w-12', 'rounded-full')
  })

  it('renders multiple skeletons', () => {
    render(
      <div>
        <Skeleton data-testid="skeleton-1" className="h-4 w-full mb-2" />
        <Skeleton data-testid="skeleton-2" className="h-4 w-3/4 mb-2" />
        <Skeleton data-testid="skeleton-3" className="h-4 w-1/2" />
      </div>
    )
    
    expect(screen.getByTestId('skeleton-1')).toBeInTheDocument()
    expect(screen.getByTestId('skeleton-2')).toBeInTheDocument()
    expect(screen.getByTestId('skeleton-3')).toBeInTheDocument()
  })
})