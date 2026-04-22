'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar } from "./avatar"
import { User } from "lucide-react"

/**
 * AvatarGroup component - Group of overlapping avatars
 * Provides avatar stacking with overflow handling
 * 
 * @param children - Avatar components
 * @param max - Maximum avatars to show before overflow
 * @param size - Avatar size: 'sm' | 'md' | 'lg' | 'xl'
 * @param spacing - Spacing between avatars
 * @param showCount - Whether to show overflow count
 * @param countLabel - Custom count label
 * @param className - Additional CSS classes
 * @returns JSX.Element - Avatar group component
 * 
 * @example
 * <AvatarGroup max={3} size="md" showCount>
 *   <Avatar src="/user1.jpg" alt="User 1" />
 *   <Avatar src="/user2.jpg" alt="User 2" />
 *   <Avatar src="/user3.jpg" alt="User 3" />
 *   <Avatar src="/user4.jpg" alt="User 4" />
 *   <Avatar src="/user5.jpg" alt="User 5" />
 * </AvatarGroup>
 */
interface AvatarGroupProps {
  children: React.ReactNode
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  spacing?: number
  showCount?: boolean
  countLabel?: string
  className?: string
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ 
    children, 
    max = 5, 
    size = 'md', 
    spacing = -12, 
    showCount = true, 
    countLabel, 
    className, 
    ...props 
  }, ref) => {
    const avatars = React.Children.toArray(children)
    const totalAvatars = avatars.length
    const displayAvatars = avatars.slice(0, max)
    const overflowCount = totalAvatars - max

    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-10 h-10',
      xl: 'w-12 h-12'
    }

    const fontSizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg'
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center", className)}
        {...props}
      >
        <div className="flex -space-x-2">
          {displayAvatars.map((avatar, index) => {
            if (!React.isValidElement(avatar)) return null
            
            return React.cloneElement(avatar, {
              key: index,
              className: cn(
                "ring-2 ring-background",
                avatar.props.className
              ),
              size: avatar.props.size || size
            })
          })}
        </div>
        
        {showCount && overflowCount > 0 && (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium ring-2 ring-background",
              sizeClasses[size],
              fontSizeClasses[size]
            )}
            style={{ marginLeft: `${spacing}px` }}
          >
            {countLabel || `+${overflowCount}`}
          </div>
        )}
      </div>
    )
  }
)
AvatarGroup.displayName = "AvatarGroup"

/**
 * AvatarStack component - Vertical stack of avatars
 * 
 * @param children - Avatar components
 * @param size - Avatar size: 'sm' | 'md' | 'lg' | 'xl'
 * @param spacing - Vertical spacing between avatars
 * @param className - Additional CSS classes
 * @returns JSX.Element - Avatar stack
 * 
 * @example
 * <AvatarStack size="sm" spacing={1}>
 *   <Avatar src="/user1.jpg" alt="User 1" />
 *   <Avatar src="/user2.jpg" alt="User 2" />
 *   <Avatar src="/user3.jpg" alt="User 3" />
 * </AvatarStack>
 */
export const AvatarStack: React.FC<{
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  spacing?: number
  className?: string
}> = ({
  children,
  size = 'md',
  spacing = 1,
  className
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  }

  return (
    <div className={cn("flex flex-col items-center space-y-1", className)}>
      {React.Children.map(children, (avatar, index) => {
        if (!React.isValidElement(avatar)) return null
        
        return React.cloneElement(avatar, {
          key: index,
          className: cn(
            "ring-2 ring-background",
            avatar.props.className
          ),
          size: avatar.props.size || size
        })
      })}
    </div>
  )
}

/**
 * AvatarCircle component - Circular arrangement of avatars
 * 
 * @param children - Avatar components
 * @param size - Avatar size: 'sm' | 'md' | 'lg' | 'xl'
 * @param radius - Circle radius
 * @param className - Additional CSS classes
 * @returns JSX.Element - Avatar circle
 * 
 * @example
 * <AvatarCircle size="sm" radius={40}>
 *   <Avatar src="/user1.jpg" alt="User 1" />
 *   <Avatar src="/user2.jpg" alt="User 2" />
 *   <Avatar src="/user3.jpg" alt="User 3" />
 * </AvatarCircle>
 */
