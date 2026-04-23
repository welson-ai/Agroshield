# AgroShield UI Accessibility Guide

## WCAG 2.1 AA Compliance

All components in the AgroShield UI library are designed to meet WCAG 2.1 AA accessibility standards.

## Accessibility Features

### 🎯 Keyboard Navigation
- Tab order follows logical sequence
- All interactive elements are keyboard accessible
- Focus indicators are clearly visible
- Skip navigation links provided

### 📱 Screen Reader Support
- Semantic HTML elements used
- ARIA labels and descriptions
- Live regions for dynamic content
- Alternative text for images

### 🎨 Visual Accessibility
- Sufficient color contrast (4.5:1 minimum)
- Focus indicators visible
- Text resizable up to 200%
- No reliance on color alone

### ⚡ Cognitive Accessibility
- Clear and consistent navigation
- Error prevention and recovery
- Help and instructions available
- Predictable functionality

## Component Accessibility

### Button Component
```tsx
// Accessible button
<Button 
  aria-label="Save document"
  aria-describedby="save-help"
  disabled={isSaving}
>
  Save
</Button>

// Button with icon
<Button aria-label="Close dialog">
  <XIcon />
</Button>
```

### Form Components
```tsx
// Accessible form field
<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby="email-error email-help"
  />
  {hasError && (
    <p id="email-error" className="text-destructive">
      Please enter a valid email address
    </p>
  )}
  <p id="email-help" className="text-muted-foreground">
    We'll never share your email
  </p>
</div>
```

### Navigation Components
```tsx
// Accessible navigation
<nav aria-label="Main navigation">
  <ul className="flex space-x-4">
    <li>
      <a href="/home" aria-current={currentPage === 'home'}>
        Home
      </a>
    </li>
    <li>
      <a href="/about" aria-current={currentPage === 'about'}>
        About
      </a>
    </li>
  </ul>
</nav>
```

### Dialog Components
```tsx
// Accessible dialog
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent 
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <DialogHeader>
      <DialogTitle id="dialog-title">Confirm Action</DialogTitle>
      <DialogDescription id="dialog-description">
        Are you sure you want to delete this item?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleDelete}>Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## ARIA Guidelines

### Roles
- Use semantic HTML elements first
- Add ARIA roles when necessary
- Don't override implicit roles

### Labels
- Every interactive element needs a label
- Use `aria-label` for invisible labels
- Use `aria-labelledby` for visible labels

### Descriptions
- Use `aria-describedby` for additional context
- Provide help text for complex inputs
- Include error messages in descriptions

### States
- Use `aria-expanded` for collapsible content
- Use `aria-selected` for selected items
- Use `aria-disabled` for disabled elements

### Live Regions
- Use `aria-live` for dynamic content
- Use `aria-busy` for loading states
- Use `aria-atomic` for complete updates

## Keyboard Navigation

### Tab Order
- Logical tab sequence
- Skip links for main content
- Focus trapping in modals

### Key Bindings
- Enter/Space for buttons
- Arrow keys for menus
- Escape for closing dialogs

### Focus Management
- Visible focus indicators
- Programmatic focus control
- Focus restoration

## Testing Accessibility

### Automated Testing
```bash
# Install accessibility testing tools
npm install --save-dev axe-core jest-axe

# Run accessibility tests
npm run test:a11y
```

### Manual Testing Checklist
- [ ] Keyboard navigation works
- [ ] Screen reader reads content correctly
- [ ] Color contrast meets standards
- [ ] Focus indicators are visible
- [ ] Forms are properly labeled
- [ ] Dynamic content is announced

### Tools
- **axe DevTools** - Browser extension
- **WAVE** - Web accessibility evaluator
- **Screen readers** - NVDA, JAWS, VoiceOver
- **Keyboard testing** - Tab navigation

## Color Contrast

### Requirements
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Testing
```css
/* Use contrast checking tools */
.text-primary {
  color: hsl(220 90% 56%); /* 7.5:1 contrast */
}

.text-muted {
  color: hsl(220 14% 46%); /* 4.8:1 contrast */
}
```

## Responsive Design

### Requirements
- Content works at 200% zoom
- Touch targets at least 44x44px
- No horizontal scrolling
- Reflow works on mobile

### Implementation
```tsx
// Responsive button sizes
<Button 
  size="default" // 44px minimum touch target
  className="min-h-[44px] min-w-[44px]"
>
  Click me
</Button>
```

## Animation and Motion

### Guidelines
- Respect `prefers-reduced-motion`
- Provide controls for auto-playing content
- No flashing content
- Smooth transitions

### Implementation
```css
/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Error Handling

### Requirements
- Error messages are accessible
- Validation is clear and helpful
- Recovery options are provided
- Errors are programmatically associated

### Implementation
```tsx
// Accessible error handling
{errors.email && (
  <div 
    role="alert"
    aria-live="polite"
    className="text-destructive"
  >
    {errors.email}
  </div>
)}
```

## Documentation Standards

### Component Documentation
- Accessibility features listed
- Keyboard shortcuts documented
- ARIA attributes explained
- Usage examples provided

### Code Comments
```tsx
// Accessibility: Provides keyboard navigation
// ARIA: Uses aria-expanded for collapsible state
// Focus: Manages focus when opened/closed
const Accordion = ({ children, ...props }) => {
  // Component implementation
}
```

## Continuous Improvement

### Regular Audits
- Monthly accessibility audits
- User testing with assistive technology
- Automated testing in CI/CD
- Issue tracking and resolution

### Training
- Team accessibility training
- Design system guidelines
- Code review checklist
- Best practices documentation

## Resources

### Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices/)
- [Accessibility Guidelines](https://www.a11yproject.com/)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Testing
- [Screen Reader Testing](https://webaim.org/techniques/screenreader/)
- [Keyboard Testing](https://webaim.org/techniques/keyboard/)
- [Mobile Accessibility](https://webaim.org/techniques/mobile/)
