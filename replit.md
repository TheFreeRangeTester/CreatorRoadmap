# Fanlist

## Overview
Fanlist is a web application designed to empower content creators by enabling them to gather ideas, suggestions, and votes directly from their audience. It features a community-driven leaderboard system where content ideas are ranked by audience votes, allowing creators to identify and prioritize the most desired content. The platform aims to streamline content planning, increase audience engagement, and foster a strong creator-community relationship.

## Recent Changes (October 12, 2025)
### Database Fixes
- Fixed `user_points` table constraint from `UNIQUE(user_id)` to `UNIQUE(user_id, creator_id)` to allow users to accumulate points for multiple creators separately.

### Authentication & Redirect Fixes
- **Top3Podium Component**: Added redirect logic for unauthenticated users - now saves current URL to localStorage as `redirectAfterAuth` and redirects to `/auth` when attempting to vote.
- **use-auth.tsx Hook**: Enhanced login/register success handlers to check for `redirectAfterAuth` and redirect users back to the originating page (usually public profile) instead of dashboard.
- **auth-page.tsx**: Fixed race condition where auth-page was interfering with use-auth redirection. Added early return if `redirectAfterAuth` exists, allowing use-auth.tsx to handle the redirect without interference.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Framework**: React 18 with TypeScript.
- **Styling**: TailwindCSS with Radix UI components, Google Fonts (Inter, Space Grotesk).
- **Animations**: Framer Motion and GSAP for smooth interactions, Canvas Confetti for celebrations.
- **Design Principles**: Modern glassmorphism effects, vibrant purple primary color, increased border radius, enhanced shadows, and hover animations.
- **Components**: Utilizes ModernIcon and IconBadge for consistent iconography.
- **Internationalization**: i18next for multi-language support (English/Spanish).

### Technical Implementations
- **Frontend State Management**: React Query for server state, React Context for client state.
- **Routing**: Wouter for lightweight client-side routing.
- **Backend Runtime**: Node.js with Express.js (TypeScript).
- **Database**: PostgreSQL (Neon Database) with Drizzle ORM.
- **Authentication**: Passport.js (local strategy, session-based, role-based access control), Node.js crypto for password hashing.
- **Payment Processing**: Stripe integration for subscription management (freemium model with trial periods).
- **Email Service**: Resend for transactional emails.
- **Monorepo Structure**: Shared TypeScript types between client and server for full-stack type safety.

### Feature Specifications
- **Idea Management**: CRUD operations, community suggestion system with approval workflow, dynamic leaderboards, vote tracking, and anti-spam measures.
- **Subscription Management**: Freemium model, Stripe integration, premium feature access control.
- **User Authentication**: Session-based auth, role-based access (creator/audience), password reset.
- **Points System**: Users earn points by voting, spend points on suggestions, and receive rewards for approved suggestions. Real-time UI updates for point transactions.
- **Points Store**: Creators can manage and users can redeem items from a points store.

### System Design Choices
- **Development Environment**: Vite for fast development, npm as package manager, Replit for deployment.
- **Testing**: Custom TypeScript testing framework covering schema validation, storage operations, service classes, premium business logic, and middleware.
- **Deployment**: Replit with autoscale deployment target; ESBuild for backend bundling, static assets served by Express.

## External Dependencies

- **Database**: Neon PostgreSQL (production data storage).
- **Payment Gateway**: Stripe (subscription billing, payments).
- **Email Service**: Resend (transactional email delivery).
- **Authentication Library**: Passport.js (session management).
- **Frontend UI/Styling**: Radix UI, TailwindCSS, Framer Motion, GSAP, Canvas Confetti.
- **Development Tools**: TypeScript, ESBuild, Drizzle Kit (migrations).