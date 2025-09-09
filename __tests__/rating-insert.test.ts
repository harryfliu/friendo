import { insertWithComparisons, generateIconKey, getIconConfig } from '@/lib/rating/insert'
import type { Friend } from '@/lib/types'

describe('Rating Insert', () => {
  describe('insertWithComparisons', () => {
    it('should insert first friend at innermost ring', async () => {
      const candidate: Friend = {
        id: '1',
        userId: 'user1',
        name: 'Alice',
        closeness: 5.0,
        iconKey: 'hexagon-green',
        createdAt: new Date(),
      }

      const result = await insertWithComparisons({
        sorted: [],
        candidate,
        compare: async () => 1,
      })

      expect(result.newSorted).toHaveLength(1)
      expect(result.newSorted[0].closeness).toBe(10.0)
      expect(result.comparisonsUsed).toBe(0)
    })

    it('should insert friend in correct position', async () => {
      const sorted: Friend[] = [
        { id: '1', userId: 'user1', name: 'Alice', closeness: 10.0, iconKey: 'star12-red', createdAt: new Date() },
        { id: '2', userId: 'user1', name: 'Bob', closeness: 5.0, iconKey: 'hexagon-green', createdAt: new Date() },
        { id: '3', userId: 'user1', name: 'Charlie', closeness: 0.0, iconKey: 'dot-blue', createdAt: new Date() },
      ]

      const candidate: Friend = {
        id: '4',
        userId: 'user1',
        name: 'Diana',
        closeness: 7.5,
        iconKey: 'star8-orange',
        createdAt: new Date(),
      }

      const result = await insertWithComparisons({
        sorted,
        candidate,
        compare: async (candidate, pivot) => {
          // Diana is closer than Bob but less close than Alice
          if (pivot.id === '1') return -1  // Diana less close than Alice
          if (pivot.id === '2') return 1   // Diana more close than Bob
          return 1  // Diana more close than Charlie
        },
      })

      expect(result.newSorted).toHaveLength(4)
      // Diana should be inserted at the end (Alice=0, Bob=1, Charlie=2, Diana=3)
      expect(result.newSorted[3].id).toBe('4')
    })

    it('should respect max comparisons limit', async () => {
      const sorted = Array.from({ length: 100 }, (_, i) => ({
        id: `friend-${i}`,
        userId: 'user1',
        name: `Friend ${i}`,
        closeness: i,
        iconKey: 'dot-blue',
        createdAt: new Date(),
      }))

      const candidate: Friend = {
        id: 'new-friend',
        userId: 'user1',
        name: 'New Friend',
        closeness: 50,
        iconKey: 'hexagon-green',
        createdAt: new Date(),
      }

      const result = await insertWithComparisons({
        sorted,
        candidate,
        compare: async () => 1,
        maxComparisons: 5,
      })

      expect(result.comparisonsUsed).toBeLessThanOrEqual(5)
    })
  })

  describe('generateIconKey', () => {
    it('should return correct icon keys for different closeness levels', () => {
      expect(generateIconKey(1.0)).toBe('dot-blue')
      expect(generateIconKey(3.0)).toBe('square-teal')
      expect(generateIconKey(5.0)).toBe('hexagon-green')
      expect(generateIconKey(7.0)).toBe('flower-yellow-green')
      expect(generateIconKey(8.5)).toBe('star8-orange')
      expect(generateIconKey(9.5)).toBe('star12-red')
    })
  })

  describe('getIconConfig', () => {
    it('should return correct icon configuration', () => {
      const config = getIconConfig(5.0)
      
      expect(config.shape).toBe('hexagon')
      expect(config.color).toBe('green')
      expect(config.size).toBeGreaterThan(12)
      expect(config.size).toBeLessThanOrEqual(24)
    })
  })
})
