# friendo

A mobile-first web app that visualizes your social closeness as a living orbit map. Your friends orbit around you at adaptive distances based on how close you feel to them, with beautiful map visualizations and intelligent rating systems.

## ✨ Features

### 🌟 Core Visualization
- **Orbit Map**: Friends positioned in concentric rings based on closeness (0.0-10.0)
- **Interactive Map**: Leaflet-powered world map with CartoDB tiles (Dark Matter & Positron)
- **Smart Icons**: Visual complexity increases with closeness:
  - 0-1.9: Blue dot - Very distant
  - 2-3.9: Teal square - Distant  
  - 4-5.9: Green hexagon - Moderate
  - 6-7.4: Yellow diamond - Close
  - 7.5-8.9: Orange 8-point star - Very close
  - 9-10: Red 12-point star - Closest

### 🎯 Intelligent Rating System
- **Binary Search Algorithm**: Efficient friend ranking with max 9 comparisons
- **"About the Same" Option**: Preserve ties when friends feel equally close
- **Tie-Aware Scoring**: Maintains identical scores for tied friends across additions
- **Relative Scoring**: Dynamic recalculation keeps rankings meaningful
- **Debug Logging**: Comprehensive logging for troubleshooting rating issues

### 📱 Mobile-First Experience
- **Touch Gestures**: Swipe to rate, pinch to zoom, drag to pan
- **Responsive Header**: Optimized for mobile with compact styling
- **Theme Support**: Dark/light mode with smooth transitions
- **Local Network Access**: Test on mobile via local IP (e.g., `http://192.168.1.100:3000`)

### 🗺️ Map Features
- **Dual Map Views**: Orbit visualization and interactive world map
- **Geocoding**: Automatic location lookup with caching
- **Map Styles**: Toggle between dark (CartoDB Dark Matter) and light (CartoDB Positron) themes
- **Real Data**: Uses actual friend locations with demo mode fallback

### 🎨 UI/UX
- **Spring Animations**: Fluid, personality-driven motion with Framer Motion
- **Adaptive Layout**: Quantile-based ring spacing with smooth thresholds
- **Theme Consistency**: All components adapt to dark/light mode
- **Friend Management**: Add, delete, and reset friends with complete data cleanup

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/harryfliu/friendo.git
cd friendo

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Mobile Testing
1. Find your computer's local IP (e.g., `192.168.1.100`)
2. Access `http://YOUR_IP:3000` on your phone
3. Ensure both devices are on the same Wi-Fi network

## 🎮 How to Use

### Adding Friends
1. Click the **"Add Friend"** button in the header
2. Enter friend's name, city, state, and country
3. Use the comparison interface to rate them against existing friends
4. Choose "closer", "farther", or "about the same" for each comparison

### Navigation
**Mobile:**
- Tap friends to view detailed cards
- Pinch to zoom the orbit map
- Drag to pan around
- Swipe during rating comparisons

**Desktop:**
- Click friends to view details
- Mouse wheel to zoom
- Click and drag to pan
- Use arrow keys during rating: ← (farther), → (closer), Esc (cancel)

### Map View
- Switch between **Orbit** and **Map** views using header buttons
- Map shows friend locations with colored markers
- Toggle map theme (dark/light) with the theme button
- Zoom and pan to explore friend locations worldwide

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives
- **Animations**: Framer Motion
- **Maps**: Leaflet.js with CartoDB tiles
- **Geocoding**: Nominatim (OpenStreetMap)
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom design system

## 📁 Project Structure

```
friendo/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── orbit-visualization.tsx
│   ├── rating-interface.tsx
│   ├── friend-card.tsx
│   ├── us-map.tsx         # Leaflet map component
│   └── header.tsx         # Responsive header
├── lib/                   # Core logic and utilities
│   ├── orbit/             # Orbit layout algorithms
│   ├── rating/            # Rating and insertion logic
│   ├── geocoding.ts       # Location lookup service
│   └── store.ts           # Zustand state management
└── types.ts               # TypeScript definitions
```

## 🔧 Development

### Key Algorithms

**Orbit Layout**:
- Quantile-based adaptive spacing
- Smooth threshold transitions
- Collision-free friend positioning

**Rating System**:
- Binary-search insertion for efficiency
- Tie-aware scoring preserves relationships
- Relative scoring maintains meaningful rankings

**Geocoding**:
- Nominatim API integration
- Local storage caching
- Automatic cleanup on friend deletion

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🎨 Design Principles

- **Mobile-First**: Touch gestures drive the experience
- **Elegant Motion**: Spring-based animations with personality
- **Playful Abstraction**: Icons as shapes and colors
- **Clarity at Scale**: Hundreds of friends supported smoothly
- **Consistency**: Smoothed thresholds for session continuity
- **Theme Awareness**: Every component adapts to dark/light mode

## 🐛 Troubleshooting

### Mobile Access Issues
- Ensure both devices are on the same Wi-Fi network
- Check your computer's firewall settings
- Try using your computer's local IP address

### Rating System Issues
- Use browser dev tools to check console logs
- Debug logging shows detailed rating process
- "About the same" preserves ties across additions

### Map Loading Issues
- Check internet connection for geocoding
- Clear browser cache if tiles don't load
- Demo mode provides fallback data

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add tests for new features
3. Ensure mobile responsiveness
4. Maintain theme consistency
5. Update documentation for new features

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for visualizing the beautiful complexity of human relationships.**