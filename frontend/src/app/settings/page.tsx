'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useTelegram } from '@/hooks/useTelegram'
import { useNotifications } from '@/components/ui/Notification'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'

interface SettingsSection {
  id: string
  title: string
  icon: string
  items: SettingItem[]
}

interface SettingItem {
  id: string
  label: string
  description?: string
  type: 'switch' | 'select' | 'button' | 'info'
  value?: boolean | string
  options?: { value: string; label: string }[]
  action?: () => void
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { webApp, hapticFeedback } = useTelegram()
  const { addNotification } = useNotifications()
  
  const [settings, setSettings] = useState({
    notifications: true,
    pushNotifications: true,
    battleAlerts: true,
    guildAlerts: true,
    sound: true,
    music: false,
    haptic: true,
    language: 'ru',
    graphics: 'medium',
    autoSave: true,
    showOnlineStatus: true,
    allowGuildInvites: true,
    allowFriendRequests: true
  })
  
  const handleSettingChange = (key: string, value: boolean | string) => {
    hapticFeedback?.impactOccurred('light')
    setSettings(prev => ({ ...prev, [key]: value }))
    
    addNotification({
      type: 'success',
      title: 'Настройка изменена',
      icon: '✅',
      duration: 2000
    })
  }
  
  const handleClearCache = () => {
    hapticFeedback?.impactOccurred('medium')
    addNotification({
      type: 'info',
      title: 'Кэш очищен',
      message: 'Освобождено 24.5 МБ',
      icon: '🧹'
    })
  }
  
  const handleExportData = () => {
    hapticFeedback?.impactOccurred('medium')
    addNotification({
      type: 'success',
      title: 'Данные экспортированы',
      message: 'Файл сохранен в загрузки',
      icon: '💾'
    })
  }
  
  const handleDeleteAccount = () => {
    hapticFeedback?.impactOccurred('heavy')
    addNotification({
      type: 'error',
      title: 'Удалить аккаунт?',
      message: 'Это действие необратимо!',
      icon: '⚠️',
      persistent: true,
      actions: [
        {
          label: 'Отмена',
          onClick: () => {},
          variant: 'secondary'
        },
        {
          label: 'Удалить',
          onClick: () => {
            logout()
          },
          variant: 'danger'
        }
      ]
    })
  }
  
