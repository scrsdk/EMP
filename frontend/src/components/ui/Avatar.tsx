'use client'

import { useState, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'circle' | 'rounded' | 'square'
  status?: 'online' | 'offline' | 'away' | 'busy'
  statusPosition?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
  border?: boolean
  borderColor?: string
  badge?: ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

export function Avatar({
  src,
  alt,
  name,
  fallback,
  size = 'md',
  variant = 'circle',
  status,
  statusPosition = 'bottom-right',
  border = false,
  borderColor = 'border-white dark:border-gray-900',
  badge,
  onClick,
  className,
  style,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }
  
  const statusSizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  }
  
  const variantClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-xl',
    square: 'rounded-none',
  }
  
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  }
  
  const statusPositions = {
    'top-right': 'top-0 right-0',
    'bottom-right': 'bottom-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-left': 'bottom-0 left-0',
  }
  
  const getInitials = (name: string) => {
    const words = name.trim().split(' ')
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase()
    }
    return words.slice(0, 2).map(word => word[0]).join('').toUpperCase()
  }
  
  const getBackgroundColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-orange-500',
    ]
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <div className={cn('relative inline-block', className)} style={style}>
      <motion.div
        whileHover={onClick ? { scale: 1.05 } : undefined}
        whileTap={onClick ? { scale: 0.95 } : undefined}
        className={cn(
          'relative overflow-hidden bg-gray-200 dark:bg-gray-700',
          sizeClasses[size],
          variantClasses[variant],
          border && `ring-2 ${borderColor}`,
          onClick && 'cursor-pointer',
        )}
        onClick={onClick}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : fallback ? (
          <div className={cn(
            'w-full h-full flex items-center justify-center font-semibold text-white',
            getBackgroundColor(fallback)
          )}>
            {fallback}
          </div>
        ) : name ? (
          <div className={cn(
            'w-full h-full flex items-center justify-center font-semibold text-white',
            getBackgroundColor(name)
          )}>
            {getInitials(name)}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-3/4 h-3/4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </motion.div>
      
      {/* Status indicator */}
      {status && (
        <span
          className={cn(
            'absolute block rounded-full ring-2 ring-white dark:ring-gray-900',
            statusSizeClasses[size],
            statusColors[status],
            statusPositions[statusPosition]
          )}
        />
      )}
      
      {/* Badge */}
      {badge && (
        <div className="absolute -top-1 -right-1">
          {badge}
        </div>
      )}
    </div>
  )
}

interface AvatarGroupProps {
  avatars: Array<{
    src?: string
    name?: string
    alt?: string
  }>
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'circle' | 'rounded' | 'square'
  spacing?: 'tight' | 'normal' | 'loose'
  className?: string
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
  variant = 'circle',
  spacing = 'normal',
  className,
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max
  
  const spacingClasses = {
    tight: '-space-x-3',
    normal: '-space-x-2',
    loose: '-space-x-1',
  }

  return (
    <div className={cn('flex items-center', spacingClasses[spacing], className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          variant={variant}
          border
          className="relative z-0 hover:z-10 transition-all"
          style={{ zIndex: visibleAvatars.length - index }}
        />
      ))}
      
      {remainingCount > 0 && (
        <div
          className={cn(
            'relative flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold ring-2 ring-white dark:ring-gray-900',
            sizeClasses[size],
            variantClasses[variant]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

// Game-specific avatar variations
export const GameAvatar = {
  Player: ({ player, size = 'md', showLevel = true }: {
    player: {
      name: string
      avatar?: string
      level?: number
      isOnline?: boolean
    }
    size?: AvatarProps['size']
    showLevel?: boolean
  }) => (
    <div className="flex items-center gap-3">
      <Avatar
        src={player.avatar}
        name={player.name}
        size={size}
        status={player.isOnline ? 'online' : 'offline'}
      />
      <div className="flex flex-col">
        <span className="font-medium text-primary">{player.name}</span>
        {showLevel && player.level && (
          <span className="text-xs text-secondary">Уровень {player.level}</span>
        )}
      </div>
    </div>
  ),
  
  Guild: ({ guild, size = 'lg' }: {
    guild: {
      name: string
      logo?: string
      memberCount?: number
    }
    size?: AvatarProps['size']
  }) => (
    <div className="flex items-center gap-3">
      <Avatar
        src={guild.logo}
        name={guild.name}
        size={size}
        variant="rounded"
        border
      />
      <div className="flex flex-col">
        <span className="font-bold text-primary">{guild.name}</span>
        {guild.memberCount && (
          <span className="text-sm text-secondary">{guild.memberCount} участников</span>
        )}
      </div>
    </div>
  ),
  
  Building: ({ building, size = 'md' }: {
    building: {
      name: string
      icon: string
      level?: number
    }
    size?: AvatarProps['size']
  }) => (
    <div className="relative">
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg',
          sizeClasses[size]
        )}
      >
        <span className="text-2xl">{building.icon}</span>
      </div>
      {building.level && (
        <span className="absolute -bottom-1 -right-1 bg-accent text-white text-xs font-bold px-1.5 rounded-full">
          {building.level}
        </span>
      )}
    </div>
  ),
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20',
}

const variantClasses = {
  circle: 'rounded-full',
  rounded: 'rounded-xl',
  square: 'rounded-none',
}