export const AvatarCircle: React.FC<{
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  radius?: number
  className?: string
}> = ({
  children,
  size = 'md',
  radius = 40,
  className
}) => {
  const avatars = React.Children.toArray(children)
  const angleStep = 360 / avatars.length

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  }

  return (
    <div className={cn("relative", className)} style={{ width: radius * 2, height: radius * 2 }}>
      {avatars.map((avatar, index) => {
        if (!React.isValidElement(avatar)) return null
        
        const angle = index * angleStep
        const x = radius + (radius - 20) * Math.cos((angle * Math.PI) / 180)
        const y = radius + (radius - 20) * Math.sin((angle * Math.PI) / 180)
        
        return React.cloneElement(avatar, {
          key: index,
          className: cn(
            "absolute ring-2 ring-background",
            avatar.props.className
          ),
          size: avatar.props.size || size,
          style: {
            left: x - 16,
            top: y - 16,
            position: 'absolute'
          }
        })
      })}
    </div>
  )
}

/**
 * AvatarList component - List of avatars with names
 * 
 * @param users - User data
 * @param size - Avatar size: 'sm' | 'md' | 'lg' | 'xl'
 * @param showStatus - Whether to show online status
 * @param maxVisible - Maximum users to show
 * @param className - Additional CSS classes
 * @returns JSX.Element - Avatar list
 * 
 * @example
 * <AvatarList 
 *   users={userData}
 *   size="md"
 *   showStatus
 *   maxVisible={5}
 * />
 */
export const AvatarList: React.FC<{
  users: Array<{
    id: string
    name: string
    avatar?: string
    status?: 'online' | 'offline' | 'away' | 'busy'
  }>
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showStatus?: boolean
  maxVisible?: number
  className?: string
}> = ({
  users,
  size = 'md',
  showStatus = false,
  maxVisible,
  className
}) => {
  const displayUsers = maxVisible ? users.slice(0, maxVisible) : users
  const remainingCount = maxVisible ? users.length - maxVisible : 0

  return (
    <div className={cn("space-y-3", className)}>
      {displayUsers.map((user) => (
        <div key={user.id} className="flex items-center space-x-3">
          <Avatar
            src={user.avatar}
            alt={user.name}
            size={size}
            className={showStatus ? "ring-2 ring-background" : ""}
          >
            {showStatus && (
              <div className={cn(
                "absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-background",
                user.status === 'online' && "bg-green-500",
                user.status === 'offline' && "bg-gray-400",
                user.status === 'away' && "bg-yellow-500",
                user.status === 'busy' && "bg-red-500"
              )} />
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            {showStatus && (
              <p className="text-xs text-muted-foreground capitalize">
                {user.status}
              </p>
            )}
          </div>
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className="flex items-center justify-center py-2">
          <span className="text-sm text-muted-foreground">
            +{remainingCount} more
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * AvatarPresence component - Avatar with presence indicator
 * 
 * @param src - Avatar image source
 * @param alt - Alt text
 * @param presence - Presence status
 * @param size - Avatar size: 'sm' | 'md' | 'lg' | 'xl'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Avatar with presence
 * 
 * @example
 * <AvatarPresence 
 *   src="/user.jpg" 
 *   alt="User" 
 *   presence="online"
 *   size="md"
 * />
 */
export const AvatarPresence: React.FC<{
  src?: string
  alt?: string
  presence?: 'online' | 'offline' | 'away' | 'busy'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}> = ({
  src,
  alt,
  presence = 'offline',
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  }

  const indicatorSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  }

  return (
    <div className={cn("relative", className)}>
      <Avatar
        src={src}
        alt={alt}
        size={size}
        className="ring-2 ring-background"
      />
      <div
        className={cn(
          "absolute bottom-0 right-0 rounded-full ring-2 ring-background",
          sizeClasses[size],
          indicatorSizeClasses[size],
          presence === 'online' && "bg-green-500",
          presence === 'offline' && "bg-gray-400",
          presence === 'away' && "bg-yellow-500",
          presence === 'busy' && "bg-red-500"
        )}
      />
    </div>
  )
}

export { AvatarGroup }
