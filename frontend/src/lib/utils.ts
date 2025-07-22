import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export from game config for consistency
export { 
  formatNumber, 
  formatTime, 
  getResourceIcon, 
  getBuildingIcon,
  getBuildingCost,
  getBuildingProduction,
  getRequiredExperience 
} from '@/config/game'