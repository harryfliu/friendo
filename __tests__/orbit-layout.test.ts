// Mock D3 for testing
jest.mock('d3', () => ({
  range: (start: number, stop: number, step: number) => {
    const result = [];
    for (let i = start; i < stop; i += step) {
      result.push(i);
    }
    return result;
  },
  quantile: (sorted: number[], p: number) => {
    const index = (sorted.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
}));

import { computeRings, computeFriendPositions } from '@/lib/orbit/layout'

describe('Orbit Layout', () => {
  describe('computeRings', () => {
    it('should return empty layout for no scores', () => {
      const result = computeRings([], 800, 600)
      expect(result.radii).toEqual([])
      expect(result.thresholds).toEqual([])
    })

    it('should create rings with correct thresholds', () => {
      const scores = [1, 2, 3, 4, 5]
      const result = computeRings(scores, 800, 600)
      
      expect(result.thresholds).toHaveLength(20) // 0.5 to 10.0 in 0.5 intervals
      expect(result.thresholds[0]).toBe(0.5)
      expect(result.thresholds[19]).toBe(10.0)
    })

    it('should create radii within bounds', () => {
      const scores = [1, 2, 3, 4, 5]
      const result = computeRings(scores, 800, 600)
      
      expect(result.radii.length).toBeGreaterThan(0)
      expect(result.radii[0]).toBeGreaterThan(0)
      expect(result.radii[0]).toBeLessThan(400) // Should be less than half width
    })

    it('should apply smoothing with previous thresholds', () => {
      const scores = [1, 2, 3, 4, 5]
      const prevThresholds = Array(20).fill(5.0)
      const result = computeRings(scores, 800, 600, prevThresholds)
      
      // Should be different from original thresholds due to smoothing
      expect(result.thresholds).not.toEqual(Array(20).fill(5.0))
    })
  })

  describe('computeFriendPositions', () => {
    it('should position friends correctly', () => {
      const friends = [
        { id: '1', closeness: 1.0 },
        { id: '2', closeness: 5.0 },
        { id: '3', closeness: 9.0 },
      ]
      const ringLayout = {
        radii: [50, 100, 150, 200],
        thresholds: [2.5, 5.0, 7.5, 10.0],
      }
      
      const positions = computeFriendPositions(friends, ringLayout, 800, 600)
      
      expect(positions).toHaveLength(3)
      expect(positions[0].id).toBe('1')
      expect(positions[1].id).toBe('2')
      expect(positions[2].id).toBe('3')
      
      // Check that positions are within bounds
      positions.forEach(pos => {
        expect(pos.x).toBeGreaterThan(0)
        expect(pos.x).toBeLessThan(800)
        expect(pos.y).toBeGreaterThan(0)
        expect(pos.y).toBeLessThan(600)
      })
    })
  })
})
