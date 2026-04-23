# AgroShield UI Testing Guide

## Overview

Comprehensive testing strategy for the AgroShield UI component library, including unit tests, integration tests, accessibility tests, and performance testing.

## 🧪 Testing Stack

### Core Testing Libraries
- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - DOM matchers
- **@testing-library/user-event** - User interaction simulation
- **MSW** - API mocking
- **Storybook** - Component visualization and testing

### Accessibility Testing
- **axe-core** - Accessibility testing engine
- **@axe-core/react** - React accessibility testing
- **jest-axe** - Jest axe integration

### Performance Testing
- **@testing-library/react-hooks** - Hook testing
- **React Profiler** - Performance profiling
- **Lighthouse CI** - Performance auditing

## 📋 Test Structure

### Directory Structure
```
src/components/ui/
├── __tests__/
│   ├── button.test.tsx
│   ├── card.test.tsx
│   └── accessibility/
│       ├── button.a11y.test.tsx
│       └── card.a11y.test.tsx
├── button.tsx
├── card.tsx
└── index.tsx
```

### Test File Naming
- `*.test.tsx` - Unit tests
- `*.integration.test.tsx` - Integration tests
- `*.a11y.test.tsx` - Accessibility tests
- `*.performance.test.tsx` - Performance tests

## 🎯 Unit Testing

### Component Testing Template
```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button Component', () => {
  const user = userEvent.setup()

  // Basic rendering
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  // Props testing
  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })

  // Event handling
  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  // Accessibility
  it('supports disabled state', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  // Ref forwarding
  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Button ref={ref}>Ref button</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
```

### Hook Testing Template
```tsx
import { renderHook, act } from '@testing-library/react'
import { useCounter } from '../hooks/useCounter'

describe('useCounter Hook', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })

  it('increments count', () => {
    const { result } = renderHook(() => useCounter())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })

  it('resets count', () => {
    const { result } = renderHook(() => useCounter(5))
    
    act(() => {
      result.current.reset()
    })
    
    expect(result.current.count).toBe(0)
  })
})
```

## 🔗 Integration Testing

### Component Integration Template
```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form, Input, Button } from '../index'

describe('Form Integration', () => {
  const user = userEvent.setup()

  it('submits form with valid data', async () => {
    const handleSubmit = jest.fn()
    
    render(
      <Form onSubmit={handleSubmit}>
        <Input name="email" type="email" required />
        <Button type="submit">Submit</Button>
      </Form>
    )

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com'
        })
      )
    })
  })

  it('shows validation errors', async () => {
    render(
      <Form>
        <Input name="email" type="email" required />
        <Button type="submit">Submit</Button>
      </Form>
    )

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
  })
})
```

## ♿ Accessibility Testing

### axe-core Integration
```tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button } from '../button'

expect.extend(toHaveNoViolations)

describe('Button Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<Button>Accessible button</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('supports keyboard navigation', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button')
    button.focus()
    
    expect(button).toHaveFocus()
    
    fireEvent.keyDown(button, { key: 'Enter' })
    expect(handleClick).toHaveBeenCalled()
  })

  it('has proper ARIA attributes', () => {
    render(<Button disabled aria-describedby="help-text">Disabled button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).toHaveAttribute('aria-describedby', 'help-text')
  })
})
```

### Keyboard Navigation Testing
```tsx
import { render, fireEvent } from '@testing-library/react'
import { Menu, MenuItem } from '../menu'

describe('Menu Keyboard Navigation', () => {
  it('navigates with arrow keys', () => {
    render(
      <Menu>
        <MenuItem>Item 1</MenuItem>
        <MenuItem>Item 2</MenuItem>
        <MenuItem>Item 3</MenuItem>
      </Menu>
    )

    const menu = screen.getByRole('menu')
    menu.focus()

    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(screen.getByRole('menuitem', { name: 'Item 1' })).toHaveFocus()

    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(screen.getByRole('menuitem', { name: 'Item 2' })).toHaveFocus()
  })

  it('closes with Escape key', () => {
    const onClose = jest.fn()
    render(
      <Menu open onClose={onClose}>
        <MenuItem>Item 1</MenuItem>
      </Menu>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
```

## ⚡ Performance Testing

