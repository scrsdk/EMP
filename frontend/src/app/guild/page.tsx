'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useTelegram } from '@/hooks/useTelegram'
import { useNotifications } from '@/components/ui/Notification'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatNumber } from '@/lib/format'

interface GuildMember { 
  id: string
  name: string
  avatar?: string
  role: 'leader' | 'officer' | 'member'
  level: number
  contribution: number
  online: boolean
  lastActive?: string
}

interface GuildInfo {
  id: string
  name: string
  tag: string
  level: number
  experience: number
  maxExperience: number
  members: number
  maxMembers: number
  description: string
  requirements: {
    minLevel: number
    approval: boolean
  }
  treasury: {
    gold: number
    gems: number
  }
  rank: number
  power: number
}

export default function GuildPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { hapticFeedback } = useTelegram()
  const { addNotification } = useNotifications()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'treasury' | 'wars'>('overview')
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [donateAmount, setDonateAmount] = useState('')
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<GuildMember | null>(null)
  
  const [hasGuild] = useState(true) // Для демонстрации
  
  const guildInfo: GuildInfo = {
    id: '1',
    name: 'Империя Драконов',
    tag: 'DRG',
    level: 8,
    experience: 45000,
    maxExperience: 60000,
    members: 47,
    maxMembers: 50,
    description: 'Сильнейшая гильдия сервера. Только активные игроки!',
    requirements: {
      minLevel: 10,
      approval: true
    },
    treasury: {
      gold: 2500000,
      gems: 15000
    },
    rank: 3,
    power: 187500
  }
  
  const members: GuildMember[] = [
    {
      id: '1',
      name: 'DragonMaster',
      avatar: '/avatars/dragon.png',
      role: 'leader',
      level: 42,
      contribution: 125000,
      online: true
    },
    {
      id: '2',
      name: 'PhoenixWarrior',
      avatar: '/avatars/phoenix.png',
      role: 'officer',
      level: 38,
      contribution: 98000,
      online: true
    },
    {
      id: '3',
      name: 'StormBringer',
      avatar: '/avatars/storm.png',
      role: 'officer',
      level: 35,
      contribution: 87000,
      online: false,
      lastActive: '2ч назад'
    },
    {
      id: '4',
      name: user?.username || 'Вы',
      avatar: user?.avatar,
      role: 'member',
      level: 12,
      contribution: 15680,
      online: true
    }
  ]
  
  const currentWar = {
    opponent: 'Темный Легион',
    status: 'active',
    score: { us: 12450, them: 11890 },
    timeLeft: '18ч 45м'
  }
  
  const tabs = [
    { id: 'overview' as const, label: 'Обзор', icon: '🏰' },
    { id: 'members' as const, label: 'Участники', icon: '👥' },
    { id: 'treasury' as const, label: 'Казна', icon: '💰' },
    { id: 'wars' as const, label: 'Войны', icon: '⚔️' }
  ]
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'leader': return 'text-yellow-600'
      case 'officer': return 'text-blue-600'
      default: return 'text-tg-text'
    }
  }
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'leader': return '👑'
      case 'officer': return '⭐'
      default: return ''
    }
  }
  
  const handleDonate = () => {
    const amount = parseInt(donateAmount)
    if (amount > 0) {
      hapticFeedback?.impactOccurred('heavy')
      addNotification({
        type: 'success',
        title: 'Пожертвование успешно',
        message: `Вы внесли ${amount} 💰 в казну гильдии`,
        icon: '💰',
        sound: true
      })
      setShowDonateModal(false)
      setDonateAmount('')
    }
  }
  
  const handleMemberClick = (member: GuildMember) => {
    hapticFeedback?.impactOccurred('light')
    setSelectedMember(member)
    setShowMemberModal(true)
  }
  
  if (!hasGuild) {
    return (
      <div className="min-h-screen bg-tg-bg pb-20">
        <motion.div 
          className="bg-surface border-b border-surface/20"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="px-4 py-3">
            <h1 className="font-semibold text-lg">Гильдия</h1>
          </div>
        </motion.div>
        
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🏰</div>
            <h2 className="font-bold text-xl mb-2">У вас нет гильдии</h2>
            <p className="text-tg-hint mb-6">
              Присоединитесь к существующей гильдии или создайте свою
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={() => router.push('/guild/search')}
              >
                Найти гильдию
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => router.push('/guild/create')}
              >
                Создать гильдию
              </Button>
            </div>
          </motion.div>
        </div>
        
        <BottomNav />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-tg-bg pb-20">
      {/* Хедер гильдии */}
      <motion.div 
        className="bg-gradient-to-b from-tg-button to-tg-button/80"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
              >
                <span className="text-2xl">🛡️</span>
              </motion.div>
              <div>
                <h1 className="font-bold text-lg text-white">
                  {guildInfo.name} [{guildInfo.tag}]
                </h1>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <span>Уровень {guildInfo.level}</span>
                  <span>•</span>
                  <span>#{guildInfo.rank}</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="glass"
              size="icon"
              onClick={() => router.push('/guild/settings')}
              className="text-white border-white/20"
            >
              ⚙️
            </Button>
          </div>
          
          {/* Прогресс гильдии */}
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex justify-between text-xs text-white/80 mb-1">
              <span>Опыт гильдии</span>
              <span>{formatNumber(guildInfo.experience)} / {formatNumber(guildInfo.maxExperience)}</span>
            </div>
            <ProgressBar
              value={(guildInfo.experience / guildInfo.maxExperience) * 100}
              variant="default"
              className="h-2 bg-white/20"
              animated
            />
          </div>
        </div>
      </motion.div>
      
      {/* Табы */}
      <div className="px-4 py-3 bg-surface/50">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticFeedback?.impactOccurred('light')
                setActiveTab(tab.id)
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-tg-button text-white'
                  : 'bg-surface text-tg-hint hover:text-tg-text'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Контент */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* Обзор */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Статистика */}
              <Card variant="outlined">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold">{guildInfo.members}/{guildInfo.maxMembers}</div>
                    <div className="text-xs text-tg-hint">Участников</div>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold">{formatNumber(guildInfo.power)}</div>
                    <div className="text-xs text-tg-hint">Сила</div>
                  </motion.div>
                </div>
              </Card>
              
              {/* Текущая война */}
              {currentWar && (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card variant="outlined" interactive className="overflow-hidden">
                    <div className="bg-red-500/10 px-4 py-2 -m-4 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-600">⚔️ Война гильдий</span>
                        <Badge variant="info" size="xs">
                          {currentWar.timeLeft}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <div className="text-sm text-tg-hint mb-1">Мы</div>
                          <div className="font-bold text-lg text-green-600">
                            {formatNumber(currentWar.score.us)}
                          </div>
                        </div>
                        <div className="text-2xl">⚔️</div>
                        <div className="text-center flex-1">
                          <div className="text-sm text-tg-hint mb-1">{currentWar.opponent}</div>
                          <div className="font-bold text-lg text-red-600">
                            {formatNumber(currentWar.score.them)}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => router.push('/guild/war')}
                      >
                        Участвовать в войне
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
              
              {/* Описание */}
              <Card variant="outlined">
                <h3 className="font-medium mb-2">О гильдии</h3>
                <p className="text-sm text-tg-hint">{guildInfo.description}</p>
                <div className="mt-3 pt-3 border-t border-surface/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-tg-hint">Требования</span>
                    <span>Уровень {guildInfo.requirements.minLevel}+</span>
                  </div>
                </div>
              </Card>
              
              {/* Быстрые действия */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="secondary"
                    fullWidth
                    className="h-20 flex-col gap-1"
                    onClick={() => setShowDonateModal(true)}
                  >
                    <span className="text-2xl">💰</span>
                    <span className="text-xs">Пожертвовать</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="secondary"
                    fullWidth
                    className="h-20 flex-col gap-1"
                    onClick={() => router.push('/guild/shop')}
                  >
                    <span className="text-2xl">🏪</span>
                    <span className="text-xs">Магазин</span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {/* Участники */}
          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleMemberClick(member)}
                >
                  <Card variant="outlined" interactive className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar
                          src={member.avatar}
                          alt={member.name}
                          size="sm"
                          fallback={member.name[0]}
                        />
                        {member.online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-surface" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <span className={`font-medium ${getRoleColor(member.role)}`}>
                            {member.name}
                          </span>
                          {getRoleBadge(member.role) && (
                            <span>{getRoleBadge(member.role)}</span>
                          )}
                        </div>
                        <div className="text-xs text-tg-hint">
                          Уровень {member.level} • Вклад: {formatNumber(member.contribution)}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {member.online ? (
                          <Badge variant="success" size="xs">В сети</Badge>
                        ) : (
                          <span className="text-xs text-tg-hint">{member.lastActive}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {/* Казна */}
          {activeTab === 'treasury' && (
            <motion.div
              key="treasury"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card variant="outlined">
                <h3 className="font-medium mb-3">Ресурсы гильдии</h3>
                <div className="space-y-3">
                  <motion.div 
                    className="flex items-center justify-between p-3 bg-surface/50 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💰</span>
                      <span className="font-medium">Золото</span>
                    </div>
                    <span className="font-bold text-lg">
                      {formatNumber(guildInfo.treasury.gold)}
                    </span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center justify-between p-3 bg-surface/50 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💎</span>
                      <span className="font-medium">Кристаллы</span>
                    </div>
                    <span className="font-bold text-lg">
                      {formatNumber(guildInfo.treasury.gems)}
                    </span>
                  </motion.div>
                </div>
                
                <Button
                  variant="primary"
                  fullWidth
                  className="mt-4"
                  onClick={() => setShowDonateModal(true)}
                >
                  Пожертвовать в казну
                </Button>
              </Card>
              
              <Card variant="outlined">
                <h3 className="font-medium mb-3">Последние пожертвования</h3>
                <div className="space-y-2">
                  {[
                    { name: 'DragonMaster', amount: 10000, time: '10м назад' },
                    { name: 'PhoenixWarrior', amount: 5000, time: '1ч назад' },
                    { name: 'Вы', amount: 1000, time: '3ч назад' }
                  ].map((donation, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm">{donation.name}</span>
                      <div className="text-right">
                        <div className="font-medium">+{donation.amount} 💰</div>
                        <div className="text-xs text-tg-hint">{donation.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
          
          {/* Войны */}
          {activeTab === 'wars' && (
            <motion.div
              key="wars"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card variant="outlined">
                <h3 className="font-medium mb-3">История войн</h3>
                <div className="space-y-3">
                  {[
                    { opponent: 'Темный Легион', result: 'active', score: '12,450 - 11,890', date: 'Сейчас' },
                    { opponent: 'Золотые Драконы', result: 'win', score: '15,230 - 12,780', date: '3д назад' },
                    { opponent: 'Повелители Бури', result: 'loss', score: '13,890 - 14,120', date: '1н назад' }
                  ].map((war, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-3 rounded-lg border ${
                        war.result === 'active' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        war.result === 'win' ? 'bg-green-500/10 border-green-500/30' :
                        'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{war.opponent}</span>
                        <Badge 
                          variant={
                            war.result === 'active' ? 'warning' :
                            war.result === 'win' ? 'success' : 'info'
                          }
                          size="xs"
                        >
                          {war.result === 'active' ? 'В процессе' :
                           war.result === 'win' ? 'Победа' : 'Поражение'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-tg-hint">{war.score}</span>
                        <span className="text-xs text-tg-hint">{war.date}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Модальное окно пожертвования */}
      <Modal
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
        title="Пожертвование в казну"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl mb-3">💰</div>
            <p className="text-sm text-tg-hint">
              Ваш баланс: 125,430 золота
            </p>
          </div>
          
          <Input
            type="number"
            placeholder="Введите сумму"
            value={donateAmount}
            onChange={(e) => setDonateAmount(e.target.value)}
            icon="💰"
          />
          
          <div className="grid grid-cols-3 gap-2">
            {[1000, 5000, 10000].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setDonateAmount(amount.toString())}
              >
                {amount}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDonateModal(false)}
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleDonate}
            >
              Пожертвовать
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Модальное окно участника */}
      <Modal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        title="Информация об участнике"
      >
        {selectedMember && (
          <div className="space-y-4">
            <div className="text-center">
              <Avatar
                src={selectedMember.avatar}
                alt={selectedMember.name}
                size="xl"
                fallback={selectedMember.name[0]}
                className="mx-auto mb-3"
              />
              <h3 className="font-bold text-lg flex items-center justify-center gap-1">
                {selectedMember.name}
                {getRoleBadge(selectedMember.role) && (
                  <span>{getRoleBadge(selectedMember.role)}</span>
                )}
              </h3>
              <p className="text-sm text-tg-hint">Уровень {selectedMember.level}</p>
            </div>
            
            <Card variant="outlined" padding="sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-tg-hint">Роль</span>
                  <span className={`font-medium ${getRoleColor(selectedMember.role)}`}>
                    {selectedMember.role === 'leader' ? 'Лидер' :
                     selectedMember.role === 'officer' ? 'Офицер' : 'Участник'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-tg-hint">Вклад</span>
                  <span className="font-medium">{formatNumber(selectedMember.contribution)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-tg-hint">Статус</span>
                  {selectedMember.online ? (
                    <Badge variant="success" size="xs">В сети</Badge>
                  ) : (
                    <span className="text-sm">{selectedMember.lastActive}</span>
                  )}
                </div>
              </div>
            </Card>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  hapticFeedback?.impactOccurred('light')
                  router.push(`/profile/${selectedMember.id}`)
                }}
              >
                Профиль
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  hapticFeedback?.impactOccurred('light')
                  addNotification({
                    type: 'info',
                    title: 'Сообщение отправлено',
                    message: `Сообщение игроку ${selectedMember.name}`,
                    icon: '💬'
                  })
                  setShowMemberModal(false)
                }}
              >
                Написать
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      <BottomNav />
    </div>
  )
}