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

  // Special case for single friend - place them in the innermost ring
  if (scores.length === 1) {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 40;
    
    return {
      radii: [28], // Small radius for innermost ring
      thresholds: [10.0], // High threshold so they get placed in this ring
    };
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
  const quantiles = [0.1, 0.3, 0.5, 0.7, 0.9].map(p => {
    const quantile = d3.quantile(sortedScores, p);
    // Fallback to the single score if quantile is undefined (single data point)
    return quantile !== undefined ? quantile : sortedScores[0];
  });
  
  // Smooth thresholds with alpha=0.28
  const alpha = 0.28;
  const smoothedThresholds = prevThresholds 
    ? thresholds.map((threshold, i) => 
        alpha * threshold + (1 - alpha) * (prevThresholds[i] || threshold)
      )
    : thresholds;

  // Calculate radii with proper distribution
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(centerX, centerY) - 40; // 40px padding
  const minRadius = 28; // minimum radius for innermost ring
  
  const radii: number[] = [];
  for (let i = 0; i < thresholds.length; i++) {
    // Use logarithmic distribution to spread rings more evenly
    // This ensures each ring has a distinct radius
    const progress = i / (thresholds.length - 1); // 0 to 1
    const radius = minRadius + (maxRadius - minRadius) * Math.pow(progress, 0.7); // 0.7 for slight curve
    radii.push(radius);
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
  
  console.log('🔍 Ring assignment debug:', {
    thresholds: ringLayout.thresholds,
    radii: ringLayout.radii,
    friends: friends.map(f => ({ name: f.id, closeness: f.closeness }))
  });

  friends.forEach(friend => {
    // Find the ring based on closeness: higher closeness = inner rings (lower index)
    // Map closeness score to ring index (0-10 scale to 0-19 rings, inverted)
    const normalizedCloseness = Math.max(0, Math.min(10, friend.closeness))
    const ringIndex = Math.floor(-2 * normalizedCloseness + 19)
    
    // Ensure we don't exceed available rings
    const actualRing = Math.min(Math.max(0, ringIndex), ringLayout.radii.length - 1);
    
    console.log(`📍 Friend ${friend.id} (closeness: ${friend.closeness}) -> ring ${actualRing}`);
    
    
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
    
    // If only one friend on this ring, place them randomly
    if (ringFriends.length === 1) {
      const angle = Math.random() * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      positions.push({
        id: ringFriends[0].id,
        x,
        y,
        ring: ringIndex,
        angle
      });
    } else {
      // Multiple friends: distribute evenly but with random starting angle
      const angleStep = (2 * Math.PI) / ringFriends.length;
      const randomOffset = Math.random() * 2 * Math.PI;
      
      ringFriends.forEach((friend, index) => {
        const angle = (index * angleStep + randomOffset) % (2 * Math.PI);
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
    }
  });

  return positions;
}