'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion' // Импортируем HTMLMotionProps
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'info' | 'warning' | 'danger' | 'premium' | 'glass'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  animated?: boolean
  pulse?: boolean
  icon?: React.ReactNode
  closable?: boolean
  onClose?: () => void
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({
    className,
    variant = 'default',
    size = 'sm',
    animated = false,
    pulse = false,
    icon,
    closable = false,
    onClose,
    children,
    ...props
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200'

    const variants = {
      default: 'bg-surface/10 text-tg-text backdrop-blur-sm border border-surface/20',
      success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      info: 'bg-empire-mystic/10 text-empire-mystic dark:text-empire-mystic-light border border-empire-mystic/20',
      warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
      premium: 'bg-gradient-gold text-empire-gold-dark shadow-glow-sm',
      glass: 'glass-card text-tg-text',
    }

    const sizes = {
      xs: 'text-[10px] px-2 py-0.5 gap-1',
      sm: 'text-xs px-2.5 py-1 gap-1.5',
      md: 'text-sm px-3 py-1.5 gap-2',
      lg: 'text-base px-4 py-2 gap-2',
    }

    // Указываем, что Component является motion.div, если animated = true
    const Component = animated ? motion.div : 'div'

    // Собираем пропсы, которые будут переданы motion.div
    const motionProps: HTMLMotionProps<'div'> = animated ? {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0, opacity: 0 },
      transition: { type: 'spring', stiffness: 500, damping: 25 }
    } : {};

    // Фильтруем пропсы, чтобы убрать те, которые не нужны для motion.div
    const {
      onAnimationStart,
      onAnimationEnd,
      onAnimationIteration,
      ...restPropsWithoutAnimationEvents
    } = props;

    return (
      <Component
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          pulse && 'animate-pulse',
          className
        )}
        {...motionProps} // Передаем motion props
        {...restPropsWithoutAnimationEvents} // Передаем остальные пропсы
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
        {closable && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose?.()
            }}
            className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-surface/20 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </Component>
    )
  }
)



Badge.displayName = 'Badge'

// Specialized badges
export const GameBadge = {
  Level: ({ level, size = 'sm' }: { level: number; size?: BadgeProps['size'] }) => (
    <Badge variant="premium" size={size} icon="⭐">
      Ур. {level}
    </Badge>
  ),
  
  Rank: ({ rank, icon }: { rank: string; icon?: string }) => (
    <Badge variant="info" icon={icon}>
      {rank}
    </Badge>
  ),
  
  Status: ({ status }: { status: 'online' | 'offline' | 'busy' | 'away' }) => {
    const configs = {
      online: { variant: 'success' as const, icon: '🟢', text: 'В сети' },
      offline: { variant: 'default' as const, icon: '⚫', text: 'Не в сети' },
      busy: { variant: 'danger' as const, icon: '🔴', text: 'Занят' },
      away: { variant: 'warning' as const, icon: '🟡', text: 'Отошел' },
    }
    
    const config = configs[status]
    
    return (
      <Badge variant={config.variant} size="xs" icon={config.icon}>
        {config.text}
      </Badge>
    )
  },
  
  Rarity: ({ rarity }: { rarity: 'common' | 'rare' | 'epic' | 'legendary' }) => {
    const configs = {
      common: { variant: 'default' as const, text: 'Обычный' },
      rare: { variant: 'info' as const, text: 'Редкий' },
      epic: { variant: 'premium' as const, text: 'Эпический' },
      legendary: { variant: 'premium' as const, text: 'Легендарный', className: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
    }
    
    const config = configs[rarity]
    
    return (
      <Badge 
        variant={config.variant} 
        size="sm" 
        className={config.className}
        animated
      >
        {config.text}
      </Badge>
    )
  },
  
  Resource: ({ type, amount }: { type: 'gold' | 'wood' | 'stone' | 'food' | 'energy'; amount: number }) => {
    const configs = {
      gold: { icon: '💰', color: 'text-yellow-500' },
      wood: { icon: '🪵', color: 'text-amber-600' },
      stone: { icon: '⛰️', color: 'text-gray-500' },
      food: { icon: '🌾', color: 'text-green-500' },
      energy: { icon: '⚡', color: 'text-purple-500' },
    }
    
    const config = configs[type]
    
    return (
      <Badge variant="glass" size="sm" className={config.color}>
        <span>{config.icon}</span>
        <span className="font-bold">{formatNumber(amount)}</span>
      </Badge>
    )
  },
}