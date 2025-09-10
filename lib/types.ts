export interface Friend {
  id: string;
  userId: string;
  name: string;
  closeness: number; // 0.0–10.0
  iconKey: string; // shape+color token
  city?: string;
  state?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
}

export interface RatingComparison {
  id: string;
  userId: string;
  friendAId: string;
  friendBId: string;
  result: -1 | 1; // -1 = A less close, +1 = A more close
  createdAt: Date;
}

export interface Settings {
  id: string;
  userId: string;
  theme: 'light' | 'dark';
  ringCount: number; // 10–20
  thresholds: number[]; // smoothed quantile thresholds
  createdAt: Date;
}

export interface RingLayout {
  radii: number[];
  thresholds: number[];
}

export interface IconConfig {
  shape: 'dot' | 'square' | 'hexagon' | 'diamond' | 'star8' | 'star12';
  color: string;
  size: number;
}

export interface OrbitPosition {
  x: number;
  y: number;
  ring: number;
  angle: number;
}

export interface FriendWithPosition extends Friend {
  position: OrbitPosition;
  icon: IconConfig;
}

export type CompareFn = (candidate: Friend, pivot: Friend) => Promise<-1 | 1>;

export interface InsertResult {
  newSorted: Friend[];
  comparisonsUsed: number;
  pivotsVisited: string[];
}

export interface ThemeConfig {
  name: 'light' | 'dark';
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    border: string;
  };
}

export interface AnimationConfig {
  stiffness: number;
  damping: number;
  mass: number;
  duration: number;
}
