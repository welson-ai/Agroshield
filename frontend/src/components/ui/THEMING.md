# AgroShield UI Theming Guide

## Overview

The AgroShield UI library uses Tailwind CSS for styling with a flexible theming system that supports custom colors, components, and design tokens.

## Color System

### Default Color Palette
```css
/* src/styles/globals.css */
:root {
  /* Primary Colors */
  --primary: 220 90% 56%;
  --primary-foreground: 220 90% 98%;
  
  /* Secondary Colors */
  --secondary: 220 14% 96%;
  --secondary-foreground: 220 14% 12%;
  
  /* Accent Colors */
  --accent: 220 14% 96%;
  --accent-foreground: 220 14% 12%;
  
  /* Destructive Colors */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 84% 98%;
  
  /* Neutral Colors */
  --muted: 220 14% 96%;
  --muted-foreground: 220 8% 46%;
  
  /* Background Colors */
  --background: 0 0% 100%;
  --foreground: 220 14% 12%;
  
  /* Border Colors */
  --border: 220 14% 96%;
  --input: 220 14% 96%;
  --ring: 220 90% 56%;
}

/* Dark Theme */
.dark {
  --background: 220 14% 4%;
  --foreground: 220 14% 98%;
  --muted: 220 14% 8%;
  --muted-foreground: 220 8% 70%;
  --border: 220 14% 15%;
  --input: 220 14% 15%;
  --secondary: 220 14% 8%;
  --secondary-foreground: 220 14% 98%;
  --accent: 220 14% 8%;
  --accent-foreground: 220 14% 98%;
  --destructive: 0 62% 30%;
  --destructive-foreground: 0 62% 98%;
  --primary: 220 90% 56%;
  --primary-foreground: 220 90% 98%;
  --ring: 220 90% 56%;
}
```

### Custom Colors
```css
/* Custom brand colors */
:root {
  --brand-blue: 215 100% 50%;
  --brand-green: 142 71% 45%;
  --brand-purple: 262 83% 58%;
  --brand-orange: 25 95% 53%;
}

/* Semantic colors */
:root {
  --success: 142 71% 45%;
  --warning: 25 95% 53%;
  --info: 215 100% 50%;
  --error: 0 84% 60%;
}
```

## Typography

### Font System
```css
/* Font families */
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-serif: 'Georgia', serif;
}

/* Font sizes */
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
}

/* Line heights */
:root {
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}

/* Font weights */
:root {
  --font-thin: 100;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;
}
```

## Spacing System

### Scale
```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
}
```

## Border Radius

### Radius Scale
```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-base: 0.25rem;  /* 4px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-2xl: 1rem;     /* 16px */
  --radius-3xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;
}
```

## Shadows

### Shadow System
```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
}
```

## Animation

### Transitions
```css
:root {
  --transition-all: all 0.15s ease-in-out;
  --transition-colors: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  --transition-opacity: opacity 0.15s ease-in-out;
  --transition-shadow: box-shadow 0.15s ease-in-out;
  --transition-transform: transform 0.15s ease-in-out;
}

/* Animation durations */
:root {
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;
}

/* Animation easing */
:root {
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Component Theming

### Button Variants
```css
/* Custom button styles */
.btn-primary {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: 1px solid hsl(var(--primary));
}

.btn-secondary {
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border: 1px solid hsl(var(--secondary));
}

.btn-ghost {
  background-color: transparent;
  color: hsl(var(--foreground));
  border: 1px solid transparent;
}

.btn-ghost:hover {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}
```

### Card Variants
```css
.card {
  background-color: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card-elevated {
  box-shadow: var(--shadow-md);
}

.card-interactive {
  transition: var(--transition-all);
}

.card-interactive:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

## Dark Mode

### Implementation
```tsx
// Theme provider
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
}

const ThemeProvider = ({ children, defaultTheme = 'light' }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
```

### Usage
```tsx
// Theme toggle
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-md border"
    >
      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  )
}
```

## Custom Components

### Styled Components
```tsx
// Custom styled button
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

## Responsive Design

### Breakpoints
```css
/* Responsive breakpoints */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### Container Sizes
```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}
```

## Best Practices

### 1. Use Design Tokens
```css
/* Good */
.button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background-color: hsl(var(--primary));
}

/* Avoid */
.button {
  padding: 8px 16px;
  border-radius: 6px;
  background-color: #3b82f6;
}
```

### 2. Maintain Contrast
```css
/* Ensure sufficient contrast in both themes */
.text-primary {
  color: hsl(var(--foreground));
}

/* Dark mode specific adjustments */
.dark .text-primary {
  color: hsl(var(--foreground));
}
```

### 3. Use Semantic Classes
```css
/* Semantic naming */
.bg-surface {
  background-color: hsl(var(--background));
}

.text-on-surface {
  color: hsl(var(--foreground));
}
```

### 4. Responsive Typography
```css
/* Fluid typography */
.text-fluid {
  font-size: clamp(1rem, 2.5vw, 1.5rem);
}

/* Responsive sizes */
.text-responsive {
  font-size: var(--text-base);
}

@media (min-width: 768px) {
  .text-responsive {
    font-size: var(--text-lg);
  }
}
```

## Migration Guide

### From CSS to Tailwind
```css
/* Before */
.custom-button {
  background-color: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

/* After */
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-md border-0 cursor-pointer">
  Button
</button>
```

### Theme Updates
```css
/* When updating theme colors */
:root {
  --primary: 210 100% 50%; /* Updated */
  /* Update all references */
}
```

## Resources

### Tools
- [Tailwind CSS Color Generator](https://tailwindcolor.com/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Figma to Tailwind](https://www.figma.com/community/plugin/843580660819525688)

### Documentation
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Design Tokens Best Practices](https://designsystems.com/mental-models/)
- [Color Theory](https://web.dev/learn/css/color/)
