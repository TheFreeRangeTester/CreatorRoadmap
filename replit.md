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
- July 1, 2025. Comprehensive unit testing implementation with 90% coverage target using Jest and TypeScript best practices
- July 2, 2025. Successfully implemented and executed complete testing suite with 100% test success rate using custom framework
- July 6, 2025. Updated premium features across all interfaces: removed "unlimited votes" and replaced with "unlimited ideas", "creator analytics", and "points store" (future functionality)
- July 14, 2025. Completed comprehensive points system implementation: integrated points display in "Mi Actividad" section, implemented points deduction for suggestions (3 points cost), removed redundant sidebar points section, and ensured proper cache invalidation for real-time UI updates
- July 14, 2025. Implemented complete points store system: added store management tabs in creator dashboard, created public store view accessible from profile pages, fixed apiRequest function signature across all components, and replaced share button with points store button in public profiles
- July 27, 2025. Fixed critical voting system bug: Users now properly receive 1 point for each vote across all voting routes (main ideas, creator profiles, and public leaderboards). Previously, public leaderboard votes weren't awarding points. Statistics for "Ideas Votadas" are automatically tracked from the votes table.
- July 27, 2025. Complete voting and suggestion system implementation: Fixed all apiRequest calls to use correct format ({ method: "POST" }), corrected suggestion schema validation to make description optional, implemented real-time UI updates without page reloads, and added comprehensive logging for debugging. System now fully functional: users earn points by voting (1 point per vote), can spend points on suggestions (3 points cost), receive rewards for approved suggestions (2 points), and all statistics update instantly.

## Testing Infrastructure

### Test Suite Implementation - ✅ COMPLETED
- **Framework**: Custom TypeScript testing framework (due to ES modules compatibility)
- **Status**: 100% tests passing (38/38 tests successful)
- **Coverage**: Schema validation, storage operations, business logic
- **Execution**: `npm run test` or `npx tsx test-runner.mjs`

### Test Results Summary
```
Total Tests: 38
✅ Passed: 38  
❌ Failed: 0
📈 Success Rate: 100.00%
```

### Test Coverage Areas - ✅ EXPANDED & IMPLEMENTED
1. **Schema Validation** (10 tests): All Zod schemas validated
   - User schemas: registration, validation, security
   - Idea schemas: creation, validation, constraints
   - Vote schemas: voting logic, data integrity
   - Suggestion schemas: user suggestions, validation

2. **Storage Operations** (4 tests): Core CRUD functionality
   - User management: create, retrieve, update
   - Idea management: create, retrieve, voting system
   - Data persistence: memory storage validation
   - Business logic: voting increments, relationships

3. **Service Classes** (5 tests): Critical service functionality
   - **TokenService**: Token generation and format validation
   - **EmailService**: Configuration handling, URL generation, i18n support

4. **Premium Utils** (16 tests): Subscription business logic
   - **hasActivePremiumAccess**: 7 comprehensive scenarios
   - **getTrialDaysRemaining**: Trial period calculations
   - **isTrialExpired**: Expiration status validation
   - **getPremiumAccessStatus**: Detailed access status reporting

5. **Middleware Classes** (3 tests): Access control logic
   - **Premium Middleware**: Operation identification and user validation
   - **Authentication checks**: Premium access verification

### Testing Framework Features
- **TypeScript Support**: Full type safety in tests
- **Async Testing**: Promise-based test execution
- **Assertion Library**: Complete expect() functionality
- **Detailed Reporting**: Success/failure statistics
- **ES Modules Compatible**: Works with project's module system

### Test Commands
- `npm run test` - Run complete test suite
- `npx tsx test-runner.mjs` - Direct test execution
- Results logged with detailed pass/fail information

### Files Created
- `test-runner.mjs` - Custom testing framework (expanded)
- `test-ide.mjs` - IDE-optimized test runner with coverage and watch mode
- `test-coverage.mjs` - Coverage analysis and HTML report generator
- `TESTING_RESULTS.md` - Original test execution report
- `TESTING_RESULTS_EXPANDED.md` - Expanded test results with 38 tests
- `TESTING_DOCUMENTATION.md` - Comprehensive testing guide
- `npm-test-scripts.md` - IDE integration guide and usage instructions
- `.vscode/tasks.json` - VS Code task configurations
- `.vscode/launch.json` - VS Code debugging configurations
- `coverage-report.html` - Generated HTML coverage report

## User Preferences

Preferred communication style: Simple, everyday language.