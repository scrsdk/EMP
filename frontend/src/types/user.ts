export interface User {
  id: string
  telegram_id: number
  username: string
  first_name: string
  last_name?: string
  photo_url?: string
  avatar?: string
  wallet_address?: string
  level: number
  experience: number
  guild_id?: string
  district_id?: string
  created_at: string
  updated_at: string
  last_active_at: string
}

export interface UserStats {
  user_id: string
  total_buildings: number
  total_battles: number
  battles_won: number
  resources_gathered: number
  play_time: number
}

export interface LeaderboardEntry {
  rank: number
  user: User
  guild_name?: string
}