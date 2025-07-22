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
import { ProgressBar } from '@/components/ui/ProgressBar'

interface Quest {
  id: string
  title: string
  description: string
  icon: string
  type: 'daily' | 'weekly' | 'special' | 'story'
  status: 'active' | 'completed' | 'locked'
  progress: number
  maxProgress: number
  rewards: {
    type: 'gold' | 'gems' | 'experience' | 'item'
    amount: number
    icon: string
  }[]
  timeLeft?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export default function QuestsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { hapticFeedback } = useTelegram()
  const { addNotification } = useNotifications()
  
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'special' | 'story'>('daily')
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  
  const quests: Quest[] = [
    {
      id: '1',
      title: 'Утренний сбор',
      description: 'Соберите ресурсы из всех зданий',
      icon: '🌅',
      type: 'daily',
      status: 'active',
      progress: 3,
      maxProgress: 5,
      rewards: [
        { type: 'gold', amount: 500, icon: '💰' },
        { type: 'experience', amount: 50, icon: '⭐' }
      ],
      timeLeft: '12ч 34м',
      difficulty: 'easy'
    },
    {
      id: '2',
      title: 'Воин арены',
      description: 'Выиграйте 10 битв на арене',
      icon: '⚔️',
      type: 'daily',
      status: 'active',
      progress: 7,
      maxProgress: 10,
      rewards: [
        { type: 'gems', amount: 50, icon: '💎' },
        { type: 'experience', amount: 100, icon: '⭐' }
      ],
      timeLeft: '12ч 34м',
      difficulty: 'medium'
    },
    {
      id: '3',
      title: 'Строитель империи',
      description: 'Улучшите любое здание до 5 уровня',
      icon: '🏗️',
      type: 'daily',
      status: 'completed',
      progress: 1,
      maxProgress: 1,
      rewards: [
        { type: 'gold', amount: 1000, icon: '💰' }
      ],
      difficulty: 'easy'
    },
    {
      id: '4',
      title: 'Недельный марафон',
      description: 'Войдите в игру 7 дней подряд',
      icon: '📅',
      type: 'weekly',
      status: 'active',
      progress: 4,
      maxProgress: 7,
      rewards: [
        { type: 'gems', amount: 200, icon: '💎' },
        { type: 'gold', amount: 5000, icon: '💰' }
      ],
      timeLeft: '3д 18ч',
      difficulty: 'easy'
    },
    {
      id: '5',
      title: 'Повелитель гильдии',
      description: 'Внесите 10,000 очков в гильдию',
      icon: '🛡️',
      type: 'weekly',
      status: 'active',
      progress: 6500,
      maxProgress: 10000,
      rewards: [
        { type: 'gems', amount: 300, icon: '💎' },
        { type: 'item', amount: 1, icon: '🎁' }
      ],
      timeLeft: '3д 18ч',
      difficulty: 'hard'
    },
    {
      id: '6',
      title: 'Легенда TON',
      description: 'Достигните 20 уровня',
      icon: '👑',
      type: 'special',
      status: 'active',
      progress: 12,
      maxProgress: 20,
      rewards: [
        { type: 'gems', amount: 500, icon: '💎' },
        { type: 'item', amount: 1, icon: '🏆' }
      ],
      difficulty: 'hard'
    },
    {
      id: '7',
      title: 'Глава I: Начало',
      description: 'Основайте свою первую империю',
      icon: '📖',
      type: 'story',
      status: 'completed',
      progress: 1,
      maxProgress: 1,
      rewards: [
        { type: 'gold', amount: 1000, icon: '💰' }
      ]
    },
    {
      id: '8',
      title: 'Глава II: Рост',
      description: 'Расширьте империю до 5 районов',
      icon: '📖',
      type: 'story',
      status: 'active',
      progress: 3,
      maxProgress: 5,
      rewards: [
        { type: 'gems', amount: 100, icon: '💎' },
        { type: 'gold', amount: 2000, icon: '💰' }
      ]
    }
  ]

  const tabs = [
    { id: 'daily' as const, label: 'Ежедневные', icon: '☀️' },
    { id: 'weekly' as const, label: 'Недельные', icon: '📅' },
    { id: 'special' as const, label: 'Особые', icon: '⭐' },
    { id: 'story' as const, label: 'Сюжет', icon: '📖' }
  ]

