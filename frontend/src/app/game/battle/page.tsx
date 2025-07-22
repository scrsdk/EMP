'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '@/hooks/useGame'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { formatNumber, formatTime } from '@/lib/utils'

interface BattleTarget {
  id: string
  username: string
  level: number
  district_name: string
  power: number
  is_online: boolean
  last_battle: string | null
}

export default function BattlePage() {
  const { resources } = useGame()
  const { user } = useAuth()
  const [selectedTarget, setSelectedTarget] = useState<BattleTarget | null>(null)
  const [battleTargets, setBattleTargets] = useState<BattleTarget[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchLevel, setSearchLevel] = useState(5)

  const searchForTargets = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock battle targets
      const mockTargets: BattleTarget[] = [
        {
          id: '1',
          username: 'EmpireBuilder',
          level: searchLevel,
          district_name: 'Golden Valley',
          power: 1250,
          is_online: false,
          last_battle: null,
        },
        {
          id: '2',
          username: 'WarLord99',
          level: searchLevel + 1,
          district_name: 'Iron Fortress',
          power: 1480,
          is_online: true,
          last_battle: '2024-01-15T10:30:00Z',
        },
        {
          id: '3',
          username: 'ResourceKing',
          level: searchLevel - 1,
          district_name: 'Trade Harbor',
          power: 980,
          is_online: false,
          last_battle: null,
        },
      ]
      
      setBattleTargets(mockTargets)
    } catch (error) {
      console.error('Failed to search for targets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const initiateBattle = async (target: BattleTarget) => {
    try {
      // API call to initiate battle
      console.log('Initiating battle with:', target.username)
      // Navigate to battle screen or show battle preparation
    } catch (error) {
      console.error('Failed to initiate battle:', error)
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
          Battle Arena
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Challenge other players and expand your empire through conquest
        </p>
      </motion.div>

      {/* Player Stats */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Your Battle Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {1250}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Power</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {12}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {3}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Losses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {1450}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
          </div>
        </div>
      </motion.div>

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Find Opponents
        </h2>
        <div className="flex items-center space-x-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Level
            </label>
            <input
              type="number"
              value={searchLevel}
              onChange={(e) => setSearchLevel(parseInt(e.target.value))}
              min="1"
              max="100"
              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex-1">
            <Button
              onClick={searchForTargets}
              isLoading={isLoading}
              className="mt-6"
            >
              🔍 Search for Opponents
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Battle Targets */}
      {battleTargets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Available Targets
          </h2>
          <div className="space-y-4">
            {battleTargets.map((target) => (
              <motion.div
                key={target.id}
                whileHover={{ scale: 1.02 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setSelectedTarget(target)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                      {target.username[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {target.username}
                        {target.is_online && (
                          <span className="ml-2 w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {target.district_name} • Level {target.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {formatNumber(target.power)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Power</div>
                  </div>
                </div>
                
                {selectedTarget?.id === target.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {target.last_battle ? (
                          <>Last battle: {formatTime(Math.floor((Date.now() - new Date(target.last_battle).getTime()) / 1000))} ago</>
                        ) : (
                          'Never been in battle'
                        )}
                      </div>
                      <Button
                        onClick={() => initiateBattle(target)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        ⚔️ Attack
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full"
          />
        </div>
      )}
    </div>
  )
}