# friendo

A mobile-first web app that visualizes your social closeness as a living orbit map. Your friends orbit around you at adaptive distances based on how close you feel to them.

## Features

- **Orbit Visualization**: Friends are positioned in concentric rings based on closeness (0.0-10.0)
- **Smart Rating System**: Binary-search insertion algorithm for efficient friend ranking
- **Mobile-First Gestures**: Swipe to rate, pinch to zoom, drag to pan
- **Desktop Shortcuts**: Keyboard navigation with arrow keys
- **Adaptive Layout**: Quantile-based ring spacing with smooth thresholds
- **Icon Progression**: Visual complexity increases with closeness
- **Spring Animations**: Fluid, personality-driven motion design

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives
- **Animations**: Framer Motion
- **Visualization**: D3.js for scales, zoom, and force simulation
- **State Management**: Zustand (UI), TanStack Query (server)
- **Database**: Prisma + PostgreSQL (Supabase)
- **Authentication**: Auth.js
- **Styling**: Tailwind CSS with custom design system

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or Supabase account)

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/harryfliu/friendo.git
cd friendo

# Install all dependencies (this creates node_modules/)
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Why `npm install` is Required

When you clone this repository, you get all the source code but **not** the `node_modules/` folder. This is intentional because:

- **`node_modules/` is huge** (hundreds of MB)
- **Platform-specific** (different for Windows/Mac/Linux) 
- **Regenerated easily** from `package.json` and `package-lock.json`
- **GitHub has file size limits** (100MB per file)

The `package-lock.json` file ensures everyone gets the **exact same versions** of dependencies across all machines.

### Detailed Installation

1. **Clone the repository:**
```bash
git clone https://github.com/harryfliu/friendo.git
cd friendo
```

2. **Install dependencies:**
```bash
npm install
```
> **Note:** This creates the `node_modules/` folder with all required packages. This step is required on every new machine.

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your database and authentication credentials.

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Adding Friends

1. Click the "Add Friend" button in the header
2. Enter the friend's name and basic information
3. Use the rating interface to compare them with existing friends
4. Swipe left (less close) or right (more close) to position them

### Navigation

**Mobile:**
- Tap friends to view details
- Pinch to zoom the orbit map
- Drag to pan around
- Swipe during rating to make comparisons

**Desktop:**
- Click friends to view details
- Mouse wheel to zoom
- Click and drag to pan
- Use arrow keys during rating: ← (less close), → (more close), Esc (cancel)

### Understanding the Orbit

- **Center**: You are at the center of the orbit
- **Rings**: Each ring represents a 0.5 closeness interval
- **Icons**: Visual complexity increases with closeness:
  - 0-1.9: Blue dot
  - 2-3.9: Teal square
  - 4-5.9: Green hexagon
  - 6-7.4: Yellow-green flower
  - 7.5-8.9: Orange 8-point star
  - 9-10: Red 12-point starburst

## Development

### Project Structure

```
friendo/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── orbit-visualization.tsx
│   ├── rating-interface.tsx
│   └── friend-card.tsx
├── lib/                   # Core logic and utilities
│   ├── orbit/             # Orbit layout algorithms
│   ├── rating/            # Rating and insertion logic
│   ├── hooks/             # Custom React hooks
│   └── store.ts           # Zustand state management
├── prisma/                # Database schema
└── __tests__/             # Test files
```

### Key Algorithms

**Orbit Layout (`lib/orbit/layout.ts`)**:
- Quantile-based adaptive spacing
- Smooth threshold transitions (alpha=0.28)
- Collision-free friend positioning

**Rating System (`lib/rating/insert.ts`)**:
- Binary-search insertion
- Moving-average smoothing
- Maximum 9 comparisons per friend

### Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Database Management

Generate Prisma client:
```bash
npm run db:generate
```

Push schema changes:
```bash
npm run db:push
```

Open Prisma Studio:
```bash
npm run db:studio
```

## Design Principles

- **Mobile-First**: Gestures drive the experience
- **Elegant Motion**: Spring-based animations with personality
- **Playful Abstraction**: Icons as shapes and colors
- **Clarity at Scale**: Hundreds of friends supported smoothly
- **Consistency**: Smoothed thresholds for session continuity

## Contributing

1. Follow the `.cursorrules` guidelines
2. Keep diffs ≤150 LOC and scoped to listed files
3. Add tests for logic or layout changes
4. Use strict TypeScript (no implicit any)
5. Maintain orbit logic isolation in `/lib/orbit`
6. Keep rating logic isolated in `/lib/rating`

## License

MIT License - see LICENSE file for details.
