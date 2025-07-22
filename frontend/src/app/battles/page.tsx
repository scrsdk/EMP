'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useTelegram } from '@/hooks/useTelegram'
import { useNotifications, GameNotifications } from '@/components/ui/Notification'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Card, GameCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge, GameBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { GameTable } from '@/components/ui/Table'
import { GamePagination } from '@/components/ui/Pagination'

interface Battle {
  id: string
  opponent: {
    name: string
    level: number
    power: number
    avatar?: string
  }
  result?: 'victory' | 'defeat' | 'draw' | 'pending'
  rewards?: {
    coins: number
    experience: number
    items?: string[]
  }
  time: string
  status: 'active' | 'completed' | 'pending'
}

export default function BattlesPage() {
  const { user } = useAuth()
  const { hapticFeedback } = useTelegram()
  const { addNotification } = useNotifications()
  
  const [activeTab, setActiveTab] = useState<'arena' | 'history' | 'tournaments'>('arena')
  const [userStats, setUserStats] = useState({
    wins: 127,
    losses: 45,
    draws: 8,
    winRate: 70.6,
    currentStreak: 5,
    bestStreak: 12,
    rating: 1847,
    rank: 'Золото III'
  })
  
  const [battles, setBattles] = useState<Battle[]>([
    {
      id: '1',
      opponent: {
        name: 'DragonSlayer99',
        level: 15,
        power: 1250,
        avatar: '🐉'
      },
      result: 'victory',
      rewards: {
        coins: 350,
        experience: 75,
        items: ['Меч викинга', 'Золотой щит']
      },
      time: '2 часа назад',
      status: 'completed'
    },
    {
      id: '2',
      opponent: {
        name: 'ShadowWarrior',
        level: 18,
        power: 1450,
        avatar: '🥷'
      },
      result: 'defeat',
      rewards: {
        coins: 50,
        experience: 25
      },
      time: '5 часов назад',
      status: 'completed'
    },
    {
      id: '3',
      opponent: {
        name: 'IronFist',
        level: 12,
        power: 980,
        avatar: '👊'
      },
      result: 'victory',
      rewards: {
        coins: 280,
        experience: 60
      },
      time: '1 день назад',
      status: 'completed'
    }
  ])

  const [availableOpponents] = useState([
    {
      id: '1',
      name: 'FireMage2023',
      level: 14,
      power: 1180,
      avatar: '🧙',
      winRate: 68,
      difficulty: 'easy' as const
    },
    {
      id: '2',
      name: 'StormBreaker',
      level: 16,
      power: 1320,
      avatar: '⚡',
      winRate: 75,
      difficulty: 'medium' as const
    },
    {
      id: '3',
      name: 'DarkLord666',
      level: 20,
      power: 1680,
      avatar: '💀',
      winRate: 82,
      difficulty: 'hard' as const
    }
  ])

  const handleStartBattle = (opponentId: string) => {
    const opponent = availableOpponents.find(o => o.id === opponentId)
    if (!opponent) return

    hapticFeedback?.impactOccurred('heavy')
    
    addNotification({
      type: 'battle',
      title: 'Битва началась!',
      message: `Сражение против ${opponent.name}`,
      icon: '⚔️',
      sound: true
    })

    // Симуляция битвы
    setTimeout(() => {
      const victory = Math.random() > 0.4
      const newBattle: Battle = {
        id: Date.now().toString(),
        opponent: {
          name: opponent.name,
          level: opponent.level,
          power: opponent.power,
          avatar: opponent.avatar
        },
        result: victory ? 'victory' : 'defeat',
        rewards: victory ? {
          coins: Math.floor(Math.random() * 300) + 200,
          experience: Math.floor(Math.random() * 50) + 50,
          items: Math.random() > 0.7 ? ['Редкий артефакт'] : undefined
        } : {
          coins: 25,
          experience: 15
        },
        time: 'Только что',
        status: 'completed'
      }

      setBattles(prev => [newBattle, ...prev])
      
      if (victory) {
        setUserStats(prev => ({
          ...prev,
          wins: prev.wins + 1,
          currentStreak: prev.currentStreak + 1,
          bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
          rating: prev.rating + 15
        }))
        
        addNotification(GameNotifications.battleWon(opponent.name, `${newBattle.rewards?.coins} монет`))
      } else {
        setUserStats(prev => ({
          ...prev,
          losses: prev.losses + 1,
          currentStreak: 0,
          rating: Math.max(0, prev.rating - 10)
        }))
        
        addNotification({
          type: 'error',
          title: 'Поражение',
          message: `${opponent.name} оказался сильнее`,
          icon: '💀',
          sound: true
        })
      }
    }, 2000)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-500'
      case 'medium': return 'text-amber-500'
      case 'hard': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легко'
      case 'medium': return 'Средне'
      case 'hard': return 'Сложно'
      default: return 'Неизвестно'
    }
  }

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
        
        {/* Контент */}
        <div className="relative z-10 p-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-bold text-2xl text-white mb-1">⚔️ Арена битв</h1>
              <p className="text-white/80 text-sm">Сражайтесь за славу и награды</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-empire-gold">{userStats.rating}</div>
              <div className="text-xs text-white/80">{userStats.rank}</div>
            </div>
          </div>
          
          {/* Статистика */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{userStats.wins}</div>
              <div className="text-xs text-white/70">Побед</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{userStats.losses}</div>
              <div className="text-xs text-white/70">Поражений</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-empire-gold">{userStats.winRate}%</div>
              <div className="text-xs text-white/70">Винрейт</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">🔥{userStats.currentStreak}</div>
              <div className="text-xs text-white/70">Серия</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Профиль игрока */}
      <div className="px-4 -mt-6 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass" className="backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-4">
              <Avatar
                src={user?.avatar || ''}
                alt={user?.username || 'Игрок'}
                size="lg"
                fallback={user?.username?.[0] || 'И'}
                className="ring-2 ring-empire-royal/30"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg">{user?.username || 'Игрок'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <GameBadge.Rank rank={userStats.rank} icon="🏆" />
                  <Badge variant="glass" size="xs">
                    Лучшая серия: {userStats.bestStreak}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Вкладки */}
      <div className="px-4 mt-6">
        <motion.div 
          className="flex bg-surface/50 backdrop-blur-sm rounded-2xl p-1.5 gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { id: 'arena' as const, label: 'Арена', icon: '⚔️' },
            { id: 'history' as const, label: 'История', icon: '📜' },
            { id: 'tournaments' as const, label: 'Турниры', icon: '🏆' }
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
              {tab.icon} {tab.label}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Содержимое вкладок */}
      <AnimatePresence mode="wait">
        {activeTab === 'arena' && (
          <motion.div
            key="arena"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 space-y-4"
          >
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <span className="bg-gradient-empire bg-clip-text text-transparent">Доступные противники</span>
            </h3>
            
            <div className="space-y-3">
              {availableOpponents.map((opponent, index) => (
                <motion.div
                  key={opponent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    variant="glass" 
                    interactive 
                    className="p-4"
                    onClick={() => handleStartBattle(opponent.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={opponent.avatar}
                          alt={opponent.name}
                          size="md"
                          fallback={opponent.avatar}
                          className="text-2xl"
                        />
                        <div>
                          <h4 className="font-semibold">{opponent.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-tg-hint">
                            <span>Уровень {opponent.level}</span>
                            <span>•</span>
                            <span>Сила: {opponent.power}</span>
                            <span>•</span>
                            <span className={getDifficultyColor(opponent.difficulty)}>
                              {getDifficultyText(opponent.difficulty)}
                            </span>
                          </div>
                          <div className="text-xs text-tg-hint mt-1">
                            Винрейт: {opponent.winRate}%
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="empire"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartBattle(opponent.id)
                        }}
                      >
                        Сразиться
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-xl">📜</span>
              <span className="bg-gradient-empire bg-clip-text text-transparent">История битв</span>
            </h3>
            
            <Card variant="glass">
              <GameTable.BattleLog battles={battles
                .filter(battle => battle.result && battle.result !== 'pending')
                .map(battle => ({
                  id: battle.id,
                  time: battle.time,
                  opponent: battle.opponent.name,
                  result: battle.result as 'victory' | 'defeat' | 'draw',
                  rewards: battle.rewards ? `${battle.rewards.coins} монет` : undefined
                }))} />
            </Card>
          </motion.div>
        )}

        {activeTab === 'tournaments' && (
          <motion.div
            key="tournaments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 space-y-4"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <span className="bg-gradient-empire bg-clip-text text-transparent">Турниры</span>
            </h3>
            
            <Card variant="gradient" className="p-6 text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-6xl mb-4"
              >
                🏆
              </motion.div>
              <h4 className="font-bold text-xl text-white mb-2">Турнир Чемпионов</h4>
              <p className="text-white/80 mb-4">
                Еженедельный турнир для лучших воинов
              </p>
              <Badge variant="premium" size="lg" className="mb-4">
                Приз: 10,000 монет
              </Badge>
              <div className="text-sm text-white/70 mb-4">
                До окончания: 2д 14ч
              </div>
              <Button variant="glass" size="lg" className="text-white border-white/30">
                Участвовать
              </Button>
            </Card>
            
            <Card variant="outlined" className="p-6 opacity-75">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Лига Героев</h4>
                <Badge variant="default">Скоро</Badge>
              </div>
              <p className="text-sm text-tg-hint mb-3">
                Премиум турнир с уникальными наградами
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-tg-hint">Начало: завтра в 12:00</span>
                <Badge variant="glass" size="sm">
                  Вход: 100 💎
                </Badge>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}