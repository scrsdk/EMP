'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

interface PopoverProps {
  trigger: ReactNode
  content: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  align?: 'start' | 'center' | 'end'
  offset?: number
  showArrow?: boolean
  triggerType?: 'click' | 'hover' | 'focus'
  closeOnClickOutside?: boolean
  closeOnEsc?: boolean
  disabled?: boolean
  className?: string
  contentClassName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Popover({
  trigger,
  content,
  position = 'auto',
  align = 'center',
  offset = 8,
  showArrow = true,
  triggerType = 'click',
  closeOnClickOutside = true,
  closeOnEsc = true,
  disabled = false,
  className,
  contentClassName,
  open: controlledOpen,
  onOpenChange,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)
  const [actualAlign, setActualAlign] = useState(align)
  const triggerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()
  
  const open = controlledOpen !== undefined ? controlledOpen : isOpen
  const setOpen = (value: boolean) => {
    if (disabled) return
    setIsOpen(value)
    onOpenChange?.(value)
  }
  
  // Calculate position to avoid viewport overflow
  useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return
    
    const calculatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect()
      const contentRect = contentRef.current!.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const padding = 16
      
      let bestPosition = position === 'auto' ? 'bottom' : position
      let bestAlign = align
      
      // Auto position calculation
      if (position === 'auto') {
        const spaceAbove = triggerRect.top - padding
        const spaceBelow = viewportHeight - triggerRect.bottom - padding
        const spaceLeft = triggerRect.left - padding
        const spaceRight = viewportWidth - triggerRect.right - padding
        
        if (spaceBelow >= contentRect.height) {
          bestPosition = 'bottom'
        } else if (spaceAbove >= contentRect.height) {
          bestPosition = 'top'
        } else if (spaceRight >= contentRect.width) {
          bestPosition = 'right'
        } else if (spaceLeft >= contentRect.width) {
          bestPosition = 'left'
        }
      }
      
      // Alignment adjustment
      if (bestPosition === 'top' || bestPosition === 'bottom') {
        const leftSpace = triggerRect.left
        const rightSpace = viewportWidth - triggerRect.right
        
        if (align === 'center') {
          const halfContentWidth = contentRect.width / 2
          const centerX = triggerRect.left + triggerRect.width / 2
          
          if (centerX - halfContentWidth < padding) {
            bestAlign = 'start'
          } else if (centerX + halfContentWidth > viewportWidth - padding) {
            bestAlign = 'end'
          }
        }
      }
      
      setActualPosition(bestPosition)
      setActualAlign(bestAlign)
    }
    
    calculatePosition()
    window.addEventListener('resize', calculatePosition)
    window.addEventListener('scroll', calculatePosition)
    
