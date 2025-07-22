'use client'

import { InputHTMLAttributes, forwardRef, useState, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  variant?: 'default' | 'filled' | 'outlined' | 'ghost'
  inputSize?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  clearable?: boolean
  onClear?: () => void
  suffix?: ReactNode
  prefix?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    hint,
    icon,
    iconPosition = 'left',
    variant = 'default',
    inputSize = 'md',
    fullWidth = true,
    clearable = false,
    onClear,
    suffix,
    prefix,
    className,
    onFocus,
    onBlur,
    disabled,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue)
    const { hapticFeedback } = useTelegram()
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      hapticFeedback?.impactOccurred('light')
      onFocus?.(e)
    }
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value)
      props.onChange?.(e)
    }
    
    const handleClear = () => {
      hapticFeedback?.impactOccurred('light')
      onClear?.()
    }
    
    const sizeClasses = {
      sm: 'h-10 text-sm',
      md: 'h-12 text-base',
      lg: 'h-14 text-lg',
    }
    
    const paddingClasses = {
      sm: {
        default: 'px-3',
        withIcon: 'pl-9 pr-3',
        withPrefix: 'pl-9 pr-3',
        withSuffix: 'pl-3 pr-9',
      },
      md: {
        default: 'px-4',
        withIcon: 'pl-11 pr-4',
        withPrefix: 'pl-11 pr-4',
        withSuffix: 'pl-4 pr-11',
      },
      lg: {
        default: 'px-5',
        withIcon: 'pl-13 pr-5',
        withPrefix: 'pl-13 pr-5',
        withSuffix: 'pl-5 pr-13',
      },
    }
    
    const variantClasses = {
      default: cn(
        'input-field',
        isFocused && 'ring-2 ring-accent/30 border-accent',
        error && 'border-red-500 focus:ring-red-500/30'
      ),
      filled: cn(
        'bg-secondary border-transparent rounded-xl transition-all duration-300',
        isFocused && 'ring-2 ring-accent/30 bg-secondary/70',
        error && 'ring-2 ring-red-500/30'
      ),
      outlined: cn(
        'bg-transparent border-2 rounded-xl transition-all duration-300',
        isFocused && 'border-accent',
        error && 'border-red-500'
      ),
      ghost: cn(
        'bg-transparent border-b-2 border-gray-300 dark:border-gray-700 rounded-none px-0 transition-all duration-300',
        isFocused && 'border-accent',
        error && 'border-red-500'
      ),
    }
    
    const getPadding = () => {
      if ((icon && iconPosition === 'left') || prefix) {
        return paddingClasses[inputSize].withPrefix
      }
      if ((icon && iconPosition === 'right') || suffix || clearable) {
        return paddingClasses[inputSize].withSuffix
      }
      return paddingClasses[inputSize].default
    }

    return (
      <div className={cn('relative', fullWidth && 'w-full', className)}>
        {label && (
          <motion.label 
            className={cn(
              'block text-sm font-medium mb-2 transition-colors duration-200',
              isFocused ? 'text-accent' : 'text-secondary',
              error && 'text-red-500'
            )}
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative">
          {/* Prefix/Left Icon */}
          {(prefix || (icon && iconPosition === 'left')) && (
            <div className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 text-secondary',
              isFocused && 'text-accent',
              inputSize === 'sm' && 'text-sm',
              inputSize === 'lg' && 'text-lg'
            )}>
              {prefix || icon}
            </div>
          )}
          
          {/* Input Field */}
          <input
            ref={ref}
            className={cn(
              'w-full transition-all duration-300 outline-none',
              sizeClasses[inputSize],
              variantClasses[variant],
              getPadding(),
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            disabled={disabled}
            {...props}
          />
          
          {/* Suffix/Right Icon/Clear Button */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {clearable && hasValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-secondary hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {suffix}
            {icon && iconPosition === 'right' && (
              <span className={cn(
                'text-secondary',
                isFocused && 'text-accent',
                inputSize === 'sm' && 'text-sm',
                inputSize === 'lg' && 'text-lg'
              )}>
                {icon}
              </span>
            )}
          </div>
        </div>
        
        {/* Hint/Error Message */}
        {(hint || error) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'text-sm mt-2',
              error ? 'text-red-500' : 'text-secondary'
            )}
          >
            {error || hint}
          </motion.p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface SearchInputProps extends Omit<InputProps, 'type' | 'icon'> {
  onSearch?: (value: string) => void
  searching?: boolean
}

export function SearchInput({
  onSearch,
  searching = false,
  ...props
}: SearchInputProps) {
  const [value, setValue] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(value)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(value)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        icon={
          searching ? (
            <div className="animate-spin">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )
        }
        clearable
        onClear={() => setValue('')}
        {...props}
      />
    </form>
  )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  variant?: 'default' | 'filled' | 'outlined' | 'ghost'
  inputSize?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  maxLength?: number
  showCount?: boolean
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({
    label,
    error,
    hint,
    variant = 'default',
    inputSize = 'md',
    fullWidth = true,
    maxLength,
    showCount = false,
    className,
    onFocus,
    onBlur,
    onChange,
    value,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [charCount, setCharCount] = useState(value?.toString().length || 0)
    const { hapticFeedback } = useTelegram()
    
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true)
      hapticFeedback?.impactOccurred('light')
      onFocus?.(e)
    }
    
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }
    
    const sizeClasses = {
      sm: 'text-sm p-3',
      md: 'text-base p-4',
      lg: 'text-lg p-5',
    }
    
    return (
      <div className={cn('relative', fullWidth && 'w-full', className)}>
        {label && (
          <label className={cn(
            'block text-sm font-medium mb-2 transition-colors duration-200',
            isFocused ? 'text-accent' : 'text-secondary',
            error && 'text-red-500'
          )}>
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={cn(
            'w-full min-h-[100px] resize-y transition-all duration-300 outline-none rounded-xl',
            sizeClasses[inputSize],
            variant === 'default' && 'input-field',
            variant === 'filled' && 'bg-secondary border-transparent',
            variant === 'outlined' && 'bg-transparent border-2',
            variant === 'ghost' && 'bg-transparent border-b-2 rounded-none px-0',
            isFocused && 'ring-2 ring-accent/30 border-accent',
            error && 'border-red-500 focus:ring-red-500/30'
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        
        <div className="flex justify-between items-center mt-2">
          {(hint || error) && (
            <p className={cn(
              'text-sm',
              error ? 'text-red-500' : 'text-secondary'
            )}>
              {error || hint}
            </p>
          )}
          
          {showCount && maxLength && (
            <span className={cn(
              'text-sm',
              charCount > maxLength * 0.9 ? 'text-warning' : 'text-secondary'
            )}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'