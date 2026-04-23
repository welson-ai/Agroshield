# Contributing to AgroShield UI

Thank you for your interest in contributing to the AgroShield UI component library! This guide will help you get started.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Setup
```bash
# Clone the repository
git clone https://github.com/welson-ai/AgroShield.git
cd AgroShield

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
frontend/src/components/ui/
├── README.md              # Overview documentation
├── COMPONENT_INDEX.md     # Component listing
├── INSTALLATION.md        # Setup guide
├── ACCESSIBILITY.md       # Accessibility guide
├── THEMING.md            # Theming guide
├── CHANGESLOG.md         # Changelog
├── CONTRIBUTING.md       # This file
├── button.tsx           # Button component
├── input.tsx            # Input component
├── card.tsx             # Card component
└── ...                  # Other components
```

## 🎯 Types of Contributions

### 🐛 Bug Reports
- Use GitHub Issues
- Provide clear reproduction steps
- Include environment details
- Add screenshots if applicable

### ✨ Feature Requests
- Use GitHub Discussions
- Describe the use case
- Provide examples
- Consider existing alternatives

### 📝 Documentation
- Fix typos and grammar
- Improve examples
- Add new guides
- Translate documentation

### 🎨 Components
- Add new components
- Improve existing ones
- Fix accessibility issues
- Optimize performance

### 🧪 Testing
- Add unit tests
- Improve test coverage
- Add integration tests
- Test accessibility

## 🛠️ Development Guidelines

### Component Structure
```tsx
// Component template
'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * ComponentName - Brief description
 * Detailed description of the component
 * 
 * @param prop1 - Description of prop1
 * @param prop2 - Description of prop2
 * @param className - Additional CSS classes
 * @returns JSX.Element - Component description
 * 
 * @example
 * <ComponentName prop1="value" prop2={true}>
 *   Children content
 * </ComponentName>
 */
interface ComponentNameProps {
  prop1: string
  prop2: boolean
  className?: string
}

const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ prop1, prop2, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("base-class", className)}
        {...props}
      >
        {prop1}
        {prop2 && <span>Conditional content</span>}
      </div>
    )
  }
)
ComponentName.displayName = "ComponentName"

export { ComponentName }
```

### TypeScript Guidelines
- Use proper typing
- Prefer interfaces over types
- Use generic types when appropriate
- Export component props interface

### Accessibility Requirements
- Keyboard navigation support
- Screen reader compatibility
- ARIA attributes
- Focus management
- Color contrast compliance

### Styling Guidelines
- Use Tailwind CSS classes
- Follow design tokens
- Responsive design
- Dark mode support
- Hover and focus states

## 📋 Pull Request Process

### 1. Fork and Branch
```bash
# Create feature branch
git checkout -b feature/new-component
```

### 2. Make Changes
- Follow component structure
- Add tests
- Update documentation
- Check accessibility

### 3. Test Changes
```bash
# Run tests
npm test

# Check types
npm run type-check

# Lint code
npm run lint

# Build project
npm run build
```

### 4. Commit Changes
```bash
# Follow conventional commits
git commit -m "feat: add new component name"
```

### 5. Create Pull Request
- Use descriptive title
- Fill out PR template
- Link relevant issues
- Request reviews

## 📝 Commit Guidelines

### Conventional Commits
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `style:` Code style
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

### Examples
```bash
feat: add progress ring component
fix: resolve button accessibility issue
docs: update installation guide
style: format component files
refactor: optimize virtual list rendering
test: add unit tests for card component
chore: update dependencies
```

## 🧪 Testing Guidelines

### Unit Tests
```tsx
// Component test template
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalled()
  })

  it('supports accessibility', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Accessibility Testing
```bash
# Install axe-core for accessibility testing
npm install --save-dev axe-core @axe-core/react

# Run accessibility tests
npm run test:a11y
```

## 🎨 Design Guidelines

### Component Variants
```tsx
// Use class-variance-authority for variants
import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        destructive: "destructive-classes",
      },
      size: {
        default: "size-classes",
        sm: "small-classes",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Responsive Design
```tsx
// Use responsive utilities
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Content */}
</div>
```

### Dark Mode Support
```tsx
// Use CSS variables for theming
<div className="bg-background text-foreground">
  {/* Content */}
</div>
```

## 📚 Documentation Guidelines

### Component Documentation
- Clear description
- Props documentation
- Usage examples
- Accessibility notes
- Best practices

### Code Comments
```tsx
/**
 * Calculate the progress percentage
 * @param value - Current value
 * @param max - Maximum value
 * @returns Percentage value (0-100)
 */
const calculateProgress = (value: number, max: number): number => {
  return (value / max) * 100
}
```

### README Updates
- Update component index
- Add new components to list
- Update installation guide
- Add new examples

## 🔧 Code Quality

### ESLint Configuration
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## 🚀 Performance Guidelines

### Optimization
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Lazy load heavy components
- Optimize re-renders

### Bundle Size
- Tree-shakeable exports
- Dynamic imports for large components
- Optimize images and assets
- Use bundle analyzer

## 📋 Review Process

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] Accessibility is considered
- [ ] Performance is optimized
- [ ] TypeScript types are correct

### Reviewer Guidelines
- Be constructive and helpful
- Explain reasoning for changes
- Suggest improvements
- Check for edge cases

## 🏆 Recognition

### Contributors
- All contributors are recognized in README
- Top contributors get special recognition
- Community highlights in releases

### Recognition Types
- 🌟 Feature contributions
- 🐛 Bug fixes
- 📚 Documentation
- 🧪 Testing
- 🎨 Design improvements

## 📞 Getting Help

### Resources
- [GitHub Issues](https://github.com/welson-ai/AgroShield/issues)
- [GitHub Discussions](https://github.com/welson-ai/AgroShield/discussions)
- [Documentation](./README.md)

### Community
- Join our Discord server
- Follow on Twitter
- Subscribe to newsletter

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🎉 Thank You!

Thank you for contributing to AgroShield UI! Your contributions help make this library better for everyone.

### Next Steps
1. Read through this guide
2. Set up your development environment
3. Find an issue to work on
4. Make your contribution
5. Submit a pull request

We look forward to your contributions! 🚀
