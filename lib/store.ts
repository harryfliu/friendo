import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Friend, RingLayout, FriendWithPosition, ThemeConfig, AnimationConfig } from './types';

interface OrbitState {
  // Data
  friends: Friend[];
  ringLayout: RingLayout | null;
  friendPositions: FriendWithPosition[];
  
  // UI State
  selectedFriend: Friend | null;
  isRating: boolean;
  currentCandidate: Friend | null;
  ratingProgress: { current: number; total: number };
  isResetting: boolean;
  isAddFriendFormOpen: boolean;
  
  // Theme & Animation
  theme: 'light' | 'dark';
  animationConfig: AnimationConfig;
  
  // Actions
  setFriends: (friends: Friend[]) => void;
  addFriend: (friend: Friend) => void;
  updateFriend: (id: string, updates: Partial<Friend>) => void;
  removeFriend: (id: string) => void;
  resetFriends: () => void;
  
  setRingLayout: (layout: RingLayout) => void;
  setFriendPositions: (positions: FriendWithPosition[]) => void;
  
  selectFriend: (friend: Friend | null) => void;
  startRating: (candidate: Friend) => void;
  endRating: () => void;
  updateRatingProgress: (current: number, total: number) => void;
  
  showAddFriendForm: () => void;
  hideAddFriendForm: () => void;
  
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Computed
  getFriendById: (id: string) => Friend | undefined;
  getFriendsByRing: (ringIndex: number) => FriendWithPosition[];
}

const defaultAnimationConfig: AnimationConfig = {
  stiffness: 220,
  damping: 26,
  mass: 0.9,
  duration: 200
};

export const useOrbitStore = create<OrbitState>()(
  devtools(
    persist(
      (set, get) => ({
      // Initial state
      friends: [],
      ringLayout: null,
      friendPositions: [],
      selectedFriend: null,
      isRating: false,
      currentCandidate: null,
      ratingProgress: { current: 0, total: 0 },
      isResetting: false,
      isAddFriendFormOpen: false,
      theme: 'light',
      animationConfig: defaultAnimationConfig,

      // Actions
      setFriends: (friends) => set({ friends, isResetting: false }),
      
      addFriend: (friend) => set((state) => ({
        friends: [...state.friends, friend]
      })),
      
      updateFriend: (id, updates) => set((state) => ({
        friends: state.friends.map(f => 
          f.id === id ? { ...f, ...updates } : f
        )
      })),
      
      removeFriend: (id) => set((state) => ({
        friends: state.friends.filter(f => f.id !== id),
        selectedFriend: state.selectedFriend?.id === id ? null : state.selectedFriend
      })),
      
      resetFriends: () => {
        set((state) => ({
          friends: [],
          selectedFriend: null,
          isResetting: true
        }))
        
        // Clear the persisted data from localStorage
        localStorage.removeItem('orbit-store')
        
        // Clear the resetting state after a short delay
        setTimeout(() => {
          set({ isResetting: false })
        }, 500)
      },
      
      setRingLayout: (ringLayout) => set({ ringLayout }),
      setFriendPositions: (friendPositions) => set({ friendPositions }),
      
      selectFriend: (friend) => set({ selectedFriend: friend }),
      
      startRating: (candidate) => set({
        isRating: true,
        currentCandidate: candidate,
        ratingProgress: { current: 0, total: 0 }
      }),
      
      endRating: () => set({
        isRating: false,
        currentCandidate: null,
        ratingProgress: { current: 0, total: 0 }
      }),
      
      updateRatingProgress: (current, total) => set({
        ratingProgress: { current, total }
      }),
      
      showAddFriendForm: () => set({ isAddFriendFormOpen: true }),
      hideAddFriendForm: () => set({ isAddFriendFormOpen: false }),
      
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),
      
      setTheme: (theme) => set({ theme }),

      // Computed getters
      getFriendById: (id) => {
        const state = get();
        return state.friends.find(f => f.id === id);
      },
      
      getFriendsByRing: (ringIndex) => {
        const state = get();
        return state.friendPositions.filter(f => f.position.ring === ringIndex);
      }
      }),
      {
        name: 'orbit-store',
        partialize: (state) => ({ 
          friends: state.friends,
          theme: state.theme 
        }),
      }
    ),
    {
      name: 'orbit-store',
    }
  )
);

// Theme configurations
export const themeConfigs: Record<'light' | 'dark', ThemeConfig> = {
  light: {
    name: 'light',
    colors: {
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(222.2 84% 4.9%)',
      primary: 'hsl(222.2 47.4% 11.2%)',
      secondary: 'hsl(210 40% 98%)',
      accent: 'hsl(210 40% 96%)',
      muted: 'hsl(210 40% 96%)',
      border: 'hsl(214.3 31.8% 91.4%)',
    }
  },
  dark: {
    name: 'dark',
    colors: {
      background: 'hsl(222.2 84% 4.9%)',
      foreground: 'hsl(210 40% 98%)',
      primary: 'hsl(210 40% 98%)',
      secondary: 'hsl(217.2 32.6% 17.5%)',
      accent: 'hsl(217.2 32.6% 17.5%)',
      muted: 'hsl(217.2 32.6% 17.5%)',
      border: 'hsl(217.2 32.6% 17.5%)',
    }
  }
};
