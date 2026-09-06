# NextUp

**Find what's next.**

NextUp is a modern, mobile-first career platform that makes job searching feel like discovering opportunities instead of digging through listings. Built with Next.js, TypeScript, and Tailwind CSS with a distinctive electric lime brand and polished consumer app aesthetic.

## 🎯 Product Vision

NextUp combines:

- **Personalized job discovery** - Tinder/Hinge-style card-based exploration
- **Intelligent matching** - Understand why jobs fit your profile
- **AI career assistance** - Resume tailoring, interview prep, career guidance
- **Application tracking** - Kanban-style pipeline management
- **Progress & streaks** - Duolingo-style motivation system
- **Career development** - Explore paths and transitions

The goal: Make job searching feel **exciting, personal, and achievable** instead of depressing and overwhelming.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone or navigate to the project
cd nextup

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
nextup/
├── app/                      # Next.js 13+ app directory
│   ├── discover/            # Job discovery feed (main UX)
│   ├── explore/             # Search and filter jobs
│   ├── ai/                  # AI career assistant
│   ├── applications/        # Application tracker
│   ├── activity/            # Streaks and missions
│   ├── profile/             # User profile
│   ├── saved/               # Saved jobs
│   ├── settings/            # Settings
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Design system tokens
│
├── components/
│   ├── ui/                  # Core UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── logo.tsx
│   │   ├── progress.tsx
│   │   ├── skeleton.tsx
│   │   └── empty-state.tsx
│   │
│   ├── jobs/                # Job-specific components
│   │   ├── job-discovery-card.tsx
│   │   └── match-score.tsx
│   │
│   └── layout/              # App shell components
│       ├── app-shell.tsx
│       ├── mobile-bottom-nav.tsx
│       └── desktop-sidebar.tsx
│
├── lib/
│   ├── data/                # Mock data
│   │   └── mock-jobs.ts
│   ├── utils.ts             # Utility functions
│   └── motion.ts            # Animation presets
│
├── types/
│   └── index.ts             # TypeScript type definitions
│
└── public/                  # Static assets
```

## 🎨 Design System

### Brand Colors

**Primary**: Electric Lime (#a3e635)
- Modern, energetic, forward-looking
- Used for CTAs, progress, success states

**Accent**: Warm Orange (#fb923c)
- Supporting highlight color
- Used sparingly for emphasis

### Typography

- **System Fonts**: Optimized native fonts for best performance
- **Hierarchy**: Hero → Display → Heading → Body → Metadata
- **Responsive**: Fluid typography using `clamp()`

### Spacing & Radius

- Generous spacing for breathability
- Consistent border radius: 10px → 14px → 20px → 28px
- Mobile-first with safe area support

### Motion

Built with **Framer Motion**:
- Fast (0.15s), Normal (0.25s), Slow (0.4s)
- Spring presets for natural feel
- Respects `prefers-reduced-motion`

## 🧩 Core Components

### UI Components

- **Button** - Primary, secondary, ghost, destructive variants
- **Input** - Accessible form inputs with labels and validation
- **Card** - Elevated, default, muted variants
- **Badge** - Chips for skills, tags, status
- **Avatar** - Auto-generated initials and colors
- **Progress** - Animated progress bars
- **EmptyState** - Thoughtful empty states with CTAs

### Job Components

- **JobDiscoveryCard** - Main card-based discovery interface
- **MatchScore** - Circular animated match percentage

### Layout Components

- **AppShell** - Combines mobile bottom nav + desktop sidebar
- **MobileBottomNav** - 5-item bottom navigation
- **DesktopSidebar** - Collapsible sidebar for desktop

## 📦 Tech Stack

### Frontend

- **Next.js 16** - App Router, Server Components, Server Actions
- **React 19** - Latest features
- **TypeScript** - Strict type safety
- **Tailwind CSS v4** - Utility-first styling with CSS variables

### Libraries

- **Framer Motion** - Smooth animations
- **Lucide React** - Modern icon set
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Zustand** - Lightweight state
- **TanStack Query** - Server state (when needed)

### Planned

- **Supabase** - Auth, database, storage
- **AI Integration** - OpenAI/Anthropic for career assistance

## 🎯 Current Status

### ✅ Completed

- ✨ Design system with electric lime brand
- ✨ Responsive navigation (mobile bottom + desktop sidebar)
- ✨ Landing page with hero and features
- ✨ Job discovery feed with match cards
- ✨ Mock job data (5 realistic opportunities)
- ✨ Match score visualization
- ✨ Daily progress tracking UI
- ✨ Placeholder pages for all routes

### 🚧 In Progress

- Job detail pages
- Saved jobs functionality
- Application tracker
- Activity/streak system

### 📋 Planned

- Onboarding flow
- User profiles
- AI career assistant
- Resume parsing and tailoring
- Interview prep
- Career path explorer
- Search and filters

## 🏃 Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production
npm run start        # Start production server

# Quality
npm run lint         # Run ESLint
```

## 🎨 Design Principles

### Visual Identity

- **NOT** generic SaaS blue/purple
- **NOT** corporate/sterile
- **NOT** endless white cards
- **IS** energetic, optimistic, modern
- **IS** consumer app quality (Spotify/Hinge/Duolingo-level polish)

### UX Philosophy

1. **Mobile-first** - Primary experience is mobile web/PWA
2. **Progressive disclosure** - Show essentials, reveal depth on demand
3. **Positive reinforcement** - Encourage without gamifying unemployment
4. **Human language** - Conversational, not corporate
5. **Respect privacy** - Conservative defaults, explicit opt-ins

## 🔧 Configuration

### Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Supabase (when implemented)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# AI Provider (when implemented)
AI_PROVIDER=openai
AI_API_KEY=your-api-key
AI_MODEL=gpt-4

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎯 Roadmap

### Phase 1: Core Discovery (Current)
- [x] Design system
- [x] Navigation
- [x] Landing page
- [x] Job discovery feed
- [ ] Job details
- [ ] Save/pass functionality

### Phase 2: User System
- [ ] Authentication (Supabase)
- [ ] User profiles
- [ ] Onboarding flow
- [ ] Preferences

### Phase 3: Application Management
- [ ] Application tracker
- [ ] Kanban board (desktop)
- [ ] Timeline and notes
- [ ] Follow-up reminders

### Phase 4: AI Features
- [ ] Resume parsing
- [ ] Job analysis
- [ ] Resume tailoring
- [ ] Interview prep
- [ ] Career chat assistant

### Phase 5: Career Development
- [ ] Career path explorer
- [ ] Transition analysis
- [ ] Skill gap identification
- [ ] Learning recommendations

### Phase 6: Social (Future)
- [ ] Community features
- [ ] Company reviews
- [ ] Salary discussions
- [ ] Career transitions sharing

---

**NextUp** - Stop searching. Start discovering.
