# Fanlist - replit.md

## Overview

Fanlist is a modern web application designed to help content creators plan and manage their careers by collecting ideas, suggestions, and votes directly from their audience. The platform features a leaderboard system where ideas are ranked by community votes, enabling creators to understand what content their audience wants to see.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with Radix UI components
- **Animations**: Framer Motion and GSAP for smooth interactions
- **State Management**: React Query for server state, React Context for client state
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: i18next for multi-language support (English/Spanish)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon Database) with Drizzle ORM
- **Authentication**: Passport.js with local strategy and session-based auth
- **Payment Processing**: Stripe integration for subscription management
- **Email Service**: Resend for transactional emails

### Development Environment
- **Build Tool**: Vite for fast development and optimized builds
- **Package Manager**: npm
- **Deployment**: Replit with autoscale deployment target

## Key Components

### Database Schema
The application uses PostgreSQL with the following main tables:
- **users**: User profiles with subscription status, social links, and creator/audience roles
- **ideas**: Content ideas with voting system and approval workflow
- **votes**: Tracking user votes to prevent duplicates
- **publicLinks**: Shareable links for public leaderboards
- **passwordResetTokens**: Secure password reset functionality

### Authentication System
- Session-based authentication using Passport.js
- Password hashing with Node.js crypto module
- Role-based access control (creator vs audience)
- Password reset functionality with email tokens

### Subscription Management
- Freemium model with trial periods
- Stripe integration for payment processing
- Premium feature access control
- Testing panel for development environment

### Idea Management
- CRUD operations for content ideas
- Community suggestion system with approval workflow
- Dynamic leaderboards with position tracking
- Vote tracking and anti-spam measures

## Data Flow

### User Registration/Login
1. User submits credentials through form
2. Backend validates and hashes password
3. Session created and stored in PostgreSQL
4. User redirected based on role (creator/audience)

### Idea Voting
1. User clicks vote on an idea
2. Frontend checks for existing vote
3. Backend validates and records vote
4. Leaderboard positions updated
5. Real-time UI updates via React Query

### Subscription Flow
1. User selects subscription plan
2. Stripe checkout session created
3. Payment processed through Stripe
4. Webhook updates user subscription status
5. Premium features unlocked immediately

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL for production data storage
- **Payment**: Stripe for subscription billing and payments
- **Email**: Resend for transactional email delivery
- **Authentication**: Passport.js for session management

### Development Dependencies
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast backend bundling for production
- **Drizzle Kit**: Database migrations and schema management

### UI Libraries
- **Radix UI**: Accessible component primitives
- **TailwindCSS**: Utility-first styling
- **Framer Motion**: Animation library
- **GSAP**: Advanced animations
- **Canvas Confetti**: Success celebrations

## Deployment Strategy

### Development Environment
- Runs on Replit with live reload
- PostgreSQL module for local database
- Environment variables through .env file
- Hot module replacement via Vite

### Production Deployment
- Build process: `npm run build`
- Bundled backend with ESBuild
- Static assets served by Express
- Autoscale deployment on Replit

### Environment Configuration
- Development: `npm run dev` (port 5000)
- Production: `npm run start`
- Database migrations: `npm run db:push`

The application uses a monorepo structure with shared TypeScript types between client and server, ensuring type safety across the full stack. The premium subscription model gates advanced features while providing a robust free tier for user acquisition.

## Changelog
- June 27, 2025. Initial setup
- June 27, 2025. Enhanced public profile UI with improved mobile UX, gamification features, and complete multilingual support

## User Preferences

Preferred communication style: Simple, everyday language.