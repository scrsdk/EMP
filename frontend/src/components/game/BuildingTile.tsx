'use client'

import { Building, BuildingType, Position } from '@/types/game'
import { useGame } from '@/hooks/useGame'
import { useTelegram } from '@/hooks/useTelegram'
import { useCreateBuildingMutation } from '@/store/api/apiSlice'
import { useNotifications } from '@/hooks/useNotifications'
import { getBuildingIcon } from '@/lib/utils'

interface BuildingTileProps {
  building: Building | null
  position: Position
  isPlacementMode: boolean
  placementBuildingType: string | null
}

export function BuildingTile({ 
  building, 
  position, 
  isPlacementMode, 
  placementBuildingType 
}: BuildingTileProps) {
  const { selectBuilding, setPlacementMode } = useGame()
  const { hapticFeedback } = useTelegram()
  const [createBuilding] = useCreateBuildingMutation()
  const { success, error } = useNotifications()

  const handleClick = async () => {
    hapticFeedback?.impactOccurred('light')
    
    if (building) {
      selectBuilding(building)
    } else if (isPlacementMode && placementBuildingType) {
      try {
        await createBuilding({
          type: placementBuildingType,
          position,
        }).unwrap()
        
        hapticFeedback?.notificationOccurred('success')
        success('Здание размещено!', `${placementBuildingType} строится`)
        setPlacementMode(false)
      } catch (err) {
        hapticFeedback?.notificationOccurred('error')
        error('Ошибка размещения', 'Попробуйте еще раз')
      }
    }
  }

  const getTileClass = () => {
    if (building) {
      if (building.health < building.max_health * 0.5) {
        return 'building-tile-occupied border-2 border-red-400 bg-red-50 dark:bg-red-900/20'
      }
      if (!building.is_active) {
        return 'building-tile-occupied opacity-60'
      }
      if (building.upgrade_end_at && new Date(building.upgrade_end_at) > new Date()) {
        return 'building-tile-occupied building-upgrade-overlay'
      }
      return 'building-tile-occupied'
    }
    
    if (isPlacementMode) {
      return 'building-tile-placement'
    }
    
    return 'building-tile-empty'
  }

  return (
    <div
      onClick={handleClick}
      className={`${getTileClass()} no-select transition-all duration-300 active:scale-[0.92]`}
    >
      {building ? (
        <>
          <div className="text-3xl">
            {getBuildingIcon(building.type)}
          </div>
          
          {/* Level badge */}
          {building.level > 1 && (
            <div className="building-level-badge">
              {building.level}
            </div>
          )}
          
          {/* Health bar */}
          {building.health < building.max_health && (
            <div className="absolute bottom-1 left-1 right-1">
              <div className="health-bar">
                <div 
                  className="health-fill"
                  style={{ width: `${(building.health / building.max_health) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Upgrade animation */}
          {building.upgrade_end_at && new Date(building.upgrade_end_at) > new Date() && (
            <div className="building-upgrade-overlay">
              <div className="text-2xl animate-spin-slow">⚙️</div>
              <p className="text-xs font-medium mt-1">Улучшается</p>
            </div>
          )}
        </>
      ) : isPlacementMode && placementBuildingType ? (
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="text-2xl opacity-70 animate-bounce-custom">
            {placementBuildingType ? getBuildingIcon(placementBuildingType as BuildingType) : null}
          </div>
          <div className="text-xs font-medium text-accent animate-pulse-custom">
            🏗️
          </div>
        </div>
      ) : (
        <div className="text-base opacity-20">+</div>
      )}
    </div>
  )
}