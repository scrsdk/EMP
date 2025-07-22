'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost' | 'floating'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'card' | 'minimal' | 'illustration'
  illustration?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  variant = 'default',
  illustration,
  className,
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8 px-4',
      icon: 'w-12 h-12 text-3xl',
      title: 'text-lg',
      description: 'text-sm',
      spacing: 'gap-3',
    },
    md: {
      container: 'py-12 px-6',
      icon: 'w-16 h-16 text-4xl',
      title: 'text-xl',
      description: 'text-base',
      spacing: 'gap-4',
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'w-20 h-20 text-5xl',
      title: 'text-2xl',
      description: 'text-lg',
      spacing: 'gap-6',
    },
  }
  
  const config = sizeClasses[size]
  
  const containerClasses = {
    default: 'bg-transparent',
    card: 'glass-card',
    minimal: 'bg-transparent',
    illustration: 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-2xl',
        config.container,
        config.spacing,
        containerClasses[variant],
        className
      )}
    >
      {/* Illustration or Icon */}
      {variant === 'illustration' && illustration ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
          className="mb-2"
        >
          {illustration}
        </motion.div>
      ) : icon ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className={cn(
            'flex items-center justify-center rounded-2xl bg-secondary/50',
            config.icon
          )}
        >
          {icon}
        </motion.div>
      ) : null}
      
      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          'font-bold text-primary',
          config.title
        )}
      >
        {title}
      </motion.h3>
      
      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={cn(
            'text-secondary max-w-sm',
            config.description
          )}
        >
          {description}
        </motion.p>
      )}
      
      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-2"
        >
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'primary'}
              size={size}
            >
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              size={size}
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

interface EmptyListProps {
  items: any[]
  emptyStateProps: EmptyStateProps
  children: ReactNode
}

export function EmptyList({ items, emptyStateProps, children }: EmptyListProps) {
  if (items.length === 0) {
    return <EmptyState {...emptyStateProps} />
  }
  
  return <>{children}</>
}

// Pre-built empty states for common scenarios
export const EmptyStates = {
  NoData: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="📊"
      title="Нет данных"
      description="Данные еще не загружены или отсутствуют"
      variant="minimal"
      {...props}
    />
  ),
  
  NoResults: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="🔍"
      title="Ничего не найдено"
      description="Попробуйте изменить параметры поиска"
      variant="minimal"
      {...props}
    />
  ),
  
  NoMessages: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="💬"
      title="Нет сообщений"
      description="Начните общение, отправив первое сообщение"
      variant="card"
      {...props}
    />
  ),
  
  NoNotifications: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="🔔"
      title="Нет уведомлений"
      description="Когда появятся новые уведомления, они отобразятся здесь"
      variant="minimal"
      {...props}
    />
  ),
  
  NoItems: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="📦"
      title="Нет предметов"
      description="Ваш инвентарь пуст"
      variant="card"
      {...props}
    />
  ),
  
  NoBattles: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="⚔️"
      title="Нет битв"
      description="История битв пока пуста"
      variant="minimal"
      {...props}
    />
  ),
  
  NoBuildings: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="🏰"
      title="Нет построек"
      description="Постройте свое первое здание"
      action={{
        label: "Построить",
        onClick: () => {},
        variant: "primary"
      }}
      variant="card"
      {...props}
    />
  ),
  
  NoGuild: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="🛡️"
      title="Вы не в гильдии"
      description="Присоединитесь к гильдии или создайте свою"
      action={{
        label: "Найти гильдию",
        onClick: () => {},
        variant: "primary"
      }}
      secondaryAction={{
        label: "Создать гильдию",
        onClick: () => {}
      }}
      variant="card"
      size="lg"
      {...props}
    />
  ),
  
  Error: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="❌"
      title="Произошла ошибка"
      description="Что-то пошло не так. Попробуйте еще раз"
      action={{
        label: "Повторить",
        onClick: () => {},
        variant: "danger"
      }}
      variant="card"
      {...props}
    />
  ),
  
  Maintenance: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="🔧"
      title="Технические работы"
      description="Мы обновляем игру. Скоро вернемся!"
      variant="illustration"
      size="lg"
      {...props}
    />
  ),
}

// Illustration components
export function NoDataIllustration() {
  return (
    <svg
      className="w-48 h-48"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.circle
        cx="100"
        cy="100"
        r="80"
        stroke="currentColor"
        strokeWidth="2"
        className="text-gray-300 dark:text-gray-700"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.path
        d="M70 90 L130 90 M70 110 L130 110 M70 130 L110 130"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-gray-400 dark:text-gray-600"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </svg>
  )
}

export function SearchIllustration() {
  return (
    <svg
      className="w-48 h-48"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.circle
        cx="85"
        cy="85"
        r="50"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        className="text-gray-300 dark:text-gray-700"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      />
      <motion.line
        x1="120"
        y1="120"
        x2="150"
        y2="150"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-gray-400 dark:text-gray-600"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
      <motion.text
        x="85"
        y="90"
        textAnchor="middle"
        className="text-2xl fill-current text-gray-400 dark:text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        ?
      </motion.text>
    </svg>
  )
}