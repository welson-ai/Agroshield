'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react'

/**
 * ResponsiveForm component - Mobile-optimized form component
 * Provides responsive form layouts with mobile-friendly inputs
 * 
 * @param children - Form fields and content
 * @param className - Additional CSS classes for styling
 * @param onSubmit - Form submission handler
 * @param loading - Whether form is submitting
 * @param disabled - Whether form is disabled
 * @param layout - Form layout: 'vertical' | 'horizontal' | 'responsive'
 * @returns JSX.Element - Responsive form component
 * 
 * @example
 * <ResponsiveForm onSubmit={handleSubmit} layout="responsive">
 *   <ResponsiveFormField label="Name" name="name" required />
 *   <ResponsiveButton type="submit">Submit</ResponsiveButton>
 * </ResponsiveForm>
 */
interface ResponsiveFormProps {
  children: React.ReactNode
  className?: string
  onSubmit?: (e: React.FormEvent) => void
  loading?: boolean
  disabled?: boolean
  layout?: 'vertical' | 'horizontal' | 'responsive'
}

export function ResponsiveForm({ 
  children, 
  className, 
  onSubmit, 
  loading = false, 
  disabled = false,
  layout = 'responsive'
}: ResponsiveFormProps) {
  const layoutClasses = {
    vertical: 'space-y-4',
    horizontal: 'space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4',
    responsive: 'space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-4'
  }

  return (
    <form 
      onSubmit={onSubmit}
      className={cn('w-full', layoutClasses[layout], className)}
    >
      {children}
    </form>
  )
}

/**
 * ResponsiveFormField component - Mobile-optimized form field
 * Provides responsive form field with validation and error handling
 * 
 * @param label - Field label
 * @param name - Field name
 * @param type - Input type
 * @param placeholder - Input placeholder
 * @param required - Whether field is required
 * @param disabled - Whether field is disabled
 * @param error - Error message
 * @param helper - Helper text
 * @param value - Field value
 * @param onChange - Change handler
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Responsive form field
 * 
 * @example
 * <ResponsiveFormField 
 *   label="Email" 
 *   name="email" 
 *   type="email" 
 *   required 
 *   error={errors.email}
 *   value={formData.email}
 *   onChange={handleChange}
 * />
 */
interface ResponsiveFormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helper?: string
  value?: string | number
  onChange?: (value: string) => void
  className?: string
}

export function ResponsiveFormField({ 
  label, 
  name, 
  type = 'text', 
  placeholder, 
  required = false, 
  disabled = false, 
  error, 
  helper, 
  value, 
  onChange, 
  className 
}: ResponsiveFormFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className={cn('space-y-2', className)}>
      <Label 
        htmlFor={name}
        className={cn(
          'text-sm font-medium',
          error && 'text-destructive',
          required && 'after:content-["*"] after:ml-1 after:text-destructive'
        )}
      >
        {label}
      </Label>
      
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'pr-10',
            error && 'border-destructive focus:ring-destructive',
            isFocused && 'ring-2 ring-ring ring-offset-2'
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helper ? `${name}-helper` : undefined}
        />
        
        {type === 'password' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      
      {error && (
        <div className="flex items-center space-x-1 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span id={`${name}-error`}>{error}</span>
        </div>
      )}
      
      {helper && !error && (
        <p className="text-sm text-muted-foreground" id={`${name}-helper`}>
          {helper}
        </p>
      )}
    </div>
  )
}

/**
 * ResponsiveSelect component - Mobile-optimized select field
 * Provides responsive select with mobile-friendly styling
 * 
 * @param label - Field label
 * @param name - Field name
 * @param options - Select options
 * @param value - Selected value
 * @param onChange - Change handler
 * @param required - Whether field is required
 * @param disabled - Whether field is disabled
 * @param error - Error message
 * @param placeholder - Placeholder text
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Responsive select field
 * 
 * @example
 * <ResponsiveSelect 
 *   label="Country" 
 *   name="country" 
 *   options={countries}
 *   value={formData.country}
 *   onChange={handleChange}
 *   required
 * />
 */
interface ResponsiveSelectProps {
  label: string
  name: string
  options: { value: string; label: string }[]
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  disabled?: boolean
  error?: string
  placeholder?: string
  className?: string
}

export function ResponsiveSelect({ 
  label, 
  name, 
  options, 
  value, 
  onChange, 
  required = false, 
  disabled = false, 
  error, 
  placeholder = 'Select an option', 
  className 
}: ResponsiveSelectProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label 
        htmlFor={name}
        className={cn(
          'text-sm font-medium',
          error && 'text-destructive',
          required && 'after:content-["*"] after:ml-1 after:text-destructive'
        )}
      >
        {label}
      </Label>
      
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        disabled={disabled}
        className={cn(
          'w-full h-10 px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus:ring-destructive'
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <div className="flex items-center space-x-1 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span id={`${name}-error`}>{error}</span>
        </div>
      )}
    </div>
  )
}

