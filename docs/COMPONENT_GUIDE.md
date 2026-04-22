# 🎨 AgroShield Component Guide

This comprehensive guide covers all components in the AgroShield component system, including usage examples, best practices, and implementation details.

## 📚 Table of Contents

- [Base UI Components](#base-ui-components)
- [Responsive Components](#responsive-components)
- [Animation Components](#animation-components)
- [Error Handling Components](#error-handling-components)
- [Form Components](#form-components)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

## 🎯 Base UI Components

### Button

The Button component provides multiple variants and states with accessibility support.

```typescript
import { Button } from '@/components/ui/button'

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Settings</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// With loading state
<Button disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>

// With accessibility
<Button 
  aria-label="Save changes"
  aria-describedby="save-help"
>
  Save
</Button>
```

**Variants:**
- `default` - Primary button style
- `destructive` - Red for destructive actions
- `outline` - Outlined button
- `ghost` - Minimal button
- `secondary` - Secondary button
- `link` - Link-style button

**Sizes:**
- `sm` - Small button (32px height)
- `md` - Medium button (40px height)
- `lg` - Large button (48px height)

### Card

The Card component provides flexible content containers with responsive behavior.

```typescript
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// Basic card
<Card>
  <CardContent>
    <p>Card content</p>
  </CardContent>
</Card>

// With header
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
</Card>

// Responsive card
import { ResponsiveCard } from '@/components/responsive-card'

<ResponsiveCard size="responsive" variant="elevated">
  <ResponsiveCardHeader size="responsive">
    <ResponsiveCardTitle size="responsive">
      Mobile Optimized Card
    </ResponsiveCardTitle>
    <ResponsiveCardDescription size="responsive">
      Adapts to screen size
    </ResponsiveCardDescription>
  </ResponsiveCardHeader>
  <ResponsiveCardContent size="responsive">
    <p>Content that works on all devices</p>
  </ResponsiveCardContent>
</ResponsiveCard>
```

### Input

The Input component provides form inputs with validation and accessibility.

```typescript
import { Input } from '@/components/ui/input'

// Basic input
<Input placeholder="Enter your name" />

// With validation
<Input 
  type="email"
  placeholder="Email address"
  aria-invalid={hasError}
  aria-describedby="email-error"
  required
/>

// With accessibility
<Input
  type="password"
  placeholder="Password"
  aria-label="Password"
  aria-required="true"
  autoComplete="current-password"
/>

// Responsive form input
import { ResponsiveFormField } from '@/components/responsive-form'

<ResponsiveFormField
  label="Email Address"
  name="email"
  type="email"
  placeholder="you@example.com"
  required
  error={errors.email}
  value={formData.email}
  onChange={(value) => setFormData({ ...formData, email: value })}
/>
```

## 📱 Responsive Components

### ResponsiveContainer

Provides responsive layout containers with breakpoint management.

```typescript
import { ResponsiveContainer } from '@/components/responsive-container'

// Basic responsive container
<ResponsiveContainer size="lg" padding="md">
  <Content />
</ResponsiveContainer>

// Grid layout
<ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }} gap="responsive">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</ResponsiveGrid>

// Flex layout
<ResponsiveFlex direction="responsive" justify="center" wrap="responsive">
  <Item />
  <Item />
  <Item />
</ResponsiveFlex>
```

### MobileNavigation

Mobile-optimized navigation with hamburger menu and bottom tabs.

```typescript
import { MobileNavigation, MobileTabBar } from '@/components/mobile-navigation'

const navItems = [
  {
    id: 'home',
    label: 'Home',
    icon: <HomeIcon />,
    href: '/'
  },
  {
    id: 'policies',
    label: 'Policies',
    icon: <PolicyIcon />,
    href: '/policies',
    badge: '3'
  }
]

// Mobile navigation
<MobileNavigation
  items={navItems}
  activeItem="home"
  onItemClick={(item) => router.push(item.href)}
/>

// Bottom tab bar
<MobileTabBar
  items={navItems.slice(0, 5)}
  activeItem="home"
  onItemClick={(item) => router.push(item.href)}
/>
```

### ResponsiveTable

Mobile-optimized table with card view on small screens.

```typescript
import { ResponsiveTable } from '@/components/responsive-table'

const columns = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    mobilePriority: 'high'
  },
  {
    key: 'email',
    label: 'Email',
    mobilePriority: 'high'
  },
  {
    key: 'status',
    label: 'Status',
    render: (value) => (
      <Badge variant={value === 'active' ? 'default' : 'secondary'}>
        {value}
      </Badge>
    )
  }
]

const actions = [
  {
    label: 'Edit',
    icon: <EditIcon />,
    onClick: (row) => editUser(row)
  },
  {
    label: 'Delete',
    icon: <TrashIcon />,
    onClick: (row) => deleteUser(row),
    variant: 'destructive'
  }
]

<ResponsiveTable
  data={users}
  columns={columns}
  actions={actions}
  searchable={true}
  pagination={{ pageSize: 10 }}
/>
```

## 🎨 Animation Components

### Hover Effects

Advanced hover animations for interactive elements.

```typescript
import { 
  HoverScale, 
  HoverGlow, 
  HoverFloat, 
  HoverRotate,
  HoverSlide,
  HoverBorder,
  HoverGradient
} from '@/components/animations/hover-effects'

// Scale on hover
<HoverScale scale="md" duration={200}>
  <Button>Hover me</Button>
</HoverScale>

// Glow effect
<HoverGlow glowColor="primary" intensity="md">
  <Card>Glowing card</Card>
</HoverGlow>

// Float effect
<HoverFloat distance="md" duration={300}>
  <Card>Floating card</Card>
</HoverFloat>

// Combined effects
<HoverScale scale="sm">
  <HoverGlow glowColor="success" intensity="sm">
    <HoverFloat distance="sm">
      <Button>Multi-effect button</Button>
    </HoverFloat>
  </HoverGlow>
</HoverScale>
```

### Transition Animations

Smooth entrance and exit animations.

```typescript
import { 
  FadeIn, 
  SlideIn, 
  ScaleIn, 
  RotateIn, 
  BounceIn,
  StaggeredAnimation,
  AnimatedCounter
} from '@/components/animations/transition-animations'

// Fade in animation
<FadeIn duration={500} delay={100} direction="up">
  <div>Fading content</div>
</FadeIn>

// Slide in animation
<SlideIn direction="left" duration={600} delay={200}>
  <div>Sliding content</div>
</SlideIn>

// Staggered animation for lists
<StaggeredAnimation staggerDelay={100} animationType="fadeIn">
  {items.map((item, index) => (
    <div key={index}>{item}</div>
  ))}
</StaggeredAnimation>

// Animated counter
<AnimatedCounter 
  value={1000} 
  duration={2000} 
  prefix="$" 
  suffix=".00"
/>
```

### Page Transitions

Smooth page and modal transitions.

```typescript
import { 
  PageTransition, 
  RouteTransition, 
  TabTransition,
  ModalTransition
} from '@/components/animations/page-transitions'

// Page transition
<PageTransition type="slide" direction="left" duration={500}>
  <PageContent />
</PageTransition>

// Route-specific transition
<RouteTransition routeName="dashboard" duration={600}>
  <DashboardPage />
</RouteTransition>

// Tab transition
<TabTransition isActive={activeTab === 'profile'} direction="horizontal">
  <ProfileContent />
</TabTransition>

// Modal transition
<ModalTransition isOpen={isModalOpen} type="scale" duration={400}>
  <ModalContent />
</ModalTransition>
```

### Loading Animations

Advanced loading states and spinners.

```typescript
import { 
  LoadingSpinner, 
  SkeletonLoader, 
  ProgressBar, 
  PulseLoader,
  WaveLoader
} from '@/components/animations/loading-animations'

// Loading spinner
<LoadingSpinner size="md" variant="dots" color="primary" />

// Skeleton loader
<SkeletonLoader lines={3} variant="text" animated />

// Progress bar
<ProgressBar 
  value={75} 
  variant="animated" 
  color="success" 
  showLabel
/>

// Pulse loader
<PulseLoader size="md" color="primary" />

// Wave loader
<WaveLoader bars={5} size="md" color="primary" />
```

## 🛡️ Error Handling Components

### Error Boundaries

Comprehensive error handling for different error types.

```typescript
import { 
  ErrorBoundary,
  NetworkErrorBoundary,
  AsyncErrorBoundary,
  TransactionErrorBoundary,
  ErrorBoundaryIndex
} from '@/components/error-boundary-index'

// Basic error boundary
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Network error boundary
<NetworkErrorBoundary>
  <App />
</NetworkErrorBoundary>

// Combined error boundaries
<ErrorBoundaryIndex
  showNetworkBoundary={true}
  showAsyncBoundary={true}
  showTransactionBoundary={true}
  timeout={10000}
>
  <App />
</ErrorBoundaryIndex>

// With custom fallback
<ErrorBoundary
  fallback={
    <div>
      <h2>Something went wrong</h2>
      <Button onClick={() => window.location.reload()}>
        Reload Page
      </Button>
    </div>
  }
>
  <App />
</ErrorBoundary>
```

### Error Notifications

Toast notifications for different error types.

```typescript
import { 
  ErrorToast,
  SuccessToast,
  InfoToast,
  WarningToast
} from '@/components/error-toast'

// Error toast
<ErrorToast
  error={errorMessage}
  onDismiss={() => setShowError(false)}
  autoDismiss={true}
  timeout={5000}
/>

// Success toast
<SuccessToast
  message="Operation completed successfully!"
  onDismiss={() => setShowSuccess(false)}
/>

// Info toast
<InfoToast
  message="New features available!"
  onDismiss={() => setShowInfo(false)}
/>

// Warning toast
<WarningToast
  message="Unsaved changes will be lost"
  onDismiss={() => setShowWarning(false)}
  autoDismiss={false}
/>
```

## 📝 Form Components

### Responsive Forms

Mobile-optimized form components with validation.

```typescript
import { 
  ResponsiveForm,
  ResponsiveFormField,
  ResponsiveSelect,
  ResponsiveTextarea,
  ResponsiveButton,
  ResponsiveFormActions
} from '@/components/responsive-form'

// Complete responsive form
<ResponsiveForm onSubmit={handleSubmit} layout="responsive">
  <ResponsiveFormField
    label="Full Name"
    name="name"
    placeholder="Enter your full name"
    required
    error={errors.name}
    value={formData.name}
    onChange={(value) => setFormData({ ...formData, name: value })}
  />
  
  <ResponsiveFormField
    label="Email"
    name="email"
    type="email"
    placeholder="you@example.com"
    required
    error={errors.email}
    value={formData.email}
    onChange={(value) => setFormData({ ...formData, email: value })}
  />
  
  <ResponsiveSelect
    label="Country"
    name="country"
    options={countryOptions}
    value={formData.country}
    onChange={(value) => setFormData({ ...formData, country: value })}
    required
    error={errors.country}
  />
  
  <ResponsiveTextarea
    label="Message"
    name="message"
    placeholder="Enter your message"
    value={formData.message}
    onChange={(value) => setFormData({ ...formData, message: value })}
    maxLength={500}
    rows={4}
  />
  
  <ResponsiveFormActions align="center">
    <ResponsiveButton variant="outline" onClick={handleCancel}>
      Cancel
    </ResponsiveButton>
    <ResponsiveButton type="submit" loading={isSubmitting}>
      Submit
    </ResponsiveButton>
  </ResponsiveFormActions>
</ResponsiveForm>
```

## 🎯 Best Practices

### 1. Accessibility First

Always include accessibility attributes:

```typescript
// ✅ Good - Include ARIA attributes
<Button
  aria-label="Save changes"
  aria-describedby="save-help"
  aria-pressed={isPressed}
>
  Save
</Button>

// ❌ Bad - Missing accessibility
<Button>Save</Button>
```

### 2. Mobile-First Design

Design for mobile first, then enhance for larger screens:

```typescript
// ✅ Good - Mobile-first responsive design
<ResponsiveContainer size="responsive" padding="responsive">
  <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }}>
    {items.map(item => <Card key={item.id}>{item.content}</Card>)}
  </ResponsiveGrid>
</ResponsiveContainer>

// ❌ Bad - Desktop-first design
<Container className="hidden md:block">
  <DesktopLayout />
</Container>
```

### 3. Performance Optimization

Use animations sparingly and optimize for performance:

```typescript
// ✅ Good - Efficient animations
<FadeIn duration={300}>
  <Content />
</FadeIn>

// ❌ Bad - Excessive animations
<ScaleIn duration={1000}>
  <RotateIn duration={1000}>
    <BounceIn duration={1000}>
      <Content />
    </BounceIn>
  </RotateIn>
</ScaleIn>
```

### 4. Error Handling

Implement comprehensive error handling:

```typescript
// ✅ Good - Comprehensive error handling
<ErrorBoundaryIndex>
  <NetworkErrorBoundary>
    <AsyncErrorBoundary>
      <TransactionErrorBoundary>
        <App />
      </TransactionErrorBoundary>
    </AsyncErrorBoundary>
  </NetworkErrorBoundary>
</ErrorBoundaryIndex>

// ❌ Bad - No error handling
<App />
```

### 5. TypeScript Usage

Always use TypeScript for type safety:

```typescript
// ✅ Good - TypeScript interfaces
interface User {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
}

const UserCard: React.FC<{ user: User }> = ({ user }) => {
  return <Card>{user.name}</Card>
}

// ❌ Bad - No types
const UserCard = ({ user }) => {
  return <Card>{user.name}</Card>
}
```

## 🔄 Migration Guide

### From Basic HTML to AgroShield Components

**Before:**
```html
<button class="btn btn-primary">Click me</button>
<div class="card">
  <h2>Card Title</h2>
  <p>Card content</p>
</div>
```

**After:**
```typescript
<Button>Click me</Button>
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
</Card>
```

### From CSS Animations to Animation Components

**Before:**
```css
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**After:**
```typescript
<FadeIn duration={500}>
  <Content />
</FadeIn>
```

## 📚 Additional Resources

- [API Documentation](./API.md)
- [Accessibility Guide](./ACCESSIBILITY.md)
- [Performance Guide](./PERFORMANCE.md)
- [Testing Guide](./TESTING.md)

## 🤝 Contributing

When contributing new components:

1. Follow the established patterns
2. Include comprehensive TypeScript types
3. Add accessibility attributes
4. Write tests for all components
5. Update this documentation

For detailed contribution guidelines, see [CONTRIBUTING.md](../CONTRIBUTING.md).

---

**🎨 Build beautiful, accessible, and responsive interfaces with AgroShield components!**
