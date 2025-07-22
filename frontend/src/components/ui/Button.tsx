import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'

// Exclude all conflicting props between HTML and Framer Motion
type ButtonHTMLProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 
  // Animation events
  'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' |
  // Drag events that conflict with Framer Motion
  'onDragStart' | 'onDrag' | 'onDragEnd' |
  // Other potentially conflicting events
  'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop'
>

// Combine cleaned HTML props with custom props
interface ButtonProps extends ButtonHTMLProps {
  variant?: 'empire' | 'glass' | 'gold' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'mystic'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  haptic?: 'light' | 'medium' | 'heavy'
  ripple?: boolean
  glow?: boolean
  // Allow Framer Motion props to be passed through
  motionProps?: Omit<MotionProps, 'children'>
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'empire', 
    size = 'md', 
    isLoading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    haptic = 'light',
    ripple = true,
    glow = true,
    children,
    disabled,
    onClick,
    motionProps,
    ...htmlProps 
  }, ref) => {
    const { hapticFeedback } = useTelegram()
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !isLoading && hapticFeedback) {
        hapticFeedback.impactOccurred(haptic)
      }
      onClick?.(e)
    }
    
    const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-empire-royal/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden'
    
    const variants = {
      empire: 'btn-empire',
      glass: 'btn-glass',
      gold: 'btn-gold',
      primary: 'bg-gradient-empire text-white shadow-glow hover:shadow-glow-lg',
      secondary: 'bg-surface/10 backdrop-blur-xl border border-surface/10 hover:bg-surface/20',
      outline: 'border-2 border-empire-royal/30 hover:border-empire-royal/50 hover:bg-empire-royal/5',
      ghost: 'hover:bg-surface/10',
      danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg',
      success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md hover:shadow-lg',
      mystic: 'bg-gradient-mystic text-white shadow-md hover:shadow-lg',
    }
    
    const sizes = {
      sm: 'h-9 px-4 text-xs rounded-lg',
      md: 'h-11 px-5 text-sm rounded-xl',
      lg: 'h-12 px-6 text-base rounded-xl',
      xl: 'h-14 px-8 text-lg rounded-2xl',
      icon: 'h-11 w-11 rounded-xl p-0',
    }

    const showGlow = glow && (variant === 'empire' || variant === 'primary' || variant === 'gold' || variant === 'mystic')
    
    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        onClick={handleClick}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        {...htmlProps}
        {...motionProps}
      >
        {/* Glow effect */}
        {showGlow && !disabled && (
          <motion.span 
            className="absolute inset-0 -z-10 rounded-inherit"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="absolute inset-0 rounded-inherit bg-current opacity-20 blur-xl" />
          </motion.span>
        )}
        
        {/* Ripple effect */}
        {ripple && !disabled && (
          <span className="absolute inset-0 pointer-events-none">
            <motion.span
              className="absolute inset-0 rounded-inherit bg-white/20"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1, opacity: 0 }}
              transition={{ duration: 0.5 }}
              key={Date.now()}
            />
          </span>
        )}
        
        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
            <>
              {icon && iconPosition === 'left' && icon}
              {children && <span>{children}</span>}
              {icon && iconPosition === 'right' && icon}
            </>
          )}
        </span>
        
        {/* Shine effect for premium buttons */}
        {variant === 'gold' && (
          <motion.span
            className="absolute inset-0 -top-[100%] h-[200%] w-[200%] rotate-45 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-200%' }}
            whileHover={{ x: '200%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'