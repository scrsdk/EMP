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
import { GameTable } from '@/components/ui/Table'
import { GamePagination } from '@/components/ui/Pagination'
import { Tabs } from '@/components/ui/Tabs'
import { Input } from '@/components/ui/Input'
import { formatNumber } from '@/lib/format'

interface LeaderboardPlayer {
  rank: number
  id: string
  name: string
  level: number
  score: number
  guild?: string
  avatar?: string
  change?: number // Изменение позиции за последний день
  country?: string
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const { hapticFeedback } = useTelegram()
  const { addNotification } = useNotifications()
  
  const [activeCategory, setActiveCategory] = useState('power')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState('all')
  
  const [leaderboards, setLeaderboards] = useState({
    power: [
      {
        rank: 1,
        id: '1',
        name: 'ImperialMaster',
        level: 42,
        score: 15680,
        guild: 'Драконы Севера',
        avatar: '/avatars/master.png',
        change: 2,
        country: '🇷🇺'
      },
      {
        rank: 2,
        id: '2',
        name: 'ShadowEmperor',
        level: 38,
        score: 14250,
        guild: 'Темный Легион',
        avatar: '/avatars/shadow.png',
        change: -1,
        country: '🇺🇸'
      },
      {
        rank: 3,
        id: '3',
        name: 'GoldenPhoenix',
        level: 35,
        score: 13890,
        guild: 'Золотые Драконы',
        avatar: '/avatars/phoenix.png',
        change: 0,
        country: '🇩🇪'
      },
      {
        rank: 4,
        id: '4',
        name: 'StormRider',
        level: 33,
        score: 12750,
        guild: 'Повелители Бури',
        avatar: '/avatars/storm.png',
        change: 3,
        country: '🇫🇷'
      },
      {
        rank: 5,
        id: '5',
        name: 'CrystalGuardian',
        level: 31,
        score: 11980,
        guild: 'Хранители',
        avatar: '/avatars/crystal.png',
        change: -2,
        country: '🇬🇧'
      }
    ],
    guilds: [
      {
        rank: 1,
        id: 'g1',
        name: 'Драконы Севера',
        level: 25,
        score: 187500,
        guild: '150 участников',
        avatar: '/guilds/dragons.png',
        change: 1,
        country: '🌍'
      },
      {
        rank: 2,
        id: 'g2',
        name: 'Темный Легион',
        level: 23,
        score: 172000,
        guild: '142 участника',
        avatar: '/guilds/legion.png',
        change: -1,
        country: '🌍'
      },
      {
        rank: 3,
        id: 'g3',
        name: 'Золотые Драконы',
        level: 22,
        score: 165800,
        guild: '138 участников',
        avatar: '/guilds/golden.png',
        change: 2,
        country: '🌍'
      }
    ],
    arena: [
      {
        rank: 1,
        id: 'a1',
        name: 'BattleMaster',
        level: 28,
        score: 2847,
        guild: 'Гладиаторы',
        avatar: '/avatars/battle.png',
        change: 0,
        country: '🇷🇺'
      },
      {
        rank: 2,
        id: 'a2',
        name: 'WarriorKing',
        level: 26,
        score: 2756,
        guild: 'Воины Света',
        avatar: '/avatars/warrior.png',
        change: 1,
        country: '🇺🇦'
      }
    ]
  })

  const [playerPosition, setPlayerPosition] = useState({
    power: { rank: 1247, score: 8650 },
    guilds: { rank: 85, score: 45200 },
    arena: { rank: 892, score: 1580 }
  })

  const categories = [
    { id: 'power', label: 'Сила', icon: '⚡', description: 'Топ по силе империи' },
    { id: 'guilds', label: 'Гильдии', icon: '🛡️', description: 'Рейтинг гильдий' },
    { id: 'arena', label: 'Арена', icon: '⚔️', description: 'Лучшие бойцы' }
  ]

  const timeFilters = [
    { id: 'all', label: 'Все время' },
    { id: 'month', label: 'Месяц' },
    { id: 'week', label: 'Неделя' },
    { id: 'day', label: 'Сегодня' }
  ]

  const getCurrentLeaderboard = () => {
    return leaderboards[activeCategory as keyof typeof leaderboards] || []
  }

  const getCurrentPlayerPosition = () => {
    return playerPosition[activeCategory as keyof typeof playerPosition]
  }

  const handlePlayerClick = (player: LeaderboardPlayer) => {
    hapticFeedback?.impactOccurred('light')
    addNotification({
      type: 'info',
      title: `Игрок: ${player.name}`,
      message: `${player.country ? `${player.country} ` : ''}Уровень ${player.level} • ${formatNumber(player.score)} очков`,
      icon: '👤'
    })
  }

  const handleGuildView = (guild: string) => {
    hapticFeedback?.impactOccurred('light')
    addNotification({
      type: 'info',
      title: `Гильдия: ${guild}`,
      message: 'Информация о гильдии',
      icon: '🛡️',
      actions: [
        {
          label: 'Подать заявку',
          onClick: () => {
            addNotification({
              type: 'success',
              title: 'Заявка отправлена',
              message: `Заявка в гильдию "${guild}" отправлена`,
              icon: '✅'
            })
          },
          variant: 'primary'
        }
      ]
    })
  }

