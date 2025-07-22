'use client'

import { useState, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'

export interface Tab {
  id: string
  label: string
  icon?: ReactNode
  badge?: string | number
}

interface TabBarProps {
  tabs: Tab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline' | 'segment'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
  children?: (activeTab: string) => ReactNode
}

export function TabBar({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  fullWidth = true,
  className,
  children,
}: TabBarProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || '')
  const activeTab = controlledActiveTab ?? internalActiveTab
  const { hapticFeedback } = useTelegram()
  
  const handleTabClick = (tabId: string) => {
    hapticFeedback?.impactOccurred('light')
    setInternalActiveTab(tabId)
    onTabChange?.(tabId)
  }
  
  const sizeClasses = {
    sm: 'text-sm py-2 px-3',
    md: 'text-base py-3 px-4',
    lg: 'text-lg py-4 px-6',
  }
  
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab)

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className={cn(
        'relative',
        variant === 'segment' && 'glass-card p-1'
      )}>
        <div className={cn(
          'flex',
          fullWidth ? 'w-full' : 'w-fit',
          variant === 'underline' && 'border-b border-gray-200 dark:border-gray-700'
        )}>
          {/* Background indicator for segment variant */}
          {variant === 'segment' && (
            <motion.div
              className="absolute bg-gradient-primary rounded-xl"
              initial={false}
              animate={{
                x: `${activeIndex * 100}%`,
                width: `${100 / tabs.length}%`,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                height: variant === 'segment' ? 'calc(100% - 8px)' : '100%',
                top: variant === 'segment' ? '4px' : '0',
              }}
            />
          )}
          
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTab
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  'relative flex items-center justify-center gap-2 font-medium transition-all duration-300',
                  sizeClasses[size],
                  fullWidth ? 'flex-1' : '',
                  // Variant styles
                  variant === 'default' && [
                    isActive 
                      ? 'text-accent' 
                      : 'text-secondary hover:text-primary',
                  ],
                  variant === 'pills' && [
                    'rounded-xl mx-1',
                    isActive 
                      ? 'bg-gradient-primary text-white shadow-medium' 
                      : 'hover:bg-secondary/50',
                  ],
                  variant === 'underline' && [
                    isActive 
                      ? 'text-accent' 
                      : 'text-secondary hover:text-primary',
                  ],
                  variant === 'segment' && [
                    'rounded-xl',
                    isActive 
                      ? 'text-white' 
                      : 'text-secondary hover:text-primary',
                  ]
                )}
              >
                {/* Tab Content */}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon && <span>{tab.icon}</span>}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-bold',
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-accent/10 text-accent'
                    )}>
                      {tab.badge}
                    </span>
                  )}
                </span>
                
                {/* Underline indicator */}
                {variant === 'underline' && isActive && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary"
                    initial={false}
                  />
                )}
                
                {/* Default dot indicator */}
                {variant === 'default' && isActive && (
                  <motion.div
                    layoutId="dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent glow-accent"
                    initial={false}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Tab Content */}
      {children && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-4"
        >
          {children(activeTab)}
        </motion.div>
      )}
    </div>
  )
}

interface TabPanelProps {
  value: string
  activeValue: string
  children: ReactNode
  className?: string
}

export function TabPanel({ value, activeValue, children, className }: TabPanelProps) {
  if (value !== activeValue) return null
  
  return (
    <div className={className}>
      {children}
    </div>
  )
}