# NeexMeet - Complete Full Stack Technical Overview

## 📋 Project Summary

**NeexMeetAI** is an **AI-Powered Team Execution System** - a modern, production-ready collaboration platform that combines real-time video conferencing, instant messaging, AI-powered automation, and team collaboration tools in one integrated application.

**Version**: 0.1.0  
**Node Version**: >=20 <23  
**Deployment**: Netlify  
**Database**: Neon PostgreSQL (Serverless)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEXTJS 15 (Frontend + API)                    │
│                         React 19                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   CLIENT LAYER   │  │   SERVER LAYER   │  │  EXTERNAL    │  │
│  │                  │  │                  │  │  SERVICES    │  │
│  │ • React 19       │  │ • tRPC Routers   │  │              │  │
│  │ • Tailwind CSS 4 │  │ • API Routes     │  │ • Stream.io  │  │
│  │ • Shadcn UI      │  │ • Middleware     │  │ • OpenAI     │  │
│  │ • Framer Motion  │  │ • Auth Handlers  │  │ • Polar      │  │
│  │ • React Query    │  │ • Webhooks       │  │ • Groq       │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│              DATABASE LAYER (Neon PostgreSQL)                    │
│                  • Drizzle ORM                                    │
│                  • Type-safe Schema                               │
├─────────────────────────────────────────────────────────────────┤
│         BACKGROUND JOBS & WORKFLOWS (Inngest)                    │
│              • Async Processing                                   │
│              • Event-driven Workflows                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Features & Modules

### **1. Video Conferencing** (`/modules/call`)
- Real-time video/audio calls powered by Stream.io
- Meeting recording and playback
- Screen sharing capabilities
- Low-latency communication

### **2. Meetings Management** (`/modules/meetings`)
- Create, schedule, and manage meetings
- Meeting dashboards and analytics
- Automated transcription via AI
- Meeting summaries and action items
- Searchable meeting history

### **3. Rooms** (`/modules/rooms`)
- Persistent team collaboration spaces
- Room-based organization
- Member management
- Role-based access control

### **4. Workspace** (`/modules/workspace`)
- Consolidated view of all activities
- Task management integration
- Document collaboration
- Team decision tracking

### **5. AI Agents** (`/modules/agents`)
- AI-powered meeting assistants
- Real-time conversation analysis
- Automatic note-taking
- Action item extraction
- Custom AI agent creation

### **6. Presence & Attendance** (`/modules/presence`)
- Real-time user presence tracking
- Attendance verification
- Team availability status
- Check-in/check-out system

### **7. Pulse** (`/modules/pulse`)
- Real-time activity feed
- Communication hub
- Instant messaging
- Notifications and alerts

### **8. Premium/Monetization** (`/modules/premium`)
- Subscription management via Polar
- Tiered feature access
- Billing and payments
- License management

### **9. Authentication** (`/modules/auth`)
- Google OAuth integration
- GitHub OAuth integration
- Email/password authentication
- Session management (Better Auth)
- Secure token handling

---

## 🛠️ Technology Stack (Detailed)

### **Frontend Technologies**

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 15 | React meta-framework with SSR, SSG, and API routes |
| **Language** | TypeScript | Static type checking for entire codebase |
| **React** | React 19 | UI library and component model |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **Component Library** | Shadcn UI + Radix UI | Accessible, unstyled UI primitives |
| **Icons** | Lucide React + React Icons | SVG icon libraries |
| **Animation** | Framer Motion | Motion library for React |
| **Data Visualization** | Recharts | Composable charting library |
| **Carousel** | Embla Carousel React | Touch and mouse dragging carousel |
| **Forms** | React Hook Form + Zod | Form state management + validation |
| **Date Handling** | date-fns | Date utility library |
| **Markdown** | react-markdown | Markdown to JSX renderer |
| **UI State** | nuqs | URL search parameters state management |
| **Theme** | next-themes | Theme provider (light/dark mode) |
| **Toast Notifications** | sonner | Sonner toast notification system |

### **Data Fetching & State Management**

| Technology | Purpose |
|-----------|---------|
| **tRPC** | End-to-end type-safe RPC framework (no manual API types) |
| **TanStack React Query** | Server state management, caching, synchronization |
| **Zod** | TypeScript-first schema validation |

### **Backend & API Technologies**

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js API Routes | Server-side request handling |
| **API Protocol** | tRPC | Type-safe RPC calls between client and server |
| **ORM** | Drizzle ORM | Lightweight, type-safe database queries |
| **Database Driver** | @neondatabase/serverless | Neon PostgreSQL serverless client |
| **Validation** | Zod | Runtime schema validation |
| **Error Handling** | react-error-boundary | Error boundary component system |

### **Database**

