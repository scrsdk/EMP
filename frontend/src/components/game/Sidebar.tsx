'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useGame } from '@/hooks/useGame'
import { Button } from '@/components/ui/Button'
import { formatNumber } from '@/lib/utils'

export function Sidebar() {
  const router = useRouter()
  const { user } = useAuth()
  const { guild } = useGame()
  const [isExpanded, setIsExpanded] = useState(true)

  const menuItems = [
    { icon: '🏛️', label: 'District', path: '/game' },
    { icon: '⚔️', label: 'Battle', path: '/game/battle' },
    { icon: '👥', label: 'Guild', path: '/game/guild' },
    { icon: '🏪', label: 'Market', path: '/game/market' },
    { icon: '💎', label: 'Store', path: '/game/store' },
    { icon: '🏆', label: 'Leaderboard', path: '/game/leaderboard' },
    { icon: '⚙️', label: 'Settings', path: '/game/settings' },
  ]

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`${
        isExpanded ? 'w-64' : 'w-20'
      } bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex flex-col`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-8 bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-10"
      >
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ←
        </motion.span>
      </button>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.first_name?.[0] || 'U'}
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <p className="font-semibold text-gray-900 dark:text-white">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Level {user?.level || 1} • {formatNumber(user?.experience || 0)} XP
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Guild Info */}
      {guild && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <AnimatePresence>
            {isExpanded ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Guild</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  [{guild.tag}] {guild.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {guild.member_count}/{guild.max_members} members
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {guild.tag}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Button
                variant="ghost"
                className={`w-full justify-start ${!isExpanded && 'justify-center'}`}
                onClick={() => router.push(item.path)}
              >
                <span className="text-xl">{item.icon}</span>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-3"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          size="sm"
          className={`w-full ${!isExpanded && 'px-2'}`}
          onClick={() => {/* TODO: Implement logout */}}
        >
          {isExpanded ? 'Logout' : '🚪'}
        </Button>
      </div>
    </motion.aside>
  )
}