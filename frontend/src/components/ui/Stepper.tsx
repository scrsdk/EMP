'use client'

import { ReactNode, useState, createContext, useContext } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'

interface StepperContextValue {
  activeStep: number
  setActiveStep: (step: number) => void
  totalSteps: number
  orientation: 'horizontal' | 'vertical'
  variant: 'default' | 'compact' | 'detailed'
  allowStepClick: boolean
}

const StepperContext = createContext<StepperContextValue | undefined>(undefined)

interface StepperProps {
  activeStep: number
  onStepChange?: (step: number) => void
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'compact' | 'detailed'
  allowStepClick?: boolean
  className?: string
  children: ReactNode
}

export function Stepper({
  activeStep,
  onStepChange,
  orientation = 'horizontal',
  variant = 'default',
  allowStepClick = true,
  className,
  children,
}: StepperProps) {
  const [totalSteps, setTotalSteps] = useState(0)
  const { hapticFeedback } = useTelegram()
  
  const handleStepChange = (step: number) => {
    if (allowStepClick && step !== activeStep) {
      hapticFeedback?.impactOccurred('light')
      onStepChange?.(step)
    }
  }

  return (
    <StepperContext.Provider value={{
      activeStep,
      setActiveStep: handleStepChange,
      totalSteps,
      orientation,
      variant,
      allowStepClick,
    }}>
      <div className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
        className
      )}>
        {children}
      </div>
    </StepperContext.Provider>
  )
}

interface StepProps {
  index: number
  title: string
  description?: string
  icon?: ReactNode
  error?: boolean
  optional?: boolean
  className?: string
}

export function Step({
  index,
  title,
  description,
  icon,
  error = false,
  optional = false,
  className,
}: StepProps) {
  const context = useContext(StepperContext)
  if (!context) throw new Error('Step must be used within Stepper')
  
  const { activeStep, setActiveStep, orientation, variant, allowStepClick } = context
  
  const isActive = index === activeStep
  const isCompleted = index < activeStep
  const isClickable = allowStepClick && (isCompleted || isActive)
  
  const handleClick = () => {
    if (isClickable) {
      setActiveStep(index)
    }
  }
  
  const sizeClasses = {
    default: {
      node: 'w-10 h-10',
      icon: 'text-lg',
      title: 'text-base',
      description: 'text-sm',
    },
    compact: {
      node: 'w-8 h-8',
      icon: 'text-sm',
      title: 'text-sm',
      description: 'text-xs',
    },
    detailed: {
      node: 'w-12 h-12',
      icon: 'text-xl',
      title: 'text-lg',
      description: 'text-base',
    },
  }
  
  const config = sizeClasses[variant]

  return (
    <div className={cn(
      'flex items-center',
      orientation === 'vertical' && 'w-full',
      className
    )}>
      <div className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-col items-center' : 'items-start gap-4'
      )}>
        {/* Step node */}
        <motion.button
          onClick={handleClick}
          disabled={!isClickable}
          whileHover={isClickable ? { scale: 1.05 } : undefined}
          whileTap={isClickable ? { scale: 0.95 } : undefined}
          className={cn(
            'relative rounded-full flex items-center justify-center font-semibold transition-all duration-300',
            config.node,
            isCompleted && !error && 'bg-accent text-white',
            isActive && !error && 'bg-accent text-white ring-4 ring-accent/30',
            !isCompleted && !isActive && !error && 'bg-gray-200 dark:bg-gray-700 text-gray-500',
            error && 'bg-red-500 text-white',
            isClickable && 'cursor-pointer',
            !isClickable && 'cursor-default'
          )}
        >
          {isCompleted && !error ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : error ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : icon ? (
            <span className={config.icon}>{icon}</span>
          ) : (
            <span>{index + 1}</span>
          )}
          
          {/* Active pulse */}
          {isActive && !error && (
            <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20" />
          )}
        </motion.button>
        
        {/* Step content */}
        <div className={cn(
          'text-center',
          orientation === 'horizontal' ? 'mt-2' : 'flex-1 text-left'
        )}>
          <div className={cn(
            'font-medium',
            config.title,
            isActive ? 'text-primary' : 'text-secondary'
          )}>
            {title}
            {optional && (
              <span className="text-xs text-gray-500 ml-1">(необязательно)</span>
            )}
          </div>
          {description && variant !== 'compact' && (
            <div className={cn(
              'text-secondary mt-1',
              config.description
            )}>
              {description}
            </div>
          )}
        </div>
      </div>
      
      {/* Connector */}
      {index < context.totalSteps - 1 && (
        <div className={cn(
          'flex-1',
          orientation === 'horizontal' ? 'h-0.5 mx-4' : 'w-0.5 ml-5 my-4 self-stretch'
        )}>
          <div className={cn(
            'h-full transition-all duration-500',
            isCompleted ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-700'
          )} />
        </div>
      )}
    </div>
  )
}

