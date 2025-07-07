import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Test input" />)
    
    const input = screen.getByPlaceholderText('Test input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border', 'border-input')
  })

  it('renders with custom className', () => {
    render(<Input className="custom-class" placeholder="Test input" />)
    
    const input = screen.getByPlaceholderText('Test input')
    expect(input).toHaveClass('custom-class')
  })

  it('renders with different input types', () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />)
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email')
    
    rerender(<Input type="password" placeholder="Password" />)
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password')
    
    rerender(<Input type="number" placeholder="Number" />)
    expect(screen.getByPlaceholderText('Number')).toHaveAttribute('type', 'number')
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} placeholder="Test input" />)
    
    const input = screen.getByPlaceholderText('Test input')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object))
  })

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled input" />)
    
    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Input ref={ref} placeholder="Test input" />)
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('passes through HTML attributes', () => {
    render(
      <Input 
        id="test-input" 
        name="test" 
        required 
        aria-describedby="help-text"
        placeholder="Test input"
      />
    )
    
    const input = screen.getByPlaceholderText('Test input')
    expect(input).toHaveAttribute('id', 'test-input')
    expect(input).toHaveAttribute('name', 'test')
    expect(input).toHaveAttribute('required')
    expect(input).toHaveAttribute('aria-describedby', 'help-text')
  })

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    render(<Input onFocus={handleFocus} onBlur={handleBlur} placeholder="Test input" />)
    
    const input = screen.getByPlaceholderText('Test input')
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('renders with default value', () => {
    render(<Input defaultValue="Default value" />)
    
    const input = screen.getByDisplayValue('Default value')
    expect(input).toBeInTheDocument()
  })

  it('renders as controlled component', () => {
    const { rerender } = render(<Input value="controlled value" onChange={() => {}} />)
    
    let input = screen.getByDisplayValue('controlled value')
    expect(input).toBeInTheDocument()
    
    rerender(<Input value="updated value" onChange={() => {}} />)
    input = screen.getByDisplayValue('updated value')
    expect(input).toBeInTheDocument()
  })

  it('handles keyboard events', () => {
    const handleKeyDown = jest.fn()
    render(<Input onKeyDown={handleKeyDown} placeholder="Test input" />)
    
    const input = screen.getByPlaceholderText('Test input')
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    expect(handleKeyDown).toHaveBeenCalledTimes(1)
    expect(handleKeyDown).toHaveBeenCalledWith(expect.objectContaining({
      key: 'Enter',
      code: 'Enter'
    }))
  })
})