/**
 * ResponsiveTextarea component - Mobile-optimized textarea
 * Provides responsive textarea with character counting
 * 
 * @param label - Field label
 * @param name - Field name
 * @param value - Textarea value
 * @param onChange - Change handler
 * @param placeholder - Placeholder text
 * @param required - Whether field is required
 * @param disabled - Whether field is disabled
 * @param error - Error message
 * @param maxLength - Maximum character count
 * @param rows - Number of rows
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Responsive textarea
 * 
 * @example
 * <ResponsiveTextarea 
 *   label="Description" 
 *   name="description" 
 *   value={formData.description}
 *   onChange={handleChange}
 *   maxLength={500}
 *   rows={4}
 * />
 */
interface ResponsiveTextareaProps {
  label: string
  name: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  maxLength?: number
  rows?: number
  className?: string
}

export function ResponsiveTextarea({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  disabled = false, 
  error, 
  maxLength, 
  rows = 4, 
  className 
}: ResponsiveTextareaProps) {
  const characterCount = value?.length || 0
  const isOverLimit = maxLength && characterCount > maxLength

  return (
    <div className={cn('space-y-2', className)}>
      <Label 
        htmlFor={name}
        className={cn(
          'text-sm font-medium',
          error && 'text-destructive',
          required && 'after:content-["*"] after:ml-1 after:text-destructive'
        )}
      >
        {label}
      </Label>
      
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          'w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical',
          error && 'border-destructive focus:ring-destructive',
          isOverLimit && 'border-destructive'
        )}
        aria-invalid={!!error || isOverLimit}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      
      {maxLength && (
        <div className="flex justify-between">
          <div></div>
          <div className={cn(
            'text-xs',
            isOverLimit ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {characterCount}/{maxLength}
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center space-x-1 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span id={`${name}-error`}>{error}</span>
        </div>
      )}
    </div>
  )
}

/**
 * ResponsiveButton component - Mobile-optimized button
 * Provides responsive button with loading states
 * 
 * @param children - Button content
 * @param type - Button type
 * @param variant - Button variant
 * @param size - Button size
 * @param loading - Whether button is loading
 * @param disabled - Whether button is disabled
 * @param fullWidth - Whether button should be full width
 * @param onClick - Click handler
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Responsive button
 * 
 * @example
 * <ResponsiveButton 
 *   type="submit" 
 *   loading={isSubmitting} 
 *   fullWidth 
 *   size="lg"
 * >
 *   Submit Form
 * </ResponsiveButton>
 */
interface ResponsiveButtonProps {
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  onClick?: () => void
  className?: string
}

export function ResponsiveButton({ 
  children, 
  type = 'button', 
  variant = 'default', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  fullWidth = false, 
  onClick, 
  className 
}: ResponsiveButtonProps) {
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 py-3 text-base'
  }

  return (
    <Button
      type={type}
      variant={variant}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        sizeClasses[size],
        fullWidth && 'w-full',
        'transition-all duration-200',
        className
      )}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </Button>
  )
}

/**
 * ResponsiveFormActions component - Mobile-optimized form actions
 * Provides responsive form action buttons
 * 
 * @param children - Action buttons
 * @param className - Additional CSS classes for styling
 * @param align - Button alignment: 'left' | 'center' | 'right'
 * @returns JSX.Element - Responsive form actions
 * 
 * @example
 * <ResponsiveFormActions align="center">
 *   <ResponsiveButton variant="outline" onClick={handleCancel}>
 *     Cancel
 *   </ResponsiveButton>
 *   <ResponsiveButton type="submit" loading={isSubmitting}>
 *     Submit
 *   </ResponsiveButton>
 * </ResponsiveFormActions>
 */
interface ResponsiveFormActionsProps {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

export function ResponsiveFormActions({ 
  children, 
  className, 
  align = 'left' 
}: ResponsiveFormActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }

  return (
    <div className={cn(
      'flex flex-col sm:flex-row gap-3 pt-4 border-t',
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  )
}

/**
 * FormBreakpointIndicator component - Visual breakpoint indicator
 * Shows current responsive breakpoint for development
 * 
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Breakpoint indicator
 * 
 * @example
 * <FormBreakpointIndicator />
 */
export function FormBreakpointIndicator({ className }: { className?: string }) {
  const [breakpoint, setBreakpoint] = useState('unknown')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < 640) setBreakpoint('sm')
      else if (width < 768) setBreakpoint('md')
      else if (width < 1024) setBreakpoint('lg')
      else if (width < 1280) setBreakpoint('xl')
      else setBreakpoint('2xl')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const getIcon = () => {
    switch (breakpoint) {
      case 'sm': return <Smartphone className="h-3 w-3" />
      case 'md': return <Tablet className="h-3 w-3" />
      default: return <Monitor className="h-3 w-3" />
    }
  }

  return (
    <div className={cn(
      'fixed bottom-4 left-4 z-50 bg-background border border-border rounded-lg px-2 py-1 text-xs flex items-center space-x-1',
      className
    )}>
      {getIcon()}
      <span>{breakpoint}</span>
    </div>
  )
}

export default ResponsiveForm
