'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { X, ArrowLeft, ArrowRight } from "lucide-react"

/**
 * Tour component - Interactive product tour
 * Provides step-by-step guided tour with highlighting
 * 
 * @param steps - Tour steps data
 * @param isOpen - Whether tour is active
 * @param onOpenChange - Callback when tour state changes
 * @param currentStep - Current step index
 * * @param onStepChange - Callback when step changes
 * @param showProgress - Whether to show progress indicator
 * @param showSkip - Whether to show skip button
 * @param className - Additional CSS classes
 * @returns JSX.Element - Tour component
 * 
 * @example
 * <Tour 
 *   steps={tourSteps}
 *   isOpen={isTourOpen}
 *   onOpenChange={setIsTourOpen}
 *   currentStep={currentStep}
 *   onStepChange={setCurrentStep}
 * />
 */
interface TourStep {
  id: string
  title: string
  content: string
  target?: string // CSS selector for target element
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: {
    label: string
    onClick: () => void
  }
  skipable?: boolean
}

interface TourProps {
  steps: TourStep[]
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  currentStep?: number
  onStepChange?: (step: number) => void
  showProgress?: boolean
  showSkip?: boolean
  className?: string
}

const TourContext = React.createContext<{
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  currentStep: number
  onStepChange: (step: number) => void
  steps: TourStep[]
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
}>({
  isOpen: false,
  onOpenChange: () => {},
  currentStep: 0,
  onStepChange: () => {},
  steps: [],
  nextStep: () => {},
  prevStep: () => {},
  skipTour: () => {}
})

