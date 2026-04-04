# NeexMeetAI — AI-Powered Team Execution System

NeexMeetAI is a production-ready, AI-driven collaboration platform that combines real-time video conferencing, task execution, and automated intelligence. It provides a structured environment where every action is tracked, every decision is recorded, and every meeting results in actionable outcomes.

## 🚀 Key Modules
- **Rooms**: Persistent team spaces for long-term collaboration.
- **Meetings**: High-performance discussion layer with AI live assistant.
- **Workspace**: Consolidated view of tasks, docs, and team decisions.
- **Pulse**: Real-time communication and activity feed.
- **Presence**: Integrated attendance and team verification.

## 🛠️ Technology Stack
- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **API**: [tRPC](https://trpc.io) (End-to-end type safety)
- **Database**: [PostgreSQL](https://neon.tech) + [Drizzle ORM](https://orm.drizzle.team)
- **Real-time**: [Stream.io](https://getstream.io) (Video, Chat, AI Realtime)
- **Auth**: [Better Auth](https://better-auth.com)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) + [Shadcn UI](https://ui.shadcn.com)
- **Workflows**: [Inngest](https://inngest.com)

## 🏁 Getting Started

### 1. Environment Setup
Create your local environment file:
```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL`: Connection string for Neon PostgreSQL.
- `BETTER_AUTH_SECRET`: Secret key for authentication.
- `NEXT_PUBLIC_APP_URL`: Base URL of your application.

Integration variables (Stream, Polar, AI Providers):
- `NEXT_PUBLIC_STREAM_VIDEO_API_KEY`, `STREAM_VIDEO_SECRET_KEY`
- `NEXT_PUBLIC_STREAM_CHAT_API_KEY`, `STREAM_CHAT_SECRET_KEY`
- `GROQ_API_KEY`, `OPENAI_API_KEY` (for AI processing)

### 2. Install & Run
```bash
npm install
npm run dev
```

### 3. Database Push
```bash
npx drizzle-kit push
```

## 🏗️ Architecture
The project follows a modular structure located in `src/modules/`, ensuring high maintainability and clean separation of concerns between business logic, server procedures, and UI components.

---
Built with 🖤 by NeexMeet Team.
