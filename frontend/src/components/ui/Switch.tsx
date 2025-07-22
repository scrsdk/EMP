'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
  label?: string
  labelPosition?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'danger' | 'premium'
  icon?: {
    on?: React.ReactNode
    off?: React.ReactNode
  }
  onChange?: (checked: boolean) => void
  onChangeEvent?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({
    label,
    labelPosition = 'right',
    size = 'md',
    variant = 'default',
    icon,
    className,
    checked,
    onChange,
    onChangeEvent,
    disabled,
    ...props
  }, ref) => {
    const { hapticFeedback } = useTelegram()
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      hapticFeedback?.impactOccurred('light')
      onChange?.(e.target.checked)
      onChangeEvent?.(e)
    }
    
    const sizeClasses = {
      sm: {
        switch: 'w-8 h-5',
        thumb: 'w-3 h-3',
        translate: 'translate-x-3',
        label: 'text-sm',
      },
      md: {
        switch: 'w-11 h-6',
        thumb: 'w-4 h-4',
        translate: 'translate-x-5',
        label: 'text-base',
      },
      lg: {
        switch: 'w-14 h-8',
        thumb: 'w-6 h-6',
        translate: 'translate-x-6',
        label: 'text-lg',
      },
    }
    
    const variantClasses = {
      default: 'bg-accent',
      success: 'bg-green-500',
      danger: 'bg-red-500',
      premium: 'bg-gradient-primary',
    }
    
    const config = sizeClasses[size]

    return (
      <label className={cn(
        'inline-flex items-center gap-3 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        labelPosition === 'left' && 'flex-row-reverse',
        className
      )}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            {...props}
          />
          
          <motion.div
            className={cn(
              'block rounded-full transition-colors duration-300',
              config.switch,
              checked ? variantClasses[variant] : 'bg-gray-300 dark:bg-gray-600'
            )}
            animate={{
              backgroundColor: checked 
                ? variant === 'premium' ? undefined : variantClasses[variant]
                : undefined
            }}
          >
            <motion.div
              className={cn(
                'absolute top-1 left-1 rounded-full bg-white shadow-lg flex items-center justify-center',
                config.thumb
              )}
              animate={{
                x: checked ? config.translate : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 700,
                damping: 30
              }}
            >
              {icon && (
                <span className="text-xs">
                  {checked ? icon.on : icon.off}
                </span>
              )}
            </motion.div>
          </motion.div>
        </div>
        
        {label && (
          <span className={cn(
            'font-medium select-none',
            config.label,
            disabled ? 'text-gray-400' : 'text-primary'
          )}>
            {label}
          </span>
        )}
      </label>
    )
  }
)

Switch.displayName = 'Switch'

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  icon?: React.ReactNode
  fullWidth?: boolean
  onChange?: (checked: boolean) => void
  onChangeEvent?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({
    label,
    size = 'md',
    variant = 'default',
    icon,
    fullWidth = false,
    className,
    checked,
    onChange,
    onChangeEvent,
    disabled,
    ...props
  }, ref) => {
    const { hapticFeedback } = useTelegram()
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      hapticFeedback?.impactOccurred('medium')
      onChange?.(e.target.checked)
      onChangeEvent?.(e)
    }
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    }
    
    const variantClasses = {
      default: cn(
        'bg-secondary hover:bg-secondary/80',
        checked && 'bg-accent text-white hover:bg-accent/90'
      ),
      filled: cn(
        'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
        checked && 'bg-accent text-white hover:bg-accent/90'
      ),
      outlined: cn(
        'border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
        checked && 'border-accent bg-accent/10 text-accent hover:bg-accent/20'
      ),
    }

    return (
      <label className={cn(
        'relative inline-block',
        fullWidth && 'w-full',
        className
      )}>
        <input
          ref={ref}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        
        <div className={cn(
          'flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 cursor-pointer',
          sizeClasses[size],
          variantClasses[variant],
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'active:scale-[0.97]'
        )}>
          {icon && <span>{icon}</span>}
          {label && <span>{label}</span>}
        </div>
      </label>
    )
  }
)

Toggle.displayName = 'Toggle'

interface ToggleGroupProps {
  options: Array<{
    value: string
    label: string
    icon?: React.ReactNode
  }>
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  multiple?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  fullWidth?: boolean
  className?: string
}

export function ToggleGroup({
  options,
  value,
  onChange,
  multiple = false,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  className,
}: ToggleGroupProps) {
  const handleToggle = (optionValue: string) => {
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
    <div className={cn(
      'inline-flex gap-2',
      fullWidth && 'w-full',
      variant === 'default' && 'glass-card p-1',
      className
    )}>
      {options.map((option) => (
        <Toggle
          key={option.value}
          label={option.label}
          icon={option.icon}
          size={size}
          variant={variant}
          checked={isSelected(option.value)}
          onChange={() => handleToggle(option.value)}
          fullWidth={fullWidth}
          className={fullWidth ? 'flex-1' : ''}
        />
      ))}
    </div>
  )
}