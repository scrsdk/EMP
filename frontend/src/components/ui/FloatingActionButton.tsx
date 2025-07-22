'use client'

import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'

interface FABAction {
  id: string
  icon: ReactNode
  label?: string
  onClick: () => void
  color?: string
}

interface FloatingActionButtonProps {
  icon: ReactNode
  actions?: FABAction[]
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
  color?: string
  hideOnScroll?: boolean
  className?: string
  onClick?: () => void
}

export function FloatingActionButton({
  icon,
  actions,
  position = 'bottom-right',
  size = 'md',
  color = 'bg-gradient-primary',
  hideOnScroll = false,
  className,
  onClick,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const { hapticFeedback } = useTelegram()
  
  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4',
  }
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-14 h-14 text-xl',
    lg: 'w-16 h-16 text-2xl',
  }
  
  const handleMainClick = () => {
    hapticFeedback?.impactOccurred('medium')
    
    if (actions && actions.length > 0) {
      setIsOpen(!isOpen)
    } else if (onClick) {
      onClick()
    }
  }
  
  const handleActionClick = (action: FABAction) => {
    hapticFeedback?.impactOccurred('light')
    setIsOpen(false)
    action.onClick()
  }

  if (hideOnScroll && !isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/30 z-40"
          />
        )}
      </AnimatePresence>

      {/* FAB Container */}
      <div className={cn(
        'fixed z-50',
        positionClasses[position],
        className
      )}>
        {/* Action Items */}
        <AnimatePresence>
          {isOpen && actions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={cn(
                'absolute mb-4 space-y-3',
                position.includes('right') ? 'right-0' : 'left-0',
                position.includes('bottom') ? 'bottom-full' : 'top-full'
              )}
            >
              {actions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: position.includes('right') ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: position.includes('right') ? 20 : -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3"
                  style={{
                    flexDirection: position.includes('right') ? 'row-reverse' : 'row'
                  }}
                >
                  <button
                    onClick={() => handleActionClick(action)}
                    className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 active:scale-[0.9]',
                      action.color || 'bg-white dark:bg-gray-800'
                    )}
                  >
                    <span className="text-lg">{action.icon}</span>
                  </button>
                  
                  {action.label && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap"
                    >
                      {action.label}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.button
          onClick={handleMainClick}
          className={cn(
            'rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-300 active:scale-[0.9]',
            sizeClasses[size],
            color,
            isOpen && 'rotate-45'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: isOpen ? 45 : 0 }}
        >
          {icon}
        </motion.button>
      </div>
    </>
  )
}

interface SpeedDialProps {
  actions: FABAction[]
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SpeedDial({
  actions,
  position = 'bottom-right',
  size = 'md',
  className,
}: SpeedDialProps) {
  return (
    <FloatingActionButton
      icon={<span>+</span>}
      actions={actions}
      position={position}
      size={size}
      className={className}
    />
  )
}