'use client'

import { useState } from 'react'
import { useGame } from '@/hooks/useGame'
import { useUpgradeBuildingMutation } from '@/store/api/apiSlice'
import { useTelegram } from '@/hooks/useTelegram'
import { getBuildingIcon, formatNumber, formatTime } from '@/lib/utils'
import { BuildingType } from '@/types/game'

const buildingTypes: { type: BuildingType; name: string; description: string; cost: { gold: number; wood: number; stone: number } }[] = [
  { type: 'house', name: 'Дом', description: 'Увеличивает население', cost: { gold: 100, wood: 50, stone: 50 } },
  { type: 'farm', name: 'Ферма', description: 'Производит еду', cost: { gold: 150, wood: 100, stone: 0 } },
  { type: 'mine', name: 'Шахта', description: 'Добывает золото', cost: { gold: 200, wood: 50, stone: 100 } },
  { type: 'lumber_mill', name: 'Лесопилка', description: 'Производит древесину', cost: { gold: 150, wood: 0, stone: 100 } },
  { type: 'power_plant', name: 'Электростанция', description: 'Генерирует энергию', cost: { gold: 300, wood: 100, stone: 200 } },
  { type: 'barracks', name: 'Казармы', description: 'Тренирует воинов', cost: { gold: 250, wood: 150, stone: 150 } },
  { type: 'wall', name: 'Стена', description: 'Защищает город', cost: { gold: 100, wood: 50, stone: 200 } },
  { type: 'market', name: 'Рынок', description: 'Торговый центр', cost: { gold: 300, wood: 200, stone: 100 } },
]

export function BuildingPanel() {
  const { selectedBuilding, resources, setPlacementMode, selectBuilding } = useGame()
  const { hapticFeedback } = useTelegram()
  const [upgradeBuilding, { isLoading }] = useUpgradeBuildingMutation()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleUpgrade = async () => {
    hapticFeedback?.impactOccurred('medium')
    if (!selectedBuilding) return
    
    try {
      await upgradeBuilding(selectedBuilding.id).unwrap()
      hapticFeedback?.notificationOccurred('success')
    } catch (error) {
      console.error('Failed to upgrade building:', error)
      hapticFeedback?.notificationOccurred('error')
    }
  }

  const handleBuildingSelect = (buildingType: BuildingType) => {
    hapticFeedback?.impactOccurred('light')
    setPlacementMode(true, buildingType)
    selectBuilding(null)
    setIsExpanded(false)
  }

  const canAfford = (cost: { gold: number; wood: number; stone: number }) => {
    return resources.gold >= cost.gold && 
           resources.wood >= cost.wood && 
           resources.stone >= cost.stone
  }

  const toggleExpanded = () => {
    hapticFeedback?.impactOccurred('light')
    setIsExpanded(!isExpanded)
  }

  const closePanel = () => {
    setIsExpanded(false)
    selectBuilding(null)
  }

  if (!selectedBuilding && !isExpanded) {
    return (
      <div className="fixed bottom-20 right-4 z-20">
        <button
          onClick={toggleExpanded}
          className="btn-floating"
        >
          <span className="text-2xl">🏗️</span>
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop animate-fade-in" onClick={closePanel} />

      {/* Panel */}
      <div className="modal-sheet animate-slide-up">
        <div className="modal-handle" />
        
        <div className="modal-header">
          <h2 className="text-xl font-bold">
            {selectedBuilding ? 'Информация о здании' : 'Постройка зданий'}
          </h2>
        </div>

        <div className="modal-body">
          {selectedBuilding ? (
            <div className="space-y-6">
              <div className="premium-card">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg flex items-center justify-center text-5xl">
                    {getBuildingIcon(selectedBuilding.type)}
                  </div>
                  <div className="flex-1 text-white">
                    <h3 className="text-xl font-bold capitalize">
                      {buildingTypes.find(b => b.type === selectedBuilding.type)?.name || selectedBuilding.type.replace('_', ' ')}
                    </h3>
                    <p className="text-white/80">
                      Уровень {selectedBuilding.level}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-white/60 mb-1">
                        <span>Прочность</span>
                        <span>{selectedBuilding.health}/{selectedBuilding.max_health}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-success rounded-full transition-all duration-500"
                          style={{ width: `${(selectedBuilding.health / selectedBuilding.max_health) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedBuilding.upgrade_end_at && new Date(selectedBuilding.upgrade_end_at) > new Date() ? (
                <div className="glass-card">
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-warning flex items-center justify-center text-xl animate-spin-slow">
                      ⚙️
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Улучшается...</p>
                      <p className="text-sm text-secondary">
                        Осталось: {formatTime(Math.floor((new Date(selectedBuilding.upgrade_end_at).getTime() - Date.now()) / 1000))}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? 'Улучшаем...' : `Улучшить до уровня ${selectedBuilding.level + 1}`}
                </button>
              )}
              
              <button
                onClick={closePanel}
                className="btn-secondary"
              >
                Закрыть
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {buildingTypes.map((building) => {
                  const affordable = canAfford(building.cost)
                  
                  return (
                    <div
                      key={building.type}
                      className={`glass-card transition-all ${
                        !affordable ? 'opacity-50' : ''
                      }`}
                    >
                      <button
                        onClick={() => affordable && handleBuildingSelect(building.type)}
                        disabled={!affordable}
                        className="w-full p-4 text-left transition-all active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-3xl">
                            {getBuildingIcon(building.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{building.name}</h4>
                            <p className="text-sm text-secondary">{building.description}</p>
                            <div className="flex gap-3 mt-2">
                              {Object.entries(building.cost).map(([resource, amount]) => (
                                amount > 0 && (
                                  <div key={resource} className="flex items-center gap-1">
                                    <span className="text-sm">
                                      {resource === 'gold' ? '🪙' : resource === 'wood' ? '🪵' : '🪨'}
                                    </span>
                                    <span className={`text-sm font-medium ${
                                      resources[resource as keyof typeof resources] >= amount 
                                        ? 'text-green-600' 
                                        : 'text-red-600'
                                    }`}>
                                      {formatNumber(amount)}
                                    </span>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                          {affordable && (
                            <div className="text-accent text-lg">→</div>
                          )}
                        </div>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}