  const settingsSections: SettingsSection[] = [
    {
      id: 'notifications',
      title: 'Уведомления',
      icon: '🔔',
      items: [
        {
          id: 'notifications',
          label: 'Уведомления в игре',
          description: 'Показывать игровые уведомления',
          type: 'switch',
          value: settings.notifications
        },
        {
          id: 'pushNotifications',
          label: 'Push-уведомления',
          description: 'Уведомления вне игры',
          type: 'switch',
          value: settings.pushNotifications
        },
        {
          id: 'battleAlerts',
          label: 'Уведомления о битвах',
          description: 'Когда на вас нападают',
          type: 'switch',
          value: settings.battleAlerts
        },
        {
          id: 'guildAlerts',
          label: 'Уведомления гильдии',
          description: 'События гильдии и войны',
          type: 'switch',
          value: settings.guildAlerts
        }
      ]
    },
    {
      id: 'audio',
      title: 'Звук и вибрация',
      icon: '🔊',
      items: [
        {
          id: 'sound',
          label: 'Звуковые эффекты',
          type: 'switch',
          value: settings.sound
        },
        {
          id: 'music',
          label: 'Фоновая музыка',
          type: 'switch',
          value: settings.music
        },
        {
          id: 'haptic',
          label: 'Вибрация',
          description: 'Тактильная обратная связь',
          type: 'switch',
          value: settings.haptic
        }
      ]
    },
    {
      id: 'game',
      title: 'Игра',
      icon: '🎮',
      items: [
        {
          id: 'language',
          label: 'Язык',
          type: 'select',
          value: settings.language,
          options: [
            { value: 'ru', label: 'Русский' },
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' }
          ]
        },
        {
          id: 'graphics',
          label: 'Качество графики',
          type: 'select',
          value: settings.graphics,
          options: [
            { value: 'low', label: 'Низкое' },
            { value: 'medium', label: 'Среднее' },
            { value: 'high', label: 'Высокое' }
          ]
        },
        {
          id: 'autoSave',
          label: 'Автосохранение',
          description: 'Сохранять прогресс автоматически',
          type: 'switch',
          value: settings.autoSave
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Приватность',
      icon: '🔒',
      items: [
        {
          id: 'showOnlineStatus',
          label: 'Показывать онлайн статус',
          type: 'switch',
          value: settings.showOnlineStatus
        },
        {
          id: 'allowGuildInvites',
          label: 'Приглашения в гильдии',
          description: 'Разрешить приглашения от других игроков',
          type: 'switch',
          value: settings.allowGuildInvites
        },
        {
          id: 'allowFriendRequests',
          label: 'Запросы в друзья',
          type: 'switch',
          value: settings.allowFriendRequests
        }
      ]
    },
    {
      id: 'data',
      title: 'Данные',
      icon: '💾',
      items: [
        {
          id: 'clearCache',
          label: 'Очистить кэш',
          description: 'Размер кэша: 24.5 МБ',
          type: 'button',
          action: handleClearCache
        },
        {
          id: 'exportData',
          label: 'Экспорт данных',
          description: 'Сохранить игровой прогресс',
          type: 'button',
          action: handleExportData
        }
      ]
    },
    {
      id: 'about',
      title: 'О приложении',
      icon: 'ℹ️',
      items: [
        {
          id: 'version',
          label: 'Версия',
          type: 'info',
          value: '1.0.0 (build 42)'
        },
        {
          id: 'telegram',
          label: 'Telegram канал',
          type: 'button',
          action: () => window.open('https://t.me/tonempire', '_blank')
        },
        {
          id: 'support',
          label: 'Поддержка',
          type: 'button',
          action: () => window.open('https://t.me/tonempiresupport', '_blank')
        }
      ]
    }
  ]
  
  return (
    <div className="min-h-screen bg-tg-bg pb-20">
      {/* Хедер */}
      <motion.div 
        className="bg-surface border-b border-surface/20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="w-8 h-8"
              >
                ←
              </Button>
            </motion.div>
            <h1 className="font-semibold text-lg">Настройки</h1>
          </div>
        </div>
      </motion.div>
      
      {/* Профиль */}
      <motion.div
        className="px-4 py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="outlined" interactive onClick={() => router.push('/profile')}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-tg-button to-tg-link rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {user?.username?.[0] || 'И'}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{user?.username || 'Игрок'}</h3>
              <p className="text-sm text-tg-hint">Уровень 12 • ID: {user?.id || '123456'}</p>
            </div>
            <span className="text-tg-hint">→</span>
          </div>
        </Card>
      </motion.div>
      
      {/* Секции настроек */}
      <div className="px-4 space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + sectionIndex * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{section.icon}</span>
              <h2 className="font-medium">{section.title}</h2>
            </div>
            
            <Card variant="outlined" className="divide-y divide-surface/20">
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={item.id}
                  className="py-3 first:pt-0 last:pb-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + sectionIndex * 0.1 + itemIndex * 0.05 }}
                >
                  {item.type === 'switch' && (
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <h4 className="font-medium text-sm">{item.label}</h4>
                        {item.description && (
                          <p className="text-xs text-tg-hint mt-0.5">{item.description}</p>
                        )}
                      </div>
                      <Switch
                        checked={item.value as boolean}
                        onChange={(checked) => handleSettingChange(item.id, checked)}
                      />
                    </div>
                  )}
                  
                  {item.type === 'select' && (
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{item.label}</h4>
                      <Select
                        value={item.value as string}
                        onChange={(value) => handleSettingChange(item.id, value)}
                        options={item.options || []}
                        className="text-sm"
                      />
                    </div>
                  )}
                  
                  {item.type === 'button' && (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={item.action}
                      className="flex items-center justify-between w-full hover:bg-surface/50 -mx-4 px-4 py-2 transition-colors"
                    >
                      <div className="text-left">
                        <h4 className="font-medium text-sm">{item.label}</h4>
                        {item.description && (
                          <p className="text-xs text-tg-hint mt-0.5">{item.description}</p>
                        )}
                      </div>
                      <span className="text-tg-hint">→</span>
                    </motion.button>
                  )}
                  
                  {item.type === 'info' && (
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{item.label}</h4>
                      <span className="text-sm text-tg-hint">{item.value}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </Card>
          </motion.div>
        ))}
        
        {/* Опасная зона */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="pt-4 pb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⚠️</span>
            <h2 className="font-medium text-red-600">Опасная зона</h2>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              fullWidth
              className="border-red-500/30 text-red-600 hover:bg-red-500/10"
              onClick={() => {
                hapticFeedback?.impactOccurred('medium')
                logout()
              }}
            >
              Выйти из аккаунта
            </Button>
            
            <Button
              variant="danger"
              fullWidth
              onClick={handleDeleteAccount}
            >
              Удалить аккаунт
            </Button>
          </div>
        </motion.div>
      </div>
      
      <BottomNav />
    </div>
  )
}