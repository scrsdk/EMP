'use client'

import { useGame } from '@/hooks/useGame'
import { useTelegram } from '@/hooks/useTelegram'
import { useCollectResourcesMutation } from '@/store/api/apiSlice'
import { formatNumber, getResourceIcon } from '@/lib/utils'
import { ResourceType } from '@/types/game'
import { motion } from 'framer-motion'

export function ResourceBar() {
  const { resources } = useGame()
  const { hapticFeedback } = useTelegram()
  const [collectResources, { isLoading }] = useCollectResourcesMutation()

  const resourceConfig = [
    { type: 'gold' as ResourceType, name: 'Золото', class: 'resource-gold' },
    { type: 'wood' as ResourceType, name: 'Дерево', class: 'resource-wood' },
    { type: 'stone' as ResourceType, name: 'Камень', class: 'resource-stone' },
    { type: 'food' as ResourceType, name: 'Еда', class: 'resource-food' },
    { type: 'energy' as ResourceType, name: 'Энергия', class: 'resource-energy' },
  ]

  const handleCollect = async () => {
    hapticFeedback?.impactOccurred('medium')
    try {
      await collectResources({}).unwrap()
      hapticFeedback?.notificationOccurred('success')
    } catch (error) {
      console.error('Failed to collect resources:', error)
      hapticFeedback?.notificationOccurred('error')
    }
  }

  const totalProduction = 1250 // Mock production rate

  return (
    <div className="px-4 py-4 bg-gradient-to-b from-transparent to-black/5">
      <div className="space-y-3">
        {/* Resources Grid */}
        <div className="resource-grid">
          {resourceConfig.map((config, index) => (
            <motion.div
              key={config.type}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`resource-item ${config.class}`}
            >
              <div className="text-xl mb-1">{getResourceIcon(config.type)}</div>
              <div className="text-lg font-bold">
                {formatNumber(resources[config.type] || 0)}
              </div>
              <div className="text-xs opacity-80">{config.name}</div>
            </motion.div>
          ))}
        </div>

        {/* Production Rate & Collect Button */}
        <div className="glass-card">
          <div className="flex items-center justify-between p-3">
            <div>
              <div className="text-sm text-secondary">Производство</div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-gradient">+{formatNumber(totalProduction)}</div>
                <div className="text-sm text-secondary">в час</div>
              </div>
            </div>
            
            <button
              onClick={handleCollect}
              disabled={isLoading}
              className="btn-floating"
            >
              {isLoading ? (
                <div className="animate-spin-slow">⏳</div>
              ) : (
                <div className="animate-bounce-custom">🌾</div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}