'use client'

import { ReactNode, HTMLAttributes, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'
import { formatNumber } from '@/lib/format'

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: 'glass' | 'solid' | 'gradient' | 'outlined' | 'elevated' | 'premium'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
  haptic?: boolean
  glowOnHover?: boolean
  children: ReactNode
}

export function Card({
  variant = 'glass',
  padding = 'md',
  interactive = false,
  haptic = true,
  glowOnHover = false,
  className,
  onClick,
  children,
  ...props
}: CardProps) {
  const { hapticFeedback } = useTelegram()
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive && haptic && hapticFeedback) {
      hapticFeedback.impactOccurred('light')
    }
    onClick?.(e)
  }
  
  const baseStyles = 'relative rounded-2xl transition-all duration-300'
  
  const variantClasses = {
    glass: 'glass-card',
    solid: 'bg-surface/80 backdrop-blur-xl border border-surface/10',
    gradient: 'bg-gradient-empire text-white shadow-glow',
    outlined: 'border-2 border-empire-royal/20 bg-transparent',
    elevated: 'bg-surface shadow-elevation-2 hover:shadow-elevation-3',
    premium: 'premium-card',
  }
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }
  
  return (
    <motion.div
      className={cn(
        baseStyles,
        variantClasses[variant],
        paddingClasses[padding],
        interactive && 'cursor-pointer active:scale-[0.98]',
        glowOnHover && 'hover:shadow-glow',
        className
      )}
      onClick={handleClick}
      whileHover={interactive ? { scale: 1.02, y: -2 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {/* Gradient mesh background for glass variant */}
      {variant === 'glass' && (
        <div className="absolute inset-0 rounded-2xl opacity-30 -z-10 bg-gradient-mesh pointer-events-none" />
      )}
      
      {/* Glow effect on hover */}
      {glowOnHover && (
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 -z-10 pointer-events-none"
          whileHover={{ opacity: 0.5 }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-empire blur-xl" />
        </motion.div>
      )}
      
      {children}
    </motion.div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  action?: ReactNode
  avatar?: ReactNode
  bordered?: boolean
}

export function CardHeader({
  title,
  subtitle,
  action,
  avatar,
  bordered = true,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between",
        bordered && "pb-4 mb-4 border-b border-surface/10",
        className
      )} 
      {...props}
    >
      <div className="flex items-center gap-3">
        {avatar && avatar}
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          {subtitle && (
            <p className="text-sm text-tg-hint opacity-80">{subtitle}</p>
          )}
        </div>
      </div>
      {action && action}
    </div>
  )
}

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  )
)

CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-tg-hint opacity-80', className)}
      {...props}
    />
  )
)

CardDescription.displayName = 'CardDescription'

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  noPadding?: boolean
}

export function CardContent({ className, children, noPadding, ...props }: CardContentProps) {
  return (
    <div className={cn(!noPadding && "px-6 py-4", className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'actions' | 'centered'
}

export function CardFooter({ 
  children, 
  variant = 'default',
  className,
  ...props 
}: CardFooterProps) {
  const variantClasses = {
    default: '',
    actions: 'flex items-center justify-end gap-3',
    centered: 'flex items-center justify-center',
  }
  
  return (
    <div 
      className={cn(
        "pt-4 mt-4 border-t border-surface/10",
        variantClasses[variant],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

// Specialized game cards
export const GameCard = {
  Resource: ({ resource, amount, production, icon, onClick, className }: {
    resource: string
    amount: number
    production?: number
    icon: string
    onClick?: () => void
    className?: string
  }) => (
    <Card
      variant="glass"
      interactive
      onClick={onClick}
      padding="sm"
      className={cn("text-center", className)}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="text-3xl mb-2 filter drop-shadow-md">{icon}</div>
        <div className="font-bold text-lg">{formatNumber(amount)}</div>
        <div className="text-xs text-tg-hint">{resource}</div>
        {production && (
          <div className="text-xs text-success mt-1">
            +{production}/час
          </div>
        )}
      </motion.div>
    </Card>
  ),
  
  Building: ({ name, level, icon, isUpgrading, onClick }: {
    name: string
    level: number
    icon: string
    isUpgrading?: boolean
    onClick?: () => void
  }) => (
    <Card
      variant="glass"
      interactive
      onClick={onClick}
      padding="sm"
      className="aspect-square flex flex-col items-center justify-center relative overflow-hidden"
      glowOnHover
    >
      {isUpgrading && (
        <div className="absolute inset-0 bg-gradient-empire/20 animate-pulse" />
      )}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-3xl mb-2"
      >
        {icon}
      </motion.div>
      <div className="text-xs font-medium">{name}</div>
      <div className="mt-1 px-2 py-0.5 bg-gradient-empire text-white text-xs rounded-full font-bold">
        Ур. {level}
      </div>
    </Card>
  ),
  
  Hero: ({ name, level, power, avatar, rarity, onClick }: {
    name: string
    level: number
    power: number
    avatar: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    onClick?: () => void
  }) => {
    const rarityColors = {
      common: 'from-gray-400 to-gray-500',
      rare: 'from-blue-400 to-blue-500',
      epic: 'from-purple-400 to-purple-500',
      legendary: 'from-yellow-400 to-yellow-500',
    }
    
    return (
      <Card
        variant="glass"
        interactive
        onClick={onClick}
        padding="none"
        className="overflow-hidden"
      >
        <div className={cn(
          "h-32 bg-gradient-to-br flex items-center justify-center text-5xl",
          rarityColors[rarity]
        )}>
          {avatar}
        </div>
        <div className="p-3">
          <h4 className="font-semibold">{name}</h4>
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-tg-hint">Уровень {level}</span>
            <span className="font-bold">⚔️ {power}</span>
          </div>
        </div>
      </Card>
    )
  },
  
  Achievement: ({ title, description, progress, maxProgress, icon, unlocked }: {
    title: string
    description: string
    progress: number
    maxProgress: number
    icon: string
    unlocked: boolean
  }) => (
    <Card 
      variant={unlocked ? 'gradient' : 'outlined'} 
      className={cn(
        'transition-all duration-500',
        !unlocked && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        <motion.div 
          className="text-2xl"
          animate={unlocked ? { 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          } : {}}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-xs opacity-80 mt-1">{description}</p>
          {!unlocked && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Прогресс</span>
                <span>{progress}/{maxProgress}</span>
              </div>
              <div className="h-1.5 bg-surface/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-empire rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress / maxProgress) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  ),
}