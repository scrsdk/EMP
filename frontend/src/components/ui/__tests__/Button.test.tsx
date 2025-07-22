import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  test('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('shows loading state', () => {
    render(<Button isLoading>Loading button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-gray-300')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('hover:bg-gray-100')
  })

  test('applies size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  test('can be disabled', () => {
    render(<Button disabled>Disabled button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('accepts motion props without type conflicts', () => {
    const motionProps = {
      whileHover: { scale: 1.05 },
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    }
    
    render(
      <Button motionProps={motionProps}>
        Motion Button
      </Button>
    )
    
    expect(screen.getByRole('button', { name: 'Motion Button' })).toBeInTheDocument()
  })

  test('supports all valid variants', () => {
    const variants = ['primary', 'secondary', 'success', 'warning', 'danger', 'outline', 'ghost', 'floating'] as const
    
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>Test {variant}</Button>)
      expect(screen.getByRole('button', { name: `Test ${variant}` })).toBeInTheDocument()
      unmount()
    })
  })
})