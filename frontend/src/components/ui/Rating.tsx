'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'

interface RatingProps {
  value?: number
  onChange?: (value: number) => void
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'star' | 'heart' | 'circle' | 'custom'
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  readonly?: boolean
  allowHalf?: boolean
  showValue?: boolean
  showTooltip?: boolean
  customIcon?: {
    filled: React.ReactNode
    empty: React.ReactNode
    half?: React.ReactNode
  }
  className?: string
}

export function Rating({
  value = 0,
  onChange,
  max = 5,
  size = 'md',
  variant = 'star',
  color = 'default',
  readonly = false,
  allowHalf = false,
  showValue = false,
  showTooltip = false,
  customIcon,
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const { hapticFeedback } = useTelegram()
  
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  }
  
  const colorClasses = {
    default: 'text-yellow-400',
    primary: 'text-accent',
    success: 'text-green-500',
    warning: 'text-orange-500',
    danger: 'text-red-500',
  }
  
  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      hapticFeedback?.impactOccurred('light')
      onChange(rating)
    }
  }
  
  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    if (readonly || !allowHalf) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    const rating = index + (percent > 0.5 ? 1 : 0.5)
    
    setHoverValue(rating)
    setHoveredIndex(index)
  }
  
  const handleMouseLeave = () => {
    setHoverValue(null)
    setHoveredIndex(null)
  }
  
  const currentValue = hoverValue !== null ? hoverValue : value
  
  const renderIcon = (index: number) => {
    const filled = index + 1 <= currentValue
    const halfFilled = allowHalf && index + 0.5 === currentValue
    
    if (variant === 'custom' && customIcon) {
      if (halfFilled && customIcon.half) {
        return customIcon.half
      }
      return filled ? customIcon.filled : customIcon.empty
    }
    
    switch (variant) {
      case 'heart':
        return (
          <svg
            className="w-full h-full"
            fill={filled || halfFilled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )
      
      case 'circle':
        return (
          <div
            className={cn(
              'w-full h-full rounded-full border-2',
              filled || halfFilled
                ? 'bg-current border-current'
                : 'border-current'
            )}
          />
        )
      
      default: // star
        if (halfFilled) {
          return (
            <svg className="w-full h-full" viewBox="0 0 24 24">
              <defs>
                <linearGradient id={`half-${index}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                fill={`url(#half-${index})`}
                stroke="currentColor"
                strokeWidth="1"
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          )
        }
        
        return (
          <svg
            className="w-full h-full"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        )
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex', readonly ? 'gap-1' : 'gap-2')}>
        {Array.from({ length: max }).map((_, index) => (
          <motion.button
            key={index}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(index + 1)}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onMouseEnter={() => !readonly && setHoveredIndex(index)}
            onMouseLeave={handleMouseLeave}
            whileHover={!readonly ? { scale: 1.1 } : undefined}
            whileTap={!readonly ? { scale: 0.9 } : undefined}
            className={cn(
              'relative transition-all duration-200',
              sizeClasses[size],
              colorClasses[color],
              !readonly && 'cursor-pointer',
              readonly && 'cursor-default'
            )}
          >
            {renderIcon(index)}
            
            {/* Tooltip */}
            {showTooltip && !readonly && hoveredIndex === index && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10"
              >
                {hoverValue || index + 1}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-gray-900" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
      
      {showValue && (
        <span className={cn(
          'font-medium text-secondary',
          size === 'xs' && 'text-xs',
          size === 'sm' && 'text-sm',
          size === 'lg' && 'text-lg',
          size === 'xl' && 'text-xl'
        )}>
          {currentValue.toFixed(allowHalf ? 1 : 0)}
        </span>
      )}
    </div>
  )
}

// Rating display component (non-interactive)
interface RatingDisplayProps {
  value: number
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showValue?: boolean
  showCount?: boolean
  count?: number
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

export function RatingDisplay({
  value,
  max = 5,
  size = 'sm',
  showValue = true,
  showCount = false,
  count,
  variant = 'default',
  className,
}: RatingDisplayProps) {
  const percentage = (value / max) * 100

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <svg
          className={cn(
            'text-yellow-400',
            size === 'xs' && 'w-3 h-3',
            size === 'sm' && 'w-4 h-4',
            size === 'md' && 'w-5 h-5',
            size === 'lg' && 'w-6 h-6'
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className={cn(
          'font-medium',
          size === 'xs' && 'text-xs',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg'
        )}>
          {value.toFixed(1)}
        </span>
        {showCount && count && (
          <span className="text-secondary text-sm">({count})</span>
        )}
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-2">
          <Rating value={value} max={max} size={size} readonly />
          {showValue && (
            <span className="font-medium text-lg">{value.toFixed(1)}</span>
          )}
        </div>
        {showCount && count && (
          <p className="text-sm text-secondary">{count} оценок</p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Rating value={value} max={max} size={size} readonly />
      {showValue && (
        <span className="text-secondary">{value.toFixed(1)}</span>
      )}
      {showCount && count && (
        <span className="text-secondary">({count})</span>
      )}
    </div>
  )
}

// Rating statistics component
interface RatingStatsProps {
  ratings: Array<{
    stars: number
    count: number
  }>
  totalCount: number
  averageRating: number
  className?: string
}

export function RatingStats({
  ratings,
  totalCount,
  averageRating,
  className,
}: RatingStatsProps) {
  const maxCount = Math.max(...ratings.map(r => r.count))

  return (
    <div className={cn('space-y-4', className)}>
      {/* Average rating */}
      <div className="text-center">
        <div className="text-4xl font-bold text-primary mb-1">
          {averageRating.toFixed(1)}
        </div>
        <RatingDisplay value={averageRating} showValue={false} size="md" />
        <p className="text-sm text-secondary mt-1">{totalCount} оценок</p>
      </div>
      
      {/* Rating distribution */}
      <div className="space-y-2">
        {ratings
          .sort((a, b) => b.stars - a.stars)
          .map((rating) => {
            const percentage = totalCount > 0 ? (rating.count / totalCount) * 100 : 0
            const barWidth = maxCount > 0 ? (rating.count / maxCount) * 100 : 0
            
            return (
              <div key={rating.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{rating.stars}</span>
                  <svg
                    className="w-3 h-3 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-yellow-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.5, delay: rating.stars * 0.1 }}
                  />
                </div>
                
                <div className="text-sm text-secondary w-16 text-right">
                  {percentage.toFixed(0)}%
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

// Game-specific rating components
export const GameRating = {
  PlayerSkill: ({ level }: { level: number }) => (
    <RatingDisplay
      value={level}
      max={5}
      variant="compact"
      showValue={false}
    />
  ),
  
  ItemRarity: ({ rarity }: { rarity: 'common' | 'rare' | 'epic' | 'legendary' }) => {
    const rarityMap = {
      common: { value: 1, color: 'default' },
      rare: { value: 2, color: 'primary' },
      epic: { value: 3, color: 'primary' },
      legendary: { value: 5, color: 'warning' },
    } as const
    
    const config = rarityMap[rarity]
    
    return (
      <Rating
        value={config.value}
        max={5}
        size="xs"
        color={config.color}
        readonly
        variant="star"
      />
    )
  },
  
  BattlePower: ({ power, maxPower = 1000 }: { power: number; maxPower?: number }) => {
    const stars = Math.ceil((power / maxPower) * 5)
    
    return (
      <div className="flex items-center gap-2">
        <Rating
          value={stars}
          max={5}
          size="sm"
          color="danger"
          readonly
          customIcon={{
            filled: '⚔️',
            empty: '🛡️',
          }}
        />
        <span className="text-sm font-medium">{power}</span>
      </div>
    )
  },
}