  const filteredQuests = quests.filter(quest => quest.type === activeTab)
  const activeQuests = filteredQuests.filter(q => q.status === 'active')
  const completedQuests = filteredQuests.filter(q => q.status === 'completed')

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'hard': return 'text-red-600'
      default: return 'text-tg-hint'
    }
  }

  const handleClaimReward = (quest: Quest) => {
    hapticFeedback?.impactOccurred('heavy')
    
    const rewardText = quest.rewards
      .map(r => `${r.amount} ${r.icon}`)
      .join(', ')
    
    addNotification({
      type: 'achievement',
      title: 'Награда получена!',
      message: `Вы получили: ${rewardText}`,
      icon: '🎁',
      sound: true
    })
  }

  const handleQuestClick = (quest: Quest) => {
    hapticFeedback?.impactOccurred('light')
    setSelectedQuest(quest)
  }

  return (
    <div className="min-h-screen bg-tg-bg pb-20">
      {/* Хедер */}
      <motion.div 
        className="bg-surface border-b border-surface/20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
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
              <h1 className="font-semibold text-lg">Задания</h1>
            </div>
            
            {/* Статистика заданий */}
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">
                ✓ {completedQuests.length}
              </Badge>
              <Badge variant="glass" size="sm">
                ⏳ {activeQuests.length}
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Прогресс дня */}
      <motion.div 
        className="px-4 py-3 bg-surface/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-tg-hint">Прогресс дня</span>
          <span className="text-sm font-medium">
            {completedQuests.filter(q => q.type === 'daily').length}/
            {quests.filter(q => q.type === 'daily').length}
          </span>
        </div>
        <ProgressBar 
          value={(completedQuests.filter(q => q.type === 'daily').length / quests.filter(q => q.type === 'daily').length) * 100} 
          variant="default"
          className="h-2"
          animated
        />
        <motion.p 
          className="text-xs text-tg-hint mt-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Выполните все ежедневные задания для бонуса!
        </motion.p>
      </motion.div>

      {/* Табы */}
      <div className="px-4 py-3">
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

      {/* Список заданий */}
      <div className="px-4 space-y-6">
        {/* Активные задания */}
        {activeQuests.length > 0 && (
          <div>
            <h3 className="font-medium text-sm text-tg-hint mb-3">Активные</h3>
            <div className="space-y-3">
              {activeQuests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card 
                    variant="outlined" 
                    interactive
                    onClick={() => handleQuestClick(quest)}
                    className="p-4"
                  >
                    <div className="flex items-start gap-3">
                      <motion.div 
                        className="text-3xl flex-shrink-0"
                        animate={{ 
                          rotate: [-5, 5, -5],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.2
                        }}
                      >
                        {quest.icon}
                      </motion.div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{quest.title}</h4>
                          {quest.timeLeft && (
                            <Badge variant="glass" size="xs">
                              ⏰ {quest.timeLeft}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-tg-hint mb-2">{quest.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className={getDifficultyColor(quest.difficulty)}>
                              {quest.difficulty === 'easy' && '● Легко'}
                              {quest.difficulty === 'medium' && '●● Средне'}
                              {quest.difficulty === 'hard' && '●●● Сложно'}
                            </span>
                            <span className="font-medium">
                              {quest.progress}/{quest.maxProgress}
                            </span>
                          </div>
                          
                          <ProgressBar 
                            value={(quest.progress / quest.maxProgress) * 100}
                            variant="default"
                            className="h-1.5"
                          />
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-tg-hint">Награды:</span>
                            <div className="flex items-center gap-2">
                              {quest.rewards.map((reward, i) => (
                                <motion.span 
                                  key={i} 
                                  className="text-sm font-medium"
                                  whileHover={{ scale: 1.2 }}
                                >
                                  {reward.amount} {reward.icon}
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Выполненные задания */}
        {completedQuests.length > 0 && (
          <div>
            <h3 className="font-medium text-sm text-tg-hint mb-3">Выполнено</h3>
            <div className="space-y-3">
              {completedQuests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card 
                    variant="outlined" 
                    className="p-4 bg-green-500/5 border-green-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl opacity-50">{quest.icon}</div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-green-600">{quest.title} ✓</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {quest.rewards.map((reward, i) => (
                            <span key={i} className="text-sm">
                              {reward.amount} {reward.icon}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleClaimReward(quest)
                          }}
                        >
                          Забрать
                        </Button>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Информация о выбранном задании */}
      <AnimatePresence>
        {selectedQuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 flex items-end"
            onClick={() => setSelectedQuest(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-t-3xl w-full p-6 max-h-[70vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-surface/50 rounded-full mx-auto mb-4" />
              
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{selectedQuest.icon}</div>
                <h3 className="font-bold text-xl mb-2">{selectedQuest.title}</h3>
                <p className="text-tg-hint">{selectedQuest.description}</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-surface/50 rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-tg-hint">Прогресс</span>
                    <span className="font-medium">
                      {selectedQuest.progress}/{selectedQuest.maxProgress}
                    </span>
                  </div>
                  <ProgressBar 
                    value={(selectedQuest.progress / selectedQuest.maxProgress) * 100}
                    variant="default"
                    animated
                  />
                </div>
                
                <div className="bg-surface/50 rounded-xl p-4">
                  <h4 className="font-medium mb-3">Награды за выполнение</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedQuest.rewards.map((reward, i) => (
                      <div key={i} className="flex items-center gap-2 bg-surface/50 rounded-lg p-3">
                        <span className="text-2xl">{reward.icon}</span>
                        <div>
                          <div className="font-medium">{reward.amount}</div>
                          <div className="text-xs text-tg-hint capitalize">{reward.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setSelectedQuest(null)}
                >
                  Закрыть
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}