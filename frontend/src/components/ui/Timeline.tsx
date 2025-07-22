'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TimelineItem {
  id: string
  title: string
  description?: string
  time?: string
  icon?: ReactNode
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  active?: boolean
  completed?: boolean
  content?: ReactNode
}

interface TimelineProps {
  items: TimelineItem[]
  variant?: 'default' | 'compact' | 'detailed'
  orientation?: 'vertical' | 'horizontal'
  animated?: boolean
  className?: string
}

export function Timeline({
  items,
  variant = 'default',
  orientation = 'vertical',
  animated = true,
  className,
}: TimelineProps) {
  const colorClasses = {
    default: 'bg-gray-400 dark:bg-gray-600',
    primary: 'bg-accent',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: animated ? 0.1 : 0,
      },
    },
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  }

  if (orientation === 'horizontal') {
    return (
      <motion.div
        variants={containerVariants}
        initial={animated ? 'hidden' : 'visible'}
        animate="visible"
        className={cn('flex items-center overflow-x-auto scrollbar-hide', className)}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className="flex items-center flex-shrink-0"
          >
            <div className="flex flex-col items-center">
              {/* Node */}
              <div className="relative">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
                    item.completed
                      ? colorClasses[item.color || 'primary']
                      : 'bg-gray-200 dark:bg-gray-700',
                    item.active && 'ring-4 ring-accent/30 scale-110'
                  )}
                >
                  {item.icon || (
                    <span className="text-white font-semibold">
                      {index + 1}
                    </span>
                  )}
                </div>
                
                {/* Pulse animation for active item */}
                {item.active && (
                  <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20" />
                )}
              </div>
              
              {/* Content */}
              <div className="mt-3 text-center px-4">
                <h4 className={cn(
                  'font-medium text-sm',
                  item.active ? 'text-accent' : 'text-primary'
                )}>
                  {item.title}
                </h4>
                {item.time && (
                  <p className="text-xs text-secondary mt-1">{item.time}</p>
                )}
              </div>
            </div>
            
            {/* Connector */}
            {index < items.length - 1 && (
              <div
                className={cn(
                  'w-16 h-0.5 mx-2',
                  items[index + 1].completed
                    ? colorClasses[items[index + 1].color || 'primary']
                    : 'bg-gray-300 dark:bg-gray-700'
                )}
              />
            )}
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial={animated ? 'hidden' : 'visible'}
      animate="visible"
      className={cn('relative', className)}
    >
      {/* Vertical line */}
      <div
        className={cn(
          'absolute left-6 top-0 bottom-0 w-0.5',
          variant === 'compact' && 'left-4',
          'bg-gray-300 dark:bg-gray-700'
        )}
      />
      
      {/* Timeline items */}
      <div className="relative space-y-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className={cn(
              'flex gap-4',
              variant === 'compact' && 'gap-3'
            )}
          >
            {/* Node */}
            <div className="relative flex-shrink-0">
              <div
                className={cn(
                  'rounded-full flex items-center justify-center transition-all duration-300 bg-white dark:bg-gray-900 ring-4',
                  variant === 'default' && 'w-12 h-12',
                  variant === 'compact' && 'w-8 h-8',
                  variant === 'detailed' && 'w-14 h-14',
                  item.completed
                    ? `ring-${colorClasses[item.color || 'primary']} ${colorClasses[item.color || 'primary']}`
                    : 'ring-gray-300 dark:ring-gray-700',
                  item.active && 'scale-110'
                )}
              >
                {item.icon ? (
                  <span className={cn(
                    'text-lg',
                    variant === 'compact' && 'text-sm',
                    variant === 'detailed' && 'text-xl'
                  )}>
                    {item.icon}
                  </span>
                ) : (
                  <div
                    className={cn(
                      'rounded-full',
                      variant === 'default' && 'w-3 h-3',
                      variant === 'compact' && 'w-2 h-2',
                      variant === 'detailed' && 'w-4 h-4',
                      item.completed
                        ? colorClasses[item.color || 'primary']
                        : 'bg-gray-400 dark:bg-gray-600'
                    )}
                  />
                )}
              </div>
              
              {/* Pulse animation for active item */}
              {item.active && (
                <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20" />
              )}
            </div>
            
            {/* Content */}
            <div className={cn(
              'flex-1 pb-6',
              index === items.length - 1 && 'pb-0'
            )}>
              <div className={cn(
                'glass-card',
                variant === 'compact' && 'p-3',
                variant === 'default' && 'p-4',
                variant === 'detailed' && 'p-5'
              )}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className={cn(
                    'font-semibold',
                    variant === 'compact' && 'text-sm',
                    variant === 'detailed' && 'text-lg',
                    item.active ? 'text-accent' : 'text-primary'
                  )}>
                    {item.title}
                  </h3>
                  {item.time && (
                    <span className={cn(
                      'text-secondary',
                      variant === 'compact' && 'text-xs',
                      variant === 'default' && 'text-sm'
                    )}>
                      {item.time}
                    </span>
                  )}
                </div>
                
                {item.description && (
                  <p className={cn(
                    'text-secondary mb-3',
                    variant === 'compact' && 'text-sm'
                  )}>
                    {item.description}
                  </p>
                )}
                
                {item.content && variant === 'detailed' && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    {item.content}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Game-specific timeline variations
export const GameTimeline = {
  BattleHistory: ({ battles }: {
    battles: Array<{
      id: string
      opponent: string
      result: 'victory' | 'defeat' | 'draw'
      time: string
      rewards?: string
    }>
  }) => {
    const items: TimelineItem[] = battles.map(battle => ({
      id: battle.id,
      title: `Битва с ${battle.opponent}`,
      description: battle.rewards,
      time: battle.time,
      icon: battle.result === 'victory' ? '🏆' : battle.result === 'defeat' ? '💀' : '🤝',
      color: battle.result === 'victory' ? 'success' : battle.result === 'defeat' ? 'danger' : 'warning',
      completed: true,
    }))
    
    return <Timeline items={items} variant="compact" />
  },
  
  QuestProgress: ({ steps }: {
    steps: Array<{
      id: string
      title: string
      description?: string
      completed: boolean
      active: boolean
    }>
  }) => {
    const items: TimelineItem[] = steps.map((step, index) => ({
      ...step,
      icon: step.completed ? '✓' : (index + 1).toString(),
      color: 'primary',
    }))
    
    return <Timeline items={items} variant="default" />
  },
  
  BuildingUpgrade: ({ stages }: {
    stages: Array<{
      id: string
      level: number
      title: string
      requirements: string
      completed: boolean
      active: boolean
      unlocks?: string[]
    }>
  }) => {
    const items: TimelineItem[] = stages.map(stage => ({
      id: stage.id,
      title: `Уровень ${stage.level}: ${stage.title}`,
      description: stage.requirements,
      icon: '🏗️',
      color: 'primary',
      completed: stage.completed,
      active: stage.active,
      content: stage.unlocks && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-secondary">Открывает:</p>
          {stage.unlocks.map((unlock, index) => (
            <div key={index} className="text-sm text-green-500">
              • {unlock}
            </div>
          ))}
        </div>
      ),
    }))
    
    return <Timeline items={items} variant="detailed" />
  },
  
  DailyEvents: ({ events }: {
    events: Array<{
      id: string
      time: string
      type: 'login' | 'battle' | 'quest' | 'achievement' | 'reward'
      title: string
      description?: string
    }>
  }) => {
    const iconMap = {
      login: '🌅',
      battle: '⚔️',
      quest: '📜',
      achievement: '🏆',
      reward: '🎁',
    }
    
    const colorMap = {
      login: 'default',
      battle: 'danger',
      quest: 'warning',
      achievement: 'success',
      reward: 'primary',
    } as const
    
    const items: TimelineItem[] = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      time: event.time,
      icon: iconMap[event.type],
      color: colorMap[event.type],
      completed: true,
    }))
    
    return <Timeline items={items} orientation="vertical" />
  },
}

// Milestone timeline for achievements
interface MilestoneTimelineProps {
  milestones: Array<{
    id: string
    value: number
    label: string
    reward?: string
    achieved: boolean
  }>
  currentValue: number
  maxValue: number
  className?: string
}

export function MilestoneTimeline({
  milestones,
  currentValue,
  maxValue,
  className,
}: MilestoneTimelineProps) {
  const percentage = (currentValue / maxValue) * 100

  return (
    <div className={cn('relative', className)}>
      {/* Progress bar */}
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      
      {/* Milestones */}
      <div className="relative mt-4">
        {milestones.map((milestone) => {
          const position = (milestone.value / maxValue) * 100
          
          return (
            <div
              key={milestone.id}
              className="absolute transform -translate-x-1/2"
              style={{ left: `${position}%` }}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border-2 -mt-3 transition-all duration-300',
                    milestone.achieved
                      ? 'bg-accent border-accent scale-125'
                      : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700'
                  )}
                />
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium whitespace-nowrap">
                    {milestone.label}
                  </p>
                  {milestone.reward && (
                    <p className="text-xs text-secondary">{milestone.reward}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}