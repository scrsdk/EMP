'use client'

import { ReactNode, HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'
import { formatNumber } from '@/lib/format'

interface ChipProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'ghost' | 'gradient'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  onClose?: () => void
  clickable?: boolean
  selected?: boolean
  disabled?: boolean
  children: ReactNode
}

export function Chip({
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  onClose,
  clickable = false,
  selected = false,
  disabled = false,
  className,
  onClick,
  children,
  ...props
}: ChipProps) {
  const { hapticFeedback } = useTelegram()
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    hapticFeedback?.impactOccurred('light')
    onClick?.(e)
  }
  
  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    hapticFeedback?.impactOccurred('light')
    onClose?.()
  }
  
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs gap-1',
    sm: 'px-2.5 py-1 text-sm gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2',
  }
  
  const variantClasses = {
    default: cn(
      'bg-secondary text-primary',
      selected && 'ring-2 ring-accent'
    ),
    primary: cn(
      'bg-accent text-white',
      selected && 'ring-2 ring-accent/50'
    ),
    success: cn(
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      selected && 'ring-2 ring-green-500'
    ),
    warning: cn(
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      selected && 'ring-2 ring-yellow-500'
    ),
    danger: cn(
      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      selected && 'ring-2 ring-red-500'
    ),
    ghost: cn(
      'bg-transparent border border-gray-300 dark:border-gray-600',
      selected && 'border-accent bg-accent/10'
    ),
    gradient: cn(
      'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      selected && 'ring-2 ring-purple-500/50'
    ),
  }
  
  const isInteractive = clickable || onClick

  return (
    <motion.div
      whileHover={isInteractive && !disabled ? { scale: 1.05 } : undefined}
      whileTap={isInteractive && !disabled ? { scale: 0.95 } : undefined}
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all duration-200',
        sizeClasses[size],
        variantClasses[variant],
        isInteractive && !disabled && 'cursor-pointer hover:shadow-md',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={isInteractive ? handleClick : undefined}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      
      <span>{children}</span>
      
      {icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      
      {onClose && (
        <button
          onClick={handleClose}
          className={cn(
            'flex-shrink-0 ml-1 -mr-1 rounded-full p-0.5 transition-colors',
            'hover:bg-black/10 dark:hover:bg-white/10',
            disabled && 'pointer-events-none'
          )}
        >
          <svg
            className={cn(
              'w-3 h-3',
              size === 'xs' && 'w-2.5 h-2.5',
              size === 'lg' && 'w-4 h-4'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </motion.div>
  )
}

interface ChipGroupProps {
  children: ReactNode
  spacing?: 'tight' | 'normal' | 'loose'
  wrap?: boolean
  className?: string
}

export function ChipGroup({
  children,
  spacing = 'normal',
  wrap = true,
  className,
}: ChipGroupProps) {
  const spacingClasses = {
    tight: 'gap-1',
    normal: 'gap-2',
    loose: 'gap-3',
  }

  return (
    <div
      className={cn(
        'flex items-center',
        spacingClasses[spacing],
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  )
}

// Pre-styled chip variations
export const StyledChip = {
  Status: ({ status }: { status: 'online' | 'offline' | 'away' | 'busy' }) => {
    const configs = {
      online: { variant: 'success' as const, icon: '🟢', label: 'Онлайн' },
      offline: { variant: 'default' as const, icon: '⚫', label: 'Оффлайн' },
      away: { variant: 'warning' as const, icon: '🟡', label: 'Отошел' },
      busy: { variant: 'danger' as const, icon: '🔴', label: 'Занят' },
    }
    
    const config = configs[status]
    
    return (
      <Chip variant={config.variant} size="sm" icon={config.icon}>
        {config.label}
      </Chip>
    )
  },
  
  Level: ({ level }: { level: number }) => (
    <Chip
      variant="gradient"
      size="sm"
      icon="⭐"
    >
      Ур. {level}
    </Chip>
  ),
  
  Resource: ({ type, amount }: { type: string; amount: number }) => {
    const icons: Record<string, string> = {
      gold: '💰',
      energy: '⚡',
      gems: '💎',
      wood: '🪵',
      stone: '🪨',
      food: '🍖',
    }
    
    return (
      <Chip
        variant="ghost"
        size="sm"
        icon={icons[type] || '📦'}
      >
        {formatNumber(amount)}
      </Chip>
    )
  },
  
  Tag: ({ tag, onRemove }: { tag: string; onRemove?: () => void }) => (
    <Chip
      variant="default"
      size="sm"
      onClose={onRemove}
    >
      {tag}
    </Chip>
  ),
  
  Filter: ({ label, active, onClick }: {
    label: string
    active: boolean
    onClick: () => void
  }) => (
    <Chip
      variant={active ? 'primary' : 'ghost'}
      size="md"
      clickable
      selected={active}
      onClick={onClick}
    >
      {label}
    </Chip>
  ),
}

// Game-specific chip collections
export const GameChips = {
  BattleResult: ({ result }: { result: 'victory' | 'defeat' | 'draw' }) => {
    const configs = {
      victory: { variant: 'success' as const, icon: '🏆', label: 'Победа' },
      defeat: { variant: 'danger' as const, icon: '💀', label: 'Поражение' },
      draw: { variant: 'warning' as const, icon: '🤝', label: 'Ничья' },
    }
    
    const config = configs[result]
    
    return (
      <Chip variant={config.variant} icon={config.icon}>
        {config.label}
      </Chip>
    )
  },
  
  BuildingType: ({ type }: { type: string }) => {
    const types: Record<string, { icon: string; label: string }> = {
      production: { icon: '🏭', label: 'Производство' },
      military: { icon: '⚔️', label: 'Военное' },
      defense: { icon: '🛡️', label: 'Защита' },
      storage: { icon: '🏪', label: 'Хранилище' },
      special: { icon: '✨', label: 'Особое' },
    }
    
    const config = types[type] || { icon: '🏛️', label: type }
    
    return (
      <Chip variant="ghost" size="sm" icon={config.icon}>
        {config.label}
      </Chip>
    )
  },
  
  QuestDifficulty: ({ difficulty }: {
    difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
  }) => {
    const configs = {
      easy: { variant: 'success' as const, label: 'Легкий' },
      medium: { variant: 'warning' as const, label: 'Средний' },
      hard: { variant: 'danger' as const, label: 'Сложный' },
      legendary: { variant: 'gradient' as const, label: 'Легендарный' },
    }
    
    const config = configs[difficulty]
    
    return (
      <Chip variant={config.variant} size="sm">
        {config.label}
      </Chip>
    )
  },
}

// Selectable chip group
interface SelectableChipGroupProps {
  options: Array<{
    value: string
    label: string
    icon?: ReactNode
  }>
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  multiple?: boolean
  variant?: ChipProps['variant']
  size?: ChipProps['size']
  className?: string
}

export function SelectableChipGroup({
  options,
  value,
  onChange,
  multiple = false,
  variant = 'ghost',
  size = 'md',
  className,
}: SelectableChipGroupProps) {
  const handleSelect = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue]
      onChange?.(newValue)
    } else {
      onChange?.(optionValue === value ? '' : optionValue)
    }
  }
  
  const isSelected = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue)
    }
    return optionValue === value
  }

  return (
    <ChipGroup className={className}>
      {options.map(option => (
        <Chip
          key={option.value}
          variant={variant}
          size={size}
          icon={option.icon}
          clickable
          selected={isSelected(option.value)}
          onClick={() => handleSelect(option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </ChipGroup>
  )
}