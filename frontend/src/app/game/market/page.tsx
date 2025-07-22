'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTelegram } from '@/hooks/useTelegram'
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ShoppingCartIcon 
} from '@heroicons/react/24/outline'

const marketItems = [
  { id: 1, resource: 'Золото', price: 100, trend: 'up', change: '+5%', icon: '🪙', description: 'Благородный металл для торговли' },
  { id: 2, resource: 'Древесина', price: 50, trend: 'down', change: '-2%', icon: '🪵', description: 'Строительный материал' },
  { id: 3, resource: 'Камень', price: 75, trend: 'up', change: '+3%', icon: '🪨', description: 'Прочный материал для строительства' },
  { id: 4, resource: 'Продовольствие', price: 25, trend: 'stable', change: '0%', icon: '🌾', description: 'Необходимо для населения' },
  { id: 5, resource: 'Энергия', price: 150, trend: 'up', change: '+8%', icon: '⚡', description: 'Питает ваше производство' },
  { id: 6, resource: 'НФТ Земля', price: 2500, trend: 'up', change: '+12%', icon: '🏔️', description: 'Эксклюзивные участки земли' },
  { id: 7, resource: 'НФТ Герой', price: 5000, trend: 'stable', change: '0%', icon: '🦸', description: 'Легендарные герои' },
]

export default function MarketPage() {
  const { hapticFeedback } = useTelegram()
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy')

  const handleTabChange = (tab: 'buy' | 'sell') => {
    hapticFeedback?.impactOccurred('light')
    setSelectedTab(tab)
  }

  const handleTrade = (item: typeof marketItems[0]) => {
    hapticFeedback?.impactOccurred('medium')
    // Trade logic here
  }

  return (
    <div className="page-container pb-nav">
      {/* Header */}
      <div className="app-header header-gradient">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Рынок</h1>
            <p className="text-white/80 text-sm">
              Торгуйте ресурсами и NFT
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Tab selector */}
        <div className="glass-card p-1">
          <div className="flex space-x-1">
            <button
              onClick={() => handleTabChange('buy')}
              className={`flex-1 py-3 rounded-xl transition-all duration-300 ${
                selectedTab === 'buy' 
                  ? 'bg-gradient-primary text-white shadow-medium' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              🛍️ Покупка
            </button>
            <button
              onClick={() => handleTabChange('sell')}
              className={`flex-1 py-3 rounded-xl transition-all duration-300 ${
                selectedTab === 'sell' 
                  ? 'bg-gradient-primary text-white shadow-medium' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              💸 Продажа
            </button>
          </div>
        </div>

        {/* Market items */}
        <div className="space-y-3">
          {marketItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card"
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-2xl">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold">{item.resource}</p>
                      <p className="text-sm text-secondary">{item.description}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleTrade(item)}
                    className="btn-small"
                  >
                    {selectedTab === 'buy' ? 'Купить' : 'Продать'}
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-gradient">
                      {item.price} TON
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      item.trend === 'up' ? 'text-green-500' : 
                      item.trend === 'down' ? 'text-red-500' : 
                      'text-gray-500'
                    }`}>
                      {item.trend === 'up' && <ArrowTrendingUpIcon className="w-4 h-4" />}
                      {item.trend === 'down' && <ArrowTrendingDownIcon className="w-4 h-4" />}
                      <span className="font-medium">{item.change}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-secondary">Доступно</div>
                    <div className="font-medium">{Math.floor(Math.random() * 1000) + 100}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Market stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="premium-card"
        >
          <h3 className="text-lg font-bold text-white mb-4">Активность рынка</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-xl font-bold text-white">12,450</div>
              <div className="text-white/60 text-sm">Объем 24ч</div>
              <div className="text-white/80 text-xs">TON</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="text-xl font-bold text-white">3,892</div>
              <div className="text-white/60 text-sm">Активные</div>
              <div className="text-white/80 text-xs">трейдеры</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Ваш счет:</span>
              <span className="text-xl font-bold text-white">2,340 TON</span>
            </div>
          </div>
        </motion.div>
        
        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Быстрые действия</h3>
          
          <div className="glass-card">
            <button 
              onClick={() => hapticFeedback?.impactOccurred('medium')}
              className="w-full flex items-center justify-between p-3 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center text-xl">
                  🔄
                </div>
                <div className="text-left">
                  <div className="font-semibold">Обмен ресурсов</div>
                  <div className="text-sm text-secondary">Быстрый обмен между ресурсами</div>
                </div>
              </div>
              <div className="text-accent text-lg">→</div>
            </button>
          </div>

          <div className="glass-card">
            <button 
              onClick={() => hapticFeedback?.impactOccurred('medium')}
              className="w-full flex items-center justify-between p-3 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-warning flex items-center justify-center text-xl">
                  📊
                </div>
                <div className="text-left">
                  <div className="font-semibold">Аналитика рынка</div>
                  <div className="text-sm text-secondary">Подробная статистика цен</div>
                </div>
              </div>
              <div className="text-accent text-lg">→</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}