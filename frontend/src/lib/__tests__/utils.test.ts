import { formatNumber, formatTime, getBuildingCost, getRequiredExperience } from '../utils'

describe('Utility Functions', () => {
  describe('formatNumber', () => {
    test('formats numbers correctly', () => {
      expect(formatNumber(500)).toBe('500')
      expect(formatNumber(1500)).toBe('1.5K')
      expect(formatNumber(1000000)).toBe('1.0M')
      expect(formatNumber(2500000)).toBe('2.5M')
    })
  })

  describe('formatTime', () => {
    test('formats time correctly', () => {
      expect(formatTime(30)).toBe('30s')
      expect(formatTime(90)).toBe('1m 30s')
      expect(formatTime(3661)).toBe('1h 1m')
    })
  })

  describe('getBuildingCost', () => {
    test('calculates building cost with level scaling', () => {
      const cost1 = getBuildingCost('house', 1)
      const cost2 = getBuildingCost('house', 2)
      
      expect(cost1.gold).toBe(100)
      expect(cost2.gold).toBeGreaterThan(cost1.gold)
    })
  })

  describe('getRequiredExperience', () => {
    test('calculates required experience correctly', () => {
      expect(getRequiredExperience(1)).toBe(100)
      expect(getRequiredExperience(2)).toBeGreaterThan(100)
      expect(getRequiredExperience(10)).toBeGreaterThan(getRequiredExperience(5))
    })
  })
})