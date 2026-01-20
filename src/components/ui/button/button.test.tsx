import { describe, expect, it } from 'vitest'
import { render, screen } from '@/__tests__/test-utils'
import { Button } from './index'

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>)

    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('should apply primary variant styles', () => {
    render(<Button primary>Primary</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-500')
  })

  it('should apply danger variant styles', () => {
    render(<Button danger>Danger</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-red-500')
  })

  it('should apply success variant styles', () => {
    render(<Button success>Success</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-green-500')
  })

  it('should apply ghost variant styles', () => {
    render(<Button ghost>Ghost</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-transparent')
  })

  it('should apply large size styles', () => {
    render(<Button lg>Large</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-lg')
  })

  it('should apply small size styles', () => {
    render(<Button sm>Small</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-xs')
  })

  it('should apply disabled styles when disabled', () => {
    render(<Button disabled>Disabled</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('cursor-not-allowed')
    expect(button).toHaveClass('opacity-75')
  })

  it('should show signal indicator when signal prop is true', () => {
    render(<Button signal>Signal</Button>)

    // Signal indicator has animate-ping class
    const signalElement = document.querySelector('.animate-ping')
    expect(signalElement).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should pass through other props', () => {
    render(<Button data-testid="test-button">Test</Button>)

    expect(screen.getByTestId('test-button')).toBeInTheDocument()
  })
})
