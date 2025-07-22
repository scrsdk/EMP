'use client'

import { motion } from 'framer-motion'
import { useTelegram } from '@/hooks/useTelegram'

export default function WorldPage() {
  const { hapticFeedback } = useTelegram()

  const handleRegionClick = () => {
    hapticFeedback?.impactOccurred('light')
  }

  return (
    <div className="page-container pb-nav">
      {/* Header */}
      <div className="app-header header-gradient">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Карта мира</h1>
            <p className="text-white/80 text-sm">
              Исследуйте территории и империи
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* World Map Preview */}
        <div className="premium-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Глобальная карта</h2>
            <button className="px-3 py-1 rounded-lg bg-white/20 text-white text-sm font-medium">
              🔍 Увеличить
            </button>
          </div>
          <div className="relative h-48 rounded-xl bg-gradient-to-br from-blue-900/50 to-green-900/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
            <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-yellow-400 glow-warning animate-pulse-custom" />
            <div className="absolute top-8 right-6 w-2 h-2 rounded-full bg-red-400" />
            <div className="absolute bottom-6 left-8 w-2 h-2 rounded-full bg-blue-400" />
            <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-green-400" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 rounded-full bg-gradient-primary glow-accent animate-pulse-custom" />
              <p className="text-xs text-white mt-1 text-center font-medium">Вы</p>
            </div>
          </div>
        </div>

        {/* Regions Grid */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Регионы</h3>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
          >
            <button 
              onClick={handleRegionClick}
              className="w-full flex items-center justify-between p-2 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center text-xl">
                  🌲
                </div>
                <div className="text-left">
                  <div className="font-semibold">Северные леса</div>
                  <div className="text-sm text-secondary">12 империй • Мирный регион</div>
                </div>
              </div>
              <div className="text-accent text-lg">→</div>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card"
          >
            <button 
              onClick={handleRegionClick}
              className="w-full flex items-center justify-between p-2 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-warning flex items-center justify-center text-xl">
                  🏜️
                </div>
                <div className="text-left">
                  <div className="font-semibold">Пустынные земли</div>
                  <div className="text-sm text-secondary">8 империй • Ресурсный регион</div>
                </div>
              </div>
              <div className="text-accent text-lg">→</div>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card"
          >
            <button 
              onClick={handleRegionClick}
              className="w-full flex items-center justify-between p-2 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-danger flex items-center justify-center text-xl">
                  ⚔️
                </div>
                <div className="text-left">
                  <div className="font-semibold">Зона конфликта</div>
                  <div className="text-sm text-secondary">25 империй • Активные бои</div>
                </div>
              </div>
              <div className="text-accent text-lg">→</div>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
          >
            <button 
              onClick={handleRegionClick}
              className="w-full flex items-center justify-between p-2 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-xl">
                  🌊
                </div>
                <div className="text-left">
                  <div className="font-semibold">Морские пути</div>
                  <div className="text-sm text-secondary">5 портов • Торговые маршруты</div>
                </div>
              </div>
              <div className="text-accent text-lg">→</div>
            </button>
          </motion.div>
        </div>

        {/* Active Events */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Активные события</h3>
          
          <div className="glass-card">
            <div className="flex items-center gap-4 p-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-danger flex items-center justify-center text-xl animate-bounce-custom">
                🛡️
              </div>
              <div className="flex-1">
                <div className="font-semibold">Осада крепости</div>
                <div className="text-sm text-secondary">Заканчивается через 2ч 34м</div>
                <div className="mt-1">
                  <div className="h-1 rounded-full bg-gray-300 overflow-hidden">
                    <div className="h-full bg-gradient-danger rounded-full" style={{width: '67%'}} />
                  </div>
                </div>
              </div>
              <button className="btn-small">
                Участвовать
              </button>
            </div>
          </div>

          <div className="glass-card">
            <div className="flex items-center gap-4 p-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center text-xl">
                🏆
              </div>
              <div className="flex-1">
                <div className="font-semibold">Турнир гильдий</div>
                <div className="text-sm text-secondary">Регистрация до завтра</div>
              </div>
              <button className="btn-small">
                Смотреть
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}