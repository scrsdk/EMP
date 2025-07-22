'use client'

import { ReactNode, useState, createContext, useContext } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
  variant?: 'default' | 'pills' | 'underline' | 'bordered'
  size?: 'sm' | 'md' | 'lg'
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  variant?: 'default' | 'pills' | 'underline' | 'bordered'
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'horizontal' | 'vertical'
  className?: string
  children: ReactNode
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  className,
  children,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(value || defaultValue)
  const { hapticFeedback } = useTelegram()
  
  const handleTabChange = (newValue: string) => {
    hapticFeedback?.impactOccurred('light')
    setActiveTab(newValue)
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{
      activeTab: value || activeTab,
      setActiveTab: handleTabChange,
      variant,
      size,
    }}>
      <div className={cn(
        'w-full',
        orientation === 'vertical' && 'flex gap-4',
        className
      )}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  className?: string
  children: ReactNode
}

export function TabsList({ className, children }: TabsListProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsList must be used within Tabs')
  
  const { variant } = context
  
  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-800 p-1 rounded-xl',
    pills: 'gap-2',
    underline: 'border-b border-gray-200 dark:border-gray-700',
    bordered: 'border-2 border-gray-200 dark:border-gray-700 rounded-xl p-1',
  }

  return (
    <div className={cn(
      'flex items-center',
      variantClasses[variant!],
      className
    )}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  disabled?: boolean
  icon?: ReactNode
  badge?: ReactNode
  className?: string
  children: ReactNode
}

export function TabsTrigger({
  value,
  disabled = false,
  icon,
  badge,
  className,
  children,
}: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')
  
  const { activeTab, setActiveTab, variant, size } = context
  const isActive = activeTab === value
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  }
  
  const variantClasses = {
    default: cn(
      'relative rounded-lg transition-all duration-200',
      isActive
        ? 'text-primary'
        : 'text-secondary hover:text-primary'
    ),
    pills: cn(
      'rounded-xl transition-all duration-200',
      isActive
        ? 'bg-accent text-white'
        : 'bg-gray-100 dark:bg-gray-800 text-secondary hover:text-primary'
    ),
    underline: cn(
      'relative pb-2 transition-all duration-200',
      isActive
        ? 'text-accent'
        : 'text-secondary hover:text-primary'
    ),
    bordered: cn(
      'relative rounded-lg transition-all duration-200',
      isActive
        ? 'text-primary'
        : 'text-secondary hover:text-primary'
    ),
  }

  return (
    <button
      onClick={() => !disabled && setActiveTab(value)}
      disabled={disabled}
      className={cn(
        'relative flex items-center justify-center gap-2 font-medium transition-all duration-200 outline-none',
        sizeClasses[size!],
        variantClasses[variant!],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
      {badge && <span>{badge}</span>}
      
      {/* Active indicator */}
      {isActive && variant === 'default' && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-white dark:bg-gray-900 rounded-lg shadow-sm -z-10"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      
      {isActive && variant === 'underline' && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      
      {isActive && variant === 'bordered' && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-accent/10 rounded-lg -z-10"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  )
}

interface TabsContentProps {
  value: string
  className?: string
  children: ReactNode
}

export function TabsContent({
  value,
  className,
  children,
}: TabsContentProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')
  
  const { activeTab } = context
  
  if (activeTab !== value) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className={cn('mt-4', className)}
    >
      {children}
    </motion.div>
  )
}

// Game-specific tab variations
export const GameTabs = {
  Navigation: ({ tabs, defaultTab, className }: {
    tabs: Array<{
      value: string
      label: string
      icon?: string
      count?: number
    }>
    defaultTab: string
    className?: string
  }) => (
    <Tabs defaultValue={defaultTab} variant="pills" className={className}>
      <TabsList className="justify-center">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            icon={tab.icon && <span>{tab.icon}</span>}
            badge={tab.count && (
              <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {tab.count}
              </span>
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  ),
  
  Settings: ({ sections, defaultSection }: {
    sections: Array<{
      value: string
      label: string
      icon?: ReactNode
      content: ReactNode
    }>
    defaultSection: string
  }) => (
    <Tabs defaultValue={defaultSection} variant="underline" orientation="vertical">
      <TabsList className="flex-col items-stretch w-48">
        {sections.map(section => (
          <TabsTrigger
            key={section.value}
            value={section.value}
            icon={section.icon}
            className="justify-start"
          >
            {section.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <div className="flex-1">
        {sections.map(section => (
          <TabsContent key={section.value} value={section.value}>
            {section.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  ),
}

// Scrollable tabs for many items
interface ScrollableTabsProps {
  tabs: Array<{
    value: string
    label: string
    icon?: ReactNode
  }>
  defaultValue: string
  onValueChange?: (value: string) => void
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ScrollableTabs({
  tabs,
  defaultValue,
  onValueChange,
  variant = 'pills',
  size = 'md',
  className,
}: ScrollableTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      variant={variant}
      size={size}
      className={className}
    >
      <div className="relative">
        <div className="overflow-x-auto scrollbar-hide">
          <TabsList className="flex-nowrap min-w-max">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                icon={tab.icon}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        {/* Gradient indicators */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none" />
      </div>
    </Tabs>
  )
}