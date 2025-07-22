'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'

interface SliderProps {
  value?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  showValue?: boolean
  showTicks?: boolean
  tickCount?: number
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  marks?: Array<{
    value: number
    label?: string
  }>
  tooltip?: boolean
  className?: string
}

export function Slider({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  showTicks = false,
  tickCount = 5,
  variant = 'default',
  size = 'md',
  disabled = false,
  marks,
  tooltip = true,
  className,
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const { hapticFeedback } = useTelegram()
  
  const percentage = ((value - min) / (max - min)) * 100
  
  const sizeClasses = {
    sm: {
      track: 'h-1',
      thumb: 'w-4 h-4',
      label: 'text-sm',
    },
    md: {
      track: 'h-2',
      thumb: 'w-5 h-5',
      label: 'text-base',
    },
    lg: {
      track: 'h-3',
      thumb: 'w-6 h-6',
      label: 'text-lg',
    },
  }
  
  const variantClasses = {
    default: 'bg-accent',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    gradient: 'bg-gradient-to-r from-blue-500 to-purple-500',
  }
  
  const config = sizeClasses[size]
  
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return
    setIsDragging(true)
    setShowTooltip(true)
    updateValue(e)
  }
  
  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || disabled) return
    updateValue(e)
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
    setShowTooltip(false)
  }
  
  const updateValue = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return
    
    const rect = sliderRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const percentage = x / rect.width
    const newValue = Math.round((percentage * (max - min) + min) / step) * step
    
    if (newValue !== value) {
      hapticFeedback?.impactOccurred('light')
      onChange?.(Math.max(min, Math.min(max, newValue)))
    }
  }
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleMouseMove)
      document.addEventListener('touchend', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleMouseMove)
        document.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [isDragging, value])
  
  const generateTicks = () => {
    const ticks = []
    for (let i = 0; i < tickCount; i++) {
      const tickValue = (i / (tickCount - 1)) * (max - min) + min
      ticks.push(tickValue)
    }
    return ticks
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-3">
          {label && (
            <label className={cn(
              'font-medium',
              config.label,
              disabled && 'text-gray-400'
            )}>
              {label}
            </label>
          )}
          {showValue && (
            <span className={cn(
              'font-semibold',
              config.label,
              variantClasses[variant].replace('bg-', 'text-')
            )}>
              {value}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        {/* Track */}
        <div
          ref={sliderRef}
          className={cn(
            'w-full rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer relative',
            config.track,
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          {/* Filled Track */}
          <motion.div
            className={cn(
              'absolute left-0 top-0 h-full rounded-full',
              variantClasses[variant]
            )}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
          
          {/* Thumb */}
          <motion.div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg cursor-grab active:cursor-grabbing',
              config.thumb,
              isDragging && 'scale-110',
              disabled && 'cursor-not-allowed'
            )}
            initial={false}
            animate={{ left: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ x: '-50%' }}
            onMouseEnter={() => tooltip && setShowTooltip(true)}
            onMouseLeave={() => !isDragging && setShowTooltip(false)}
          >
            {/* Tooltip */}
            {tooltip && showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap"
              >
                {value}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-gray-900" />
              </motion.div>
            )}
          </motion.div>
        </div>
        
        {/* Ticks */}
        {showTicks && (
          <div className="absolute w-full flex justify-between mt-2">
            {generateTicks().map((tick, index) => (
              <div
                key={index}
                className="w-0.5 h-2 bg-gray-300 dark:bg-gray-600"
              />
            ))}
          </div>
        )}
        
        {/* Marks */}
        {marks && (
          <div className="relative w-full mt-4">
            {marks.map((mark) => {
              const markPercentage = ((mark.value - min) / (max - min)) * 100
              return (
                <div
                  key={mark.value}
                  className="absolute -translate-x-1/2"
                  style={{ left: `${markPercentage}%` }}
                >
                  <div className="w-0.5 h-2 bg-gray-300 dark:bg-gray-600 mx-auto" />
                  {mark.label && (
                    <span className="text-xs text-secondary mt-1 block text-center">
                      {mark.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

interface RangeSliderProps {
  value?: [number, number]
  onChange?: (value: [number, number]) => void
  min?: number
  max?: number
  step?: number
  label?: string
  showValue?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

export function RangeSlider({
  value = [0, 100],
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  variant = 'default',
  size = 'md',
  disabled = false,
  className,
}: RangeSliderProps) {
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const { hapticFeedback } = useTelegram()
  
  const minPercentage = ((value[0] - min) / (max - min)) * 100
  const maxPercentage = ((value[1] - min) / (max - min)) * 100
  
  const sizeClasses = {
    sm: {
      track: 'h-1',
      thumb: 'w-4 h-4',
      label: 'text-sm',
    },
    md: {
      track: 'h-2',
      thumb: 'w-5 h-5',
      label: 'text-base',
    },
    lg: {
      track: 'h-3',
      thumb: 'w-6 h-6',
      label: 'text-lg',
    },
  }
  
  const variantClasses = {
    default: 'bg-accent',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    gradient: 'bg-gradient-to-r from-blue-500 to-purple-500',
  }
  
  const config = sizeClasses[size]
  
  const handleThumbDown = (thumb: 'min' | 'max') => {
    if (disabled) return
    setActiveThumb(thumb)
    hapticFeedback?.impactOccurred('light')
  }
  
  const updateValue = (e: MouseEvent | TouchEvent) => {
    if (!sliderRef.current || !activeThumb) return
    
    const rect = sliderRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const percentage = x / rect.width
    const newValue = Math.round((percentage * (max - min) + min) / step) * step
    
    if (activeThumb === 'min') {
      onChange?.([Math.min(newValue, value[1] - step), value[1]])
    } else {
      onChange?.([value[0], Math.max(newValue, value[0] + step)])
    }
  }
  
  useEffect(() => {
    if (activeThumb) {
      const handleMouseMove = (e: MouseEvent | TouchEvent) => updateValue(e)
      const handleMouseUp = () => setActiveThumb(null)
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleMouseMove)
      document.addEventListener('touchend', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleMouseMove)
        document.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [activeThumb, value])

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-3">
          {label && (
            <label className={cn(
              'font-medium',
              config.label,
              disabled && 'text-gray-400'
            )}>
              {label}
            </label>
          )}
          {showValue && (
            <span className={cn(
              'font-semibold',
              config.label,
              variantClasses[variant].replace('bg-', 'text-')
            )}>
              {value[0]} - {value[1]}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        {/* Track */}
        <div
          ref={sliderRef}
          className={cn(
            'w-full rounded-full bg-gray-200 dark:bg-gray-700 relative',
            config.track,
            disabled && 'opacity-50'
          )}
        >
          {/* Filled Track */}
          <motion.div
            className={cn(
              'absolute top-0 h-full rounded-full',
              variantClasses[variant]
            )}
            initial={false}
            animate={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
          
          {/* Min Thumb */}
          <motion.div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg cursor-grab active:cursor-grabbing',
              config.thumb,
              activeThumb === 'min' && 'scale-110 z-10',
              disabled && 'cursor-not-allowed'
            )}
            initial={false}
            animate={{ left: `${minPercentage}%` }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ x: '-50%' }}
            onMouseDown={() => handleThumbDown('min')}
            onTouchStart={() => handleThumbDown('min')}
          />
          
          {/* Max Thumb */}
          <motion.div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg cursor-grab active:cursor-grabbing',
              config.thumb,
              activeThumb === 'max' && 'scale-110 z-10',
              disabled && 'cursor-not-allowed'
            )}
            initial={false}
            animate={{ left: `${maxPercentage}%` }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ x: '-50%' }}
            onMouseDown={() => handleThumbDown('max')}
            onTouchStart={() => handleThumbDown('max')}
          />
        </div>
      </div>
    </div>
  )
}