| Component | Technology |
|-----------|-----------|
| **Database** | PostgreSQL (Neon Serverless) |
| **ORM** | Drizzle ORM v0.43.1 |
| **Migrations** | drizzle-kit |
| **Schema** | Type-safe Drizzle schema definitions |

### **Real-time Communication**

| Service | Purpose |
|---------|---------|
| **Stream Video SDK** | Video conferencing, recording, playback |
| **Stream Chat SDK** | Real-time messaging and chat |
| **Stream OpenAI Realtime API** | AI voice integration during calls |
| **WebSockets** | Real-time data synchronization |

### **Authentication & Security**

| Technology | Purpose |
|-----------|---------|
| **Better Auth** | Authentication framework (sessions, OAuth) |
| **OAuth 2.0** | Google & GitHub third-party login |
| **JWT** | Token-based authentication |
| **CORS & Security Headers** | Request validation |

### **AI & NLP Services**

| Service | Purpose |
|---------|---------|
| **OpenAI API** | GPT models for transcription, summarization |
| **Groq API** | Fast language inference for real-time responses |
| **Stream OpenAI Realtime** | Voice-based AI interactions |

### **Background Jobs & Workflows**

| Technology | Purpose |
|-----------|---------|
| **Inngest** | Event-driven background jobs |
| **Webhooks** | External service integrations |
| **Event Queue** | Asynchronous task processing |

### **Payments & Monetization**

| Technology | Purpose |
|-----------|---------|
| **Polar SDK** | Subscription management and billing |
| **Stripe Integration** | Payment processing (via Polar) |

### **Development Tools**

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and quality |
| **TypeScript** | Type checking |
| **Tailwind CSS Postcss** | CSS processing |
| **tsx** | TypeScript execution for scripts |
| **Drizzle Kit** | Database schema management |

---

## 📁 Project Structure

```
Final-NEEXMEETAI/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication routes
│   │   │   ├── sign-in/
│   │   │   ├── sign-up/
│   │   │   └── auth-callback/
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   ├── agents/               # AI agents page
│   │   │   ├── dashboard/            # Main dashboard
│   │   │   ├── meetings/             # Meetings list
│   │   │   ├── rooms/                # Rooms management
│   │   │   └── workspace/            # Workspace view
│   │   ├── (marketing)/              # Public marketing pages
│   │   ├── api/                      # API routes
│   │   │   ├── auth/[...all]/        # Better Auth handler
│   │   │   ├── trpc/[trpc]/          # tRPC endpoint
│   │   │   ├── inngest/              # Inngest webhooks
│   │   │   └── webhook/              # External webhooks
│   │   ├── call/[meetingId]/         # Video call page
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   │
│   ├── modules/                      # Feature modules (domain-driven)
│   │   ├── agents/                   # AI agent management
│   │   ├── auth/                     # Authentication logic
│   │   ├── call/                     # Video call functionality
│   │   ├── dashboard/                # Dashboard features
│   │   ├── home/                     # Home page features
│   │   ├── meetings/                 # Meeting management
│   │   ├── premium/                  # Premium/subscription features
│   │   ├── presence/                 # User presence tracking
│   │   ├── pulse/                    # Activity feed
│   │   ├── rooms/                    # Room management
│   │   └── workspace/                # Workspace features
│   │
│   ├── components/                   # Shared UI components
│   │   ├── ui/                       # Shadcn/Radix components
│   │   ├── data-table.tsx
│   │   ├── data-pagination.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-state.tsx
│   │   ├── loading-state.tsx
│   │   └── ...
│   │
│   ├── trpc/                         # tRPC configuration
│   │   ├── init.ts                   # tRPC initialization
│   │   ├── server.tsx                # Server-side tRPC setup
│   │   ├── client.tsx                # Client-side tRPC setup
│   │   ├── query-client.ts           # React Query config
│   │   └── routers/
│   │       └── _app.ts               # Root tRPC router
│   │
│   ├── db/                           # Database
│   │   ├── schema.ts                 # Drizzle schema definitions
│   │   └── index.ts                  # Database client
│   │
│   ├── lib/                          # Utility functions
│   │   ├── auth.ts                   # Better Auth setup
│   │   ├── auth-client.ts            # Client-side auth
│   │   ├── stream-video.ts           # Stream Video config
│   │   ├── stream-chat.ts            # Stream Chat config
│   │   ├── polar.ts                  # Polar payments config
│   │   ├── env.ts                    # Environment variables
│   │   └── utils.ts                  # General utilities
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-confirm.tsx           # Confirmation dialog hook
│   │   ├── use-meeting-share.ts      # Meeting share hook
│   │   └── use-mobile.ts             # Mobile detection hook
│   │
│   ├── inngest/                      # Background jobs
│   │   ├── client.ts                 # Inngest client
│   │   └── functions.ts              # Job definitions
│   │
│   └── constants.ts                  # App-wide constants
│
├── public/                           # Static assets
│   ├── (SVGs & Images)
│   │   ├── 0.svg - 7.svg            # Product showcase images
│   │   ├── logo.svg                 # Logo SVG
│   │   ├── upcoming.svg, cancelled.svg, processing.svg
│   │   └── ...
│   ├── chat-instructions.txt        # AI chat instructions
│   └── system-prompt.txt            # System prompt for AI
│
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── next.config.ts                    # Next.js config
├── drizzle.config.ts                 # Drizzle ORM config
├── tailwind.config.js                # Tailwind CSS config
├── postcss.config.mjs                # PostCSS config
├── eslint.config.mjs                 # ESLint config
└── netlify.toml                      # Netlify deployment config
```

