import type { Friend, CompareFn, InsertResult } from "../types";

export async function insertWithComparisons({
  sorted,
  candidate,
  compare,
  maxComparisons,
  smoothingFactor = 0.3,
}: {
  sorted: Friend[];
  candidate: Friend;
  compare: CompareFn;
  maxComparisons?: number;
  smoothingFactor?: number;
}): Promise<InsertResult> {
  if (sorted.length === 0) {
    candidate.closeness = 10.0;
    return { newSorted: [candidate], comparisonsUsed: 0, pivotsVisited: [] };
  }

  let lo = 0;
  let hi = sorted.length - 1;
  let pivotsVisited: string[] = [];
  let comparisons = 0;
  maxComparisons ??= Math.min(Math.ceil(Math.log2(sorted.length)) + 1, 9);

  while (lo <= hi && comparisons < maxComparisons) {
    const mid = Math.floor((lo + hi) / 2);
    const pivot = sorted[mid];
    pivotsVisited.push(pivot.id);
    const result = await compare(candidate, pivot);
    comparisons++;
    if (result < 0) hi = mid - 1;
    else lo = mid + 1;
  }

  const insertAt = lo;
  const newSorted = [...sorted];
  newSorted.splice(insertAt, 0, candidate);

  // Normalize closeness scores 0..10
  const n = newSorted.length;
  newSorted.forEach((f, i) => {
    f.closeness = n > 1 ? (10 * i) / (n - 1) : 10.0;
  });

  // Apply moving-average smoothing for stability
  const smoothedSorted = applyMovingAverageSmoothing(newSorted, smoothingFactor);

  return { newSorted: smoothedSorted, comparisonsUsed: comparisons, pivotsVisited };
}

function applyMovingAverageSmoothing(
  friends: Friend[], 
  smoothingFactor: number
): Friend[] {
  if (friends.length <= 2) return friends;

  const smoothed = [...friends];
  
  for (let i = 1; i < smoothed.length - 1; i++) {
    const prev = smoothed[i - 1].closeness;
    const current = smoothed[i].closeness;
    const next = smoothed[i + 1].closeness;
    
    // Apply moving average smoothing
    const smoothedValue = smoothingFactor * current + 
      (1 - smoothingFactor) * (prev + next) / 2;
    
    smoothed[i].closeness = Math.max(0, Math.min(10, smoothedValue));
  }

  return smoothed;
}

export function generateIconKey(closeness: number): string {
  // Deterministic icon progression based on closeness
  if (closeness < 2) return 'dot-blue';
  if (closeness < 4) return 'square-teal';
  if (closeness < 6) return 'hexagon-green';
  if (closeness < 7.5) return 'flower-yellow-green';
  if (closeness < 9) return 'star8-orange';
  return 'star12-red';
}

export function getIconConfig(closeness: number) {
  const iconKey = generateIconKey(closeness);
  const [shape, color] = iconKey.split('-');
  
  return {
    shape: shape as 'dot' | 'square' | 'hexagon' | 'flower' | 'star8' | 'star12',
    color,
    size: Math.max(12, Math.min(24, 12 + (closeness / 10) * 12)) // 12-24px based on closeness
  };
}