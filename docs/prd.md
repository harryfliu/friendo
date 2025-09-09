# friendo — Product Requirements Document (v1.4)

**Owner:** Harry  
**Date:** Sept 2025  

---

## 1. Vision
friendo is a mobile-first web app that turns your social closeness into a living orbit map. The user is the center, friends orbit at adaptive distances based on relative closeness (0.0–10.0). Every detail — from abstract icon design to animation curves — is tuned for elegance and emotional resonance.

---

## 2. Core Goals
- **Elegant motion:** fluid, spring-based animations with personality.  
- **Playful abstraction:** icons as shapes + colors, stronger/more interesting for closer friends.  
- **Mobile-first UX:** gestures (swipe, pinch, drag) drive the experience.  
- **Clarity at scale:** hundreds of friends supported while retaining smoothness.  
- **Consistency:** smoothed thresholds stored in Settings for continuity across sessions.  
- **Complementary desktop UX:** keyboard + mouse with same design language.

---

## 3. Core Features

### 3.1 Friend Orbit Map
- User dot centered.  
- Up to **20 rings**; min **10**. Rings represent 0.5 score intervals (0.0–10.0).  
- Adaptive spacing: radii derived from score quantiles, smoothed (`alpha=0.28`).  
- Multiple friends per ring; collision-free layout.  
- Icons become more vibrant and complex with closeness.  

### 3.2 Friend Rating (Beli-inspired)
- Pairwise comparisons (swipe right = more close, left = less close).  
- Binary-search insertion algorithm.  
- **Max comparisons:** `min(ceil(log2(N))+1, 9)` to avoid fatigue.  
- First friend defaults to innermost ring.  
- Normalize scores 0.0–10.0 after each insertion; apply moving-average smoothing.  
- Existing scores adjust dynamically.  

### 3.3 Interactions
- **Tap friend:** open card with name + location.  
- **Drag within orbit:** tangential reposition only.  
- **Pinch-zoom / pan:** smooth navigation.  
- **Theme switcher:** light ↔ dark with cross-fade transition.  
- **Desktop shortcuts:** `←` less, `→` more, `Enter` next, `Esc` cancel.  

### 3.4 Animations
- Orbit transitions: radii smoothly interpolate.  
- Placement: new friend animates from center → orbit.  
- Micro-interactions: glow pulse, ripple, drag trail.  
- Motion specs: spring `{stiffness:220, damping:26, mass:0.9}`, fade 160–220ms, cross-theme 240ms.  

---

## 4. Non-Goals (v1)
- No friend-friend mapping.  
- No avatars/images.  
- No exports/sharing.  
- No world map placement (reserved for v2).  

---

## 5. Tech Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind, shadcn/ui, Framer Motion.  
- **Visualization:** D3 (scales, zoom, force) in SVG.  
- **State:** Zustand (UI), TanStack Query (server).  
- **Backend:** Prisma + Postgres (Supabase).  
- **Auth:** Auth.js.  
- **Deployment:** Vercel.  

---

## 6. Data Model

```prisma
model Friend {
  id        String   @id @default(cuid())
  userId    String
  name      String
  closeness Float    // 0.0–10.0
  iconKey   String   // shape+color token
  city      String?
  state     String?
  country   String?
  createdAt DateTime @default(now())
}

model RatingComparison {
  id        String @id @default(cuid())
  userId    String
  friendAId String
  friendBId String
  result    Int    // -1 = A less close, +1 = A more close
  createdAt DateTime @default(now())
}

model Settings {
  id        String   @id @default(cuid())
  userId    String   @unique
  theme     String   // "light" | "dark"
  ringCount Int      // dynamic 10–20
  thresholds Json    // smoothed quantile thresholds
  createdAt DateTime @default(now())
}

7. UX & Design Principles
	•	Mobile-first gestures.
	•	Deterministic icon progression:
	•	0–1.9: dot (cool blue)
	•	2–3.9: rounded square (teal)
	•	4–5.9: hexagon (green)
	•	6–7.4: flower/asterisk (yellow-green)
	•	7.5–8.9: 8-point star (orange)
	•	9–10: 12-point starburst (red, most vibrant)
	•	Warm hues = closeness.
	•	Minimal cards: only name + location.
	•	Accessible color ramps.

⸻

8. Future Roadmap (v2)
	•	World map visualization.
	•	Export/share.
	•	Pixi.js/WebGL renderer.
	•	Advanced analytics.