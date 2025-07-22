'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/hooks/useTelegram'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'battle'
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }>
  icon?: React.ReactNode
  image?: string
  persistent?: boolean
  sound?: boolean
}

interface NotificationContextValue {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => string
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? (notification.persistent ? 0 : 5000),
    }
    
    setNotifications((prev) => [...prev, newNotification])
    
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
    
    return id
  }, [])
  
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])
  
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])
  
  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()
  const { hapticFeedback } = useTelegram()
  
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
            style={{ top: index * 80 }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onClose: () => void
  style?: React.CSSProperties
}

function NotificationItem({ notification, onClose, style }: NotificationItemProps) {
  const { hapticFeedback } = useTelegram()
  
  useEffect(() => {
    if (notification.sound) {
      hapticFeedback?.notificationOccurred('success')
    }
  }, [notification.sound, hapticFeedback])
  
  const typeConfig = {
    success: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-900 dark:text-green-100',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-900 dark:text-yellow-100',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
    },
    achievement: {
      bg: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30',
      border: 'border-yellow-300 dark:border-yellow-700',
      text: 'text-yellow-900 dark:text-yellow-100',
      icon: '🏆',
    },
    battle: {
      bg: 'bg-gradient-to-r from-red-100 to-purple-100 dark:from-red-900/30 dark:to-purple-900/30',
      border: 'border-red-300 dark:border-red-700',
      text: 'text-red-900 dark:text-red-100',
      icon: '⚔️',
    },
  }
  
  const config = typeConfig[notification.type]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      style={style}
      className="absolute right-0 pointer-events-auto"
    >
      <div className={cn(
        'min-w-[320px] max-w-md rounded-xl border shadow-lg overflow-hidden',
        config.bg,
        config.border
      )}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon or Image */}
            {notification.image ? (
              <img
                src={notification.image}
                alt=""
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className={cn('flex-shrink-0', config.text)}>
                {notification.icon || config.icon}
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className={cn('font-semibold', config.text)}>
                {notification.title}
              </h4>
              {notification.message && (
                <p className={cn('text-sm mt-1 opacity-90', config.text)}>
                  {notification.message}
                </p>
              )}
              
              {/* Actions */}
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        hapticFeedback?.impactOccurred('light')
                        action.onClick()
                        onClose()
                      }}
                      className={cn(
                        'text-sm font-medium px-3 py-1 rounded-lg transition-colors',
                        action.variant === 'primary'
                          ? 'bg-accent text-white hover:bg-accent/90'
                          : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70'
                      )}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Close button */}
            {!notification.persistent && (
              <button
                onClick={() => {
                  hapticFeedback?.impactOccurred('light')
                  onClose()
                }}
                className={cn(
                  'flex-shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors',
                  config.text
                )}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Progress bar for auto-dismiss */}
        {notification.duration && notification.duration > 0 && (
          <motion.div
            className="h-1 bg-current opacity-30"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: notification.duration / 1000, ease: 'linear' }}
          />
        )}
      </div>
    </motion.div>
  )
}

// Notification center component
interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, removeNotification, clearAll } = useNotifications()
  const { hapticFeedback } = useTelegram()
  
  const unreadCount = notifications.length
  
  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => {
          hapticFeedback?.impactOccurred('light')
          setIsOpen(!isOpen)
        }}
        className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 glass-card max-h-96 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold">Уведомления</h3>
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    hapticFeedback?.impactOccurred('light')
                    clearAll()
                  }}
                  className="text-sm text-accent hover:underline"
                >
                  Очистить все
                </button>
              )}
            </div>
            
            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-secondary">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p>Нет новых уведомлений</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {notification.icon || getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{notification.title}</p>
                          {notification.message && (
                            <p className="text-xs text-secondary mt-1">{notification.message}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="flex-shrink-0 text-secondary hover:text-primary"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'success':
      return '✅'
    case 'error':
      return '❌'
    case 'warning':
      return '⚠️'
    case 'info':
      return 'ℹ️'
    case 'achievement':
      return '🏆'
    case 'battle':
      return '⚔️'
  }
}

// Game-specific notifications
export const GameNotifications = {
  levelUp: (level: number) => ({
    type: 'achievement' as const,
    title: `Новый уровень ${level}!`,
    message: 'Поздравляем с повышением уровня!',
    icon: '🎉',
    sound: true,
  }),
  
  resourceFull: (resource: string) => ({
    type: 'warning' as const,
    title: 'Склад переполнен',
    message: `${resource} достиг максимума. Улучшите склад или потратьте ресурсы.`,
    actions: [
      {
        label: 'К складу',
        onClick: () => console.log('Navigate to storage'),
        variant: 'primary' as const,
      },
    ],
  }),
  
  battleWon: (opponent: string, rewards: string) => ({
    type: 'battle' as const,
    title: 'Победа в битве!',
    message: `Вы победили ${opponent} и получили ${rewards}`,
    icon: '🏆',
    sound: true,
    duration: 10000,
  }),
  
  guildInvite: (guildName: string, inviter: string) => ({
    type: 'info' as const,
    title: 'Приглашение в гильдию',
    message: `${inviter} приглашает вас в гильдию "${guildName}"`,
    persistent: true,
    actions: [
      {
        label: 'Принять',
        onClick: () => console.log('Accept guild invite'),
        variant: 'primary' as const,
      },
      {
        label: 'Отклонить',
        onClick: () => console.log('Decline guild invite'),
        variant: 'secondary' as const,
      },
    ],
  }),
}