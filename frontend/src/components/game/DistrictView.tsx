'use client'

import { useEffect } from 'react'
import { useGame } from '@/hooks/useGame'
import { useGetMyDistrictQuery, useGetDistrictBuildingsQuery } from '@/store/api/apiSlice'
import { useDispatch } from 'react-redux'
import { setDistrict, setBuildings } from '@/store/slices/gameSlice'
import { AppDispatch } from '@/store/store'
import { BuildingTile } from './BuildingTile'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

export function DistrictView() {
  const dispatch = useDispatch<AppDispatch>()
  const { district, buildings, isPlacementMode, placementBuildingType } = useGame()
  
  const { data: districtData, isLoading: districtLoading } = useGetMyDistrictQuery(undefined)
  const { data: buildingsData, isLoading: buildingsLoading } = useGetDistrictBuildingsQuery(
    district?.id || '',
    { skip: !district?.id }
  )

  useEffect(() => {
    if (districtData) {
      dispatch(setDistrict(districtData))
    }
  }, [districtData, dispatch])

  useEffect(() => {
    if (buildingsData) {
      dispatch(setBuildings(buildingsData.buildings))
    }
  }, [buildingsData, dispatch])

  if (districtLoading || buildingsLoading) {
    return <LoadingScreen />
  }

  // Create a 8x8 grid for mobile
  const gridSize = 8
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))

  // Place buildings on the grid
  buildings.forEach((building) => {
    if (building.position.x < gridSize && building.position.y < gridSize) {
      grid[building.position.y][building.position.x] = building
    }
  })

  const getBuildingTypeName = (type?: string | null) => {
    const names: Record<string, string> = {
      'TOWN_HALL': 'Ратуша',
      'HOUSE': 'Дом',
      'FARM': 'Ферма',
      'MINE': 'Шахта',
      'SAWMILL': 'Лесопилка',
      'QUARRY': 'Каменоломня',
      'MARKET': 'Рынок',
      'BARRACKS': 'Казармы',
      'WALL': 'Стена',
      'TOWER': 'Башня'
    }
    return type ? names[type] || type.replace('_', ' ') : ''
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-4 bg-gradient-to-b from-blue-50/50 to-green-50/50 dark:from-blue-900/20 dark:to-green-900/20">
        <div className="district-grid max-w-2xl mx-auto">
          {grid.map((row, y) => (
            row.map((building, x) => (
              <BuildingTile
                key={`${x}-${y}`}
                building={building}
                position={{ x, y }}
                isPlacementMode={isPlacementMode}
                placementBuildingType={placementBuildingType}
              />
            ))
          ))}
        </div>
      </div>

      {isPlacementMode && (
        <div className="p-4">
          <div className="glass-card animate-slide-up">
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-2xl animate-bounce-custom">
                🏗️
              </div>
              <div className="flex-1">
                <p className="font-semibold">Режим строительства</p>
                <p className="text-sm text-secondary">
                  Выберите свободную клетку для постройки: <span className="font-medium text-accent">{getBuildingTypeName(placementBuildingType)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}