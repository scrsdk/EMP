'use client'

import { ReactNode, useState, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'

interface AccordionContextValue {
  expandedItems: string[]
  toggleItem: (value: string) => void
  type: 'single' | 'multiple'
}

const AccordionContext = createContext<AccordionContextValue | undefined>(undefined)

interface AccordionProps {
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
  className?: string
  children: ReactNode
}

export function Accordion({
  type = 'single',
  defaultValue,
  value,
  onValueChange,
  collapsible = true,
  className,
  children,
}: AccordionProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    if (value !== undefined) {
      return Array.isArray(value) ? value : [value]
    }
    if (defaultValue !== undefined) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
    }
    return []
  })
  
  const { hapticFeedback } = useTelegram()
  
  const toggleItem = (itemValue: string) => {
    hapticFeedback?.impactOccurred('light')
    
    setExpandedItems(prev => {
      let newItems: string[]
      
      if (type === 'single') {
        if (prev.includes(itemValue) && collapsible) {
          newItems = []
        } else {
          newItems = [itemValue]
        }
      } else {
        if (prev.includes(itemValue)) {
          newItems = prev.filter(item => item !== itemValue)
        } else {
          newItems = [...prev, itemValue]
        }
      }
      
      onValueChange?.(type === 'single' ? newItems[0] || '' : newItems)
      return newItems
    })
  }
  
  const contextValue: AccordionContextValue = {
    expandedItems: value !== undefined 
      ? (Array.isArray(value) ? value : [value])
      : expandedItems,
    toggleItem,
    type,
  }

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn('space-y-2', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  value: string
  className?: string
  children: ReactNode
}

export function AccordionItem({
  value,
  className,
  children,
}: AccordionItemProps) {
  return (
    <div
      className={cn(
        'glass-card overflow-hidden',
        className
      )}
      data-state={useContext(AccordionContext)?.expandedItems.includes(value) ? 'open' : 'closed'}
    >
      {children}
    </div>
  )
}

interface AccordionTriggerProps {
  value: string
  icon?: ReactNode
  badge?: ReactNode
  className?: string
  children: ReactNode
}

export function AccordionTrigger({
  value,
  icon,
  badge,
  className,
  children,
}: AccordionTriggerProps) {
  const context = useContext(AccordionContext)
  if (!context) throw new Error('AccordionTrigger must be used within Accordion')
  
  const { expandedItems, toggleItem } = context
  const isExpanded = expandedItems.includes(value)

  return (
    <button
      onClick={() => toggleItem(value)}
      className={cn(
        'flex w-full items-center justify-between p-4 font-medium transition-all hover:bg-secondary/50',
        isExpanded && 'bg-secondary/30',
        className
      )}
      aria-expanded={isExpanded}
    >
      <div className="flex items-center gap-3">
        {icon && <span>{icon}</span>}
        <span className="text-left">{children}</span>
        {badge && <span>{badge}</span>}
      </div>
      
      <motion.svg
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="h-5 w-5 shrink-0 text-secondary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </motion.svg>
    </button>
  )
}

interface AccordionContentProps {
  value: string
  className?: string
  children: ReactNode
}

export function AccordionContent({
  value,
  className,
  children,
}: AccordionContentProps) {
  const context = useContext(AccordionContext)
  if (!context) throw new Error('AccordionContent must be used within Accordion')
  
  const { expandedItems } = context
  const isExpanded = expandedItems.includes(value)

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            height: { duration: 0.3, ease: 'easeInOut' },
            opacity: { duration: 0.2 }
          }}
          className="overflow-hidden"
        >
          <div className={cn('p-4 pt-0', className)}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Pre-built accordion variations
interface FAQItem {
  question: string
  answer: string
}

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  return (
    <Accordion type="single" collapsible>
      {items.map((item, index) => (
        <AccordionItem key={index} value={`faq-${index}`}>
          <AccordionTrigger value={`faq-${index}`} icon="❓">
            {item.question}
          </AccordionTrigger>
          <AccordionContent value={`faq-${index}`}>
            <p className="text-secondary">{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

// Game-specific accordion variations
export const GameAccordion = {
  BuildingInfo: ({ buildings }: {
    buildings: Array<{
      id: string
      name: string
      icon: string
      level: number
      description: string
      stats: Array<{ label: string; value: string }>
    }>
  }) => (
    <Accordion type="single" collapsible>
      {buildings.map(building => (
        <AccordionItem key={building.id} value={building.id}>
          <AccordionTrigger
            value={building.id}
            icon={<span className="text-2xl">{building.icon}</span>}
            badge={
              <span className="px-2 py-1 bg-accent/20 text-accent rounded-lg text-sm">
                Ур. {building.level}
              </span>
            }
          >
            {building.name}
          </AccordionTrigger>
          <AccordionContent value={building.id}>
            <div className="space-y-3">
              <p className="text-secondary">{building.description}</p>
              <div className="grid grid-cols-2 gap-2">
                {building.stats.map((stat, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-secondary">{stat.label}:</span>
                    <span className="font-medium">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
  
  QuestList: ({ quests }: {
    quests: Array<{
      id: string
      title: string
      type: 'daily' | 'weekly' | 'story'
      completed: boolean
      description: string
      rewards: Array<{ type: string; amount: number }>
      progress?: { current: number; max: number }
    }>
  }) => (
    <Accordion type="multiple">
      {quests.map(quest => (
        <AccordionItem
          key={quest.id}
          value={quest.id}
          className={quest.completed ? 'opacity-60' : ''}
        >
          <AccordionTrigger
            value={quest.id}
            icon={
              quest.type === 'daily' ? '📅' :
              quest.type === 'weekly' ? '📆' : '📖'
            }
            badge={
              quest.completed ? (
                <span className="text-green-500">✓</span>
              ) : quest.progress ? (
                <span className="text-sm text-secondary">
                  {quest.progress.current}/{quest.progress.max}
                </span>
              ) : null
            }
          >
            {quest.title}
          </AccordionTrigger>
          <AccordionContent value={quest.id}>
            <div className="space-y-3">
              <p className="text-secondary">{quest.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium">Награды:</span>
                {quest.rewards.map((reward, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-secondary rounded-lg text-sm"
                  >
                    {reward.type}: {reward.amount}
                  </span>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
}

// Styled accordion variant
interface StyledAccordionProps {
  items: Array<{
    value: string
    trigger: ReactNode
    content: ReactNode
    icon?: ReactNode
  }>
  variant?: 'default' | 'bordered' | 'separated'
  className?: string
}

export function StyledAccordion({
  items,
  variant = 'default',
  className,
}: StyledAccordionProps) {
  const variantClasses = {
    default: '',
    bordered: 'border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden',
    separated: 'space-y-4',
  }
  
  return (
    <Accordion type="single" collapsible className={cn(variantClasses[variant], className)}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className={cn(
            variant === 'bordered' && index > 0 && 'border-t border-gray-200 dark:border-gray-700',
            variant === 'separated' && 'shadow-lg'
          )}
        >
          <AccordionTrigger value={item.value} icon={item.icon}>
            {item.trigger}
          </AccordionTrigger>
          <AccordionContent value={item.value}>
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}