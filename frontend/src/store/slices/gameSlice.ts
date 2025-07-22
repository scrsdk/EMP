import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { District, Building, Guild, Resources } from '@/types/game'

interface GameState {
  district: District | null
  buildings: Building[]
  guild: Guild | null
  resources: Resources
  selectedBuilding: Building | null
  isPlacementMode: boolean
  placementBuildingType: string | null
}

// Mock data for development
const mockDistrict: District = {
  id: 'mock-district-1',
  owner_id: '123456789',
  city_id: 'city-1',
  name: 'Test Empire',
  population: 150,
  efficiency: 85,
  resources: {
    gold: 2500,
    wood: 1200,
    stone: 800,
    food: 600,
    energy: 200,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockBuildings: Building[] = [
  {
    id: 'building-1',
    district_id: 'mock-district-1',
    type: 'house',
    level: 3,
    health: 80,
    max_health: 100,
    position: { x: 2, y: 2 },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'building-2',
    district_id: 'mock-district-1',
    type: 'farm',
    level: 2,
    health: 100,
    max_health: 100,
    position: { x: 4, y: 3 },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'building-3',
    district_id: 'mock-district-1',
    type: 'mine',
    level: 1,
    health: 100,
    max_health: 100,
    position: { x: 6, y: 1 },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const initialState: GameState = {
  district: process.env.NODE_ENV === 'development' ? mockDistrict : null,
  buildings: process.env.NODE_ENV === 'development' ? mockBuildings : [],
  guild: null,
  resources: process.env.NODE_ENV === 'development' ? mockDistrict.resources : {
    gold: 0,
    wood: 0,
    stone: 0,
    food: 0,
    energy: 0,
  },
  selectedBuilding: null,
  isPlacementMode: false,
  placementBuildingType: null,
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setDistrict: (state, action: PayloadAction<District>) => {
      state.district = action.payload
      state.resources = action.payload.resources
    },
    setBuildings: (state, action: PayloadAction<Building[]>) => {
      state.buildings = action.payload
    },
    addBuilding: (state, action: PayloadAction<Building>) => {
      state.buildings.push(action.payload)
    },
    updateBuilding: (state, action: PayloadAction<Building>) => {
      const index = state.buildings.findIndex(b => b.id === action.payload.id)
      if (index !== -1) {
        state.buildings[index] = action.payload
      }
    },
    setGuild: (state, action: PayloadAction<Guild | null>) => {
      state.guild = action.payload
    },
    updateResources: (state, action: PayloadAction<Partial<Resources>>) => {
      state.resources = { ...state.resources, ...action.payload }
    },
    selectBuilding: (state, action: PayloadAction<Building | null>) => {
      state.selectedBuilding = action.payload
    },
    setPlacementMode: (state, action: PayloadAction<{ enabled: boolean; buildingType?: string }>) => {
      state.isPlacementMode = action.payload.enabled
      state.placementBuildingType = action.payload.buildingType || null
    },
  },
})

export const {
  setDistrict,
  setBuildings,
  addBuilding,
  updateBuilding,
  setGuild,
  updateResources,
  selectBuilding,
  setPlacementMode,
} = gameSlice.actions

// Add missing actions that were referenced but not defined
export const setResources = updateResources

export default gameSlice.reducer