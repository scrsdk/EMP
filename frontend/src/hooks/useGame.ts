import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import { 
  selectBuilding, 
  setPlacementMode,
  updateResources 
} from '@/store/slices/gameSlice'
import { Building, Resources } from '@/types/game'

export function useGame() {
  const dispatch = useDispatch<AppDispatch>()
  const gameState = useSelector((state: RootState) => state.game)

  const handleSelectBuilding = (building: Building | null) => {
    dispatch(selectBuilding(building))
  }

  const handleSetPlacementMode = (enabled: boolean, buildingType?: string) => {
    dispatch(setPlacementMode({ enabled, buildingType }))
  }

  const handleUpdateResources = (resources: Partial<Resources>) => {
    dispatch(updateResources(resources))
  }

  return {
    ...gameState,
    selectBuilding: handleSelectBuilding,
    setPlacementMode: handleSetPlacementMode,
    updateResources: handleUpdateResources,
  }
}