  const getChangeIcon = (change?: number) => {
    if (!change) return '—'
    if (change > 0) return `🔺${change}`
    if (change < 0) return `🔻${Math.abs(change)}`
    return '—'
  }

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-secondary'
    if (change > 0) return 'text-green-500'
    if (change < 0) return 'text-red-500'
    return 'text-secondary'
  }

  const filteredLeaderboard = getCurrentLeaderboard().filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (player.guild && player.guild.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-tg-bg pb-20">
      {/* Премиум хедер */}
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
        
        <div className="relative z-10 p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-bold text-2xl text-white mb-1">🏆 Таблица лидеров</h1>
              <p className="text-white/80 text-sm">Лучшие игроки TON Empire</p>
            </div>
            <Button
              variant="glass"
              size="icon"
              onClick={() => {
                hapticFeedback?.impactOccurred('light')
                addNotification({
                  type: 'info',
                  title: 'Обновлено',
                  message: 'Рейтинг обновлен',
                  icon: '🔄'
                })
              }}
              className="text-white border-white/20"
            >
              🔄
            </Button>
          </div>

          {/* Поиск */}
          <Input
            placeholder="Поиск игроков или гильдий..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon="🔍"
            className="mb-4 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />

          {/* Категории */}
          <motion.div 
            className="flex gap-2 overflow-x-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  hapticFeedback?.impactOccurred('light')
                  setActiveCategory(category.id)
                  setCurrentPage(1)
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-white text-empire-royal shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <div className="p-4 space-y-6">
        {/* Позиция игрока */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="gradient">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar
                    src={user?.avatar || ''}
                    alt={user?.username || 'Игрок'}
                    size="md"
                    fallback={user?.username?.[0] || 'И'}
                    className="ring-2 ring-white/20"
                  />
                </motion.div>
                <div>
                  <h4 className="font-semibold text-white">{user?.username || 'Игрок'}</h4>
                  <p className="text-sm text-white/80">
                    {formatNumber(getCurrentPlayerPosition().score)} очков
                  </p>
                </div>
              </div>
              <div className="text-right">
                <motion.div 
                  className="text-3xl font-bold text-empire-gold"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  #{getCurrentPlayerPosition().rank}
                </motion.div>
                <div className="text-xs text-white/70">ваша позиция</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Топ-3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass">
            <CardHeader
              title="Лидеры"
              avatar="👑"
              subtitle={categories.find(c => c.id === activeCategory)?.description}
            />
            <div className="grid grid-cols-3 gap-3">
              {filteredLeaderboard.slice(0, 3).map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePlayerClick(player)}
                  className="text-center cursor-pointer"
                >
                  <div className={`relative mb-2 ${
                    index === 0 ? 'transform -translate-y-2' : ''
                  }`}>
                    <Avatar
                      src={player.avatar}
                      alt={player.name}
                      size={index === 0 ? 'lg' : 'md'}
                      fallback={player.name[0]}
                      className="shadow-xl"
                    />
                    <motion.div 
                      className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                        index === 0 ? 'bg-gradient-gold' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                        'bg-gradient-to-br from-orange-500 to-orange-700'
                      }`}
                      animate={index === 0 ? { rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {player.rank}
                    </motion.div>
                  </div>
                  <h4 className="font-semibold text-sm truncate">{player.name}</h4>
                  <p className="text-xs text-tg-hint">
                    {player.country ? `${player.country} ` : ''}{formatNumber(player.score)}
                  </p>
                  {player.guild && (
                    <Badge variant="glass" size="xs" className="mt-1">
                      {player.guild}
                    </Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Полная таблица */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-xl">📊</span>
                <span className="bg-gradient-empire bg-clip-text text-transparent">Полный рейтинг</span>
              </h3>
              
              {/* Фильтр по времени */}
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-1 bg-surface/50 backdrop-blur-sm rounded-lg text-sm border border-surface/20 outline-none focus:ring-2 focus:ring-empire-royal/30"
              >
                {timeFilters.map(filter => (
                  <option key={filter.id} value={filter.id}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {filteredLeaderboard.slice(3).map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handlePlayerClick(player)}
                  className="flex items-center justify-between p-3 bg-surface/30 backdrop-blur-sm rounded-xl cursor-pointer hover:bg-surface/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-empire flex items-center justify-center font-bold text-white">
                      {player.rank}
                    </div>
                    <Avatar
                      src={player.avatar}
                      alt={player.name}
                      size="sm"
                      fallback={player.name[0]}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{player.name}</span>
                        {player.country && (
                          <span className="text-sm">{player.country}</span>
                        )}
                      </div>
                      {player.guild && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGuildView(player.guild!)
                          }}
                          className="text-xs text-empire-mystic hover:underline"
                        >
                          {player.guild}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold bg-gradient-empire bg-clip-text text-transparent">
                      {formatNumber(player.score)}
                    </div>
                    <div className={`text-xs ${getChangeColor(player.change)}`}>
                      {getChangeIcon(player.change)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Пагинация */}
            <div className="mt-6">
              <GamePagination.Leaderboard
                currentPage={currentPage}
                totalPages={10}
                onPageChange={setCurrentPage}
              />
            </div>
          </Card>
        </motion.div>

        {/* Достижения */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="glass">
            <CardHeader
              title="Цели рейтинга"
              avatar="🎯"
            />
            <div className="space-y-3">
              <motion.div 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-empire-gold/10 to-empire-gold/5 rounded-xl border border-empire-gold/20"
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <h4 className="font-semibold">Топ-1000</h4>
                  <p className="text-sm text-tg-hint">Войти в топ-1000 игроков</p>
                </div>
                <GameBadge.Status status="busy" />
              </motion.div>
              
              <motion.div 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-empire-royal/10 to-empire-mystic/10 rounded-xl border border-empire-royal/20"
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <h4 className="font-semibold">Гильдия-чемпион</h4>
                  <p className="text-sm text-tg-hint">Присоединиться к топ-10 гильдии</p>
                </div>
                <Badge variant="glass">Недоступно</Badge>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}