    return () => {
      window.removeEventListener('resize', calculatePosition)
      window.removeEventListener('scroll', calculatePosition)
    }
  }, [open, position, align])
  
  // Handle outside clicks
  useEffect(() => {
    if (!open || !closeOnClickOutside) return
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, closeOnClickOutside])
  
  // Handle ESC key
  useEffect(() => {
    if (!open || !closeOnEsc) return
    
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, closeOnEsc])
  
  const handleTriggerClick = () => {
    if (triggerType === 'click') {
      setOpen(!open)
    }
  }
  
  const handleMouseEnter = () => {
    if (triggerType === 'hover') {
      clearTimeout(hoverTimeoutRef.current)
      setOpen(true)
    }
  }
  
  const handleMouseLeave = () => {
    if (triggerType === 'hover') {
      hoverTimeoutRef.current = setTimeout(() => {
        setOpen(false)
      }, 200)
    }
  }
  
  const handleFocus = () => {
    if (triggerType === 'focus') {
      setOpen(true)
    }
  }
  
  const handleBlur = () => {
    if (triggerType === 'focus') {
      setOpen(false)
    }
  }
  
  const getContentStyle = () => {
    if (!triggerRef.current) return {}
    
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 50,
    }
    
    switch (actualPosition) {
      case 'top':
        style.bottom = window.innerHeight - triggerRect.top + offset
        break
      case 'bottom':
        style.top = triggerRect.bottom + offset
        break
      case 'left':
        style.right = window.innerWidth - triggerRect.left + offset
        style.top = triggerRect.top + triggerRect.height / 2
        style.transform = 'translateY(-50%)'
        break
      case 'right':
        style.left = triggerRect.right + offset
        style.top = triggerRect.top + triggerRect.height / 2
        style.transform = 'translateY(-50%)'
        break
    }
    
    if (actualPosition === 'top' || actualPosition === 'bottom') {
      switch (actualAlign) {
        case 'start':
          style.left = triggerRect.left
          break
        case 'center':
          style.left = triggerRect.left + triggerRect.width / 2
          style.transform = 'translateX(-50%)'
          break
        case 'end':
          style.right = window.innerWidth - triggerRect.right
          break
      }
    }
    
    return style
  }
  
  const arrowClasses = {
    top: 'bottom-[-4px] border-t-gray-900',
    bottom: 'top-[-4px] border-b-gray-900',
    left: 'right-[-4px] border-l-gray-900',
    right: 'left-[-4px] border-r-gray-900',
  }
  
  const arrowAlignClasses = {
    start: actualPosition === 'top' || actualPosition === 'bottom' ? 'left-4' : 'top-4',
    center: actualPosition === 'top' || actualPosition === 'bottom' 
      ? 'left-1/2 -translate-x-1/2' 
      : 'top-1/2 -translate-y-1/2',
    end: actualPosition === 'top' || actualPosition === 'bottom' ? 'right-4' : 'bottom-4',
  }

  return (
    <>
      <div
        ref={triggerRef}
        className={cn('inline-block', className)}
        onClick={handleTriggerClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {trigger}
      </div>
      
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={contentRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              style={getContentStyle()}
              onMouseEnter={() => triggerType === 'hover' && clearTimeout(hoverTimeoutRef.current)}
              onMouseLeave={() => triggerType === 'hover' && handleMouseLeave()}
              className={cn(
                'glass-card shadow-xl',
                contentClassName
              )}
            >
              {content}
              
              {showArrow && (
                <div
                  className={cn(
                    'absolute w-0 h-0 border-4 border-transparent',
                    arrowClasses[actualPosition],
                    arrowAlignClasses[actualAlign]
                  )}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

// Popover content components
interface PopoverHeaderProps {
  children: ReactNode
  className?: string
}

export function PopoverHeader({ children, className }: PopoverHeaderProps) {
  return (
    <div className={cn('px-4 py-3 border-b border-gray-200 dark:border-gray-700', className)}>
      <h3 className="font-semibold text-primary">{children}</h3>
    </div>
  )
}

interface PopoverBodyProps {
  children: ReactNode
  className?: string
}

export function PopoverBody({ children, className }: PopoverBodyProps) {
  return (
    <div className={cn('px-4 py-3', className)}>
      {children}
    </div>
  )
}

interface PopoverFooterProps {
  children: ReactNode
  className?: string
}

export function PopoverFooter({ children, className }: PopoverFooterProps) {
  return (
    <div className={cn('px-4 py-3 border-t border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  )
}

// Pre-built popover variations
export const GamePopover = {
  PlayerInfo: ({ player }: {
    player: {
      name: string
      level: number
      guild?: string
      stats: Array<{ label: string; value: string | number }>
    }
  }) => (
    <>
      <PopoverHeader>{player.name}</PopoverHeader>
      <PopoverBody>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-secondary">Уровень</span>
            <span className="font-medium">{player.level}</span>
          </div>
          {player.guild && (
            <div className="flex justify-between">
              <span className="text-secondary">Гильдия</span>
              <span className="font-medium">{player.guild}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2 space-y-1">
            {player.stats.map((stat, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-secondary">{stat.label}</span>
                <span>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </PopoverBody>
    </>
  ),
  
  ItemTooltip: ({ item }: {
    item: {
      name: string
      rarity: 'common' | 'rare' | 'epic' | 'legendary'
      description: string
      stats?: Array<{ label: string; value: string }>
    }
  }) => {
    const rarityColors = {
      common: 'text-gray-500',
      rare: 'text-blue-500',
      epic: 'text-purple-500',
      legendary: 'text-orange-500',
    }
    
    return (
      <div className="w-64">
        <PopoverHeader>
          <span className={rarityColors[item.rarity]}>{item.name}</span>
        </PopoverHeader>
        <PopoverBody>
          <p className="text-sm text-secondary mb-3">{item.description}</p>
          {item.stats && (
            <div className="space-y-1">
              {item.stats.map((stat, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-secondary">{stat.label}</span>
                  <span className="text-green-500">+{stat.value}</span>
                </div>
              ))}
            </div>
          )}
        </PopoverBody>
      </div>
    )
  },
  
  ResourceInfo: ({ resource }: {
    resource: {
      type: string
      icon: string
      current: number
      max: number
      production: number
    }
  }) => (
    <div className="w-48">
      <PopoverBody>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{resource.icon}</span>
          <div>
            <div className="font-semibold">{resource.type}</div>
            <div className="text-sm text-secondary">
              {resource.current} / {resource.max}
            </div>
          </div>
        </div>
        <div className="text-sm text-green-500">
          +{resource.production} в час
        </div>
      </PopoverBody>
    </div>
  ),
}