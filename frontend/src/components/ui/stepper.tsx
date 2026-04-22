'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, ChevronRight } from "lucide-react"

/**
 * Stepper component - Multi-step wizard navigation
 * Provides accessible step navigation with progress tracking
 * 
 * @param children - Step components
 * @param currentStep - Current active step index
 * @param onStepChange - Callback when step changes
 * @param orientation - Stepper orientation: 'horizontal' | 'vertical'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Stepper component
 * 
 * @example
 * <Stepper currentStep={1} onStepChange={setStep}>
 *   <Step title="Step 1" description="First step">Content 1</Step>
 *   <Step title="Step 2" description="Second step">Content 2</Step>
 * </Stepper>
 */
interface StepperProps {
  children: React.ReactNode
  currentStep: number
  onStepChange?: (step: number) => void
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

const StepperContext = React.createContext<{
  currentStep: number
  onStepChange?: (step: number) => void
  orientation?: 'horizontal' | 'vertical'
  totalSteps: number
}>({
  currentStep: 0,
  orientation: 'horizontal',
  totalSteps: 0
})

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ 
    children, 
    currentStep, 
    onStepChange, 
    orientation = 'horizontal', 
    className, 
    ...props 
  }, ref) => {
    const steps = React.Children.toArray(children)
    const totalSteps = steps.length

    const handleStepClick = (stepIndex: number) => {
      if (stepIndex <= currentStep) {
        onStepChange?.(stepIndex)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent, stepIndex: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleStepClick(stepIndex)
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        if (stepIndex < totalSteps - 1) {
          const nextStep = stepIndex + 1
          if (nextStep <= currentStep) {
            onStepChange?.(nextStep)
          }
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        if (stepIndex > 0) {
          const prevStep = stepIndex - 1
          if (prevStep <= currentStep) {
            onStepChange?.(prevStep)
          }
        }
      }
    }

    const contextValue = React.useMemo(() => ({
      currentStep,
      onStepChange,
      orientation,
      totalSteps
    }), [currentStep, onStepChange, orientation, totalSteps])

    return (
      <StepperContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("w-full", className)}
          {...props}
        >
          {/* Step indicators */}
          <div className={cn(
            "flex items-center",
            orientation === 'horizontal' ? "flex-row space-x-4" : "flex-col space-y-4"
          )}>
            {steps.map((step, index) => {
              if (!React.isValidElement(step)) return null

              const isActive = index === currentStep
              const isCompleted = index < currentStep
              const isAccessible = index <= currentStep

              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center",
                    orientation === 'horizontal' ? "flex-1" : "w-full"
                  )}
                >
                  {/* Step indicator */}
                  <button
                    type="button"
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isCompleted 
                        ? "bg-primary border-primary text-primary-foreground"
                        : isActive
                        ? "border-primary text-primary"
                        : "border-muted-foreground text-muted-foreground",
                      isAccessible 
                        ? "cursor-pointer hover:border-primary hover:text-primary"
                        : "cursor-not-allowed"
                    )}
                    onClick={() => handleStepClick(index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    disabled={!isAccessible}
                    aria-current={isActive}
                    aria-label={`Step ${index + 1}`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </button>

                  {/* Step content */}
                  <div className={cn(
                    "ml-3 flex-1",
                    orientation === 'horizontal' ? "text-left" : "ml-0 mt-2"
                  )}>
                    <h3 className={cn(
                      "text-sm font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.props.title}
                    </h3>
                    {step.props.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.props.description}
                      </p>
                    )}
                  </div>

                  {/* Connector */}
                  {index < totalSteps - 1 && (
                    <div className={cn(
                      "flex-1 h-px bg-muted-foreground/20 mx-4",
                      orientation === 'vertical' ? "w-px h-4 ml-4 mr-0" : "h-px"
                    )}>
                      {isCompleted && (
                        <div className="h-full bg-primary" />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Step content */}
          <div className="mt-8">
            {steps[currentStep]}
          </div>
        </div>
      </StepperContext.Provider>
    )
  }
)
Stepper.displayName = "Stepper"

/**
 * Step component - Individual step in stepper
 * 
 * @param children - Step content
 * @param title - Step title
 * @param description - Step description
 * @param className - Additional CSS classes
 * @returns JSX.Element - Step component
 * 
 * @example
 * <Step title="Personal Info" description="Enter your personal details">
 *   <Form>...</Form>
 * </Step>
 */
interface StepProps {
  children: React.ReactNode
  title: string
  description?: string
  className?: string
}

const Step = React.forwardRef<HTMLDivElement, StepProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Step.displayName = "Step"

/**
 * StepperActions component - Navigation buttons for stepper
 * 
 * @param onPrevious - Callback for previous button
 * @param onNext - Callback for next button
 * @param onFinish - Callback for finish button
 * @param previousLabel - Previous button label
 * @param nextLabel - Next button label
 * @param finishLabel - Finish button label
 * @param disabled - Whether navigation is disabled
 * @param className - Additional CSS classes
 * @returns JSX.Element - Stepper actions
 * 
 * @example
 * <StepperActions
 *   onPrevious={handlePrevious}
 *   onNext={handleNext}
 *   onFinish={handleFinish}
 *   disabled={isSubmitting}
 * />
 */
export const StepperActions: React.FC<{
  onPrevious?: () => void
  onNext?: () => void
  onFinish?: () => void
  previousLabel?: string
  nextLabel?: string
  finishLabel?: string
  disabled?: boolean
  className?: string
}> = ({
  onPrevious,
  onNext,
  onFinish,
  previousLabel = "Previous",
  nextLabel = "Next",
  finishLabel = "Finish",
  disabled = false,
  className
}) => {
  const { currentStep, totalSteps } = React.useContext(StepperContext)
  const isLastStep = currentStep === totalSteps - 1
  const isFirstStep = currentStep === 0

  return (
    <div className={cn("flex justify-between space-x-4", className)}>
      <button
        type="button"
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md border transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "hover:bg-accent hover:text-accent-foreground",
          isFirstStep && "invisible"
        )}
        onClick={onPrevious}
        disabled={disabled || isFirstStep}
      >
        {previousLabel}
      </button>

      <button
        type="button"
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "hover:bg-primary/90",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        onClick={isLastStep ? onFinish : onNext}
        disabled={disabled}
      >
        {isLastStep ? finishLabel : nextLabel}
      </button>
    </div>
  )
}

/**
 * StepperProgress component - Progress bar for stepper
 * 
 * @param className - Additional CSS classes
 * @returns JSX.Element - Stepper progress
 * 
 * @example
 * <StepperProgress />
 */
export const StepperProgress: React.FC<{
  className?: string
}> = ({ className }) => {
  const { currentStep, totalSteps } = React.useContext(StepperContext)
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0

  return (
    <div className={cn("w-full bg-muted rounded-full h-2", className)}>
      <div 
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export { Stepper, Step }