// Stepper navigation controls
interface StepperControlsProps {
  onNext?: () => void
  onPrev?: () => void
  onFinish?: () => void
  nextLabel?: string
  prevLabel?: string
  finishLabel?: string
  isFirstStep?: boolean
  isLastStep?: boolean
  canGoNext?: boolean
  className?: string
}

export function StepperControls({
  onNext,
  onPrev,
  onFinish,
  nextLabel = 'Далее',
  prevLabel = 'Назад',
  finishLabel = 'Завершить',
  isFirstStep = false,
  isLastStep = false,
  canGoNext = true,
  className,
}: StepperControlsProps) {
  return (
    <div className={cn('flex justify-between gap-4', className)}>
      <button
        onClick={onPrev}
        disabled={isFirstStep}
        className={cn(
          'btn btn-secondary',
          isFirstStep && 'invisible'
        )}
      >
        {prevLabel}
      </button>
      
      {isLastStep ? (
        <button
          onClick={onFinish}
          disabled={!canGoNext}
          className="btn btn-gradient"
        >
          {finishLabel}
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="btn btn-primary"
        >
          {nextLabel}
        </button>
      )}
    </div>
  )
}

// Game-specific stepper variations
export const GameStepper = {
  Tutorial: ({ steps, currentStep, onComplete }: {
    steps: Array<{
      title: string
      description: string
      action: string
    }>
    currentStep: number
    onComplete: () => void
  }) => {
    const [activeStep, setActiveStep] = useState(currentStep)
    
    return (
      <div className="space-y-6">
        <Stepper
          activeStep={activeStep}
          onStepChange={setActiveStep}
          variant="default"
        >
          {steps.map((step, index) => (
            <Step
              key={index}
              index={index}
              title={step.title}
              description={step.description}
            />
          ))}
        </Stepper>
        
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-3">
            {steps[activeStep].title}
          </h3>
          <p className="text-secondary mb-4">
            {steps[activeStep].description}
          </p>
          <div className="bg-accent/10 rounded-lg p-4 text-accent">
            <strong>Действие:</strong> {steps[activeStep].action}
          </div>
        </div>
        
        <StepperControls
          onNext={() => setActiveStep(activeStep + 1)}
          onPrev={() => setActiveStep(activeStep - 1)}
          onFinish={onComplete}
          isFirstStep={activeStep === 0}
          isLastStep={activeStep === steps.length - 1}
        />
      </div>
    )
  },
  
  BuildingConstruction: ({ stages, currentStage }: {
    stages: Array<{
      name: string
      duration: string
      resources: Array<{ type: string; amount: number }>
      completed: boolean
    }>
    currentStage: number
  }) => (
    <Stepper
      activeStep={currentStage}
      orientation="vertical"
      variant="detailed"
      allowStepClick={false}
    >
      {stages.map((stage, index) => (
        <Step
          key={index}
          index={index}
          title={stage.name}
          description={`Время: ${stage.duration}`}
          icon={stage.completed ? '✓' : '🏗️'}
        />
      ))}
    </Stepper>
  ),
  
  QuestChain: ({ quests, activeQuest, onQuestSelect }: {
    quests: Array<{
      id: string
      title: string
      reward: string
      completed: boolean
      locked: boolean
    }>
    activeQuest: number
    onQuestSelect: (index: number) => void
  }) => (
    <Stepper
      activeStep={activeQuest}
      onStepChange={onQuestSelect}
      variant="compact"
      allowStepClick={true}
    >
      {quests.map((quest, index) => (
        <Step
          key={quest.id}
          index={index}
          title={quest.title}
          description={quest.reward}
          error={quest.locked}
          icon={quest.completed ? '✓' : '📜'}
        />
      ))}
    </Stepper>
  ),
}

// Progress stepper with percentage
interface ProgressStepperProps {
  steps: Array<{
    label: string
    value: number
  }>
  currentValue: number
  maxValue: number
  className?: string
}

export function ProgressStepper({
  steps,
  currentValue,
  maxValue,
  className,
}: ProgressStepperProps) {
  const percentage = (currentValue / maxValue) * 100

  return (
    <div className={cn('relative', className)}>
      {/* Progress bar */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-700">
        <motion.div
          className="h-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const stepPercentage = (step.value / maxValue) * 100
          const isCompleted = currentValue >= step.value
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 bg-white dark:bg-gray-900',
                  isCompleted
                    ? 'ring-4 ring-accent bg-accent text-white'
                    : 'ring-2 ring-gray-300 dark:ring-gray-700 text-gray-500'
                )}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm font-medium">{step.label}</div>
                <div className="text-xs text-secondary">{step.value}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}