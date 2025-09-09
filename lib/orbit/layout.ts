import * as d3 from "d3";
import type { RingLayout } from "../types";

export function computeRings(
  scores: number[], 
  width: number, 
  height: number, 
  prevThresholds?: number[]
): RingLayout {
  if (scores.length === 0) {
    return { radii: [], thresholds: [] };
  }

  const minRings = 10;
  const maxRings = 20;
  const intervalSize = 0.5;
  
  // Determine number of rings based on score distribution
  const scoreRange = Math.max(...scores) - Math.min(...scores);
  const suggestedRings = Math.min(maxRings, Math.max(minRings, Math.ceil(scoreRange / intervalSize)));
  
  // Create thresholds with 0.5 intervals
  const intervals = d3.range(0, 10.5, intervalSize);
  const thresholds = intervals.slice(1); // 0.5, 1.0, …, 10.0

  // Quantile-based adaptive spacing
  const sortedScores = [...scores].sort((a, b) => a - b);
  const quantiles = [0.1, 0.3, 0.5, 0.7, 0.9].map(p => d3.quantile(sortedScores, p) as number);
  
  // Smooth thresholds with alpha=0.28
  const alpha = 0.28;
  const smoothedThresholds = prevThresholds 
    ? thresholds.map((threshold, i) => 
        alpha * threshold + (1 - alpha) * (prevThresholds[i] || threshold)
      )
    : thresholds;

  // Calculate radii with adaptive spacing
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(centerX, centerY) - 40; // 40px padding
  
  // Base radius calculation with quantile-based spacing
  const baseRadius = 28; // minimum spacing
  const maxSpacing = 72; // maximum spacing
  
  const radii: number[] = [];
  for (let i = 0; i < thresholds.length; i++) {
    const threshold = smoothedThresholds[i];
    const quantileIndex = quantiles.findIndex(q => threshold <= q);
    const spacingFactor = quantileIndex >= 0 ? (quantileIndex + 1) / quantiles.length : 1;
    const spacing = Math.min(maxSpacing, baseRadius + spacingFactor * (maxSpacing - baseRadius));
    radii.push(Math.min(maxRadius, baseRadius + i * spacing));
  }

  return {
    radii,
    thresholds: smoothedThresholds,
  };
}

export function computeFriendPositions(
  friends: Array<{ closeness: number; id: string }>,
  ringLayout: RingLayout,
  width: number,
  height: number
): Array<{ id: string; x: number; y: number; ring: number; angle: number }> {
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Group friends by ring
  const friendsByRing: { [ringIndex: number]: Array<{ closeness: number; id: string }> } = {};
  
  friends.forEach(friend => {
    const ringIndex = ringLayout.thresholds.findIndex(threshold => friend.closeness <= threshold);
    const actualRing = ringIndex === -1 ? ringLayout.thresholds.length - 1 : ringIndex;
    
    if (!friendsByRing[actualRing]) {
      friendsByRing[actualRing] = [];
    }
    friendsByRing[actualRing].push(friend);
  });

  const positions: Array<{ id: string; x: number; y: number; ring: number; angle: number }> = [];

  // Position friends within each ring
  Object.entries(friendsByRing).forEach(([ringIndexStr, ringFriends]) => {
    const ringIndex = parseInt(ringIndexStr);
    const radius = ringLayout.radii[ringIndex];
    const angleStep = (2 * Math.PI) / ringFriends.length;
    
    ringFriends.forEach((friend, index) => {
      const angle = index * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      positions.push({
        id: friend.id,
        x,
        y,
        ring: ringIndex,
        angle
      });
    });
  });

  return positions;
}