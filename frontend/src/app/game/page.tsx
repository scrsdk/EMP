'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useTelegram } from '@/hooks/useTelegram'
import { useNotifications, GameNotifications } from '@/components/ui/Notification'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Card, GameCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge, GameBadge } from '@/components/ui/Badge'
import { GameCarousel } from '@/components/ui/Carousel'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { NotificationCenter } from '@/components/ui/Notification'
import { formatNumber, formatCompactNumber } from '@/lib/format'

interface GameState {
  level: number
  experience: number
  maxExperience: number
  resources: {
    gold: number
    wood: number
    stone: number
    food: number
    energy: number
  }
  buildings: Array<{
    id: string
    name: string
    level: number
    icon: string
    production: number
    type: string
  }>
  heroes: Array<{
    id: string
    name: string
    avatar: string
    level: number
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    power: number
  }>
  guild?: {
    name: string
    level: number
    members: number
  }
}

interface MapTile {
  id: string
  x: number
  y: number
  type: 'empty' | 'building' | 'resource' | 'decoration'
  building?: {
    id: string
    name: string
    icon: string
    level: number
  }
  available: boolean
}

export default function GamePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { webApp, hapticFeedback } = useTelegram()
  const { addNotification } = useNotifications()
  const [gameState, setGameState] = useState<GameState>({
    level: 12,
    experience: 2850,
    maxExperience: 3500,
    resources: {
      gold: 125430,
      wood: 8520,
      stone: 6340,
      food: 12890,
      energy: 80
    },
    buildings: [
      {
        id: '1',
        name: 'Замок',
        level: 12,
        icon: '🏰',
        production: 120,
        type: 'main'
      },
      {
        id: '2',
        name: 'Шахта',
        level: 8,
        icon: '⛏️',
        production: 85,
        type: 'resource'
      },
      {
        id: '3',
        name: 'Лесопилка',
        level: 6,
        icon: '🪓',
        production: 45,
        type: 'resource'
      },
      {
        id: '4',
        name: 'Ферма',
        level: 10,
        icon: '🌾',
        production: 65,
        type: 'resource'
      }
    ],
    heroes: [
      {
        id: '1',
        name: 'Александр',
        avatar: '⚔️',
        level: 25,
        rarity: 'legendary',
        power: 1200
      },
      {
        id: '2',
        name: 'Елена',
        avatar: '🏹',
        level: 20,
        rarity: 'epic',
        power: 850
      },
      {
        id: '3',
        name: 'Игорь',
        avatar: '🛡️',
        level: 18,
        rarity: 'rare',
        power: 650
      }
    ],
    guild: {
      name: 'Империя',
      level: 8,
      members: 47
    }
  })

  const [selectedBuilding, setSelectedBuilding] = useState<typeof gameState.buildings[0] | null>(null)
  const [showBuildingModal, setShowBuildingModal] = useState(false)
  const [showHeroesModal, setShowHeroesModal] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'city' | 'heroes' | 'battles'>('city')
  const [resourceAnimation, setResourceAnimation] = useState<string | null>(null)
  const [selectedTile, setSelectedTile] = useState<MapTile | null>(null)
  
  // Генерация карты города
  const [cityMap, setCityMap] = useState<MapTile[]>(() => {
    const map: MapTile[] = []
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const id = `tile-${x}-${y}`
        const isCenter = x === 2 && y === 2
        const hasBuilding = (x === 1 && y === 1) || (x === 3 && y === 1) || (x === 1 && y === 3) || (x === 3 && y === 3)
        
        map.push({
          id,
          x,
          y,
          type: isCenter ? 'building' : hasBuilding ? 'building' : 'empty',
          building: isCenter ? {
            id: '1',
            name: 'Замок',
            icon: '🏰',
            level: 12
          } : hasBuilding ? {
            id: `b-${x}-${y}`,
            name: ['Шахта', 'Лесопилка', 'Ферма', 'Казармы'][Math.floor(Math.random() * 4)],
            icon: ['⛏️', '🪓', '🌾', '⚔️'][Math.floor(Math.random() * 4)],
            level: Math.floor(Math.random() * 5) + 1
          } : undefined,
          available: !isCenter && !hasBuilding && ((x + y) % 2 === 0)
        })
      }
    }
    return map
  })

  useEffect(() => {
    webApp?.ready()
    webApp?.expand()
    
    // Симуляция производства ресурсов
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        resources: {
          gold: Math.min(prev.resources.gold + 10, 999999),
          wood: Math.min(prev.resources.wood + 5, 999999),
          stone: Math.min(prev.resources.stone + 3, 999999),
          food: Math.min(prev.resources.food + 8, 999999),
          energy: Math.min(prev.resources.energy + 1, 100)
        }
      }))
      
      // Анимация случайного ресурса
      const resources = ['💰', '🪵', '⛰️', '🌾', '⚡']
      const randomResource = resources[Math.floor(Math.random() * resources.length)]
      setResourceAnimation(randomResource)
      
      // Показываем уведомление о производстве
      addNotification({
        type: 'success',
        title: 'Ресурсы произведены',
        message: `+10 ${randomResource}`,
        icon: randomResource,
        duration: 2000
      })
      
      setTimeout(() => setResourceAnimation(null), 1000)
    }, 5000)

    return () => clearInterval(interval)
  }, [webApp, addNotification])

  const handleBuildingClick = (building: typeof gameState.buildings[0]) => {
    hapticFeedback?.impactOccurred('light')
    setSelectedBuilding(building)
    setShowBuildingModal(true)
  }

  const handleUpgradeBuilding = () => {
    if (!selectedBuilding) return

    const cost = selectedBuilding.level * 100
    if (gameState.resources.gold >= cost) {
      hapticFeedback?.impactOccurred('medium')
      
      setGameState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          gold: prev.resources.gold - cost
        },
        buildings: prev.buildings.map(building => 
          building.id === selectedBuilding.id
            ? { ...building, level: building.level + 1, production: building.production + 10 }
            : building
        )
      }))
      
      addNotification({
        type: 'achievement',
        title: 'Здание улучшено!',
        message: `${selectedBuilding.name} теперь уровня ${selectedBuilding.level + 1}`,
        icon: selectedBuilding.icon,
        sound: true
      })
      
      setShowBuildingModal(false)
    } else {
      addNotification({
        type: 'error',
        title: 'Недостаточно золота',
        message: `Нужно ${cost} золота для улучшения`,
        icon: '❌'
      })
    }
  }

  const handleStartBattle = () => {
    hapticFeedback?.impactOccurred('heavy')
    router.push('/battles')
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-tg-bg flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-empire flex items-center justify-center mx-auto mb-4 shadow-glow">
            <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-tg-hint">Загрузка империи...</p>
        </motion.div>
      </div>
    )
  }

  const handleTileClick = (tile: MapTile) => {
    hapticFeedback?.impactOccurred('light')
    if (tile.type === 'building' && tile.building) {
      const building = gameState.buildings.find(b => b.name === tile.building?.name)
      if (building) {
        setSelectedBuilding(building)
        setShowBuildingModal(true)
      }
    } else if (tile.available) {
      setSelectedTile(tile)
      addNotification({
        type: 'info',
        title: 'Место для строительства',
        message: 'Здесь можно построить новое здание',
        icon: '🏗️'
      })
    }
  }

  return (
    <div className="min-h-screen bg-tg-bg pb-20">
      {/* Простой хедер */}
      <motion.div 
        className="bg-surface border-b border-surface/20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar
                  src={user?.avatar || ''}
                  alt={user?.username || 'Игрок'}
                  size="sm"
                  fallback={user?.username?.[0] || 'И'}
                  className="cursor-pointer"
                  onClick={() => router.push('/profile')}
                />
              </motion.div>
              <div>
                <h1 className="font-semibold text-base">
                  {user?.username || 'Игрок'}
                </h1>
                <motion.div 
                  className="text-xs text-tg-hint"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Уровень {gameState.level}
                </motion.div>
              </div>
            </div>
            
            <motion.div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    hapticFeedback?.impactOccurred('light')
                    router.push('/leaderboard')
                  }}
                  className="w-8 h-8"
                >
                  🏆
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    hapticFeedback?.impactOccurred('light')
                    router.push('/profile')
                  }}
                  className="w-8 h-8"
                >
                  ⚙️
                </Button>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Прогресс опыта */}
          <div>
            <div className="flex justify-between text-xs text-tg-hint mb-1">
              <span>Опыт</span>
              <span>{gameState.experience} / {gameState.maxExperience}</span>
            </div>
            <ProgressBar
              value={gameState.experience}
              max={gameState.maxExperience}
              variant="default"
              className="h-1.5"
              animated
            />
          </div>
        </div>
      </motion.div>

      {/* Ресурсы */}
      <motion.div 
        className="bg-surface/50 border-b border-surface/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {[
              { icon: '💰', amount: gameState.resources.gold, label: 'Золото' },
              { icon: '🪵', amount: gameState.resources.wood, label: 'Дерево' },
              { icon: '⛰️', amount: gameState.resources.stone, label: 'Камень' },
              { icon: '🌾', amount: gameState.resources.food, label: 'Еда' },
              { icon: '⚡', amount: gameState.resources.energy, label: 'Энергия' },
            ].map((resource, index) => (
              <motion.div 
                key={resource.icon} 
                className="flex-1 text-center relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.1 }}
              >
                {resourceAnimation === resource.icon && (
                  <motion.div
                    className="absolute inset-0 bg-green-500/20 rounded-lg"
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                <motion.div 
                  className="text-lg"
                  animate={resourceAnimation === resource.icon ? {
                    scale: [1, 1.3, 1],
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {resource.icon}
                </motion.div>
                <motion.div 
                  className="text-sm font-medium"
                  key={resource.amount}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {formatCompactNumber(resource.amount)}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Основной контент */}
      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Главная карточка города */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="solid" className="p-6 text-center overflow-hidden relative">
            <motion.div
              className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            
            <motion.div 
              className="text-6xl mb-3"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [-2, 2, -2]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              🏰
            </motion.div>
            <h2 className="font-bold text-xl mb-1">Империя {user?.username || 'Игрока'}</h2>
            <p className="text-sm text-tg-hint mb-4">
              Сила: {gameState.heroes.reduce((sum, h) => sum + h.power, 0)} • Гильдия: {gameState.guild?.name || 'Нет'}
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: '⚔️', label: 'Битвы', onClick: handleStartBattle, variant: 'primary' as const },
                { icon: '🗺️', label: 'Карта', onClick: () => setShowMapModal(true), variant: 'secondary' as const },
                { icon: '🦸', label: 'Герои', onClick: () => setShowHeroesModal(true), variant: 'secondary' as const }
              ].map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={action.variant}
                    size="sm"
                    onClick={() => {
                      hapticFeedback?.impactOccurred('light')
                      action.onClick()
                    }}
                    className="flex-col gap-1 h-auto py-3 w-full"
                  >
                    <span className="text-xl">{action.icon}</span>
                    <span className="text-xs">{action.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Здания */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Здания</h3>
            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" onClick={() => {}}>
                Все →
              </Button>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {gameState.buildings.map((building, index) => (
              <motion.div
                key={building.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  variant="outlined"
                  interactive
                  onClick={() => {
                    hapticFeedback?.impactOccurred('light')
                    handleBuildingClick(building)
                  }}
                  className="p-4 hover:border-tg-link transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <motion.div 
                        className="text-2xl mb-1"
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                      >
                        {building.icon}
                      </motion.div>
                      <h4 className="font-medium text-sm">{building.name}</h4>
                      <p className="text-xs text-tg-hint">Уровень {building.level}</p>
                    </div>
                    <div className="text-right">
                      <motion.div 
                        className="text-xs text-emerald-600 font-medium"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        +{building.production}
                      </motion.div>
                      <div className="text-xs text-tg-hint">/час</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Герои */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Герои</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowHeroesModal(true)}>
              Все {gameState.heroes.length} →
            </Button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {gameState.heroes.map((hero, index) => (
              <motion.div
                key={hero.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  variant="outlined"
                  className="flex-shrink-0 w-24 p-3 text-center cursor-pointer hover:border-tg-link transition-all"
                  onClick={() => {
                    hapticFeedback?.impactOccurred('light')
                    addNotification({
                      type: 'info',
                      title: hero.name,
                      message: `Сила: ${hero.power} • ${hero.rarity}`,
                      icon: hero.avatar
                    })
                  }}
                >
                  <motion.div 
                    className="text-3xl mb-1"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    {hero.avatar}
                  </motion.div>
                  <h4 className="text-xs font-medium truncate">{hero.name}</h4>
                  <p className="text-xs text-tg-hint">Ур. {hero.level}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ежедневные задания */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.01 }}
        >
          <Card variant="solid" className="p-4 relative overflow-hidden">
            <motion.div
              className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-xl"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Ежедневные задания</h3>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Badge variant="success" size="sm">3/5</Badge>
              </motion.div>
            </div>
            <ProgressBar value={60} variant="default" className="h-2 mb-2" animated />
            <p className="text-sm text-tg-hint mb-3">Завершите еще 2 задания для награды</p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="primary" 
                size="sm" 
                fullWidth
                onClick={() => {
                  hapticFeedback?.impactOccurred('light')
                  router.push('/game/quests')
                }}
              >
                Посмотреть задания
              </Button>
            </motion.div>
          </Card>
        </motion.div>
        
        {/* Быстрый доступ к магазину */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Card variant="outlined" interactive onClick={() => router.push('/game/store')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="text-3xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🏪
                </motion.div>
                <div>
                  <h4 className="font-medium">Магазин</h4>
                  <p className="text-sm text-tg-hint">Новые предложения!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" size="sm">Скидки</Badge>
                <span className="text-tg-hint">→</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Модальное окно здания */}
      <Modal
        isOpen={showBuildingModal}
        onClose={() => setShowBuildingModal(false)}
        title={selectedBuilding?.name || ''}
      >
        {selectedBuilding && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">{selectedBuilding.icon}</div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface rounded-full text-sm">
                <span className="text-tg-hint">Уровень</span>
                <span className="font-bold">{selectedBuilding.level}</span>
              </div>
            </div>
            
            <Card variant="outlined" padding="sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tg-hint">Производство</span>
                  <span className="font-medium">+{selectedBuilding.production}/час</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tg-hint">После улучшения</span>
                  <span className="font-medium text-emerald-600">+{selectedBuilding.production + 10}/час</span>
                </div>
              </div>
            </Card>
            
            <div>
              <p className="text-sm text-tg-hint mb-2">Стоимость улучшения:</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <span className="font-medium">{selectedBuilding.level * 100}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🪵</span>
                  <span className="font-medium">{selectedBuilding.level * 50}</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="primary"
              fullWidth
              onClick={handleUpgradeBuilding}
            >
              Улучшить до уровня {selectedBuilding.level + 1}
            </Button>
          </div>
        )}
      </Modal>

      {/* Модальное окно героев */}
      <Modal
        isOpen={showHeroesModal}
        onClose={() => setShowHeroesModal(false)}
        title="Герои империи"
        size="lg"
      >
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {gameState.heroes.map((hero) => (
            <GameCard.Hero
              key={hero.id}
              name={hero.name}
              level={hero.level}
              power={hero.power}
              avatar={hero.avatar}
              rarity={hero.rarity}
              onClick={() => {
                hapticFeedback?.impactOccurred('light')
                addNotification({
                  type: 'info',
                  title: hero.name,
                  message: `Сила: ${hero.power} | Редкость: ${hero.rarity}`,
                  icon: hero.avatar
                })
              }}
            />
          ))}
        </div>
      </Modal>

      {/* Модальное окно карты города */}
      <Modal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        title="Карта города"
        size="full"
      >
        <div className="space-y-4">
          <div className="text-center text-sm text-tg-hint">
            Нажмите на пустую клетку чтобы построить
          </div>
          
          {/* Сетка карты */}
          <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
            {cityMap.map((tile) => (
              <motion.div
                key={tile.id}
                whileHover={{ scale: tile.available || tile.type === 'building' ? 1.05 : 1 }}
                whileTap={{ scale: tile.available || tile.type === 'building' ? 0.95 : 1 }}
                onClick={() => handleTileClick(tile)}
                className={`
                  aspect-square rounded-lg flex items-center justify-center relative
                  ${tile.type === 'building' ? 'bg-gradient-to-br from-tg-button/20 to-tg-link/20 border-2 border-tg-button/30' : ''}
                  ${tile.type === 'empty' && tile.available ? 'bg-green-500/10 border-2 border-dashed border-green-500/30 cursor-pointer' : ''}
                  ${tile.type === 'empty' && !tile.available ? 'bg-surface/30' : ''}
                `}
              >
                {tile.type === 'building' && tile.building && (
                  <div className="text-center">
                    <motion.div 
                      className="text-3xl mb-1"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: tile.building.name === 'Замок' ? [0, 5, -5, 0] : 0
                      }}
                      transition={{ 
                        duration: tile.building.name === 'Замок' ? 3 : 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                    >
                      {tile.building.icon}
                    </motion.div>
                    <div className="text-xs font-medium">{tile.building.name}</div>
                    <div className="text-xs text-tg-hint">Ур.{tile.building.level}</div>
                  </div>
                )}
                
                {tile.type === 'empty' && tile.available && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl text-green-600"
                  >
                    +
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Легенда */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-tg-button/20 to-tg-link/20 border border-tg-button/30 rounded" />
              <span>Здание</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/10 border border-dashed border-green-500/30 rounded" />
              <span>Доступно</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-surface/30 rounded" />
              <span>Занято</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push('/game/build')}
            >
              🏗️ Строить
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowMapModal(false)}
            >
              Закрыть
            </Button>
          </div>
        </div>
      </Modal>

      <BottomNav />
      <NotificationCenter />
    </div>
  )
}