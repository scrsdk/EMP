'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular' | 'rectangular' | 'rounded'
  animation?: 'pulse' | 'wave' | 'none'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  variant = 'default',
  animation = 'pulse',
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    default: 'rounded-md',
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  }
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700 relative overflow-hidden',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      {...props}
    >
      {animation === 'wave' && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
      )}
    </div>
  )
}

// Preset skeleton components
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  )
}

export function SkeletonAvatar({
  size = 'md',
  className,
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeClasses[size], className)}
    />
  )
}

export function SkeletonButton({
  size = 'md',
  fullWidth = false,
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  }

  return (
    <Skeleton
      variant="rounded"
      className={cn(
        !fullWidth && sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
    />
  )
}

export function SkeletonCard({
  showMedia = true,
  className,
}: {
  showMedia?: boolean
  className?: string
}) {
  return (
    <div className={cn('glass-card p-4 space-y-4', className)}>
      {showMedia && (
        <Skeleton
          variant="rounded"
          className="w-full h-48"
        />
      )}
      <div className="space-y-2">
        <Skeleton variant="text" width="60%" />
        <SkeletonText lines={2} />
      </div>
      <div className="flex gap-2">
        <SkeletonButton size="sm" />
        <SkeletonButton size="sm" />
      </div>
    </div>
  )
}

// Game-specific skeleton components
export const GameSkeleton = {
  PlayerCard: () => (
    <div className="flex items-center gap-3 p-4">
      <SkeletonAvatar size="lg" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="60%" height="14px" />
      </div>
      <Skeleton variant="rectangular" width="60px" height="24px" className="rounded-full" />
    </div>
  ),
  
  BuildingCard: () => (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="rounded" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" width="30%" height="14px" />
        </div>
      </div>
      <Skeleton variant="rectangular" width="100%" height="8px" className="rounded-full" />
      <div className="flex justify-between">
        <Skeleton variant="text" width="80px" height="14px" />
        <Skeleton variant="text" width="60px" height="14px" />
      </div>
    </div>
  ),
  
  ResourceBar: () => (
    <div className="flex items-center justify-between p-2">
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width="24px" height="24px" />
        <Skeleton variant="text" width="60px" />
      </div>
      <Skeleton variant="text" width="80px" />
    </div>
  ),
  
  BattleLog: () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 glass-card">
          <SkeletonAvatar size="sm" />
          <Skeleton variant="text" className="flex-1" />
          <Skeleton variant="text" width="60px" height="14px" />
        </div>
      ))}
    </div>
  ),
  
  GuildList: () => (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton variant="rounded" width="40px" height="40px" />
              <div className="space-y-2">
                <Skeleton variant="text" width="120px" />
                <Skeleton variant="text" width="80px" height="14px" />
              </div>
            </div>
            <SkeletonButton size="sm" />
          </div>
        </div>
      ))}
    </div>
  ),
}

// List skeleton with customizable item count
export function SkeletonList({
  count = 5,
  renderItem,
  className,
}: {
  count?: number
  renderItem?: (index: number) => React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          {renderItem ? renderItem(i) : (
            <div className="flex items-center gap-3 p-3">
              <SkeletonAvatar size="sm" />
              <SkeletonText lines={1} className="flex-1" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Grid skeleton
export function SkeletonGrid({
  count = 6,
  columns = 3,
  renderItem,
  className,
}: {
  count?: number
  columns?: number
  renderItem?: (index: number) => React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn('grid gap-4', className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          {renderItem ? renderItem(i) : <SkeletonCard />}
        </div>
      ))}
    </div>
  )
}

// Form skeleton
export function SkeletonForm({
  fields = 4,
  className,
}: {
  fields?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" width="30%" height="14px" />
          <Skeleton variant="rounded" width="100%" height="40px" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </div>
  )
}