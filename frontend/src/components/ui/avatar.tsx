'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Avatar component - User avatar with fallback
 * Provides avatar display with image, initials, or icon fallback
 * 
 * @param src - Image source URL
 * @param alt - Alt text for image
 * @param initials - User initials to display
 * @param size - Avatar size: 'sm' | 'md' | 'lg' | 'xl'
 * @param variant - Avatar variant: 'circle' | 'square' | 'rounded'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Avatar component
 * 
 * @example
 * <Avatar 
 *   src="/api/user-avatar.jpg" 
 *   alt="User avatar"
 *   initials="JD"
 *   size="md" 
 *   variant="circle"
 * />
 */
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  initials?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'circle' | 'square' | 'rounded'
  fallback?: React.ReactNode
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    src, 
    alt = '', 
    initials, 
    size = 'md', 
    variant = 'circle', 
    fallback, 
    className, 
    ...props 
  }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false)
    const [imageError, setImageError] = React.useState(false)

    const sizeClasses = {
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl'
    }

    const variantClasses = {
      circle: 'rounded-full',
      square: 'rounded-none',
      rounded: 'rounded-lg'
    }

    const handleImageLoad = () => {
      setImageLoaded(true)
      setImageError(false)
    }

    const handleImageError = () => {
      setImageError(true)
      setImageLoaded(false)
    }

    const getInitials = () => {
      if (initials) return initials
      
      // Generate initials from alt text or fallback
      const text = alt || 'User'
      const words = text.trim().split(/\s+/)
      if (words.length >= 2) {
        return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('')
      }
      return words[0]?.charAt(0).toUpperCase() || 'U'
    }

    const displayInitials = getInitials()

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center font-medium text-muted-foreground bg-muted select-none',
          
          // Size styles
          sizeClasses[size],
          
          // Variant styles
          variantClasses[variant],
          
          // Custom classes
          className
        )}
        {...props}
      >
        {/* Image */}
        {src && !imageError && (
          <img
            src={src}
            alt={alt}
            className={cn(
              'absolute inset-0 h-full w-full object-cover',
              variantClasses[variant]
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* Fallback content */}
        {(!src || imageError) && (
          <div className="absolute inset-0 flex items-center justify-center">
            {fallback || (
              <span className={cn(
                'font-medium',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base',
                size === 'xl' && 'text-lg'
              )}>
                {displayInitials}
              </span>
            )}
          </div>
        )}

        {/* Loading state */}
        {src && !imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

/**
 * AvatarGroup component - Stack of avatars
 * 
 * @param children - Avatar components
 * @param max - Maximum avatars to show before showing count
 * @param size - Avatar size
 * @param className - Additional CSS classes
 * @returns JSX.Element - Avatar group
 * 
 * @example
 * <AvatarGroup max={3} size="sm">
 *   <Avatar src="/user1.jpg" initials="JD" />
 *   <Avatar src="/user2.jpg" initials="AB" />
 *   <Avatar src="/user3.jpg" initials="CD" />
 *   <Avatar src="/user4.jpg" initials="EF" />
 * </AvatarGroup>
 */
interface AvatarGroupProps {
  children: React.ReactNode
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 3,
  size = 'md',
  className
}) => {
  const avatarCount = React.Children.count(children)
  const visibleAvatars = React.Children.toArray(children).slice(0, max)
  const remainingCount = avatarCount - max

  const sizeClasses = {
    sm: '-space-x-2',
    md: '-space-x-3',
    lg: '-space-x-4',
    xl: '-space-x-5'
  }

  return (
    <div className={cn("flex items-center", className)}>
      {/* Visible avatars */}
      <div className={cn("flex", sizeClasses[size])}>
        {visibleAvatars.map((avatar, index) => (
          <div
            key={index}
            className={cn(
              "relative border-2 border-background",
              index > 0 && "-ml-4"
            )}
          >
            {avatar}
          </div>
        ))}
      </div>

      {/* Remaining count */}
      {remainingCount > 0 && (
        <div
          className={cn(
            "relative inline-flex items-center justify-center font-medium text-muted-foreground bg-muted border-2 border-background",
            sizeClasses[size],
            size === 'sm' && 'h-8 w-8 text-xs',
            size === 'md' && 'h-10 w-10 text-sm',
            size === 'lg' && 'h-12 w-12 text-lg',
            size === 'xl' && 'h-16 w-16 text-xl'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

/**
 * AvatarFallback component - Custom fallback for avatar
 * 
 * @param icon - Icon to display
 * @param size - Avatar size
 * @param className - Additional CSS classes
 * @returns JSX.Element - Avatar fallback
 * 
 * @example
 * <AvatarFallback icon={<UserIcon />} size="md" />
 */
interface AvatarFallbackProps {
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({
  icon,
  size = 'md',
  className
}) => {
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  }

  return (
    <div className={cn("absolute inset-0 flex items-center justify-center", className)}>
      {icon || (
        <svg
          className={cn("text-muted-foreground", iconSizeClasses[size])}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 01-8 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      )}
    </div>
  )
}

/**
 * AvatarStatus component - Status indicator for avatar
 * 
 * @param status - Status type: 'online' | 'offline' | 'away' | 'busy'
 * @param size - Avatar size
 * @param position - Position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Avatar status
 * 
 * @example
 * <div className="relative">
 *   <Avatar src="/user.jpg" initials="JD" />
 *   <AvatarStatus status="online" position="bottom-right" />
 * </div>
 */
interface AvatarStatusProps {
  status: 'online' | 'offline' | 'away' | 'busy'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  className?: string
}

export const AvatarStatus: React.FC<AvatarStatusProps> = ({
  status,
  size = 'md',
  position = 'bottom-right',
  className
}) => {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  }

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4'
  }

  const positionClasses = {
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0'
  }

  return (
    <div
      className={cn(
        "absolute rounded-full border-2 border-background",
        statusColors[status],
        sizeClasses[size],
        positionClasses[position],
        className
      )}
      role="status"
      aria-label={`Status: ${status}`}
    />
  )
}

export { Avatar, AvatarGroup, AvatarFallback, AvatarStatus }
