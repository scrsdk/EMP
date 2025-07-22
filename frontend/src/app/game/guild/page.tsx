'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/hooks/useGame'
import { useTelegram } from '@/hooks/useTelegram'
import { formatNumber } from '@/lib/utils'

interface GuildMember {
  id: string
  username: string
  level: number
  role: 'leader' | 'officer' | 'member'
  contribution: number
  is_online: boolean
  join_date: string
}

interface GuildInfo {
  id: string
  name: string
  tag: string
  level: number
  experience: number
  max_experience: number
  member_count: number
  max_members: number
  description: string
  requirements: {
    min_level: number
    min_power: number
  }
  created_at: string
}

export default function GuildPage() {
  const { guild } = useGame()
  const { hapticFeedback } = useTelegram()
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'search'>('overview')
  const [guildSearchResults, setGuildSearchResults] = useState<GuildInfo[]>([])

  // Mock guild data
  const mockGuild: GuildInfo = {
    id: '1',
    name: 'Empire Builders',
    tag: 'EB',
    level: 8,
    experience: 750000,
    max_experience: 1000000,
    member_count: 42,
    max_members: 50,
    description: 'United we build, together we conquer! Join our growing empire and help us dominate the TON blockchain.',
    requirements: {
      min_level: 5,
      min_power: 500,
    },
    created_at: '2024-01-01T00:00:00Z',
  }

  const mockMembers: GuildMember[] = [
    {
      id: '1',
      username: 'GuildMaster',
      level: 25,
      role: 'leader',
      contribution: 50000,
      is_online: true,
      join_date: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      username: 'ViceCommander',
      level: 22,
      role: 'officer',
      contribution: 35000,
      is_online: false,
      join_date: '2024-01-05T00:00:00Z',
    },
    {
      id: '3',
      username: 'TopBuilder',
      level: 20,
      role: 'member',
      contribution: 28000,
      is_online: true,
      join_date: '2024-01-10T00:00:00Z',
    },
  ]

  const searchGuilds = async () => {
    // Mock guild search results
    const mockResults: GuildInfo[] = [
      {
        id: '2',
        name: 'Dragon Slayers',
        tag: 'DS',
        level: 12,
        experience: 1200000,
        max_experience: 1500000,
        member_count: 48,
        max_members: 50,
        description: 'Elite warriors seeking glory and treasure.',
        requirements: { min_level: 15, min_power: 1000 },
        created_at: '2023-12-01T00:00:00Z',
      },
      {
        id: '3',
        name: 'Peaceful Traders',
        tag: 'PT',
        level: 6,
        experience: 300000,
        max_experience: 500000,
        member_count: 25,
        max_members: 40,
        description: 'Focus on trade and economic growth.',
        requirements: { min_level: 1, min_power: 100 },
        created_at: '2024-01-15T00:00:00Z',
      },
    ]
    setGuildSearchResults(mockResults)
  }

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: '🏛️' },
    { id: 'members', label: 'Участники', icon: '👥' },
    { id: 'search', label: 'Поиск', icon: '🔍' },
  ]

  const handleTabClick = (tabId: string) => {
    hapticFeedback?.impactOccurred('light')
    setActiveTab(tabId as any)
  }

  const handleActionClick = () => {
    hapticFeedback?.impactOccurred('medium')
  }

  const getRoleColor = (role: GuildMember['role']) => {
    switch (role) {
      case 'leader':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'officer':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getRoleName = (role: GuildMember['role']) => {
    switch (role) {
      case 'leader':
        return 'Leader'
      case 'officer':
        return 'Officer'
      default:
        return 'Member'
    }
  }

  return (
    <div className="page-container pb-nav">
      {/* Header */}
      <div className="app-header header-gradient">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Гильдия</h1>
            <p className="text-white/80 text-sm">
              {guild ? 'Управляйте гильдией и союзниками' : 'Найдите и присоединитесь к гильдии'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚔️</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Tab Navigation */}
        <div className="glass-card p-1">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-primary text-white shadow-medium'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {true ? (
              <>
                {/* Guild Info */}
                <div className="premium-card space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        [{mockGuild.tag}] {mockGuild.name}
                      </h2>
                      <p className="text-white/80 mt-1">
                        Уровень {mockGuild.level} • Создана в январе 2024
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/60">Участники</div>
                      <div className="text-xl font-bold text-white">
                        {mockGuild.member_count}/{mockGuild.max_members}
                      </div>
                    </div>
                  </div>

                  <p className="text-white/90 text-sm">
                    Объединившись, мы строим, вместе мы побеждаем! Присоединяйтесь к нашей растущей империи.
                  </p>

                  {/* Guild Experience Bar */}
                  <div>
                    <div className="flex justify-between text-sm text-white/80 mb-2">
                      <span>Опыт гильдии</span>
                      <span>{formatNumber(mockGuild.experience)} / {formatNumber(mockGuild.max_experience)}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-gradient-warning h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(mockGuild.experience / mockGuild.max_experience) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Guild Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card text-center space-y-2">
                    <div className="text-2xl">👑</div>
                    <div>
                      <div className="text-lg font-bold text-gradient">{mockGuild.level}</div>
                      <div className="text-xs text-secondary">Уровень</div>
                    </div>
                  </div>
                  <div className="glass-card text-center space-y-2">
                    <div className="text-2xl">💪</div>
                    <div>
                      <div className="text-lg font-bold text-gradient">{formatNumber(150000)}</div>
                      <div className="text-xs text-secondary">Общая сила</div>
                    </div>
                  </div>
                  <div className="glass-card text-center space-y-2">
                    <div className="text-2xl">⚔️</div>
                    <div>
                      <div className="text-lg font-bold text-gradient">23</div>
                      <div className="text-xs text-secondary">Побед</div>
                    </div>
                  </div>
                  <div className="glass-card text-center space-y-2">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <div className="text-lg font-bold text-gradient">#12</div>
                      <div className="text-xs text-secondary">Рейтинг</div>
                    </div>
                  </div>
                </div>

                {/* Guild Actions */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold">Действия гильдии</h3>
                  
                  <div className="glass-card">
                    <button 
                      onClick={handleActionClick}
                      className="w-full flex items-center justify-between p-3 transition-all duration-300 active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center text-xl">
                          💰
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Пожертвовать ресурсы</div>
                          <div className="text-sm text-secondary">Помогите развитию гильдии</div>
                        </div>
                      </div>
                      <div className="text-accent text-lg">→</div>
                    </button>
                  </div>

                  <div className="glass-card">
                    <button 
                      onClick={handleActionClick}
                      className="w-full flex items-center justify-between p-3 transition-all duration-300 active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-danger flex items-center justify-center text-xl">
                          ⚔️
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Битвы гильдий</div>
                          <div className="text-sm text-secondary">Сражайтесь за территории</div>
                        </div>
                      </div>
                      <div className="text-accent text-lg">→</div>
                    </button>
                  </div>

                  <div className="glass-card">
                    <button 
                      onClick={handleActionClick}
                      className="w-full flex items-center justify-between p-3 transition-all duration-300 active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-xl">
                          📋
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Задания гильдии</div>
                          <div className="text-sm text-secondary">Выполняйте коллективные цели</div>
                        </div>
                      </div>
                      <div className="text-accent text-lg">→</div>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card text-center space-y-6 p-8">
                <div className="text-6xl">🏛️</div>
                <div>
                  <h2 className="text-xl font-bold mb-2">
                    Вы не состоите в гильдии
                  </h2>
                  <p className="text-secondary">
                    Присоединитесь к гильдии для доступа к эксклюзивным функциям, помощи союзников и участия в битвах.
                  </p>
                </div>
                <button
                  onClick={() => handleTabClick('search')}
                  className="btn-primary"
                >
                  Найти гильдию
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'members' && (
          <motion.div
            key="members"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="space-y-4">
              <h2 className="text-xl font-bold">
                Участники гильдии ({mockMembers.length})
              </h2>
              
              {mockMembers.map((member) => (
                <div key={member.id} className="glass-card">
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold">
                          {member.username[0]}
                        </div>
                        {member.is_online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white glow-success"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {member.username}
                        </h3>
                        <p className="text-sm text-secondary">
                          Уровень {member.level} • 
                          <span className={`${
                            member.role === 'leader' ? 'text-yellow-500' :
                            member.role === 'officer' ? 'text-blue-500' :
                            'text-gray-500'
                          }`}>
                            {member.role === 'leader' ? 'Лидер' :
                             member.role === 'officer' ? 'Офицер' : 'Участник'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gradient">
                        {formatNumber(member.contribution)}
                      </div>
                      <div className="text-xs text-secondary">Вклад</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="space-y-6">
              <div className="glass-card space-y-4">
                <h2 className="text-xl font-bold">Поиск гильдии</h2>
                
                <div className="space-y-3">
                  <button onClick={searchGuilds} className="btn-primary">
                    🔍 Найти гильдии
                  </button>
                  <button onClick={handleActionClick} className="btn-secondary">
                    ➕ Создать новую гильдию
                  </button>
                </div>
              </div>

              {guildSearchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Результаты поиска</h3>
                  {guildSearchResults.map((guild) => (
                    <div key={guild.id} className="glass-card">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            [{guild.tag}] {guild.name}
                          </h3>
                          <div className="px-2 py-1 bg-gradient-primary text-white text-xs rounded-lg font-medium">
                            Ур. {guild.level}
                          </div>
                        </div>
                        
                        <p className="text-secondary text-sm">
                          {guild.description === 'Elite warriors seeking glory and treasure.' ? 
                           'Элитные воины, ищущие славы и сокровищ.' :
                           'Сосредоточены на торговле и экономическом росте.'}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-lg">👥</div>
                            <div className="font-medium">{guild.member_count}/{guild.max_members}</div>
                            <div className="text-secondary">Участники</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg">⭐</div>
                            <div className="font-medium">{guild.requirements.min_level}</div>
                            <div className="text-secondary">Мин. уровень</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg">💪</div>
                            <div className="font-medium">{formatNumber(guild.requirements.min_power)}</div>
                            <div className="text-secondary">Мин. сила</div>
                          </div>
                        </div>
                        
                        <button onClick={handleActionClick} className="btn-success">
                          Присоединиться к гильдии
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
    </div>
  )
}