const Tour = React.forwardRef<HTMLDivElement, TourProps>(
  ({ 
    steps, 
    isOpen = false, 
    onOpenChange, 
    currentStep = 0, 
    onStepChange, 
    showProgress = true, 
    showSkip = true, 
    className, 
    ...props 
  }, ref) => {
    const [internalStep, setInternalStep] = React.useState(currentStep)
    const [highlightedElement, setHighlightedElement] = React.useState<HTMLElement | null>(null)

    const activeStep = currentStep !== undefined ? currentStep : internalStep
    const currentStepData = steps[activeStep]
    const isLastStep = activeStep === steps.length - 1
    const isFirstStep = activeStep === 0

    const handleStepChange = React.useCallback((newStep: number) => {
      if (currentStep === undefined) {
        setInternalStep(newStep)
      }
      onStepChange?.(newStep)
    }, [currentStep, onStepChange])

    const handleOpenChange = React.useCallback((newOpen: boolean) => {
      onOpenChange?.(newOpen)
      if (!newOpen) {
        handleStepChange(0)
      }
    }, [onOpenChange, handleStepChange])

    const nextStep = React.useCallback(() => {
      if (!isLastStep) {
        handleStepChange(activeStep + 1)
      } else {
        handleOpenChange(false)
      }
    }, [activeStep, isLastStep, handleStepChange, handleOpenChange])

    const prevStep = React.useCallback(() => {
      if (!isFirstStep) {
        handleStepChange(activeStep - 1)
      }
    }, [activeStep, isFirstStep, handleStepChange])

    const skipTour = React.useCallback(() => {
      handleOpenChange(false)
    }, [handleOpenChange])

    // Highlight target element
    React.useEffect(() => {
      if (isOpen && currentStepData?.target) {
        const element = document.querySelector(currentStepData.target) as HTMLElement
        setHighlightedElement(element)

        if (element) {
          // Add highlight styles
          element.style.position = 'relative'
          element.style.zIndex = '9999'
          element.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.7)'
          element.style.borderRadius = '4px'
          element.style.transition = 'all 0.3s ease'

          // Scroll element into view
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          })
        }
      } else {
        // Remove highlight
        if (highlightedElement) {
          highlightedElement.style.position = ''
          highlightedElement.style.zIndex = ''
          highlightedElement.style.boxShadow = ''
          highlightedElement.style.borderRadius = ''
          highlightedElement.style.transition = ''
        }
        setHighlightedElement(null)
      }

      return () => {
        if (highlightedElement) {
          highlightedElement.style.position = ''
          highlightedElement.style.zIndex = ''
          highlightedElement.style.boxShadow = ''
          highlightedElement.style.borderRadius = ''
          highlightedElement.style.transition = ''
        }
      }
    }, [isOpen, currentStepData?.target, highlightedElement])

    // Handle keyboard navigation
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return

        switch (e.key) {
          case 'Escape':
            e.preventDefault()
            skipTour()
            break
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault()
            nextStep()
            break
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault()
            prevStep()
            break
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, nextStep, prevStep, skipTour])

    const contextValue = React.useMemo(() => ({
      isOpen,
      onOpenChange: handleOpenChange,
      currentStep: activeStep,
      onStepChange: handleStepChange,
      steps,
      nextStep,
      prevStep,
      skipTour
    }), [isOpen, handleOpenChange, activeStep, handleStepChange, steps, nextStep, prevStep, skipTour])

    if (!isOpen || !currentStepData) return null

    return (
      <TourContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            "fixed inset-0 z-[10000] flex items-center justify-center",
            className
          )}
          {...props}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Tour tooltip */}
          <div className="relative z-[10001] w-full max-w-md mx-4">
            <div className="bg-background border rounded-lg shadow-lg p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {currentStepData.title}
                  </h3>
                  {showProgress && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Step {activeStep + 1} of {steps.length}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                  className="ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-sm text-foreground leading-relaxed">
                  {currentStepData.content}
                </p>
              </div>

              {/* Action */}
              {currentStepData.action && (
                <div className="mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={currentStepData.action.onClick}
                    className="w-full"
                  >
                    {currentStepData.action.label}
                  </Button>
                </div>
              )}

              {/* Progress bar */}
              {showProgress && (
                <div className="mb-6">
                  <div className="w-full bg-muted rounded-full h-1">
                    <div
                      className="bg-primary h-1 rounded-full transition-all duration-300"
                      style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevStep}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {showSkip && currentStepData.skipable !== false && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={skipTour}
                    >
                      Skip
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    onClick={nextStep}
                  >
                    {isLastStep ? 'Finish' : 'Next'}
                    {!isLastStep && <ArrowRight className="w-4 h-4 ml-1" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TourContext.Provider>
    )
  }
)
Tour.displayName = "Tour"

/**
 * TourTrigger component - Button to start tour
 * 
 * @param children - Trigger content
 * @param startStep - Step to start from (optional)
 * @param className - Additional CSS classes
 * @returns JSX.Element - Tour trigger
 * 
 * @example
 * <TourTrigger startStep={0}>
 *   <Button>Start Tour</Button>
 * </TourTrigger>
 */
export const TourTrigger: React.FC<{
  children: React.ReactNode
  startStep?: number
  className?: string
}> = ({
  children,
  startStep = 0,
  className
}) => {
  const { onOpenChange, onStepChange } = React.useContext(TourContext)

  const handleClick = () => {
    onStepChange(startStep)
    onOpenChange(true)
  }

  return (
    <div className={className} onClick={handleClick}>
      {children}
    </div>
  )
}

/**
 * TourProgress component - Tour progress indicator
 * 
 * @param className - Additional CSS classes
 * @returns JSX.Element - Tour progress
 * 
 * @example
 * <TourProgress />
 */
export const TourProgress: React.FC<{
  className?: string
}> = ({ className }) => {
  const { currentStep, steps } = React.useContext(TourContext)

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {steps.map((_, index) => (
        <div
          key={index}
          className={cn(
            "w-2 h-2 rounded-full transition-colors",
            index <= currentStep ? "bg-primary" : "bg-muted-foreground/30"
          )}
        />
      ))}
    </div>
  )
}

/**
 * TourTooltip component - Floating tour tooltip
 * 
 * @param step - Tour step data
 * @param onNext - Next step callback
 * @param onPrevious - Previous step callback
 * @param onSkip - Skip tour callback
 * @param isLast - Whether this is the last step
 * @param isFirst - Whether this is the first step
 * @param className - Additional CSS classes
 * @returns JSX.Element - Tour tooltip
 * 
 * @example
 * <TourTooltip 
 *   step={currentStepData}
 *   onNext={nextStep}
 *   onPrevious={prevStep}
 *   onSkip={skipTour}
 *   isLast={isLastStep}
 *   isFirst={isFirstStep}
 * />
 */
export const TourTooltip: React.FC<{
  step: TourStep
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  isLast: boolean
  isFirst: boolean
  className?: string
}> = ({
  step,
  onNext,
  onPrevious,
  onSkip,
  isLast,
  isFirst,
  className
}) => {
  return (
    <div className={cn(
      "bg-background border rounded-lg shadow-lg p-4 max-w-sm",
      className
    )}>
      <h4 className="font-semibold text-foreground mb-2">
        {step.title}
      </h4>
      
      <p className="text-sm text-foreground mb-4">
        {step.content}
      </p>

      {step.action && (
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={step.action.onClick}
            className="w-full"
          >
            {step.action.label}
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {!isFirst && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {step.skipable !== false && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
            >
              Skip
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={onNext}
          >
            {isLast ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { Tour, TourContext }
