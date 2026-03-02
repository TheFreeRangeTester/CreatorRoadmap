# Fanlist

## Overview
Fanlist is a web application designed to empower content creators by enabling them to gather ideas, suggestions, and votes directly from their audience. It features a community-driven leaderboard system where content ideas are ranked by audience votes, allowing creators to identify and prioritize the most desired content. The platform aims to streamline content planning, increase audience engagement, and foster a strong creator-community relationship.

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
- **Idea Management**: CRUD operations, community suggestion system with approval workflow, dynamic leaderboards, vote tracking, and anti-spam measures. Includes "Complete" and "Delete" actions for ideas, allowing creators to archive finished ideas separately from permanent deletion, with an 'active'/'completed' filter toggle in the dashboard.
- **Video Planning Templates**: Creators can create planning templates for each idea with points to cover and visuals needed. Features include completion tracking with checkboxes, collapsible sections, markdown export, and template persistence per idea. Enhanced structure with fields for video title, thumbnail notes, and sections like HOOK, TEASER, VALOR PARA AUDIENCIA, PUNTOS A CUBRIR, VISUALES NECESARIOS, BONUS / EXTRA, and OUTRO / CTA.
- **Subscription Management**: Freemium model, Stripe integration, premium feature access control.
- **User Authentication**: Session-based auth, role-based access (creator/audience), password reset.
- **Points System**: Users earn points by voting, spend points on suggestions, and receive rewards for approved suggestions. Real-time UI updates for point transactions.
- **Points Store**: Creators can manage and users can redeem items from a points store.
- **Public Profile**: Redesigned with a modern card-based layout, personalized greeting, 'Top3Cards' component for top ideas, and a clean list view for other ideas.
- **Test Mode**: Per-request test mode for published app using dual DB pools, AsyncLocalStorage for context switching, and a proxy-based storage system for transparent routing to test or production instances.

### System Design Choices
- **Development Environment**: Vite for fast development, npm as package manager, Replit for deployment.
- **Testing**: Custom TypeScript testing framework covering schema validation, storage operations, service classes, premium business logic, and middleware.
- **Deployment**: Replit with autoscale deployment target; ESBuild for backend bundling, static assets served by Express.
- **Database Isolation**: PostgreSQL schema `testing` for test mode, isolated from production `public` schema. `niche_stats` table for persistent top niche statistics.

## External Dependencies

- **Database**: Neon PostgreSQL (production data storage).
- **Payment Gateway**: Stripe (subscription billing, payments).
- **Email Service**: Resend (transactional email delivery).
- **Authentication Library**: Passport.js (session management).
- **Frontend UI/Styling**: Radix UI, TailwindCSS, Framer Motion, GSAP, Canvas Confetti.
- **Development Tools**: TypeScript, ESBuild, Drizzle Kit (migrations).