---

## 🔄 Data Flow

### **Authentication Flow**
```
User → Google/GitHub OAuth → Better Auth → Session Created → Redirect to Dashboard
```

### **Meeting Creation Flow**
```
Create Meeting Form → tRPC Call → Database Insert → Stream.io Room Creation → Notify Participants
```

### **Real-time Communication Flow**
```
User Input → React Query → tRPC Server → Stream.io SDK → Real-time Update → Client Sync
```

### **Background Job Flow**
```
Event Triggered → Inngest Queue → Process Async Task → Database Update → Webhook Response
```

---

## 🚀 Key Technologies by Purpose

### **Type Safety (End-to-End)**
- TypeScript (5.x)
- Zod (runtime validation)
- tRPC (type-safe API)
- Drizzle ORM (type-safe queries)

### **Real-time Features**
- Stream Video SDK (video calls)
- Stream Chat (messaging)
- Stream OpenAI Realtime (voice AI)
- WebSockets (live syncing)

### **Scalability**
- Neon Serverless PostgreSQL
- Next.js optimization
- Drizzle ORM efficiency
- Inngest async processing

### **User Experience**
- Tailwind CSS (responsive design)
- Framer Motion (animations)
- Shadcn/Radix UI (accessible components)
- React Query (smart caching)

### **AI & Automation**
- OpenAI API (transcription, summarization)
- Groq API (fast inference)
- Stream OpenAI Realtime (voice interaction)
- Custom AI agents

---

## 🔑 Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://user:password@neon.tech/neexmeet

# Authentication
BETTER_AUTH_SECRET=your_secret_key
NEXT_PUBLIC_BETTER_AUTH_URL=https://neexmeet.com

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Stream Services
NEXT_PUBLIC_STREAM_VIDEO_API_KEY=your_stream_video_key
STREAM_VIDEO_SECRET_KEY=your_stream_video_secret
NEXT_PUBLIC_STREAM_CHAT_API_KEY=your_stream_chat_key
STREAM_CHAT_SECRET_KEY=your_stream_chat_secret

# AI Services
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key

# Payments
POLAR_ACCESS_TOKEN=your_polar_token

# URLs
NEXT_PUBLIC_APP_URL=https://neexmeet.com
```

---

## 📊 Performance Metrics

- **Framework**: Next.js 15 (latest)
- **Database**: Serverless PostgreSQL (Neon)
- **Caching**: React Query with automatic invalidation
- **Bundle**: Optimized with Next.js code splitting
- **Video**: Ultra-low latency with Stream.io CDN
- **Deployment**: Netlify with edge functions

---

## 🔐 Security Features

- OAuth 2.0 with Google & GitHub
- Session-based authentication (Better Auth)
- Type-safe API routes (tRPC)
- CORS protection
- Environment variable encryption
- Role-based access control (rooms/meetings)
- Secure database connection (Neon serverless)

---

## 📈 Scalability Architecture

1. **Horizontal Scaling**: Serverless functions (Netlify)
2. **Database Scaling**: Neon auto-scaling PostgreSQL
3. **Real-time**: Stream.io handles concurrent users
4. **Async Jobs**: Inngest manages heavy processing
5. **Static Assets**: CDN delivery via Netlify
6. **Caching**: React Query + Next.js ISR

---

## 🎯 Key Innovations

1. **Type-Safe RPC** - tRPC ensures no API contract mismatches
2. **AI-First Architecture** - Built-in AI agent support
3. **Modular Design** - Feature-based folder structure
4. **Serverless First** - Neon + Netlify for easy scaling
5. **Real-time Collaboration** - Stream.io + WebSockets
6. **Event-Driven** - Inngest for background processing

---

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive components from Shadcn/Radix
- Touch-friendly interactions
- Optimized for mobile video calls
- Native mobile-like experience on web

---

**This is a production-ready, enterprise-grade full-stack application built with the latest technologies and best practices!** 🚀
