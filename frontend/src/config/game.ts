import { BuildingType, ResourceType } from '@/types/game'

export const GAME_CONFIG = {
  GRID_SIZE: 10,
  MAX_BUILDINGS_PER_DISTRICT: 100,

  INITIAL_RESOURCES: {
    gold: 1000,
    wood: 500,
    stone: 500,
    food: 100,
    energy: 50,
  },

  BUILDINGS: {
    house: {
      name: 'House',
      icon: '🏠',
      description: 'Provides population and basic income',
      baseCost: { gold: 100, wood: 50, stone: 50, food: 0, energy: 0 },
      baseProduction: { gold: 10, wood: 0, stone: 0, food: 0, energy: 0 },
      maxLevel: 10,
      buildTime: 30,
    },
    farm: {
      name: 'Farm',
      icon: '🌾',
      description: 'Produces food for your population',
      baseCost: { gold: 150, wood: 100, stone: 0, food: 0, energy: 0 },
      baseProduction: { gold: 0, wood: 0, stone: 0, food: 20, energy: 0 },
      maxLevel: 8,
      buildTime: 45,
    },
    mine: {
      name: 'Mine',
      icon: '⛏️',
      description: 'Extracts stone and precious materials',
      baseCost: { gold: 200, wood: 50, stone: 100, food: 0, energy: 0 },
      baseProduction: { gold: 5, wood: 0, stone: 15, food: 0, energy: 0 },
      maxLevel: 12,
      buildTime: 60,
    },
    lumber_mill: {
      name: 'Lumber Mill',
      icon: '🪵',
      description: 'Processes wood from nearby forests',
      baseCost: { gold: 150, wood: 0, stone: 100, food: 0, energy: 0 },
      baseProduction: { gold: 0, wood: 25, stone: 0, food: 0, energy: 0 },
      maxLevel: 8,
      buildTime: 40,
    },
    power_plant: {
      name: 'Power Plant',
      icon: '⚡',
      description: 'Generates energy for advanced buildings',
      baseCost: { gold: 300, wood: 100, stone: 200, food: 0, energy: 0 },
      baseProduction: { gold: 0, wood: 0, stone: 0, food: 0, energy: 30 },
      maxLevel: 6,
      buildTime: 90,
    },
    barracks: {
      name: 'Barracks',
      icon: '🏛️',
      description: 'Trains soldiers for defense and attack',
      baseCost: { gold: 250, wood: 150, stone: 150, food: 0, energy: 0 },
      baseProduction: { gold: 0, wood: 0, stone: 0, food: 0, energy: 0 },
      maxLevel: 10,
      buildTime: 75,
    },
    wall: {
      name: 'Wall',
      icon: '🏰',
      description: 'Provides defense against enemy attacks',
      baseCost: { gold: 100, wood: 50, stone: 200, food: 0, energy: 0 },
      baseProduction: { gold: 0, wood: 0, stone: 0, food: 0, energy: 0 },
      maxLevel: 5,
      buildTime: 25,
    },
    market: {
      name: 'Market',
      icon: '🏪',
      description: 'Enables trading with other players',
      baseCost: { gold: 300, wood: 200, stone: 100, food: 0, energy: 0 },
      baseProduction: { gold: 15, wood: 0, stone: 0, food: 0, energy: 0 },
      maxLevel: 8,
      buildTime: 60,
    },
  } as Record<BuildingType, {
    name: string
    icon: string
    description: string
    baseCost: Record<ResourceType, number>
    baseProduction: Record<ResourceType, number>
    maxLevel: number
    buildTime: number
  }>,

  RESOURCE_ICONS: {
    gold: '🪙',
    wood: '🪵',
    stone: '🪨',
    food: '🌾',
    energy: '⚡',
  } as Record<ResourceType, string>,

  EXPERIENCE: {
    BASE_EXP_PER_LEVEL: 100,
    LEVEL_MULTIPLIER: 1.5,
    ACTIONS: {
      BUILD: 10,
      UPGRADE: 15,
      BATTLE_WIN: 50,
      BATTLE_LOSE: 10,
      COLLECT_RESOURCES: 5,
    },
  },

  BATTLE: {
    PREPARATION_TIME: 300,
    BATTLE_DURATION: 600,
    ATTACK_COOLDOWN: 3600,
    PROTECTION_TIME: 86400,
  },

  GUILD: {
    MAX_MEMBERS: 50,
    CREATION_COST: 10000,
    DAILY_TRIBUTE: 100,
  },

  API_ENDPOINTS: {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
  },

  TELEGRAM: {
    BOT_NAME: process.env.NEXT_PUBLIC_BOT_NAME || 'ton_empire_bot',
    MINI_APP_URL: process.env.NEXT_PUBLIC_MINI_APP_URL || 'https://t.me/ton_empire_bot/game',
  },

  BLOCKCHAIN: {
    NETWORK: process.env.NEXT_PUBLIC_TON_NETWORK || 'testnet',
    RPC_URL: process.env.NEXT_PUBLIC_TON_RPC_URL || 'https://testnet.toncenter.com/api/v2/jsonRPC',
    GAME_CONTRACT: process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS || 'EQD__PLACEHOLDER__',
    MANIFEST_URL: process.env.NEXT_PUBLIC_TON_CONNECT_MANIFEST_URL || '/tonconnect-manifest.json',
    
    TOKEN_RATES: {
      TON_TO_GOLD: 5000,
      TON_TO_PREMIUM_DAYS: 10,
    },
    
    FEES: {
      PURCHASE_TOKENS: '0.01',
      CLAIM_REWARDS: '0.01',
      TRADE_RESOURCES: '0.005',
    },
  },

  ANIMATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000,
  },

  UI: {
    SIDEBAR_WIDTH: 256,
    HEADER_HEIGHT: 64,
    RESOURCE_BAR_HEIGHT: 72,
    BUILDING_PANEL_HEIGHT: 200,
  },
}

export const getBuildingCost = (type: BuildingType, level: number = 1): Record<ResourceType, number> => {
  const building = GAME_CONFIG.BUILDINGS[type]
  const multiplier = Math.pow(1.5, level - 1)
  
  return Object.entries(building.baseCost).reduce((acc, [resource, cost]) => {
    acc[resource as ResourceType] = Math.floor(cost * multiplier)
    return acc
  }, {} as Record<ResourceType, number>)
}

export const getBuildingProduction = (type: BuildingType, level: number = 1): Record<ResourceType, number> => {
  const building = GAME_CONFIG.BUILDINGS[type]
  const multiplier = Math.pow(1.2, level - 1)
  
  return Object.entries(building.baseProduction).reduce((acc, [resource, production]) => {
    acc[resource as ResourceType] = Math.floor(production * multiplier)
    return acc
  }, {} as Record<ResourceType, number>)
}

export const getRequiredExperience = (level: number): number => {
  return Math.floor(GAME_CONFIG.EXPERIENCE.BASE_EXP_PER_LEVEL * Math.pow(GAME_CONFIG.EXPERIENCE.LEVEL_MULTIPLIER, level - 1))
}

export const getBuildingIcon = (type: BuildingType): string => {
  return GAME_CONFIG.BUILDINGS[type]?.icon || '🏗️'
}

export const getResourceIcon = (type: ResourceType): string => {
  return GAME_CONFIG.RESOURCE_ICONS[type] || '📦'
}

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  }
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}