export type ResourceType = 'gold' | 'wood' | 'stone' | 'food' | 'energy'

export type BuildingType = 
  | 'town_hall' 
  | 'house' 
  | 'farm' 
  | 'mine' 
  | 'lumber_mill' 
  | 'power_plant' 
  | 'barracks' 
  | 'wall' 
  | 'market'

export type GuildRole = 'emperor' | 'governor' | 'citizen' | 'vassal'

export interface Resources {
  gold: number
  wood: number
  stone: number
  food: number
  energy: number
}

export interface Position {
  x: number
  y: number
}

export interface District {
  id: string
  owner_id: string
  city_id: string
  name: string
  population: number
  efficiency: number
  resources: Resources
  created_at: string
  updated_at: string
}

export interface Building {
  id: string
  district_id: string
  type: BuildingType
  level: number
  health: number
  max_health: number
  position: Position
  is_active: boolean
  upgrade_end_at?: string
  created_at: string
  updated_at: string
}

export interface BuildingProduction {
  building_id: string
  resource_type: ResourceType
  rate: number
  last_collected: string
}

export interface Guild {
  id: string
  name: string
  tag: string
  description: string
  emperor_id: string
  level: number
  experience: number
  member_count: number
  max_members: number
  treasury: Resources
  created_at: string
  updated_at: string
}

export interface GuildMember {
  guild_id: string
  user_id: string
  role: GuildRole
  joined_at: string
}

export interface City {
  id: string
  guild_id: string
  name: string
  level: number
  population: number
  defense: number
  created_at: string
  updated_at: string
}

export interface GameEvent {
  id: string
  type: 'disaster' | 'raid' | 'bonus' | 'maintenance'
  title: string
  description: string
  start_time: string
  end_time: string
  rewards?: Resources
}

export interface Battle {
  id: string
  attacker_guild_id: string
  defender_guild_id: string
  status: 'preparation' | 'active' | 'completed'
  winner_guild_id?: string
  start_time: string
  end_time?: string
  participants: number
}