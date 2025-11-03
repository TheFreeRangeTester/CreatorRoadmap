# Fanlist

## Overview
Fanlist is a web application designed to empower content creators by enabling them to gather ideas, suggestions, and votes directly from their audience. It features a community-driven leaderboard system where content ideas are ranked by audience votes, allowing creators to identify and prioritize the most desired content. The platform aims to streamline content planning, increase audience engagement, and foster a strong creator-community relationship.

## Recent Changes

### November 3, 2025 - UI Consistency and Border Radius Updates
- **Top Niches Display**: Changed "Top Niche" to "Top Niches" (plural) with top 2 niches shown in dashboard.
- **Multi-Niche Display**: Dashboard shows both top niches in mobile carousel and desktop grid layouts.
- **Translations**: Updated English and Spanish to reflect plural form ("Top Niches" / "Nichos Principales").
- **Border Radius Consistency**: Standardized all UI elements to use rounded-md (6px):
  - Updated modals from rounded-sm to rounded-md
  - Updated profile pages (profile-page.tsx, dashboard-settings-page.tsx, modern-public-profile.tsx) from rounded-xl/lg to rounded-md
  - Buttons already use rounded-md by default
- **Modal Overflow**: Added max-h-[90vh] overflow-y-auto to all major modals for proper scrolling.
- **Vote Display**: Vote counts already visible in IdeaListView for all ideas in creator dashboard.

### November 2, 2025 - Persistent Top Niche Statistics
- **Database**: Created `niche_stats` table to track historical vote counts by niche and creator.
- **Persistent Tracking**: Top Niche metric now shows all-time statistics instead of only current published ideas.
- **Vote Integration**: All voting endpoints now increment niche statistics automatically.
- **Dashboard Update**: Dashboard stats endpoint uses persistent niche data from `niche_stats` table.
- **Data Migration**: Populated initial niche stats from existing ideas during deployment.
- **Behavior Change**: Deleting ideas no longer affects Top Niche display - historical vote data is preserved.

### November 2, 2025 - Video Planning Templates
- **New Feature**: Added video planning template system for creators to plan content before production.
- **Database**: Created `video_templates` table with JSONB fields storing items with completion status {text, completed}.
- **VideoTemplateModal Component**: Modal UI with collapsible sections for organizing video planning (points to cover, visuals needed).
- **Completion Tracking**: Each point and visual has a checkbox to mark as done. Completed items shown with strikethrough styling.
- **API Routes**: Full CRUD endpoints (`/api/video-templates`) with authentication ensuring only idea owners can manage their templates.
- **UI Integration**: Template button (FileText icon) added to IdeaCard and IdeaListView, visible only to creators.
- **Export Feature**: Markdown export functionality with completed items marked with strikethrough and checkmarks.
- **Styling**: Blue-themed buttons with improved contrast for better visibility.

### October 12, 2025
#### Database Fixes
- Fixed `user_points` table constraint from `UNIQUE(user_id)` to `UNIQUE(user_id, creator_id)` to allow users to accumulate points for multiple creators separately.

#### Authentication & Redirect Fixes
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
- **Video Planning Templates**: Creators can create planning templates for each idea with points to cover and visuals needed. Features include completion tracking with checkboxes, collapsible sections, markdown export, and template persistence per idea.
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