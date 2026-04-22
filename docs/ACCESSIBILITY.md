# ♿ AgroShield Accessibility Guide

This guide covers AgroShield's commitment to accessibility and how to use our components to create inclusive user experiences.

## 🎯 Accessibility Mission

AgroShield is committed to providing an accessible experience for all users, regardless of their abilities or the assistive technologies they use. We follow WCAG 2.1 AA guidelines and strive to exceed these standards.

## 📋 Table of Contents

- [Accessibility Features](#accessibility-features)
- [Component Accessibility](#component-accessibility)
- [Keyboard Navigation](#keyboard-navigation)
- [Screen Reader Support](#screen-reader-support)
- [Color and Contrast](#color-and-contrast)
- [Mobile Accessibility](#mobile-accessibility)
- [Testing Accessibility](#testing-accessibility)
- [Best Practices](#best-practices)

## ✨ Accessibility Features

### Built-in ARIA Support

All AgroShield components include comprehensive ARIA attributes:

```typescript
// Automatic ARIA attributes
<Button
  aria-label="Save changes"
  aria-describedby="save-help"
  aria-pressed={isPressed}
>
  Save
</Button>

// Screen reader announcements
<ProgressBar 
  value={75}
  aria-label="Loading progress"
  aria-live="polite"
/>
```

### Focus Management

Components provide proper focus management:

```typescript
// Focus trapping in modals
<Modal>
  <ModalContent>
    <Button>Close</Button> {/* Automatically focused on open */}
  </ModalContent>
</Modal>

// Skip links for keyboard users
<SkipLink href="#main-content">
  Skip to main content
</SkipLink>
```

## 🧩 Component Accessibility

### Button Component

The Button component includes comprehensive accessibility:

```typescript
import { Button } from '@/components/ui/button'

// ✅ Accessible button usage
<Button
  aria-label="Save changes"
  aria-describedby="save-help"
  aria-pressed={isPressed}
  disabled={isLoading}
>
  {isLoading ? 'Saving...' : 'Save'}
</Button>

// ✅ Icon button with label
<Button
  aria-label="Close dialog"
  variant="ghost"
  size="sm"
>
  <XIcon />
</Button>

// ✅ Toggle button
<Button
  aria-pressed={isToggled}
  aria-label="Toggle dark mode"
  onClick={toggleDarkMode}
>
  <MoonIcon />
</Button>
```

**Accessibility Features:**
- Automatic `role="button"`
- Keyboard navigation support
- Focus management
- ARIA attributes support
- Screen reader announcements

### Form Components

Form components include validation and error handling:

```typescript
import { 
  ResponsiveFormField,
  ResponsiveSelect,
  ResponsiveTextarea
} from '@/components/responsive-form'

// ✅ Accessible form field
<ResponsiveFormField
  label="Email Address"
  name="email"
  type="email"
  required
  error={errors.email}
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : 'email-help'}
  value={formData.email}
  onChange={(value) => setFormData({ ...formData, email: value })}
/>

// ✅ Error announcement
{errors.email && (
  <div id="email-error" role="alert" className="text-destructive">
    {errors.email}
  </div>
)}

// ✅ Help text
<div id="email-help" className="text-muted-foreground">
  We'll never share your email with anyone else.
</div>
```

### Modal Components

Modals include focus trapping and escape handling:

```typescript
import { ResponsiveModal } from '@/components/responsive-modal'

// ✅ Accessible modal
<ResponsiveModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Edit Profile"
  closeOnBackdrop={true}
>
  <form onSubmit={handleSubmit}>
    <ResponsiveFormField
      label="Name"
      name="name"
      value={formData.name}
      onChange={(value) => setFormData({ ...formData, name: value })}
    />
    <Button type="submit">Save</Button>
  </form>
</ResponsiveModal>
```

**Accessibility Features:**
- Focus trapping within modal
- Escape key handling
- ARIA dialog roles
- Screen reader announcements
- Backdrop click handling

### Table Components

Tables include headers and navigation support:

```typescript
import { ResponsiveTable } from '@/components/responsive-table'

// ✅ Accessible table
<ResponsiveTable
  data={users}
  columns={[
    {
      key: 'name',
      label: 'Name',
      sortable: true
    },
    {
      key: 'email',
      label: 'Email Address'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span
          role="status"
          aria-label={`User status: ${value}`}
        >
          {value}
        </span>
      )
    }
  ]}
  searchable={true}
  pagination={{ pageSize: 10 }}
/>
```

## ⌨️ Keyboard Navigation

### Tab Order

Proper tab order is maintained throughout the application:

```typescript
// ✅ Logical tab order
<div>
  <h1>Page Title</h1>
  <form>
    <Input placeholder="First field" />
    <Input placeholder="Second field" />
    <Button>Submit</Button>
  </form>
  <Button>Cancel</Button>
</div>
```

### Keyboard Shortcuts

Common keyboard shortcuts are supported:

- `Tab` - Navigate forward
- `Shift + Tab` - Navigate backward
- `Enter` - Activate buttons and links
- `Space` - Activate buttons and toggle switches
- `Escape` - Close modals and dropdowns
- `Arrow Keys` - Navigate menus and options

### Focus Management

Components manage focus appropriately:

```typescript
// ✅ Focus management example
const [focusedIndex, setFocusedIndex] = useState(0)

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      setFocusedIndex(prev => Math.min(prev + 1, items.length - 1))
      break
    case 'ArrowUp':
      event.preventDefault()
      setFocusedIndex(prev => Math.max(prev - 1, 0))
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      selectItem(items[focusedIndex])
      break
  }
}
```

## 🖥️ Screen Reader Support

### Semantic HTML

Components use semantic HTML elements:

```typescript
// ✅ Semantic structure
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/policies">Policies</a></li>
    </ul>
  </nav>
</header>

<main id="main-content">
  <h1>Page Title</h1>
  <section aria-labelledby="policies-heading">
    <h2 id="policies-heading">Your Policies</h2>
    <PolicyList />
  </section>
</main>

<aside aria-label="Help">
  <HelpContent />
</aside>

<footer>
  <FooterContent />
</footer>
```

### ARIA Labels

Comprehensive ARIA labeling:

```typescript
// ✅ Descriptive labels
<Button
  aria-label="Close dialog and return to main page"
  onClick={closeModal}
>
  <XIcon />
</Button>

// ✅ Landmark roles
<nav aria-label="Main navigation">
  <NavigationItems />
</nav>

<main role="main" aria-labelledby="page-title">
  <h1 id="page-title">Dashboard</h1>
  <DashboardContent />
</main>

// ✅ Live regions
<div
  aria-live="polite"
  aria-atomic="true"
  id="status-messages"
>
  {statusMessage && <p>{statusMessage}</p>}
</div>
```

### Screen Reader Announcements

Important changes are announced:

```typescript
// ✅ Status announcements
const announceStatus = (message: string) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Usage
announceStatus('Policy created successfully')
```

## 🎨 Color and Contrast

### WCAG Compliance

All color combinations meet WCAG 2.1 AA standards:

- **Normal Text:** 4.5:1 contrast ratio minimum
- **Large Text:** 3:1 contrast ratio minimum
- **Interactive Elements:** 3:1 contrast ratio minimum

### High Contrast Mode

Support for high contrast and reduced motion preferences:

```typescript
// ✅ Respect user preferences
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const prefersHighContrast = useMediaQuery('(prefers-contrast: high)')

// Apply conditional animations
<FadeIn 
  duration={prefersReducedMotion ? 0 : 300}
>
  <Content />
</FadeIn>

// Apply conditional colors
<div className={cn(
  'bg-background text-foreground',
  prefersHighContrast && 'high-contrast'
)}>
  <Content />
</div>
```

### Color Blindness Considerations

Color is not the only indicator of state:

```typescript
// ✅ Multiple indicators
<Button
  className={cn(
    'bg-primary text-primary-foreground',
    isActive && 'ring-2 ring-primary ring-offset-2'
  )}
  aria-pressed={isActive}
>
  {isActive && <CheckIcon className="mr-2" />}
  {isActive ? 'Active' : 'Inactive'}
</Button>
```

## 📱 Mobile Accessibility

### Touch Targets

Touch targets meet minimum size requirements:

- **Minimum:** 44px × 44px
- **Recommended:** 48px × 48px

```typescript
// ✅ Proper touch targets
<Button size="lg">Large Touch Target</Button>

// ✅ Spaced touch targets
<div className="space-x-4">
  <Button size="lg">Button 1</Button>
  <Button size="lg">Button 2</Button>
</div>
```

### Gesture Support

Touch gestures are supported with alternatives:

```typescript
// ✅ Touch with keyboard alternative
<SwipeableCard
  onSwipeLeft={handleNext}
  onSwipeRight={handlePrevious}
>
  <CardContent>
    <Button onClick={handlePrevious} aria-label="Previous">
      <PreviousIcon />
    </Button>
    <CardContent />
    <Button onClick={handleNext} aria-label="Next">
      <NextIcon />
    </Button>
  </CardContent>
</SwipeableCard>
```

## 🧪 Testing Accessibility

### Automated Testing

Use accessibility testing tools:

```bash
# Install accessibility testing tools
npm install --save-dev @axe-core/react-axe

# Run accessibility tests
npm run test:a11y
```

```typescript
// ✅ Automated accessibility testing
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('component should be accessible', async () => {
  const { container } = render(<MyComponent />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Manual Testing

Manual testing checklist:

- [ ] Keyboard navigation works throughout
- [ ] Screen reader reads content correctly
- [ ] Focus is visible and logical
- [ ] Color contrast meets standards
- [ ] Touch targets are appropriately sized
- [ ] Forms are fully accessible
- [ ] Dynamic content is announced

### Testing Tools

Recommended accessibility testing tools:

1. **Screen Readers:**
   - NVDA (Windows)
   - JAWS (Windows)
   - VoiceOver (macOS)
   - TalkBack (Android)

2. **Browser Tools:**
   - Chrome DevTools Lighthouse
   - axe DevTools extension
   - WAVE Web Accessibility Evaluator

3. **Automated Tools:**
   - jest-axe for unit testing
   - @axe-core/react for React testing
   - lighthouse-ci for CI/CD

## 📋 Best Practices

### 1. Semantic HTML First

Always use semantic HTML elements:

```typescript
// ✅ Good - Semantic HTML
<header>
  <nav aria-label="Main navigation">
    <NavigationItems />
  </nav>
</header>

<main>
  <h1>Page Title</h1>
  <MainContent />
</main>

// ❌ Bad - Non-semantic HTML
<div class="header">
  <div class="nav">
    <NavigationItems />
  </div>
</div>

<div class="main">
  <div class="title">Page Title</div>
  <MainContent />
</div>
```

### 2. Provide Multiple Cues

Don't rely on color alone:

```typescript
// ✅ Good - Multiple indicators
<div className={cn(
  'border-2 rounded-lg p-4',
  isError && 'border-destructive bg-destructive/10',
  isSuccess && 'border-green-500 bg-green-50'
)}>
  {isError && <AlertCircle className="text-destructive" />}
  {isSuccess && <CheckCircle className="text-green-500" />}
  <span className={cn(
    isError && 'text-destructive',
    isSuccess && 'text-green-700'
  )}>
    {message}
  </span>
</div>

// ❌ Bad - Color only
<div className={cn(
  'border-2 rounded-lg p-4',
  isError && 'border-red-500 bg-red-50',
  isSuccess && 'border-green-500 bg-green-50'
)}>
  <span className={cn(
    isError && 'text-red-700',
    isSuccess && 'text-green-700'
  )}>
    {message}
  </span>
</div>
```

### 3. Respect User Preferences

Honor accessibility preferences:

```typescript
// ✅ Good - Respect preferences
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

<FadeIn 
  duration={prefersReducedMotion ? 0 : 300}
  className={prefersDarkMode ? 'dark-mode' : 'light-mode'}
>
  <Content />
</FadeIn>

// ❌ Bad - Ignore preferences
<FadeIn duration={300}>
  <Content />
</FadeIn>
```

### 4. Test with Screen Readers

Always test with actual screen readers:

```typescript
// ✅ Good - Screen reader friendly
<button
  aria-label="Save changes"
  aria-describedby="save-help"
  onClick={saveChanges}
>
  <SaveIcon />
  <span className="sr-only">Save changes</span>
</button>

<div id="save-help" className="text-muted-foreground">
  Saves your changes to the server
</div>

// ❌ Bad - Screen reader unfriendly
<button onClick={saveChanges}>
  <SaveIcon />
</button>
```

### 5. Provide Skip Links

Include skip links for keyboard users:

```typescript
// ✅ Good - Skip links
<SkipLink href="#main-content">
  Skip to main content
</SkipLink>

<SkipLink href="#navigation">
  Skip to navigation
</SkipLink>

<main id="main-content">
  <MainContent />
</main>

<nav id="navigation">
  <NavigationItems />
</nav>
```

## 🔧 Accessibility Utilities

### useAccessibility Hook

Custom hook for accessibility features:

```typescript
const useAccessibility = () => {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')

    setReducedMotion(motionQuery.matches)
    setHighContrast(contrastQuery.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches)

    motionQuery.addEventListener('change', handleMotionChange)
    contrastQuery.addEventListener('change', handleContrastChange)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      contrastQuery.removeEventListener('change', handleContrastChange)
    }
  }, [])

  return { reducedMotion, highContrast }
}
```

### Accessibility Classes

Utility classes for accessibility:

```css
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus visible */
.focus-visible:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .high-contrast {
    border: 2px solid currentColor;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .respect-motion {
    animation: none !important;
    transition: none !important;
  }
}
```

## 📞 Getting Help

For accessibility questions or issues:

- **Documentation:** [Accessibility Guide](./ACCESSIBILITY.md)
- **Issues:** [GitHub Issues](https://github.com/welson-ai/AgroShield/issues)
- **Email:** accessibility@agroshield.io
- **Discord:** #accessibility channel

## 🤝 Contributing to Accessibility

When contributing to accessibility:

1. Test with screen readers
2. Verify keyboard navigation
3. Check color contrast
4. Include ARIA attributes
5. Write accessibility tests
6. Update documentation

For detailed guidelines, see [CONTRIBUTING.md](../CONTRIBUTING.md).

---

**♿ AgroShield is committed to making decentralized insurance accessible to everyone.**
