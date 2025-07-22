'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useTelegram } from '@/hooks/useTelegram'
import { useNotifications } from '@/components/ui/Notification'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Card, GameCard, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, GameBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Tabs } from '@/components/ui/Tabs'
import { GameRating } from '@/components/ui/Rating'
import { formatNumber } from '@/lib/format'

interface PlayerStats {
  totalPlayTime: string
  citiesBuilt: number
  battlesWon: number
  resourcesGathered: number
  achievementsUnlocked: number
  friendsReferred: number
  guildContribution: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: string
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { webApp, hapticFeedback } = useTelegram()
  const { addNotification } = useNotifications()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [editForm, setEditForm] = useState({
    displayName: user?.username || '',
    bio: 'Строитель великих империй',
    favoriteStrategy: 'Агрессивная экспансия'
  })
  
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    haptic: true,
    autoSave: true,
    privacy: 'friends'
  })

  const [stats, setStats] = useState<PlayerStats>({
    totalPlayTime: '47 часов 23 минуты',
    citiesBuilt: 12,
    battlesWon: 127,
    resourcesGathered: 1250000,
    achievementsUnlocked: 23,
    friendsReferred: 7,
    guildContribution: 15680
  })

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Первый шаг',
      description: 'Построить первое здание',
      icon: '🏗️',
      unlocked: true,
      rarity: 'common',
      unlockedAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Завоеватель',
      description: 'Выиграть 100 битв',
      icon: '⚔️',
      unlocked: true,
      rarity: 'rare',
      unlockedAt: '2024-02-01'
    },
    {
      id: '3',
      title: 'Магнат',
      description: 'Накопить 1,000,000 монет',
      icon: '💰',
      unlocked: true,
      rarity: 'epic',
      unlockedAt: '2024-02-10'
    },
    {
      id: '4',
      title: 'Легенда',
      description: 'Достичь 50 уровня',
      icon: '👑',
      unlocked: false,
      progress: 12,
      maxProgress: 50,
      rarity: 'legendary'
    },
    {
      id: '5',
      title: 'Коллекционер',
      description: 'Собрать 10 эпических предметов',
      icon: '💎',
      unlocked: false,
      progress: 6,
      maxProgress: 10,
      rarity: 'epic'
    }
  ])

  const handleSaveProfile = () => {
    hapticFeedback?.impactOccurred('medium')
    
    // Здесь бы был запрос к API
    addNotification({
      type: 'success',
      title: 'Профиль обновлен',
      message: 'Изменения сохранены успешно',
      icon: '✅',
      sound: true
    })
    
    setShowEditModal(false)
  }

  const handleSaveSettings = () => {
    hapticFeedback?.impactOccurred('medium')
    
    // Применение настроек
    if (webApp) {
      webApp.HapticFeedback = settings.haptic ? webApp.HapticFeedback : undefined
    }
    
    addNotification({
      type: 'success',
      title: 'Настройки сохранены',
      message: 'Все изменения применены',
      icon: '⚙️'
    })
    
    setShowSettingsModal(false)
  }

  const handleLogout = () => {
    hapticFeedback?.impactOccurred('heavy')
    
    addNotification({
      type: 'info',
      title: 'До встречи!',
      message: 'Ваш прогресс сохранен',
      icon: '👋',
      actions: [
        {
          label: 'Отмена',
          onClick: () => {},
          variant: 'secondary'
        },
        {
          label: 'Выйти',
          onClick: () => {
            logout()
          },
          variant: 'primary'
        }
      ],
      persistent: true
    })
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 bg-gray-500/10'
      case 'rare': return 'border-blue-500 bg-blue-500/10'
      case 'epic': return 'border-purple-500 bg-purple-500/10'
      case 'legendary': return 'border-yellow-500 bg-yellow-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)

  return (
    <div className="min-h-screen bg-tg-bg pb-20">
      {/* Премиум хедер профиля */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-empire"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Декоративные элементы */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-empire-gold/20 rounded-full blur-xl" />
        
        <div className="relative z-10 p-6 pb-8">
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Avatar
                src={user?.avatar || ''}
                alt={user?.username || 'Император'}
                size="xl"
                fallback={user?.username?.[0] || 'И'}
                className="ring-4 ring-white/20 shadow-2xl"
              />
              <div className="absolute -bottom-1 -right-1">
                <GameBadge.Level level={12} size="xs" />
              </div>
            </motion.div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">{user?.username || 'Император'}</h1>
              <p className="text-white/80 mb-3">{editForm.bio}</p>
              <div className="flex items-center gap-2">
                <Badge variant="glass" className="text-white/90 border-white/20">
                  <span className="mr-1">🏆</span>
                  {stats.achievementsUnlocked} достижений
                </Badge>
                <GameBadge.Status status="online" />
              </div>
            </div>
            <Button
              onClick={() => setShowEditModal(true)}
              variant="glass"
              size="sm"
              className="text-white border-white/20"
            >
              ✏️
            </Button>
          </div>
          
          {/* Быстрая статистика */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-3xl font-bold text-white mb-1">{stats.battlesWon}</div>
              <div className="text-sm text-white/70">Побед</div>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="text-3xl font-bold text-empire-gold mb-1">{stats.citiesBuilt}</div>
              <div className="text-sm text-white/70">Городов</div>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-3xl font-bold text-white mb-1">{stats.friendsReferred}</div>
              <div className="text-sm text-white/70">Друзей</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="p-4 space-y-6">
        {/* Вкладки */}
        <motion.div 
          className="flex bg-surface/50 backdrop-blur-sm rounded-2xl p-1.5 gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { id: 'overview', label: 'Обзор', icon: '📊' },
            { id: 'achievements', label: 'Достижения', icon: '🏆' },
            { id: 'stats', label: 'Статистика', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                hapticFeedback?.impactOccurred('light')
                setActiveTab(tab.id)
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-empire text-white shadow-md'
                  : 'text-tg-hint hover:text-tg-text'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Содержимое вкладок */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Игровой прогресс */}
              <Card variant="glass">
                <CardHeader
                  title="Игровой прогресс"
                  avatar="🎮"
                  bordered
                />
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-tg-hint">Опыт до следующего уровня</span>
                      <span className="font-bold bg-gradient-empire bg-clip-text text-transparent">
                        2,850 / 3,500
                      </span>
                    </div>
                    <ProgressBar value={81.4} variant="default" animated />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface/10">
                    <motion.div 
                      className="text-center p-3 bg-empire-mystic/10 rounded-xl"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-2xl font-bold text-empire-mystic">
                        {(stats.resourcesGathered / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-tg-hint">Ресурсов собрано</div>
                    </motion.div>
                    <motion.div 
                      className="text-center p-3 bg-empire-royal/10 rounded-xl"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-2xl font-bold text-empire-royal">
                        {formatNumber(stats.guildContribution)}
                      </div>
                      <div className="text-xs text-tg-hint">Вклад в гильдию</div>
                    </motion.div>
                  </div>
                </div>
              </Card>

              {/* Последние достижения */}
              <Card variant="glass">
                <CardHeader
                  title="Последние достижения"
                  avatar="🏆"
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('achievements')}
                    >
                      Все →
                    </Button>
                  }
                />
                <div className="space-y-3">
                  {unlockedAchievements.slice(0, 3).map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GameCard.Achievement
                        title={achievement.title}
                        description={achievement.description}
                        icon={achievement.icon}
                        progress={100}
                        maxProgress={100}
                        unlocked={true}
                      />
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Быстрые действия */}
              <Card variant="glass">
                <CardHeader
                  title="Действия"
                  avatar="⚙️"
                />
                <div className="grid grid-cols-2 gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setShowSettingsModal(true)}
                      variant="glass"
                      className="h-20 w-full flex-col gap-2"
                    >
                      <span className="text-2xl">⚙️</span>
                      <span className="text-sm">Настройки</span>
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => {
                        hapticFeedback?.impactOccurred('light')
                        addNotification({
                          type: 'info',
                          title: 'Поделиться профилем',
                          message: 'Скопирована ссылка на профиль',
                          icon: '🔗'
                        })
                      }}
                      variant="glass"
                      className="h-20 w-full flex-col gap-2"
                    >
                      <span className="text-2xl">📤</span>
                      <span className="text-sm">Поделиться</span>
                    </Button>
                  </motion.div>
                </div>
                
                <Button
                  onClick={handleLogout}
                  variant="danger"
                  fullWidth
                  className="mt-4"
                  icon="🚪"
                >
                  Выйти из аккаунта
                </Button>
              </Card>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Прогресс достижений */}
              <Card variant="gradient">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2 text-white">
                    <span className="text-2xl">🏆</span>
                    <span>Достижения</span>
                  </h3>
                  <GameBadge.Level 
                    level={unlockedAchievements.length}
                    size="sm"
                  />
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-white/80 mb-2">
                    <span>Прогресс</span>
                    <span>{unlockedAchievements.length}/{achievements.length}</span>
                  </div>
                  <ProgressBar 
                    value={(unlockedAchievements.length / achievements.length) * 100}
                    variant="default"
                    className="h-3 bg-white/20"
                    animated
                  />
                </div>
              </Card>

              {/* Открытые достижения */}
              <Card variant="glass">
                <CardHeader
                  title="Получено"
                  avatar="✅"
                  subtitle={`${unlockedAchievements.length} достижений`}
                />
                <div className="space-y-3">
                  {unlockedAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GameCard.Achievement
                        title={achievement.title}
                        description={achievement.description}
                        icon={achievement.icon}
                        progress={100}
                        maxProgress={100}
                        unlocked={true}
                      />
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Заблокированные достижения */}
              <Card variant="glass">
                <CardHeader
                  title="В процессе"
                  avatar="🔒"
                  subtitle={`${lockedAchievements.length} достижений`}
                />
                <div className="space-y-3">
                  {lockedAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GameCard.Achievement
                        title={achievement.title}
                        description={achievement.description}
                        icon={achievement.icon}
                        progress={achievement.progress || 0}
                        maxProgress={achievement.maxProgress || 100}
                        unlocked={false}
                      />
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Общая статистика */}
              <Card variant="glass">
                <CardHeader
                  title="Общая статистика"
                  avatar="📊"
                />
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '⏱️', value: stats.totalPlayTime, label: 'Время в игре' },
                    { icon: '🏗️', value: stats.citiesBuilt, label: 'Построено городов' },
                    { icon: '⚔️', value: stats.battlesWon, label: 'Побед в битвах' },
                    { icon: '👥', value: stats.friendsReferred, label: 'Друзей приглашено' }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-4 bg-gradient-to-br from-empire-royal/10 to-empire-mystic/10 rounded-xl backdrop-blur-sm"
                    >
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="font-bold text-lg bg-gradient-empire bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-xs text-tg-hint">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Детальная статистика */}
              <Card variant="glass">
                <CardHeader
                  title="Детальная статистика"
                  avatar="📈"
                />
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <GameBadge.Resource type="gold" amount={0} />
                      <span className="text-tg-hint">Ресурсов собрано</span>
                    </div>
                    <span className="font-bold text-lg">{formatNumber(stats.resourcesGathered)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚔️</span>
                      <span className="text-tg-hint">Вклад в гильдию</span>
                    </div>
                    <span className="font-bold text-lg">{formatNumber(stats.guildContribution)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏆</span>
                      <span className="text-tg-hint">Открыто достижений</span>
                    </div>
                    <span className="font-bold text-lg">{stats.achievementsUnlocked}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Модальное окно редактирования */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Редактировать профиль"
      >
        <div className="space-y-4">
          <Input
            label="Отображаемое имя"
            value={editForm.displayName}
            onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
            placeholder="Введите имя"
          />
          
          <Input
            label="О себе"
            value={editForm.bio}
            onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
            placeholder="Расскажите о себе"
          />
          
          <Input
            label="Любимая стратегия"
            value={editForm.favoriteStrategy}
            onChange={(e) => setEditForm({...editForm, favoriteStrategy: e.target.value})}
            placeholder="Ваш стиль игры"
          />
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowEditModal(false)}
              variant="outline"
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSaveProfile}
              variant="primary"
              className="flex-1"
            >
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно настроек */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Настройки"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Уведомления</h4>
                <p className="text-sm text-secondary">Push-уведомления о событиях</p>
              </div>
              <Switch
                checked={settings.notifications}
                onChange={(checked) => setSettings({...settings, notifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Звук</h4>
                <p className="text-sm text-secondary">Звуковые эффекты</p>
              </div>
              <Switch
                checked={settings.sound}
                onChange={(checked) => setSettings({...settings, sound: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Вибрация</h4>
                <p className="text-sm text-secondary">Тактильная обратная связь</p>
              </div>
              <Switch
                checked={settings.haptic}
                onChange={(checked) => setSettings({...settings, haptic: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Автосохранение</h4>
                <p className="text-sm text-secondary">Автоматическое сохранение прогресса</p>
              </div>
              <Switch
                checked={settings.autoSave}
                onChange={(checked) => setSettings({...settings, autoSave: checked})}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setShowSettingsModal(false)}
              variant="outline"
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSaveSettings}
              variant="primary"
              className="flex-1"
            >
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>

      <BottomNav />
    </div>
  )
}