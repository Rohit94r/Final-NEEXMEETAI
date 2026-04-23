# 🏠 NeexMeet - Complete Project Structure Guide

> **A beginner-friendly guide to understanding the NeexMeet codebase**

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Root Folder Structure](#2-root-folder-structure)
3. [The App Router - How Pages Work](#3-the-app-router---how-pages-work)
4. [Modules - Feature-Based Architecture](#4-modules---feature-based-architecture)
5. [Components - Reusable UI Building Blocks](#5-components---reusable-ui-building-blocks)
6. [The tRPC Layer - Connecting Frontend to Backend](#6-the-trpc-layer---connecting-frontend-to-backend)
7. [Database Schema - How Data is Stored](#7-database-schema---how-data-is-stored)
8. [Custom Hooks - Reusable Logic](#8-custom-hooks---reusable-logic)
9. [Inngest - Background Jobs](#9-inngest---background-jobs)
10. [Libraries - Utility Functions](#10-libraries---utility-functions)
11. [Data Flow - How Everything Connects](#11-data-flow---how-everything-connects)
12. [Authentication Flow](#12-authentication-flow)
13. [Meeting Creation Flow](#13-meeting-creation-flow)
14. [How to Run the Project](#14-how-to-run-the-project)
15. [How to Add a New Feature](#15-how-to-add-a-new-feature)
16. [Key Patterns and Best Practices](#16-key-patterns-and-best-practices)

---

## 1. PROJECT OVERVIEW

### What is NeexMeet?

**NeexMeet** is an AI-powered team execution and collaboration platform built with Next.js. It helps teams:

- 📹 **Conduct meetings** with AI assistants that join calls and take notes
- 🏢 **Organize into Rooms** - virtual spaces where teams collaborate
- ✅ **Track tasks** - create, assign, and complete action items
- 💡 **Capture decisions** - record important decisions made during meetings
- 📢 **Real-time communication** via Pulse (built-in messaging system)
- 👤 **Track presence** - monitor team attendance and activity

### The Problem It Solves

Traditional team tools are scattered:
- Slack for chat, Zoom for meetings, Notion for docs, Asana for tasks...

**NeexMeet brings everything together** with AI assistance at every step.

### Core Technologies

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | Full-stack React framework |
| **TypeScript** | Type-safe code |
| **tRPC** | Type-safe API calls |
| **Drizzle ORM** | Database operations |
| **PostgreSQL** | Database storage |
| **Stream Video** | Video calling infrastructure |
| **Better Auth** | Authentication system |
| **Inngest** | Background job processing |
| **Tailwind CSS** | Styling with shadcn/ui components |

---

## 2. ROOT FOLDER STRUCTURE

```
Final-NEEXMEETAI/
├── public/              # Static assets (images, videos, icons)
├── src/                 # Main source code
│   ├── app/            # Next.js App Router (pages)
│   ├── modules/        # Feature-based modules
│   ├── components/    # Shared app-level components grouped by purpose
│   ├── lib/           # Utility functions & external integrations
│   ├── hooks/         # Custom React hooks
│   ├── trpc/          # tRPC API configuration
│   ├── db/            # Database schema & connection
│   ├── inngest/       # Background job functions
│   └── constants.ts   # Global constants
├── .env.example       # Environment variables template
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript configuration
└── drizzle.config.ts  # Drizzle ORM configuration
```

### What Each Folder Does

| Folder | Purpose | When to Use |
|--------|---------|-------------|
| `public/` | Static files served directly (images, videos) | Add images, icons, downloadable files |
| `src/app/` | Page routes and layouts | Create new pages, configure routing |
| `src/modules/` | Feature modules (meetings, rooms, tasks) | Add business logic for features |
| `src/components/` | Shared app-level components | Add shared feedback, navigation, and non-feature-specific components |
| `src/lib/` | Third-party integrations (Stream, Auth, AI) | Connect external services |
| `src/hooks/` | Custom React hooks | Extract reusable component logic |
| `src/trpc/` | API router configuration | Define new API endpoints |
| `src/db/` | Database schema | Define database tables |
| `src/inngest/` | Background tasks | Process data after meetings |

---

## 3. THE APP ROUTER - HOW PAGES WORK

### Route Groups (Folders with Parentheses)

The `src/app/` folder uses **route groups** (folders in parentheses like `(dashboard)`) to organize pages without affecting the URL.

```
src/app/
├── (auth)/              # Auth pages (not in URL)
│   ├── sign-in/
│   │   └── page.tsx    # URL: /sign-in
│   └── sign-up/
│       └── page.tsx    # URL: /sign-up
├── (dashboard)/         # Dashboard pages (not in URL)
│   ├── layout.tsx      # Dashboard layout (sidebar, navbar)
│   ├── meetings/
│   │   └── page.tsx    # URL: /meetings
│   ├── rooms/
│   │   └── page.tsx    # URL: /rooms
│   └── workspace/
│       └── page.tsx    # URL: /workspace
├── (marketing)/         # Marketing pages (not in URL)
│   ├── layout.tsx
│   └── page.tsx        # URL: / (homepage)
└── call/
    └── [meetingId]/
        └── page.tsx    # URL: /call/{meetingId}
```

### Understanding the Route Groups

| Route Group | URL Pattern | Purpose |
|-------------|-------------|---------|
| `(auth)` | `/sign-in`, `/sign-up` | Authentication pages |
| `(dashboard)` | `/dashboard`, `/meetings`, `/rooms` | Main app after login |
| `(marketing)` | `/` | Public landing page |
| `call` | `/call/{id}` | Video call interface |

### Layout Files

**Layout files** wrap pages and provide shared UI:

```tsx
// src/app/(dashboard)/layout.tsx
export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />     {/* Left sidebar */}
      <DashboardNavbar />       {/* Top navigation */}
      {children}               {/* Page content goes here */}
    </SidebarProvider>
  );
}
```

### How a Page is Structured

```tsx
// src/app/(dashboard)/meetings/page.tsx

export const dynamic = "force-dynamic"; // Always fetch fresh data

export default async function Page({ searchParams }) {
  // 1. Check authentication
  const session = await getSessionOrNull(await headers());
  if (!session) redirect("/sign-in");

  // 2. Load search/filter params
  const filters = await loadSearchParams(searchParams);

  // 3. Prefetch data for the page
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.meetings.getMany.queryOptions({ ...filters })
  );

  // 4. Render the page
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MeetingsView />  {/* Client component */}
    </HydrationBoundary>
  );
}
```

### URL Parameters (Query Strings)

The `params.ts` files define URL query parameters:

```tsx
// src/modules/meetings/params.ts
export const filtersSearchParams = {
  search: parseAsString.withDefault(""),      // ?search=hello
  page: parseAsInteger.withDefault(1),         // ?page=2
  status: parseAsStringEnum(["upcoming", ...]), // ?status=active
  agentId: parseAsString.withDefault(""),
};
```

---

## 4. MODULES - FEATURE-BASED ARCHITECTURE

### Why Modules?

Instead of organizing by file type (all components together, all hooks together), **modules** group everything related to one feature:

```
src/modules/
├── meetings/      # Everything about meetings
│   ├── params.ts           # URL parameters
│   ├── schemas.ts          # Validation rules
│   ├── types.ts            # TypeScript types
│   ├── hooks/              # Meeting-specific hooks
│   ├── server/             # API procedures (backend)
│   │   └── procedures.ts   # tRPC router
│   └── ui/                 # UI components (frontend)
│       ├── components/     # Small components
│       └── views/          # Page-level components
├── rooms/         # Everything about rooms
├── workspace/     # Tasks, decisions, documents
├── agents/       # AI agents
├── pulse/        # Messaging/chat
└── presence/     # Attendance tracking
```

### Anatomy of a Module

```
module-name/
├── params.ts           # What URL parameters does this feature use?
├── schemas.ts          # Zod validation schemas
├── types.ts            # TypeScript interfaces
├── hooks/              # Custom hooks for this feature
│   └── use-example.ts
├── server/             # Backend (runs on server)
│   └── procedures.ts   # tRPC router with all endpoints
└── ui/                # Frontend (runs in browser)
    ├── components/     # Reusable UI pieces
    │   ├── ComponentA.tsx
    │   └── ComponentB.tsx
    └── views/         # Complete page views
        └── feature-view.tsx
```

### The Meetings Module (Example)

Let's trace through the meetings feature:

**1. Schema (Validation)**
```tsx
// src/modules/meetings/schemas.ts
export const meetingsInsertSchema = z.object({
  name: z.string().min(1),        // Name is required
  agentId: z.string().min(1),     // Must select an AI agent
  roomId: z.string().optional(),  // Optional room association
  scheduledAt: z.string().optional(),
  topic: z.string().optional(),
});
```

**2. Server Procedures (API)**
```tsx
// src/modules/meetings/server/procedures.ts
export const meetingsRouter = createTRPCRouter({
  // Query: Get all meetings
  getMany: protectedProcedure
    .input(z.object({ page: z.number(), search: z.string() }))
    .query(async ({ ctx, input }) => {
      // Fetch from database
    }),

  // Mutation: Create a meeting
  create: protectedProcedure
    .input(meetingsInsertSchema)
    .mutation(async ({ ctx, input }) => {
      // Insert into database
    }),
});
```

**3. UI View (Frontend)**
```tsx
// src/modules/meetings/ui/views/meetings-view.tsx
"use client";

export const MeetingsView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({ page: 1 })
  );

  return <DataTable data={data.items} columns={columns} />;
};
```

### Other Modules

| Module | What It Does | Key Tables |
|--------|--------------|------------|
| `rooms` | Team workspaces | `rooms`, `roomMembers` |
| `workspace` | Tasks, decisions, docs | `tasks`, `decisions`, `documents` |
| `agents` | AI meeting assistants | `agents` |
| `pulse` | Real-time chat | `channels`, `messages`, `threads` |
| `presence` | Attendance tracking | `attendance`, `attendanceReasons` |
| `call` | Video call UI | Uses Stream Video SDK |
| `dashboard` | Navigation components | - |
| `home` | Landing page components | - |

---

## 5. COMPONENTS - REUSABLE UI BUILDING BLOCKS

### Component Organization

```
src/components/
├── ui/                 # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ... (50+ components)
├── data-table.tsx      # Generic table component
├── empty-state.tsx     # Shown when no data
├── error-state.tsx     # Shown on errors
├── loading-state.tsx   # Shown while loading
└── data-pagination.tsx  # Page navigation
```

### Base UI Components (shadcn/ui)

These are pre-built components from shadcn/ui that you can customize:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Usage
<Button variant="default">Click Me</Button>
<Card><CardHeader>Title</CardHeader><CardContent>Content</CardContent></Card>
```

### Generic Components

| Component | Purpose |
|-----------|---------|
| `DataTable` | Renders data in a sortable table |
| `EmptyState` | "No items found" message |
| `ErrorState` | Error message with retry button |
| `LoadingState` | Loading spinner |
| `DataPagination` | Previous/Next page buttons |

### Module-Specific Components

Each module has its own UI components in `modules/{name}/ui/components/`:

```
src/modules/meetings/ui/components/
├── new-meeting-dialog.tsx    # Create meeting modal
├── meetings-list-header.tsx  # Search & filters
├── columns.tsx               # Table column definitions
└── meeting-form.tsx           # Meeting creation form
```

---

## 6. THE TRPC LAYER - CONNECTING FRONTEND TO BACKEND

### What is tRPC?

tRPC creates **type-safe APIs** without needing to write API routes manually. The frontend knows exactly what the backend expects.

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                                │
│                                                             │
│  const { data } = useSuspenseQuery(                         │
│    trpc.meetings.getMany.queryOptions({ page: 1 })         │
│  );                                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Type-safe call
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND                                 │
│                                                             │
│  // src/trpc/routers/_app.ts                                │
│  export const appRouter = createTRPCRouter({                │
│    meetings: meetingsRouter,                                 │
│    rooms: roomsRouter,                                      │
│    workspace: workspaceRouter,                             │
│    ...                                                      │
│  });                                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
src/trpc/
├── init.ts         # Create base router & procedures
├── client.tsx      # Client-side provider
├── query-client.ts # React Query setup
├── server.tsx      # Server-side helpers
└── routers/
    └── _app.ts     # Main router combining all modules
```

### Creating a New API Endpoint

**1. Define the procedure in your module:**

```tsx
// src/modules/meetings/server/procedures.ts
export const meetingsRouter = createTRPCRouter({
  // Query (GET request)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.select().from(meetings).where(eq(meetings.id, input.id));
    }),

  // Mutation (POST/PUT/DELETE request)
  create: protectedProcedure
    .input(meetingsInsertSchema)
    .mutation(async ({ ctx, input }) => {
      return db.insert(meetings).values({ ...input, userId: ctx.auth.user.id });
    }),
});
```

**2. Register in the main router:**

```tsx
// src/trpc/routers/_app.ts
export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  meetings: meetingsRouter,     // ✅ Added
  rooms: roomsRouter,
  workspace: workspaceRouter,
  pulse: pulseRouter,
  presence: presenceRouter,
});
```

**3. Call from frontend:**

```tsx
// In a client component
const trpc = useTRPC();

// Get data
const { data: meeting } = useSuspenseQuery(
  trpc.meetings.getById.queryOptions({ id: "123" })
);

// Create data
const createMeeting = trpc.meetings.create.useMutation();
await createMeeting.mutateAsync({ name: "Team Sync", agentId: "ai-1" });
```

### Protected vs Base Procedures

```tsx
// src/trpc/init.ts

// Base procedure - no auth required
export const baseProcedure = t.procedure;

// Protected procedure - requires login
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await getSessionOrNull(await headers());
  
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  
  return next({ ctx: { ...ctx, auth: session } });
});
```

---

## 7. DATABASE SCHEMA - HOW DATA IS STORED

### ORM: Drizzle

The project uses **Drizzle ORM** to interact with PostgreSQL in a type-safe way.

### Schema Location

```
src/db/
├── index.ts    # Database connection
└── schema.ts   # All table definitions
```

### Main Tables

```tsx
// src/db/schema.ts

// ─── Users & Auth ─────────────────────────────────────────────────────
export const user = pgTable("user", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  image: text('image'),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()),
});

export const session = pgTable("session", { /* ... */ });
export const account = pgTable("account", { /* OAuth accounts */ });
export const verification = pgTable("verification", { /* Email verification */ });

// ─── AI Agents ───────────────────────────────────────────────────────
export const agents = pgTable("agents", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  instructions: text("instructions").notNull(), // What the AI should do
  userId: text("user_id").references(() => user.id),
});

// ─── Rooms (Team Workspaces) ─────────────────────────────────────────
export const rooms = pgTable("rooms", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  description: text("description"),
  inviteCode: text("invite_code").$defaultFn(() => nanoid(8)),
  ownerId: text("owner_id").references(() => user.id),
  defaultAgentId: text("default_agent_id").references(() => agents.id),
});

export const roomMembers = pgTable("room_members", {
  roomId: text("room_id").references(() => rooms.id),
  userId: text("user_id").references(() => user.id),
  role: roomMemberRole("admin" | "member"),
});

// ─── Meetings ────────────────────────────────────────────────────────
export const meetings = pgTable("meetings", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  secretCode: text("secret_code").notNull(), // 4-digit join code
  status: meetingStatus("upcoming" | "active" | "completed" | "processing"),
  agentId: text("agent_id").references(() => agents.id),
  roomId: text("room_id").references(() => rooms.id),
  summary: text("summary"), // AI-generated summary
  startedAt: timestamp(),
  endedAt: timestamp(),
});

export const meetingMembers = pgTable("meeting_members", {
  meetingId: text("meeting_id").references(() => meetings.id),
  userId: text("user_id").references(() => user.id),
  status: meetingMemberStatus("pending" | "approved"),
});

// ─── Workspace Items ─────────────────────────────────────────────────
export const tasks = pgTable("tasks", {
  title: text("title").notNull(),
  status: taskStatus("todo" | "in_progress" | "done"),
  priority: taskPriority("low" | "medium" | "high"),
  meetingId: text("meeting_id").references(() => meetings.id),
  roomId: text("room_id").references(() => rooms.id),
});

export const decisions = pgTable("decisions", { /* Key decisions */ });
export const documents = pgTable("documents", { /* Shared docs */ });

// ─── Pulse (Chat) ────────────────────────────────────────────────────
export const channels = pgTable("channels", {
  name: text("name").notNull(), // "#general", "#meetings"
  roomId: text("room_id").references(() => rooms.id),
});

export const messages = pgTable("messages", {
  content: text("content").notNull(),
  channelId: text("channel_id").references(() => channels.id),
  userId: text("user_id").references(() => user.id),
});

export const threads = pgTable("threads", {
  parentMessageId: text("parent_message_id").references(() => messages.id),
  content: text("content").notNull(),
});

// ─── Presence (Attendance) ─────────────────────────────────────────
export const attendance = pgTable("attendance", {
  userId: text("user_id").references(() => user.id),
  roomId: text("room_id").references(() => rooms.id),
  date: text("date"), // "2026-04-09"
  status: attendanceStatus("present" | "absent" | "late"),
});
```

### Relationships Diagram

```
User ──┬── owns ──→ Rooms
       ├── member of ──→ RoomMembers ──→ Rooms
       ├── creates ──→ Meetings
       ├── joins ──→ MeetingMembers ──→ Meetings
       └── tracks ──→ Attendance

Room ──┬── contains ──→ Meetings
       ├── has ──→ Channels ──→ Messages
       ├── owns ──→ Tasks
       └── owns ──→ Decisions

Meeting ──┬── has ──→ Tasks (action items)
          ├── has ──→ Decisions (recorded)
          ├── has ──→ Agent (AI assistant)
          └── generates ──→ Summary (AI transcription)
```

---

## 8. CUSTOM HOOKS - REUSABLE LOGIC

### What Are Hooks?

React hooks let you extract and reuse stateful logic. Custom hooks are just functions that start with "use".

### Hooks Location

```
src/hooks/
├── use-confirm.tsx       # Confirmation dialog hook
├── use-mobile.ts         # Detect mobile devices
└── use-meeting-share.ts  # Share meeting link logic

src/modules/meetings/hooks/
└── use-meetings-filters.ts  # Filter state management
```

### Example: useMeetingsFilters

```tsx
// src/modules/meetings/hooks/use-meetings-filters.ts
export function useMeetingsFilters() {
  const [filters, setFilters] = useSearchParams();

  const updateFilters = useCallback((updates: Partial<Filters>) => {
    setFilters(updates);
  }, [setFilters]);

  return [filters, updateFilters] as const;
}
```

### Example: useMobile

```tsx
// src/hooks/use-mobile.ts
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}
```

---

## 9. INNGEST - BACKGROUND JOBS

### Why Background Jobs?

Some tasks take too long to do during a user request:
- Generating meeting summaries from transcripts
- Processing video recordings
- Sending batch emails

**Inngest** handles these in the background.

### How It Works

```
User finishes meeting
        │
        ▼
API marks meeting as "processing"
        │
        ▼
Trigger Inngest event
        │
        ▼
┌─────────────────────────────────────┐
│         INNGEST HANDLER              │
│                                      │
│  1. Fetch transcript                │
│  2. Parse transcript data           │
│  3. Generate summary with AI         │
│  4. Save summary to database         │
│  5. Mark meeting as "completed"     │
└─────────────────────────────────────┘
```

### The Meetings Processing Function

```tsx
// src/inngest/functions.ts
export const meetingsProcessing = inngest.createFunction(
  { id: "meetings/processing" },
  { event: "meetings/processing" },
  async ({ event, step }) => {
    // Step 1: Fetch transcript
    const response = await step.run("fetch-transcript", async () => {
      return fetch(event.data.transcriptUrl).then(res => res.text());
    });

    // Step 2: Parse transcript
    const transcript = await step.run("parse-transcript", async () => {
      return JSONL.parse(response);
    });

    // Step 3: Generate summary with AI
    const summary = await step.run("summarize-transcript", async () => {
      const gptResponse = await openai.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: "Summarize: " + transcript }],
      });
      return gptResponse.choices[0].message.content;
    });

    // Step 4: Save to database
    await step.run("save-summary", async () => {
      await db.update(meetings)
        .set({ summary, status: "completed" })
        .where(eq(meetings.id, event.data.meetingId));
    });
  }
);
```

---

## 10. LIBRARIES - UTILITY FUNCTIONS

### Lib Files

```
src/lib/
├── auth.ts           # Better Auth configuration
├── auth-client.ts    # Client-side auth helpers
├── env.ts            # Environment variable access
├── stream-video.ts   # Stream Video SDK setup
├── stream-chat.ts    # Stream Chat SDK setup
├── avatar.tsx        # Generate user avatars
├── utils.ts          # General utilities (cn function)
└── polar.ts          # Payment/subscription (Polar SDK)
```

### Key Libraries

#### Better Auth (Authentication)

```tsx
// src/lib/auth.ts
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    github: { clientId: "...", clientSecret: "..." },
    google: { clientId: "...", clientSecret: "..." },
  },
});
```

#### Stream Video (Video Calls)

```tsx
// src/lib/stream-video.ts
export const streamVideo = new Proxy({} as StreamClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getStreamVideo(), prop, receiver);
  },
});

// Usage
await streamVideo.video.call("default", meetingId).getOrCreate({ ... });
```

#### Avatar Generation

```tsx
// Generate unique avatars for users
generateAvatarUri({ seed: userName, variant: "initials" });
generateAvatarUri({ seed: agentName, variant: "botttsNeutral" });
```

---

## 11. DATA FLOW - HOW EVERYTHING CONNECTS

### Complete Request Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER ACTION                                      │
│                    "Create a new meeting"                                │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                         │
│                                                                          │
│  1. User fills form in <MeetingForm />                                   │
│  2. Form validated with Zod schema                                       │
│  3. tRPC mutation called:                                                 │
│                                                                          │
│     trpc.meetings.create.mutate({                                        │
│       name: "Team Sync",                                                 │
│       agentId: "agent-123",                                              │
│     })                                                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP Request to /api/trpc/meetings.create
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (tRPC)                                   │
│                                                                          │
│  4. Protected procedure checks auth                                      │
│  5. Zod schema validates input                                           │
│  6. Business logic runs:                                                 │
│     - Generate 4-digit meeting code                                      │
│     - Create Stream Video call                                           │
│     - Upsert agent in Stream                                             │
│  7. Database operation:                                                  │
│                                                                          │
│     await db.insert(meetings).values({                                  │
│       name: input.name,                                                  │
│       secretCode,                                                         │
│       userId: ctx.auth.user.id,                                          │
│       ...                                                                │
│     })                                                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE                                         │
│                                                                          │
│  PostgreSQL: INSERT INTO meetings (...) VALUES (...)                    │
│  Returns: { id: "meet_abc", secretCode: "1234", ... }                   │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         RESPONSE                                         │
│                                                                          │
│  { success: true, meeting: { id: "meet_abc", ... } }                    │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND UPDATE                                  │
│                                                                          │
│  8. React Query cache updated                                            │
│  9. UI re-renders with new meeting                                       │
│  10. User redirected to /meetings                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Meeting Lifecycle Flow

```
┌──────────┐     User clicks      ┌──────────┐     Timer ends      ┌──────────┐
│ UPCOMING │ ─── "Start Now" ────→ │  ACTIVE  │ ─── or ends ──────→ │PROCESSING│
└──────────┘                       └──────────┘                      └──────────┘
                                                                    │
                                     Inngest Background Job         │
                                     generates summary              │
                                                                    ▼
                                                            ┌──────────┐
                                                            │COMPLETED │
                                                            └──────────┘
```

---

## 12. AUTHENTICATION FLOW

### How Login Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SIGN UP / SIGN IN                                │
│                                                                          │
│  User submits email/password or clicks "Sign in with Google"            │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BETTER AUTH                                      │
│                                                                          │
│  1. Creates user in database                                            │
│  2. Creates session with secure token                                   │
│  3. Sets HTTP-only cookie                                               │
│  4. Returns session to client                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         PROTECTED ROUTES                                 │
│                                                                          │
│  Every request includes the session cookie                              │
│  Better Auth validates cookie and attaches user to request context       │
│                                                                          │
│  Dashboard pages check:                                                 │
│    const session = await getSessionOrNull(await headers());             │
│    if (!session) redirect("/sign-in");                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Protected vs Public Routes

```tsx
// src/app/(dashboard)/meetings/page.tsx
export default async function Page() {
  const session = await getSessionOrNull(await headers());
  
  if (!session) {
    redirect("/sign-in");  // Must be logged in
  }
  
  return <MeetingsView />;
}
```

---

## 13. MEETING CREATION FLOW

### Step-by-Step

```
1. USER ACTIONS
   │
   ├─→ Navigates to /meetings
   ├─→ Clicks "New Meeting"
   ├─→ Fills form:
   │    - Meeting name
   │    - Select AI agent
   │    - Schedule time (optional)
   │    - Select room (optional)
   └─→ Clicks "Create"

2. FRONTEND VALIDATION
   │
   └─→ Zod schema validates all fields

3. API CALL
   │
   └─→ trpc.meetings.create.mutate()

4. SERVER PROCESSING
   │
   ├─→ Generate unique 4-digit code
   ├─→ Create database record
   ├─→ Create Stream Video call
   ├─→ Register agent in Stream
   └─→ If room specified:
        - Send Pulse notification
        - Optionally send email to room members

5. RESPONSE
   │
   └─→ { id: "meet_abc", secretCode: "1234", ... }

6. UI UPDATE
   │
   ├─→ React Query cache updated
   ├─→ User sees new meeting in list
   └─→ User can now start or share the meeting
```

---

## 14. HOW TO RUN THE PROJECT

### Prerequisites

- Node.js 20+ (check with `node -v`)
- PostgreSQL database (Neon, Supabase, or local)
- pnpm package manager (`npm install -g pnpm`)

### Setup Steps

```bash
# 1. Clone and install
cd Final-NEEXMEETAI
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials:
# - DATABASE_URL (PostgreSQL connection string)
# - BETTER_AUTH_SECRET (generate with: openssl rand -base64 32)
# - STREAM_VIDEO_API_KEY & STREAM_VIDEO_SECRET_KEY
# - OPENAI_API_KEY or GROQ_API_KEY (for AI features)

# 3. Push database schema
pnpm db:push

# 4. Start development server
pnpm dev

# 5. Open http://localhost:3000
```

### Available Scripts

| Command | What It Does |
|---------|--------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Drizzle Studio (database GUI) |

---

## 15. HOW TO ADD A NEW FEATURE

### Example: Add "Favorites" to Meetings

### Step 1: Add Database Field

```tsx
// src/db/schema.ts
// meetings table already has: isStarred: boolean("is_starred").default(false)
// ✅ Already exists!

// If adding a new table:
export const favorites = pgTable("favorites", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id").references(() => user.id),
  meetingId: text("meeting_id").references(() => meetings.id),
});
```

### Step 2: Add tRPC Endpoint

```tsx
// src/modules/meetings/server/procedures.ts
export const meetingsRouter = createTRPCRouter({
  // ... existing code ...

  toggleStar: protectedProcedure
    .input(z.object({ id: z.string(), isStarred: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(meetings)
        .set({ isStarred: input.isStarred })
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .returning();
      
      if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
      return updated;
    }),
});
```

### Step 3: Add UI Component

```tsx
// src/modules/meetings/ui/components/star-button.tsx
"use client";

import { Star } from "lucide-react";
import { trpc } from "@/trpc/client";

export function StarButton({ meetingId, isStarred }: Props) {
  const utils = trpc.useUtils();
  const toggleStar = trpc.meetings.toggleStar.useMutation({
    onSuccess: () => utils.meetings.getMany.invalidate(),
  });

  return (
    <button
      onClick={() => toggleStar.mutate({ id: meetingId, isStarred: !isStarred })}
      className={isStarred ? "text-yellow-500" : "text-gray-400"}
    >
      <Star className={isStarred ? "fill-current" : ""} />
    </button>
  );
}
```

### Step 4: Wire It Up

```tsx
// src/modules/meetings/ui/components/columns.tsx
import { StarButton } from "./star-button";

export const columns = [
  {
    accessorKey: "name",
    header: "Meeting",
  },
  {
    accessorKey: "isStarred",
    header: "",
    cell: ({ row }) => (
      <StarButton
        meetingId={row.original.id}
        isStarred={row.original.isStarred}
      />
    ),
  },
];
```

### Step 5: Test It

```bash
pnpm dev
# Navigate to /meetings
# Click the star icon
# Verify toggle works
```

---

## 16. KEY PATTERNS AND BEST PRACTICES

### 1. Modular Architecture

Each feature is self-contained in its module. All related code lives together.

```
GOOD:
src/modules/meetings/
├── server/procedures.ts    # API logic
├── ui/components/         # UI components
└── hooks/                  # Feature hooks

AVOID:
src/
├── server/meetings.ts      # API scattered
├── components/meetings/    # Components scattered
└── hooks/meetings.ts       # Hooks scattered
```

### 2. Type-Safe APIs with tRPC

Always use tRPC for API calls. Never fetch with plain fetch() unless necessary.

```tsx
// GOOD - Type-safe
const { data } = useSuspenseQuery(trpc.meetings.getById.queryOptions({ id }));

// AVOID - No type safety
const { data } = useQuery(["meeting", id], () => fetch(`/api/meeting/${id}`));
```

### 3. Protected Procedures for Auth

Every API that needs a logged-in user should use `protectedProcedure`.

```tsx
// Every endpoint that modifies data
export const meetingsRouter = createTRPCRouter({
  create: protectedProcedure    // ✅ Checks auth
    .input(...)
    .mutation(...),
  
  getPublicData: baseProcedure  // If data is public
    .query(...),
});
```

### 4. Zod Validation

Always validate input with Zod schemas.

```tsx
// GOOD
.input(z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
}))

// AVOID
.input(z.object({ name: z.any() }))
```

### 5. Server vs Client Components

Use server components by default. Only add "use client" when needed.

```tsx
// Server Component (default) - runs on server
// Can: access DB directly, use async, render children
export default async function Page() {
  const data = await db.select().from(meetings);
  return <MeetingsView data={data} />;
}

// Client Component ("use client") - runs in browser
// Can: use hooks, handle events, useState
"use client";
export function MeetingsView() {
  const [filter, setFilter] = useState("all");
  return <DataTable />;
}
```

### 6. Error Handling

Always handle errors in mutations.

```tsx
const createMeeting = trpc.meetings.create.useMutation({
  onSuccess: () => {
    toast.success("Meeting created!");
    queryClient.invalidateQueries(["meetings"]);
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

### 7. Environment Variables

Never hardcode secrets. Use environment variables.

```tsx
// GOOD
apiKey: getRequiredServerEnv("GROQ_API_KEY")

// BAD
apiKey: "sk-1234567890..."
```

### 8. Database Indexes

Add indexes for frequently queried columns.

```tsx
export const meetings = pgTable("meetings", {
  // ...
}, (table) => ({
  // Index for secret code lookups
  meetingSecretCodeIdx: uniqueIndex("meetings_secret_code_idx").on(table.secretCode),
}));
```

---

## 📚 QUICK REFERENCE

### File Locations

| Need to... | Go to... |
|------------|----------|
| Add a new page | `src/app/(dashboard)/{feature}/page.tsx` |
| Add API endpoint | `src/modules/{feature}/server/procedures.ts` |
| Add UI component | `src/modules/{feature}/ui/components/` |
| Modify database | `src/db/schema.ts` |
| Add styles | Use Tailwind classes in components |
| Add custom hook | `src/hooks/` or `src/modules/{feature}/hooks/` |

### Common Imports

```tsx
// Database
import { db } from "@/db";
import { meetings, user } from "@/db/schema";

// tRPC
import { trpc, useTRPC } from "@/trpc/client";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

// UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Utilities
import { cn } from "@/lib/utils";
import { toast } from "sonner";
```

### Environment Variables Needed

```
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

# Video Calls
NEXT_PUBLIC_STREAM_VIDEO_API_KEY=...
STREAM_VIDEO_SECRET_KEY=...

# AI
GROQ_API_KEY=...      # Free tier available
# OR
OPENAI_API_KEY=...   # Paid

# Optional
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
RESEND_API_KEY=...   # For email
```

---

## 🎓 LEARNING PATH

### Week 1: Understand the Basics
1. Read this document
2. Run the project locally
3. Explore `src/app/(dashboard)/meetings/page.tsx`
4. Look at `src/modules/meetings/server/procedures.ts`
5. Try creating a meeting

### Week 2: Make Small Changes
1. Add a new column to the meetings table
2. Create a new tRPC endpoint
3. Add a button to the meetings list
4. Style it with Tailwind

### Week 3: Add a Feature
1. Add a "favorite" feature (as shown above)
2. Create a new module for a simple feature
3. Connect frontend to backend with tRPC

### Week 4: Advanced
1. Add background jobs with Inngest
2. Create custom hooks
3. Optimize database queries
4. Add real-time features with Stream

---

## 🆘 COMMON ISSUES

### "Cannot find module '@/..."
Check your `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### "useTRPC must be used within TRPCProvider"
Wrap your app with the provider in `src/app/providers.tsx`.

### Database connection fails
1. Check `DATABASE_URL` is correct
2. Ensure PostgreSQL is running
3. Run `pnpm db:push` to sync schema

### tRPC not working
1. Check `src/app/api/trpc/[trpc]/route.ts` exists
2. Verify `appRouter` is exported from `src/trpc/routers/_app.ts`

---

## 📞 Getting Help

- Check existing code in `src/modules/meetings/` for patterns
- Read the tRPC documentation: https://trpc.io
- Read the Drizzle documentation: https://orm.drizzle.team
- Check shadcn/ui components: https://ui.shadcn.com

---

**Happy Coding! 🚀**
