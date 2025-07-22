'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click' | 'focus'
  delay?: number
  offset?: number
  arrow?: boolean
  className?: string
  contentClassName?: string
  disabled?: boolean
}

export function Tooltip({
  content,
  children,
  position = 'top',
  trigger = 'hover',
  delay = 200,
  offset = 8,
  arrow = true,
  className,
  contentClassName,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const showTooltip = () => {
    if (disabled) return
    
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current)
    setIsVisible(false)
  }

  const toggleTooltip = () => {
    if (disabled) return
    setIsVisible(!isVisible)
  }

  // Calculate position to avoid viewport overflow
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 10

    let newPosition = position

    // Check horizontal overflow
    if (position === 'right' && triggerRect.right + tooltipRect.width + offset > viewportWidth - padding) {
      newPosition = 'left'
    } else if (position === 'left' && triggerRect.left - tooltipRect.width - offset < padding) {
      newPosition = 'right'
    }

    // Check vertical overflow
    if (position === 'top' && triggerRect.top - tooltipRect.height - offset < padding) {
      newPosition = 'bottom'
    } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height + offset > viewportHeight - padding) {
      newPosition = 'top'
    }

    if (newPosition !== actualPosition) {
      setActualPosition(newPosition)
    }
  }, [isVisible, position, offset, actualPosition])

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
  }

  const motionVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
      ...(actualPosition === 'top' && { y: 10 }),
      ...(actualPosition === 'bottom' && { y: -10 }),
      ...(actualPosition === 'left' && { x: 10 }),
      ...(actualPosition === 'right' && { x: -10 }),
    },
    animate: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
    },
  }

  const triggerProps = {
    ...(trigger === 'hover' && {
      onMouseEnter: showTooltip,
      onMouseLeave: hideTooltip,
    }),
    ...(trigger === 'click' && {
      onClick: toggleTooltip,
    }),
    ...(trigger === 'focus' && {
      onFocus: showTooltip,
      onBlur: hideTooltip,
    }),
  }

  return (
    <div className={cn('relative inline-flex', className)}>
      <div ref={triggerRef} {...triggerProps}>
        {children}
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <div className={cn('absolute z-50', positionClasses[actualPosition])}>
            <motion.div
              ref={tooltipRef}
              variants={motionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.15 }}
              className={cn(
                'relative px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg whitespace-nowrap',
                contentClassName
              )}
              style={{ marginTop: offset, marginBottom: offset }}
            >
              {content}
              
              {arrow && (
                <div
                  className={cn(
                    'absolute w-0 h-0 border-4 border-transparent',
                    arrowClasses[actualPosition]
                  )}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface MobileTooltipProps {
  content: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  disabled?: boolean
}

export function MobileTooltip({
  content,
  children,
  className,
  contentClassName,
  disabled = false,
}: MobileTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [touchTimeout, setTouchTimeout] = useState<NodeJS.Timeout>()

  const handleTouchStart = () => {
    if (disabled) return
    
    const timeout = setTimeout(() => {
      setIsVisible(true)
    }, 500) // Long press duration
    
    setTouchTimeout(timeout)
  }

  const handleTouchEnd = () => {
    if (touchTimeout) {
      clearTimeout(touchTimeout)
    }
    
    if (isVisible) {
      setTimeout(() => {
        setIsVisible(false)
      }, 2000) // Auto hide after 2 seconds
    }
  }

  return (
    <>
      <div
        className={cn('relative inline-flex', className)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {children}
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm"
          >
            <div
              className={cn(
                'px-4 py-3 bg-gray-900 dark:bg-gray-800 text-white rounded-xl shadow-xl',
                contentClassName
              )}
              onClick={() => setIsVisible(false)}
            >
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Helper component that automatically uses MobileTooltip on touch devices
export function SmartTooltip(props: TooltipProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window)
  }, [])

  if (isTouchDevice) {
    return <MobileTooltip {...props} />
  }

  return <Tooltip {...props} />
}