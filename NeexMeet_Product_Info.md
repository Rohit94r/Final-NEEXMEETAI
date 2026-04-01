# NeexMeet-AI: Comprehensive Product Overview

NeexMeet-AI is a modern, real-time communication platform that seamlessly integrates video conferencing, instant messaging, and advanced Artificial Intelligence capabilities. Built with scalability, performance, and user experience in mind, the platform serves as a next-generation solution for virtual communication and intelligent collaboration.

## Core Features & Functionality

### 1. Robust Video & Audio Conferencing
- **High-Quality Calls**: Reliable, low-latency video and audio meetings.
- **Meeting Management**: Complete control over meeting creation, scheduling, and participant management.
- **Call Dashboard**: A centralized interface to view upcoming, past, and ongoing meetings.

### 2. Intelligent AI Agents Integration
- **Real-Time AI Assistants**: Integration with OpenAI's Realtime API.
- **Conversational Agents**: AI participants that can interact naturally within the context of the platform, enhancing productivity and assisting users during or after meetings.

### 3. Integrated Instant Messaging
- **Real-Time Chat**: Dedicated chat channels running alongside video calls for seamless text-based communication.

### 4. Premium & Monetization
- **Subscription Management**: Built-in capabilities to handle premium user tiers, subscriptions, and billing.

### 5. Secure Authentication
- **User Management**: Secure, modern authentication flows ensuring data privacy and smooth onboarding.

---

## Technical Stack & Architecture

NeexMeet-AI is built on a highly modern, edge-ready TypeScript stack, utilizing the best tools in the React ecosystem for type safety, performance, and developer experience.

### Framework & Language
- **Next.js (v15)**: The core React framework utilizing the App Router for server-side rendering, static site generation, and optimized client-side performance.
- **React 19**: Leveraging the latest features of React.
- **TypeScript**: Strict type-checking across the entire codebase.

### State Management & Data Fetching
- **tRPC**: End-to-end type-safe APIs without the need for manual type generation.
- **TanStack React Query**: Powerful asynchronous state management handling caching, synchronization, and background updates.

### Real-Time Infrastructure (Video/Audio/Chat)
- **Stream Video & Audio (@stream-io/video-react-sdk)**: Powers the ultra-low latency video conferencing infrastructure.
- **Stream Chat (stream-chat-react)**: Handles real-time messaging capabilities.
- **Stream OpenAI Realtime API**: Bridges real-time voice and communication with OpenAI's conversational models.

### Database & ORM
- **PostgreSQL (Neon Serverless)**: A scalable, serverless Postgres database for resilient data handling.
- **Drizzle ORM**: A lightweight, fast, and type-safe Object Relational Mapper for defining schemas and querying the database effortlessly.

### Authentication & Authorization
- **Better Auth**: Handles secure user authentication, session management, and access control.

### Payments & Premium Tiers
- **Polar (@polar-sh/sdk)**: Powers the monetization infrastructure, handling premium features and subscriptions.

### UI / UX & Styling
- **Tailwind CSS (v4)**: Utility-first CSS framework for rapid, responsive UI development.
- **Shadcn UI & Radix UI**: Accessible, customizable, and unstyled UI primitives.
- **Lucide React & React Icons**: Comprehensive SVG icon libraries.
- **Framer Motion Elements / Data Visualization**: Embla Carousel for sliders and Recharts for data visualization in the dashboard.

### Background Jobs & Workflows
- **Inngest**: Manages reliable asynchronous background jobs, webhooks, and complex workflows safely outside the main request loop.

---

## Directory Structure Overview
- `src/app/`: Contains the Next.js App Router definitions, including `(auth)` for authentication pages, `(dashboard)` for core user views, and `api/` for endpoint logic.
- `src/modules/`: Houses domain-specific business logic clearly separated by feature: `agents`, `auth`, `call`, `dashboard`, `home`, `meetings`, and `premium`.
- `src/components/`: Reusable UI components including data tables, forms, empty states, and layout wrappers.
- `src/trpc/`: Configuration and routers for type-safe client-server communication.
- `src/db/`: Database schema definitions and Drizzle ORM configuration.

## Summary
NeexMeet-AI is not just a standard video calling application; it is an *AI-first communication platform*. By combining the real-time reliability of Stream and Neon with the power of Next.js and tRPC, it provides an unparalleled architecture designed to scale while delivering cutting-edge AI features directly into the user's workflow.
