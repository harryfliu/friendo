export const ANIMATION_CONFIG = {
  spring: {
    stiffness: 220,
    damping: 26,
    mass: 0.9,
  },
  durations: {
    fast: 160,
    normal: 200,
    slow: 240,
  },
  easing: [0.22, 1, 0.36, 1], // Framer Motion cubic-bezier format
} as const;

export const ORBIT_CONFIG = {
  minRings: 10,
  maxRings: 20,
  intervalSize: 0.5,
  minSpacing: 28,
  maxSpacing: 72,
  smoothingAlpha: 0.28,
  padding: 40,
} as const;

export const RATING_CONFIG = {
  maxComparisons: 9,
  smoothingFactor: 0.3,
} as const;

export const ICON_PROGRESSION = [
  { min: 0, max: 1.9, shape: 'dot', color: 'blue' },
  { min: 2, max: 3.9, shape: 'square', color: 'teal' },
  { min: 4, max: 5.9, shape: 'hexagon', color: 'green' },
  { min: 6, max: 7.4, shape: 'flower', color: 'yellow-green' },
  { min: 7.5, max: 8.9, shape: 'star8', color: 'orange' },
  { min: 9, max: 10, shape: 'star12', color: 'red' },
] as const;

export const GESTURE_CONFIG = {
  swipeThreshold: 50,
  pinchThreshold: 0.1,
  doubleTapDelay: 300,
} as const;

export const KEYBOARD_SHORTCUTS = {
  LESS: 'ArrowLeft',
  MORE: 'ArrowRight',
  NEXT: 'Enter',
  CANCEL: 'Escape',
} as const;
