'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'
import { useTelegram } from '@/hooks/useTelegram'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  position?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  title?: string
  description?: string
  children: ReactNode
  closeOnClickOutside?: boolean
  closeOnEsc?: boolean
  showOverlay?: boolean
  showCloseButton?: boolean
  className?: string
}

export function Drawer({
  isOpen,
  onClose,
  position = 'right',
  size = 'md',
  title,
  description,
  children,
  closeOnClickOutside = true,
  closeOnEsc = true,
  showOverlay = true,
  showCloseButton = true,
  className,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const { hapticFeedback } = useTelegram()
  
  const handleClose = () => {
    hapticFeedback?.impactOccurred('light')
    onClose()
  }
  
  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return
    
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }
    
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, closeOnEsc])
  
  // Handle click outside
  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return
    
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, closeOnClickOutside])
  
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  
  const sizeClasses = {
    sm: {
      left: 'w-64',
      right: 'w-64',
      top: 'h-48',
      bottom: 'h-48',
    },
    md: {
      left: 'w-80',
      right: 'w-80',
      top: 'h-64',
      bottom: 'h-64',
    },
    lg: {
      left: 'w-96',
      right: 'w-96',
      top: 'h-80',
      bottom: 'h-80',
    },
    xl: {
      left: 'w-[32rem]',
      right: 'w-[32rem]',
      top: 'h-96',
      bottom: 'h-96',
    },
    full: {
      left: 'w-full',
      right: 'w-full',
      top: 'h-full',
      bottom: 'h-full',
    },
  }
  
  const positionClasses = {
    left: 'inset-y-0 left-0',
    right: 'inset-y-0 right-0',
    top: 'inset-x-0 top-0',
    bottom: 'inset-x-0 bottom-0',
  }
  
  const motionVariants = {
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
    },
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
    top: {
      initial: { y: '-100%' },
      animate: { y: 0 },
      exit: { y: '-100%' },
    },
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
    },
  }
  
  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
          )}
          
          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            {...motionVariants[position]}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className={cn(
              'fixed bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col',
              positionClasses[position],
              sizeClasses[size][position],
              position === 'left' && 'rounded-r-2xl',
              position === 'right' && 'rounded-l-2xl',
              position === 'top' && 'rounded-b-2xl',
              position === 'bottom' && 'rounded-t-2xl',
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  {title && (
                    <h2 className="text-lg font-semibold text-primary">{title}</h2>
                  )}
                  {description && (
                    <p className="text-sm text-secondary mt-1">{description}</p>
                  )}
                </div>
                
                {showCloseButton && (
                  <button
                    onClick={handleClose}
                    className="ml-4 p-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

// Drawer section components
interface DrawerSectionProps {
  title?: string
  children: ReactNode
  className?: string
}

export function DrawerSection({ title, children, className }: DrawerSectionProps) {
  return (
    <div className={cn('mb-6 last:mb-0', className)}>
      {title && (
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

// Pre-built drawer variations
export const GameDrawer = {
  Navigation: ({ isOpen, onClose, items }: {
    isOpen: boolean
    onClose: () => void
    items: Array<{
      label: string
      icon: ReactNode
      href?: string
      onClick?: () => void
      badge?: ReactNode
    }>
  }) => (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="left"
      title="Меню"
      size="sm"
    >
      <nav className="space-y-1">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick?.()
              onClose()
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge}
          </button>
        ))}
      </nav>
    </Drawer>
  ),
  
  Settings: ({ isOpen, onClose, sections }: {
    isOpen: boolean
    onClose: () => void
    sections: Array<{
      title: string
      items: ReactNode
    }>
  }) => (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      title="Настройки"
      size="md"
    >
      {sections.map((section, index) => (
        <DrawerSection key={index} title={section.title}>
          {section.items}
        </DrawerSection>
      ))}
    </Drawer>
  ),
  
  Filter: ({ isOpen, onClose, filters, onApply }: {
    isOpen: boolean
    onClose: () => void
    filters: ReactNode
    onApply: () => void
  }) => (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="bottom"
      title="Фильтры"
      size="lg"
    >
      <div className="space-y-4">
        {filters}
        
        <div className="flex gap-2 pt-4">
          <button
            onClick={() => {
              onApply()
              onClose()
            }}
            className="flex-1 btn btn-primary"
          >
            Применить
          </button>
          <button
            onClick={onClose}
            className="flex-1 btn btn-secondary"
          >
            Отмена
          </button>
        </div>
      </div>
    </Drawer>
  ),
}

// Mobile-friendly drawer with swipe to close
interface SwipeableDrawerProps extends DrawerProps {
  swipeToClose?: boolean
  swipeThreshold?: number
}

export function SwipeableDrawer({
  swipeToClose = true,
  swipeThreshold = 100,
  position = 'bottom',
  children,
  ...props
}: SwipeableDrawerProps) {
  const startY = useRef(0)
  const startX = useRef(0)
  
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    startX.current = e.touches[0].clientX
  }
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!swipeToClose) return
    
    const endY = e.changedTouches[0].clientY
    const endX = e.changedTouches[0].clientX
    const deltaY = endY - startY.current
    const deltaX = endX - startX.current
    
    switch (position) {
      case 'bottom':
        if (deltaY > swipeThreshold) props.onClose()
        break
      case 'top':
        if (deltaY < -swipeThreshold) props.onClose()
        break
      case 'left':
        if (deltaX < -swipeThreshold) props.onClose()
        break
      case 'right':
        if (deltaX > swipeThreshold) props.onClose()
        break
    }
  }
  
  return (
    <Drawer position={position} {...props}>
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="h-full"
      >
        {/* Swipe indicator */}
        {swipeToClose && (position === 'bottom' || position === 'top') && (
          <div className="flex justify-center py-2">
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
          </div>
        )}
        
        {children}
      </div>
    </Drawer>
  )
}