### Render Performance
```tsx
import { render, screen } from '@testing-library/react'
import { Profiler } from 'react'
import { VirtualList } from '../virtual-list'

describe('VirtualList Performance', () => {
  it('renders large datasets efficiently', () => {
    const items = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }))

    const onRender = jest.fn()

    render(
      <Profiler id="VirtualList" onRender={onRender}>
        <VirtualList
          items={items}
          itemHeight={50}
          renderItem={(item) => <div>{item.name}</div>}
        />
      </Profiler>
    )

    // Should only render visible items
    expect(onRender).toHaveBeenCalled()
    expect(screen.getAllByText(/Item \d+/)).toHaveLength(expect.any(Number))
  })

  it('handles data updates efficiently', () => {
    const { rerender } = render(
      <VirtualList
        items={[]}
        itemHeight={50}
        renderItem={(item) => <div>{item.name}</div>}
      />
    )

    const newItems = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }))

    rerender(
      <VirtualList
        items={newItems}
        itemHeight={50}
        renderItem={(item) => <div>{item.name}</div>}
      />
    )

    expect(screen.getAllByText(/Item \d+/)).toHaveLength(expect.any(Number))
  })
})
```

### Memory Testing
```tsx
describe('Memory Management', () => {
  it('cleans up event listeners', () => {
    const { unmount } = render(<ComponentWithListeners />)
    
    // Simulate component unmount
    unmount()
    
    // Verify cleanup
    expect(removeEventListener).toHaveBeenCalled()
  })

  it('does not leak memory on re-renders', () => {
    const { rerender } = render(<ExpensiveComponent data={[]} />)
    
    // Multiple re-renders
    for (let i = 0; i < 100; i++) {
      rerender(<ExpensiveComponent data={Array(i)} />)
    }
    
    // Memory should be stable
    expect(process.memoryUsage().heapUsed).toBeLessThan(50 * 1024 * 1024) // 50MB
  })
})
```

## 🎨 Visual Testing

### Storybook Integration
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Interactive button component with multiple variants.'
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon']
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button'
  }
}

export const WithIcon: Story = {
  args: {
    children: 'With Icon',
    leftIcon: <PlusIcon />
  }
}

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true
  }
}
```

### Visual Regression Testing
```tsx
import { render, screen } from '@testing-library/react'
import { matchSnapshot } from 'test-snapshot'
import { Button } from '../button'

describe('Button Visual Tests', () => {
  it('matches snapshot for default variant', () => {
    const { container } = render(<Button>Default</Button>)
    expect(container).toMatchSnapshot()
  })

  it('matches snapshot for all variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']
    
    variants.forEach(variant => {
      const { container } = render(<Button variant={variant}>{variant}</Button>)
      expect(container).toMatchSnapshot(`Button-${variant}`)
    })
  })
})
```

## 📊 Test Coverage

### Coverage Configuration
```json
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/components/ui/**/*.{ts,tsx}',
    '!src/components/ui/**/*.stories.{ts,tsx}',
    '!src/components/ui/**/*.test.{ts,tsx}',
    '!src/components/ui/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# Generate HTML report
npm run test:coverage:html

# Check coverage thresholds
npm run test:coverage:check
```

## 🔧 Testing Utilities

### Custom Test Utilities
```tsx
// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### Mock Utilities
```tsx
// mocks.ts
export const mockResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

export const mockIntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Setup mocks
beforeAll(() => {
  window.ResizeObserver = mockResizeObserver
  window.IntersectionObserver = mockIntersectionObserver
})
```

## 🚀 Test Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:coverage:html": "jest --coverage --coverageReporters=html",
    "test:a11y": "jest --testPathPattern=a11y",
    "test:integration": "jest --testPathPattern=integration",
    "test:performance": "jest --testPathPattern=performance",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
```

## 📋 Testing Checklist

### Before Submitting
- [ ] All components have unit tests
- [ ] Critical paths have integration tests
- [ ] All components pass accessibility tests
- [ ] Performance tests pass for heavy components
- [ ] Test coverage meets threshold (80%+)
- [ ] Visual tests match snapshots
- [ ] Tests are well-documented

### Test Quality
- [ ] Tests are readable and maintainable
- [ ] Tests cover edge cases
- [ ] Tests mock external dependencies
- [ ] Tests are deterministic
- [ ] Tests run quickly

## 🎯 Best Practices

### Do's
- ✅ Test user behavior, not implementation
- ✅ Use meaningful test names
- ✅ Test accessibility features
- ✅ Mock external dependencies
- ✅ Keep tests simple and focused

### Don'ts
- ❌ Test implementation details
- ❌ Use fragile selectors
- ❌ Skip accessibility testing
- ❌ Forget cleanup in tests
- ❌ Write overly complex tests

## 📚 Resources

### Documentation
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [axe-core Documentation](https://www.deque.com/axe/core-documentation/)

### Tools
- [Storybook](https://storybook.js.org/)
- [Chromatic](https://www.chromatic.com/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Examples
- [Testing Library Examples](https://testing-library.com/docs/react-testing-library/examples/)
- [Jest Examples](https://jestjs.io/docs/getting-started#using-typescript)

---

By following this comprehensive testing guide, you can ensure that your AgroShield UI components are reliable, accessible, and performant across all use cases.
