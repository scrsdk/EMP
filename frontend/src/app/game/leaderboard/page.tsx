'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/hooks/useGame'
import { useAuth } from '@/hooks/useAuth'
import { formatNumber } from '@/lib/utils'

interface LeaderboardEntry {
  rank: number
  id: string
  username: string
  level: number
  power: number
  guild_name?: string
  guild_tag?: string
  district_name: string
  total_buildings: number
  battle_rating: number
  is_online: boolean
}

interface GuildLeaderboardEntry {
  rank: number
  id: string
  name: string
  tag: string
  level: number
  total_power: number
  member_count: number
  battles_won: number
  territory_controlled: number
}

export default function LeaderboardPage() {
  const { } = useGame()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'players' | 'guilds' | 'battles'>('players')

  // Mock leaderboard data
  const playerLeaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      id: '1',
      username: 'EmpireKing',
      level: 50,
      power: 25000,
      guild_name: 'Dragon Empire',
      guild_tag: 'DE',
      district_name: 'Golden Citadel',
      total_buildings: 89,
      battle_rating: 2150,
      is_online: true,
    },
    {
      rank: 2,
      id: '2',
      username: 'WarMaster',
      level: 48,
      power: 23500,
      guild_name: 'Iron Legion',
      guild_tag: 'IL',
      district_name: 'Fortress Prime',
      total_buildings: 85,
      battle_rating: 2080,
      is_online: false,
    },
    {
      rank: 3,
      id: '3',
      username: 'BuilderPro',
      level: 45,
      power: 21200,
      guild_name: 'Architects',
      guild_tag: 'ARCH',
      district_name: 'Mega City',
      total_buildings: 92,
      battle_rating: 1950,
      is_online: true,
    },
    {
      rank: 4,
      id: '4',
      username: 'ResourceLord',
      level: 44,
      power: 20800,
      district_name: 'Trade Haven',
      total_buildings: 78,
      battle_rating: 1920,
      is_online: false,
    },
    {
      rank: 5,
      id: '5',
      username: 'TacticalGenius',
      level: 43,
      power: 19500,
      guild_name: 'Strategic Alliance',
      guild_tag: 'SA',
      district_name: 'Command Center',
      total_buildings: 73,
      battle_rating: 1880,
      is_online: true,
    },
  ]

  const guildLeaderboard: GuildLeaderboardEntry[] = [
    {
      rank: 1,
      id: '1',
      name: 'Dragon Empire',
      tag: 'DE',
      level: 25,
      total_power: 450000,
      member_count: 50,
      battles_won: 156,
      territory_controlled: 25,
    },
    {
      rank: 2,
      id: '2',
      name: 'Iron Legion',
      tag: 'IL',
      level: 23,
      total_power: 420000,
      member_count: 48,
      battles_won: 142,
      territory_controlled: 22,
    },
    {
      rank: 3,
      id: '3',
      name: 'Strategic Alliance',
      tag: 'SA',
      level: 22,
      total_power: 395000,
      member_count: 45,
      battles_won: 138,
      territory_controlled: 20,
    },
  ]

  const battleLeaderboard: LeaderboardEntry[] = playerLeaderboard
    .sort((a, b) => b.battle_rating - a.battle_rating)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  const tabs = [
    { id: 'players', label: 'Players', icon: '👤' },
    { id: 'guilds', label: 'Guilds', icon: '🏛️' },
    { id: 'battles', label: 'Battle Rating', icon: '⚔️' },
  ]

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500'
      case 2:
        return 'text-gray-400'
      case 3:
        return 'text-amber-600'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '👑'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `#${rank}`
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Leaderboards
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          See how you stack up against other empire builders
        </p>
      </motion.div>

      {/* Player's Current Rank */}
      {user && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg shadow-lg p-6 mb-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Your Current Rank</h2>
              <p className="text-primary-100">Keep building to climb higher!</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">#42</div>
              <div className="text-sm text-primary-100">Out of 10,247 players</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-primary-400">
            <div className="text-center">
              <div className="text-lg font-bold">{user.level}</div>
              <div className="text-xs text-primary-100">Level</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{formatNumber(1250)}</div>
              <div className="text-xs text-primary-100">Power</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">23</div>
              <div className="text-xs text-primary-100">Buildings</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">1420</div>
              <div className="text-xs text-primary-100">Rating</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'players' && (
          <motion.div
            key="players"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Top Players by Power
              </h2>
              <div className="space-y-4">
                {playerLeaderboard.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      player.rank <= 3 
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800'
                        : 'border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-2xl font-bold ${getRankColor(player.rank)}`}>
                        {getRankIcon(player.rank)}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold relative">
                        {player.username[0]}
                        {player.is_online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                          <span>{player.username}</span>
                          {player.guild_tag && (
                            <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded">
                              [{player.guild_tag}]
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {player.district_name} • Level {player.level}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {formatNumber(player.power)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {player.total_buildings} buildings
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'guilds' && (
          <motion.div
            key="guilds"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Top Guilds by Power
              </h2>
              <div className="space-y-4">
                {guildLeaderboard.map((guild, index) => (
                  <motion.div
                    key={guild.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      guild.rank <= 3 
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800'
                        : 'border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-2xl font-bold ${getRankColor(guild.rank)}`}>
                        {getRankIcon(guild.rank)}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                        {guild.tag}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          [{guild.tag}] {guild.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Level {guild.level} • {guild.member_count} members
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {formatNumber(guild.total_power)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {guild.battles_won} victories
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'battles' && (
          <motion.div
            key="battles"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Top Warriors by Battle Rating
              </h2>
              <div className="space-y-4">
                {battleLeaderboard.map((player, index) => (
                  <motion.div
                    key={`battle-${player.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      player.rank <= 3 
                        ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800'
                        : 'border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-2xl font-bold ${getRankColor(player.rank)}`}>
                        {getRankIcon(player.rank)}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold relative">
                        ⚔️
                        {player.is_online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                          <span>{player.username}</span>
                          {player.guild_tag && (
                            <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                              [{player.guild_tag}]
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Level {player.level} • {formatNumber(player.power)} power
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">
                        {player.battle_rating}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Battle Rating
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}