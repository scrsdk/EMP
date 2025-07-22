'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient' | 'striped'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  indeterminate?: boolean
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  variant = 'default',
  size = 'md',
  animated = true,
  indeterminate = false,
  className,
}: ProgressBarProps) {
  const [mounted, setMounted] = useState(false)
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const sizeClasses = {
    sm: {
      height: 'h-2',
      label: 'text-xs',
      padding: 'mb-1',
    },
    md: {
      height: 'h-3',
      label: 'text-sm',
      padding: 'mb-2',
    },
    lg: {
      height: 'h-4',
      label: 'text-base',
      padding: 'mb-3',
    },
  }
  
  const variantClasses = {
    default: 'bg-accent',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    gradient: 'bg-gradient-to-r from-blue-500 to-purple-500',
    striped: 'bg-accent bg-striped',
  }
  
  const config = sizeClasses[size]

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className={cn('flex justify-between items-center', config.padding)}>
          {label && (
            <span className={cn('font-medium text-primary', config.label)}>
              {label}
            </span>
          )}
          {showValue && !indeterminate && (
            <span className={cn('font-semibold text-secondary', config.label)}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div className={cn(
        'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative',
        config.height
      )}>
        {indeterminate ? (
          <motion.div
            className={cn(
              'absolute inset-y-0 w-1/3 rounded-full',
              variantClasses[variant]
            )}
            animate={{
              x: ['-100%', '400%'],
            }}
            transition={{
              duration: 1.5,
              ease: 'linear',
              repeat: Infinity,
            }}
          />
        ) : (
          <motion.div
            className={cn(
              'h-full rounded-full relative overflow-hidden',
              variantClasses[variant]
            )}
            initial={animated && mounted ? { width: 0 } : false}
            animate={{ width: `${percentage}%` }}
            transition={{
              duration: animated ? 0.5 : 0,
              ease: 'easeOut',
            }}
          >
            {variant === 'striped' && (
              <div className="absolute inset-0 bg-stripes opacity-20" />
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

interface MultiProgressBarProps {
  segments: Array<{
    value: number
    color?: string
    label?: string
  }>
  max?: number
  label?: string
  showValues?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

export function MultiProgressBar({
  segments,
  max = 100,
  label,
  showValues = true,
  size = 'md',
  animated = true,
  className,
}: MultiProgressBarProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }
  
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const normalizedSegments = segments.map(segment => ({
    ...segment,
    percentage: (segment.value / max) * 100,
  }))

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-primary">{label}</span>
          {showValues && (
            <span className="text-sm font-semibold text-secondary">
              {total}/{max}
            </span>
          )}
        </div>
      )}
      
      <div className={cn(
        'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex',
        sizeClasses[size]
      )}>
        {normalizedSegments.map((segment, index) => (
          <motion.div
            key={index}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{
              backgroundColor: segment.color || `hsl(${index * 60}, 70%, 50%)`,
            }}
            initial={animated ? { width: 0 } : false}
            animate={{ width: `${segment.percentage}%` }}
            transition={{
              duration: animated ? 0.5 : 0,
              delay: animated ? index * 0.1 : 0,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
      
      {showValues && segments.some(s => s.label) && (
        <div className="flex flex-wrap gap-3 mt-2">
          {segments.map((segment, index) => (
            segment.label && (
              <div key={index} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: segment.color || `hsl(${index * 60}, 70%, 50%)`,
                  }}
                />
                <span className="text-xs text-secondary">
                  {segment.label}: {segment.value}
                </span>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
  showValue?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient'
  animated?: boolean
  className?: string
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  showValue = true,
  variant = 'default',
  animated = true,
  className,
}: CircularProgressProps) {
  const [mounted, setMounted] = useState(false)
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const variantColors = {
    default: 'stroke-accent',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    danger: 'stroke-red-500',
    gradient: 'stroke-gradient',
  }

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          
          {/* Progress circle */}
          {variant === 'gradient' ? (
            <>
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#progress-gradient)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                initial={animated && mounted ? { strokeDashoffset: circumference } : false}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: animated ? 0.5 : 0, ease: 'easeOut' }}
                style={{
                  strokeDasharray: circumference,
                }}
              />
            </>
          ) : (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              className={variantColors[variant]}
              initial={animated && mounted ? { strokeDashoffset: circumference } : false}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: animated ? 0.5 : 0, ease: 'easeOut' }}
              style={{
                strokeDasharray: circumference,
              }}
            />
          )}
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <span className="text-2xl font-bold text-primary">
              {Math.round(percentage)}%
            </span>
          )}
          {label && (
            <span className="text-xs text-secondary mt-1">{label}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// Game-specific progress bars
export const GameProgress = {
  Experience: ({ current, max, level }: { current: number; max: number; level: number }) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="text-secondary">Уровень {level}</span>
        <span className="text-secondary">{current}/{max} XP</span>
      </div>
      <ProgressBar
        value={current}
        max={max}
        variant="gradient"
        size="sm"
        showValue={false}
      />
    </div>
  ),
  
  Health: ({ current, max }: { current: number; max: number }) => (
    <ProgressBar
      value={current}
      max={max}
      label="❤️ Здоровье"
      variant={current < max * 0.3 ? 'danger' : 'success'}
      size="md"
    />
  ),
  
  Energy: ({ current, max }: { current: number; max: number }) => (
    <ProgressBar
      value={current}
      max={max}
      label="⚡ Энергия"
      variant="warning"
      size="md"
    />
  ),
  
  Building: ({ progress, timeLeft }: { progress: number; timeLeft: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="text-secondary">🏗️ Строительство</span>
        <span className="text-secondary">{timeLeft}</span>
      </div>
      <ProgressBar
        value={progress}
        variant="striped"
        size="sm"
        showValue={false}
        animated
      />
    </div>
  ),
}