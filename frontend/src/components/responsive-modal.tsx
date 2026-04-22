'use client'

import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { X, Maximize2, Minimize2 } from 'lucide-react'

/**
 * ResponsiveModal component - Mobile-optimized modal dialog
 * Provides responsive modal with mobile-friendly interactions
 * 
 * @param isOpen - Whether modal is open
 * @param onClose - Callback when modal is closed
 * @param title - Modal title
 * @param children - Modal content
 * @param size - Modal size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param showCloseButton - Whether to show close button
 * @param closeOnBackdrop - Whether to close on backdrop click
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Responsive modal
 * 
 * @example
 * <ResponsiveModal 
 *   isOpen={isModalOpen} 
 *   onClose={() => setIsModalOpen(false)} 
 *   title="Edit Profile"
 *   size="md"
 * >
 *   <form>...</form>
 * </ResponsiveModal>
 */
interface ResponsiveModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  className?: string
}

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  className
}: ResponsiveModalProps) {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  }

  const modalSize = isMaximized ? 'max-w-full mx-4' : sizeClasses[size]

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <Card 
        className={cn(
          'w-full relative max-h-[90vh] overflow-hidden flex flex-col',
          modalSize,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            {title && (
              <CardTitle className="text-lg font-semibold truncate">
                {title}
              </CardTitle>
            )}
            <div className="flex items-center space-x-2">
              {size !== 'full' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="h-8 w-8 p-0"
                  aria-label={isMaximized ? 'Minimize' : 'Maximize'}
                >
                  {isMaximized ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              )}
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
        )}

        {/* Content */}
        <CardContent className="flex-1 overflow-y-auto p-6">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * ResponsiveDrawer component - Mobile-optimized drawer/slide-up modal
 * Provides drawer interface for mobile devices
 * 
 * @param isOpen - Whether drawer is open
 * @param onClose - Callback when drawer is closed
 * @param title - Drawer title
 * @param children - Drawer content
 * @param position - Drawer position: 'bottom' | 'top' | 'left' | 'right'
 * @param size - Drawer size: 'sm' | 'md' | 'lg' | 'full'
 * @param showHandle - Whether to show drag handle
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Responsive drawer
 * 
 * @example
 * <ResponsiveDrawer 
 *   isOpen={isDrawerOpen} 
 *   onClose={() => setIsDrawerOpen(false)} 
 *   title="Filter Options"
 *   position="bottom"
 *   size="md"
 * >
 *   <FilterContent />
 * </ResponsiveDrawer>
 */
interface ResponsiveDrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  position?: 'bottom' | 'top' | 'left' | 'right'
  size?: 'sm' | 'md' | 'lg' | 'full'
  showHandle?: boolean
  className?: string
}

export function ResponsiveDrawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'bottom',
  size = 'md',
  showHandle = true,
  className
}: ResponsiveDrawerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50 bg-background border'
    
    switch (position) {
      case 'bottom':
        return cn(baseClasses, 'bottom-0 left-0 right-0 rounded-t-lg')
      case 'top':
        return cn(baseClasses, 'top-0 left-0 right-0 rounded-b-lg')
      case 'left':
        return cn(baseClasses, 'top-0 left-0 bottom-0 rounded-r-lg')
      case 'right':
        return cn(baseClasses, 'top-0 right-0 bottom-0 rounded-l-lg')
      default:
        return cn(baseClasses, 'bottom-0 left-0 right-0 rounded-t-lg')
    }
  }

  const getSizeClasses = () => {
    switch (position) {
      case 'bottom':
      case 'top':
        return {
          sm: 'max-h-64',
          md: 'max-h-96',
          lg: 'max-h-[80vh]',
          full: 'max-h-[90vh]'
        }[size]
      case 'left':
      case 'right':
        return {
          sm: 'max-w-64',
          md: 'max-w-80',
          lg: 'max-w-96',
          full: 'max-w-[80vw]'
        }[size]
      default:
        return 'max-h-96'
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={cn(
          getPositionClasses(),
          getSizeClasses(),
          'overflow-hidden flex flex-col',
          className
        )}
      >
        {/* Handle */}
        {showHandle && (position === 'bottom' || position === 'top') && (
          <div className="flex justify-center py-2">
            <div className="w-12 h-1 bg-muted rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </>
  )
}

/**
 * ResponsiveSheet component - Mobile-optimized sheet/side panel
 * Provides sheet interface for mobile and desktop
 * 
 * @param isOpen - Whether sheet is open
 * @param onClose - Callback when sheet is closed
 * @param title - Sheet title
 * @param children - Sheet content
 * @param side - Sheet side: 'left' | 'right'
 * @param size - Sheet size: 'sm' | 'md' | 'lg' | 'full'
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Responsive sheet
 * 
 * @example
 * <ResponsiveSheet 
 *   isOpen={isSheetOpen} 
 *   onClose={() => setIsSheetOpen(false)} 
 *   title="Navigation"
 *   side="left"
 *   size="md"
 * >
 *   <NavigationContent />
 * </ResponsiveSheet>
 */
interface ResponsiveSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  side?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

export function ResponsiveSheet({
  isOpen,
  onClose,
  title,
  children,
  side = 'left',
  size = 'md',
  className
}: ResponsiveSheetProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const getSizeClasses = () => {
    return {
      sm: 'w-64',
      md: 'w-80',
      lg: 'w-96',
      full: 'w-[80vw]'
    }[size]
  }

  const getSideClasses = () => {
    return {
      left: 'left-0',
      right: 'right-0'
    }[side]
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className={cn(
          'fixed top-0 bottom-0 z-50 bg-background border-r shadow-xl',
          getSizeClasses(),
          getSideClasses(),
          'overflow-hidden flex flex-col',
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label="Close sheet"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </>
  )
}

/**
 * ModalProvider component - Context provider for modal management
 * Provides global modal state management
 * 
 * @param children - Child components
 * @returns JSX.Element - Modal provider
 * 
 * @example
 * <ModalProvider>
 *   <App />
 * </ModalProvider>
 */
interface ModalContextValue {
  openModal: (props: Omit<ResponsiveModalProps, 'isOpen' | 'onClose'>) => void
  closeModal: () => void
  isModalOpen: boolean
}

const ModalContext = React.createContext<ModalContextValue | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalProps, setModalProps] = useState<Omit<ResponsiveModalProps, 'isOpen' | 'onClose'> | null>(null)

  const openModal = React.useCallback((props: Omit<ResponsiveModalProps, 'isOpen' | 'onClose'>) => {
    setModalProps(props)
  }, [])

  const closeModal = React.useCallback(() => {
    setModalProps(null)
  }, [])

  const value = React.useMemo(() => ({
    openModal,
    closeModal,
    isModalOpen: modalProps !== null
  }), [openModal, closeModal, modalProps])

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modalProps && (
        <ResponsiveModal
          {...modalProps}
          isOpen={true}
          onClose={closeModal}
        />
      )}
    </ModalContext.Provider>
  )
}

/**
 * useModal hook - Access modal context
 * Provides modal management functions
 * 
 * @returns ModalContextValue - Modal context value
 * @throws Error if used outside ModalProvider
 * 
 * @example
 * const { openModal, closeModal, isModalOpen } = useModal()
 * 
 * const handleOpenModal = () => {
 *   openModal({
 *     title: 'Confirm Action',
 *     children: <ConfirmationContent />
 *   })
 * }
 */
export function useModal(): ModalContextValue {
  const context = React.useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export default ResponsiveModal
