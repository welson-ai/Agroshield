# AgroShield UI Component Library Installation

## Quick Start

### Prerequisites
- React 18+
- TypeScript 4.5+
- Tailwind CSS 3.0+

### Installation

```bash
# Install dependencies
npm install react react-dom typescript tailwindcss

# Copy UI components to your project
cp -r components/ui src/components/
```

### Setup

1. **Configure Tailwind CSS**

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

2. **Import CSS**

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

3. **Setup Utils**

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Usage

### Basic Usage

```tsx
import { Button, Card, Input } from '@/components/ui'

export default function Example() {
  return (
    <Card className="p-6">
      <Input placeholder="Enter text" className="mb-4" />
      <Button variant="primary">Submit</Button>
    </Card>
  )
}
```

### Advanced Usage

```tsx
import { DataGrid, TooltipGroup, ProgressRing } from '@/components/ui'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <ProgressRing value={75} size={120} />
      <DataGrid data={data} columns={columns} />
      <TooltipGroup delay={400}>
        {/* Tooltip items */}
      </TooltipGroup>
    </div>
  )
}
```

## Component Categories

### Essential Components
```tsx
import { Button, Input, Card, Alert, Dialog } from '@/components/ui'
```

### Navigation Components
```tsx
import { Breadcrumb, Menu, Tabs, Accordion } from '@/components/ui'
```

### Data Display Components
```tsx
import { Table, DataGrid, Progress, Skeleton } from '@/components/ui'
```

### Advanced Components
```tsx
import { VirtualList, DragDrop, Tour, Masonry } from '@/components/ui'
```

## Theming

### Custom Colors

```css
/* src/styles/globals.css */
:root {
  --primary: 220 90% 56%;
  --secondary: 220 14% 96%;
  --accent: 220 14% 96%;
  --destructive: 0 84% 60%;
}
```

### Custom Components

```tsx
// Custom button variant
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
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
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## Accessibility

All components include:
- Keyboard navigation
- Screen reader support
- ARIA attributes
- Focus management
- Color contrast compliance

## Performance

### Tree Shaking

```tsx
// Import only what you need
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

### Lazy Loading

```tsx
import { lazy, Suspense } from 'react'

const DataGrid = lazy(() => import('@/components/ui/data-grid'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataGrid data={data} />
    </Suspense>
  )
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
