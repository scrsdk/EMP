'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'

export interface SelectOption {
  value: string
  label: string
  icon?: ReactNode
  disabled?: boolean
  description?: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  hint?: string
  variant?: 'default' | 'filled' | 'outlined' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  searchable?: boolean
  clearable?: boolean
  multiple?: boolean
  className?: string
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Выберите опцию',
  label,
  error,
  hint,
  variant = 'default',
  size = 'md',
  fullWidth = true,
  disabled = false,
  searchable = false,
  clearable = false,
  multiple = false,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedValues, setSelectedValues] = useState<string[]>(
    multiple && value ? [value] : []
  )
  const selectRef = useRef<HTMLDivElement>(null)
  const { hapticFeedback } = useTelegram()
  
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options
  
  const selectedOption = options.find(opt => opt.value === value)
  
  const handleSelect = (optionValue: string) => {
    hapticFeedback?.impactOccurred('light')
    
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue]
      setSelectedValues(newValues)
      onChange?.(newValues.join(','))
    } else {
      onChange?.(optionValue)
      setIsOpen(false)
    }
  }
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    hapticFeedback?.impactOccurred('light')
    onChange?.('')
    setSelectedValues([])
  }
  
  const handleToggle = () => {
    if (!disabled) {
      hapticFeedback?.impactOccurred('light')
      setIsOpen(!isOpen)
      if (!isOpen && searchable) {
        setSearchQuery('')
      }
    }
  }
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg',
  }
  
  const variantClasses = {
    default: 'input-field',
    filled: 'bg-secondary border-transparent rounded-xl',
    outlined: 'bg-transparent border-2 rounded-xl',
    ghost: 'bg-transparent border-b-2 border-gray-300 dark:border-gray-700 rounded-none px-0',
  }

  return (
    <div 
      ref={selectRef}
      className={cn('relative', fullWidth && 'w-full', className)}
    >
      {label && (
        <label className={cn(
          'block text-sm font-medium mb-2 transition-colors duration-200',
          isOpen ? 'text-accent' : 'text-secondary',
          error && 'text-red-500'
        )}>
          {label}
        </label>
      )}
      
      {/* Select Trigger */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-4 transition-all duration-300',
          sizeClasses[size],
          variantClasses[variant],
          isOpen && 'ring-2 ring-accent/30 border-accent',
          error && 'border-red-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className={cn(
          'flex items-center gap-2 truncate',
          !selectedOption && !multiple && 'text-secondary'
        )}>
          {selectedOption?.icon && selectedOption.icon}
          {multiple 
            ? selectedValues.length > 0 
              ? `Выбрано: ${selectedValues.length}`
              : placeholder
            : selectedOption?.label || placeholder
          }
        </span>
        
        <div className="flex items-center gap-2">
          {clearable && (value || selectedValues.length > 0) && !disabled && (
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
          
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-5 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </button>
      
      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2"
          >
            <div className="glass-card max-h-60 overflow-hidden">
              {searchable && (
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск..."
                    className="w-full px-3 py-2 text-sm bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-accent/30"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              
              <div className="overflow-y-auto max-h-48">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const isSelected = multiple 
                      ? selectedValues.includes(option.value)
                      : option.value === value
                    
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        disabled={option.disabled}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200',
                          'hover:bg-secondary/50',
                          isSelected && 'bg-accent/10 text-accent',
                          option.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {multiple && (
                          <div className={cn(
                            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                            isSelected 
                              ? 'bg-accent border-accent' 
                              : 'border-gray-300 dark:border-gray-600'
                          )}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        )}
                        
                        {option.icon && (
                          <span className="flex-shrink-0">{option.icon}</span>
                        )}
                        
                        <div className="flex-1">
                          <div className="font-medium">{option.label}</div>
                          {option.description && (
                            <div className="text-sm text-secondary">{option.description}</div>
                          )}
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <div className="px-4 py-8 text-center text-secondary">
                    Ничего не найдено
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hint/Error Message */}
      {(hint || error) && (
        <p className={cn(
          'text-sm mt-2',
          error ? 'text-red-500' : 'text-secondary'
        )}>
          {error || hint}
        </p>
      )}
    </div>
  )
}

interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  variant?: 'default' | 'filled' | 'outlined' | 'ghost'
  inputSize?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function NativeSelect({
  label,
  error,
  hint,
  variant = 'default',
  inputSize = 'md',
  fullWidth = true,
  className,
  children,
  ...props
}: NativeSelectProps) {
  const sizeClasses = {
    sm: 'h-10 text-sm px-3',
    md: 'h-12 text-base px-4',
    lg: 'h-14 text-lg px-5',
  }
  
  const variantClasses = {
    default: 'input-field',
    filled: 'bg-secondary border-transparent rounded-xl',
    outlined: 'bg-transparent border-2 rounded-xl',
    ghost: 'bg-transparent border-b-2 border-gray-300 dark:border-gray-700 rounded-none px-0',
  }
  
  return (
    <div className={cn('relative', fullWidth && 'w-full', className)}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-secondary">
          {label}
        </label>
      )}
      
      <select
        className={cn(
          'w-full appearance-none transition-all duration-300 outline-none pr-10',
          sizeClasses[inputSize],
          variantClasses[variant],
          'focus:ring-2 focus:ring-accent/30 focus:border-accent',
          error && 'border-red-500',
          props.disabled && 'opacity-50 cursor-not-allowed'
        )}
        {...props}
      >
        {children}
      </select>
      
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {(hint || error) && (
        <p className={cn(
          'text-sm mt-2',
          error ? 'text-red-500' : 'text-secondary'
        )}>
          {error || hint}
        </p>
      )}
    </div>
  )
}