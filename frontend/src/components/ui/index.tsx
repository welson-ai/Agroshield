'use client'

// Export all UI components
export { Button } from './button'
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
export { Input } from './input'
export { Label } from './label'
export { Select } from './select'
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
export { Badge } from './badge'
export { Progress } from './progress'

// New components
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion'
export { Toggle, ToggleGroup, ToggleItem } from './toggle'
export { Slider, RangeSlider } from './slider'
export { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuCheckboxItem, 
  DropdownMenuLabel 
} from './dropdown'
export { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogBody, 
  DialogFooter, 
  DialogClose, 
  DialogTrigger 
} from './dialog'
export { 
  Alert, 
  AlertTitle, 
  AlertDescription, 
  AlertActions, 
  AlertProvider, 
  AlertContainer, 
  useAlert 
} from './alert'
export { 
  Tooltip, 
  TooltipProvider, 
  TooltipContent, 
  TooltipText, 
  useTooltip 
} from './tooltip'
export { 
  Avatar, 
  AvatarGroup, 
  AvatarFallback, 
  AvatarStatus 
} from './avatar'
export { 
  Separator, 
  SeparatorWithText, 
  SectionSeparator, 
  GroupSeparator, 
  AnimatedSeparator 
} from './separator'

// Re-export types for TypeScript users
export type { ButtonProps } from './button'
export type { 
  CardProps, 
  CardContentProps, 
  CardDescriptionProps, 
  CardFooterProps, 
  CardHeaderProps, 
  CardTitleProps 
} from './card'
export type { InputProps } from './input'
export type { LabelProps } from './label'
export type { SelectProps } from './select'
export type { 
  TabsProps, 
  TabsContentProps, 
  TabsListProps, 
  TabsTriggerProps 
} from './tabs'
export type { BadgeProps } from './badge'
export type { ProgressProps } from './progress'

// New component types
export type { AccordionProps, AccordionItemProps, AccordionTriggerProps, AccordionContentProps } from './accordion'
export type { ToggleProps, ToggleGroupProps, ToggleItemProps } from './toggle'
export type { SliderProps, RangeSliderProps } from './slider'
export type { 
  DropdownMenuProps, 
  DropdownMenuTriggerProps, 
  DropdownMenuContentProps, 
  DropdownMenuItemProps, 
  DropdownMenuSeparatorProps, 
  DropdownMenuCheckboxItemProps, 
  DropdownMenuLabelProps 
} from './dropdown'
export type { 
  DialogProps, 
  DialogContentProps, 
  DialogHeaderProps, 
  DialogTitleProps, 
  DialogDescriptionProps, 
  DialogBodyProps, 
  DialogFooterProps, 
  DialogCloseProps, 
  DialogTriggerProps 
} from './dialog'
export type { 
  AlertProps, 
  AlertTitleProps, 
  AlertDescriptionProps, 
  AlertActionsProps,
  Alert,
  AlertTitle,
  AlertDescription,
  AlertActions,
  AlertProvider,
  AlertContainer,
  useAlert
} from './alert'
export type { 
  TooltipProps, 
  TooltipProviderProps, 
  TooltipContentProps, 
  TooltipTextProps 
} from './tooltip'
export type { 
  AvatarProps, 
  AvatarGroupProps, 
  AvatarFallbackProps, 
  AvatarStatusProps 
} from './avatar'
export type { 
  SeparatorProps, 
  SeparatorWithTextProps, 
  SectionSeparatorProps, 
  GroupSeparatorProps, 
  AnimatedSeparatorProps 
} from './separator'

/**
 * UILibrary component - Complete UI component library
 * Provides access to all UI components and utilities
 * 
 * @example
 * import { Button, Card, Input, Badge } from '@/components/ui'
 * 
 * <Card>
 *   <CardHeader>
 *     <CardTitle>User Profile</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     <Input placeholder="Enter your name" />
 *     <Button>Submit</Button>
 *     <Badge variant="success">Active</Badge>
 *   </CardContent>
 * </Card>
 */
export const UILibrary = {
  // Base Components
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Progress,
  
  // Interactive Components
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Toggle,
  ToggleGroup,
  ToggleItem,
  Slider,
  RangeSlider,
  
  // Navigation Components
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  
  // Modal Components
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  
  // Feedback Components
  Alert,
  AlertTitle,
  AlertDescription,
  AlertActions,
  AlertProvider,
  AlertContainer,
  useAlert,
  
  // Utility Components
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipText,
  useTooltip,
  
  // User Components
  Avatar,
  AvatarGroup,
  AvatarFallback,
  AvatarStatus,
  
  // Layout Components
  Separator,
  SeparatorWithText,
  SectionSeparator,
  GroupSeparator,
  AnimatedSeparator
}

/**
 * ComponentThemes component - Theme configurations
 * Provides predefined theme configurations for components
 * 
 * @example
 * <ComponentThemes>
 *   <App />
 * </ComponentThemes>
 */
export const ComponentThemes = {
  // Color themes
  colors: {
    primary: {
      light: 'bg-blue-500 text-white',
      dark: 'bg-blue-600 text-white'
    },
    success: {
      light: 'bg-green-500 text-white',
      dark: 'bg-green-600 text-white'
    },
    warning: {
      light: 'bg-yellow-500 text-white',
      dark: 'bg-yellow-600 text-white'
    },
    error: {
      light: 'bg-red-500 text-white',
      dark: 'bg-red-600 text-white'
    }
  },
  
  // Size themes
  sizes: {
    sm: {
      padding: 'px-2 py-1',
      text: 'text-xs',
      rounded: 'rounded'
    },
    md: {
      padding: 'px-4 py-2',
      text: 'text-sm',
      rounded: 'rounded-md'
    },
    lg: {
      padding: 'px-6 py-3',
      text: 'text-base',
      rounded: 'rounded-lg'
    }
  },
  
  // Animation themes
  animations: {
    subtle: 'transition-all duration-200 ease-out',
    smooth: 'transition-all duration-300 ease-in-out',
    bouncy: 'transition-all duration-400 ease-bounce'
  }
}

/**
 * ComponentVariants component - Common variant combinations
 * Provides pre-configured component variants
 * 
 * @example
 * <Button variant={ComponentVariants.buttons.primary}>
 *   Primary Button
 * </Button>
 */
export const ComponentVariants = {
  buttons: {
    primary: 'default',
    secondary: 'secondary',
    destructive: 'destructive',
    outline: 'outline',
    ghost: 'ghost',
    link: 'link'
  },
  
  badges: {
    default: 'default',
    secondary: 'secondary',
    success: 'success',
    warning: 'warning',
    error: 'destructive',
    info: 'info',
    outline: 'outline'
  },
  
  inputs: {
    default: 'default',
    error: 'destructive',
    success: 'success'
  },
  
  cards: {
    default: 'default',
    elevated: 'shadow-lg',
    outlined: 'border-2',
    interactive: 'hover:shadow-md transition-shadow'
  }
}

export default UILibrary
