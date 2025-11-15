# 📋 System Specifications - CreatorRoadmap

## 🎯 Executive Summary

- **Project**: CreatorRoadmap - Fanlist Platform
- **Version**: 1.0.0
- **Last Updated**: 2024-12-19
- **Status**: Active Production

## 👥 Users and Roles

### 🎨 For Content Creators

- **Description**: Users who create content and manage ideas for their audience
- **Needs**:
  - Create and manage content ideas
  - Receive votes and suggestions from their audience
  - Analyze engagement metrics
  - Manage points store and rewards
  - Customize public profile
- **Capabilities**:
  - Create up to 10 ideas (free) or unlimited (premium)
  - Approve/reject audience suggestions
  - Configure points store (premium)
  - Access advanced analytics (premium)
  - Share public profile

### 🎨 For Audience Members

- **Description**: Users who vote on ideas and suggest content to creators
- **Needs**:
  - Vote on content ideas
  - Suggest new ideas to creators
  - Earn points through participation
  - Redeem creator rewards
- **Capabilities**:
  - Vote once per idea (earns 1 point)
  - Suggest ideas (costs 3 points, earns 5 if approved)
  - Redeem creator store items
  - View participation statistics

## 🚀 Main Features

### 📝 FEAT-001: Idea Management System

- **Description**: Allows creators to create, edit and delete content ideas with voting system
- **Priority**: High
- **Status**: Completed
- **Acceptance Criteria**:
  - ✅ Creators can create ideas with title (max 100 chars) and description (max 280 chars)
  - ✅ Ideas are displayed ordered by votes in real-time
  - ✅ Creators can edit their own ideas (except if they have >100 votes)
  - ✅ Creators can delete their own ideas
  - ✅ Predefined niches system (unboxing, review, tutorial, vlog, behindTheScenes, qna)
- **Related Components**:
  - **Backend - Orchestration**: `server/routes.ts` — handlers POST/PUT/DELETE `/api/ideas` (creation line ~392, update ~446, deletion ~500)
  - **Backend - Persistence**: `server/database-storage.ts` — methods `createIdea()`, `updateIdea()`, `deleteIdea()`, `getIdeasByCreator()`, `updatePositions()` (lines ~107-133, ~183-220, ~237-257)
  - **Backend - Ordering**: `server/database-storage.ts` — method `updatePositions()` orders ideas by votes descending (lines ~269-290), `client/src/components/ideas-tab-view.tsx` — frontend sorting by votes (line ~358)
  - **Backend - Validation**: `shared/schema.ts` — schemas `insertIdeaSchema`, `updateIdeaSchema`, `ideas` table (lines ~177-191)
  - **Frontend - UI**: `client/src/components/idea-form.tsx` — create/edit form with Zod validation
  - **Frontend - View**: `client/src/components/ideas-tab-view.tsx` — list and management of creator's ideas
- **Use Cases**:
  - **CU-001**: Creator creates new content idea
  - **CU-002**: Creator edits existing idea
  - **CU-003**: Creator deletes unwanted idea

### 📝 FEAT-002: Voting System

- **Description**: Allows audience to vote on content ideas with points system
- **Priority**: High
- **Status**: Completed
- **Acceptance Criteria**:
  - ✅ Users can vote once per idea
  - ✅ Each vote awards 1 point to the voter
  - ✅ Creators cannot vote on their own ideas
  - ✅ Votes update in real-time
  - ✅ System prevents duplicate votes per user
- **Related Components**:
  - **Backend - Orchestration**: `server/routes.ts` — handlers POST `/api/ideas/:id/vote` (lines ~1006-1109), `/api/creators/:username/ideas/:ideaId/vote` (lines ~1112-1235), `/api/public/:token/ideas/:ideaId/vote` — vote endpoints
  - **Backend - Duplicate Prevention**: `server/routes.ts` — check existing vote before creating (line ~1046), prevent duplicate votes (line ~1047-1050)
  - **Backend - Self-Vote Prevention**: `server/routes.ts` — validation to prevent creators voting own ideas (lines ~1037-1043, ~1157-1163)
  - **Backend - Points Award**: `server/routes.ts` — award 1 point per vote via `updateUserPoints()` (lines ~1072, ~1198)
  - **Backend - Persistence**: `server/database-storage.ts` — methods `createVote()` (lines ~234-254), `getVoteByUserOrSession()` (lines ~220-232), `updateUserPoints()` to award +1 point (lines ~556-596)
  - **Backend - Validation**: `shared/schema.ts` — `votes` table (lines ~48-55), `pointTransactions` table (lines ~92-102)
  - **Frontend - UI**: `client/src/components/ideas-tab-view.tsx` — vote mutation and UI updates (lines ~72-119)
  - **Frontend - Profiles**: `client/src/pages/creator-profile-unified.tsx`, `client/src/pages/modern-public-profile.tsx` — vote handlers on public profiles
  - **Frontend - State**: `client/src/hooks/use-reactive-stats.tsx` — reactive statistics updates after voting
- **Use Cases**:
  - **CU-004**: User votes for creator's idea
  - **CU-005**: System awards points for vote
  - **CU-006**: Rankings update automatically

### 📝 FEAT-003: Idea Suggestions System

- **Description**: Allows audience to suggest ideas to specific creators with approval system
- **Priority**: High
- **Status**: Completed (Note: Awards 2 points instead of 5 for approved suggestions)
- **Acceptance Criteria**:
  - ✅ Users can suggest ideas to specific creators
  - ✅ Each suggestion costs 3 points
  - ✅ Suggestions require creator approval
  - ✅ Approved ideas award 5 points to suggester (Note: Currently awards 2 points)
  - ✅ Creators can approve/reject suggestions
- **Related Components**:
  - **Backend - Orchestration**: `server/routes.ts` — handlers POST `/api/creators/:username/suggest` (suggest, lines ~769-854), PATCH `/api/ideas/:id/approve` (approve, lines ~904-978), GET `/api/pending-ideas` (list pending, lines ~857-901)
  - **Backend - Points Deduction**: `server/routes.ts` — check points balance (line ~812), deduct 3 points when suggesting (line ~818)
  - **Backend - Points Award**: `server/routes.ts` — award 2 points to suggester when approving (lines ~958-962)
  - **Backend - Persistence**: `server/database-storage.ts` — methods `suggestIdea()` creates idea with status='pending' (lines ~135-156), `approveIdea()` updates to 'approved' (lines ~158-176), `getPendingIdeas()` (lines ~178-186)
  - **Backend - Points**: `server/database-storage.ts` — `updateUserPoints()` deduct 3 points when suggesting (called from line ~818 in routes), award 2 points when approving (called from line ~961 in routes)
  - **Backend - Validation**: `shared/schema.ts` — schema `suggestIdeaSchema` with creatorId (lines ~184-188), `ideas` table with `suggestedBy` field (line ~44)
  - **Frontend - UI Suggestions**: `client/src/components/suggest-idea-modal.tsx`, `client/src/components/suggest-idea-dialog.tsx` — suggestion forms
  - **Frontend - UI Approval**: `client/src/components/ideas-tab-view.tsx` — approval mutation and pending list (lines ~144-221)
- **Use Cases**:
  - **CU-007**: User suggests idea to creator
  - **CU-008**: Creator approves suggestion
  - **CU-009**: System awards points for approved suggestion

### 📝 FEAT-004: Points and Rewards System

- **Description**: Gamification system with points for participation and rewards store
- **Priority**: High
- **Status**: Completed
- **Acceptance Criteria**:
  - ✅ Users earn points for voting (+1) and approved suggestions (+5)
  - ✅ Creators can create store items (premium)
  - ✅ Users can redeem items with points
  - ✅ Transaction system with complete history
  - ✅ Limit of 5 items per creator in store
- **Related Components**:
  - **Backend - Orchestration**: `server/routes.ts` — store CRUD handlers: GET/POST `/api/creators/:username/store` (lines ~1883-1931), PUT/DELETE `/api/creators/:username/store/:itemId` (lines ~1934-2012), POST `/api/creators/:username/store/:itemId/redeem` (lines ~2180-2229)
  - **Backend - Redemption**: `server/routes.ts` — redemption endpoint checks points balance (lines ~2211-2216), creates redemption and deducts points (lines ~2219-2222)
  - **Backend - Item Limit**: `server/routes.ts` — validation for 5-item limit per creator (lines ~1988-1992)
  - **Backend - Persistence**: `server/database-storage.ts` — methods `getStoreItems()`, `createStoreItem()`, `updateStoreItem()`, `deleteStoreItem()` (lines ~614-672), `createStoreRedemption()` (lines ~735-790), `getStoreRedemptions()` for redemptions
  - **Backend - Transaction History**: `server/database-storage.ts` — method `getUserPointTransactions()` retrieves complete transaction history (lines ~598-619), `updateUserPoints()` records transactions in `pointTransactions` table (lines ~581-591)
  - **Backend - Points**: `server/database-storage.ts` — `updateUserPoints()` deduct points when redeeming (called from line ~2222 in routes), sufficient balance validation
  - **Backend - Premium Validation**: `server/premium-middleware.ts` — premium access validation for creating/editing items
  - **Backend - Validation**: `shared/schema.ts` — tables `storeItems` (lines ~104-116), `storeRedemptions` (lines ~118-128), `pointTransactions` (lines ~92-102), schemas `insertStoreItemSchema`, `updateStoreItemSchema` (lines ~349-407)
  - **Frontend - Management**: `client/src/components/store-management.tsx` — store items CRUD for creators
  - **Frontend - Form**: `client/src/components/store-item-form.tsx` — create/edit item form
  - **Frontend - Redemptions**: `client/src/components/public-store.tsx`, `client/src/pages/modern-public-profile.tsx` — redemption UI for audience
- **Use Cases**:
  - **CU-010**: Creator creates store item
  - **CU-011**: User redeems item with points
  - **CU-012**: System records points transaction

### 📝 FEAT-005: Premium Subscription System

- **Description**: Stripe-based subscription system for premium features
- **Priority**: High
- **Status**: Completed
- **Acceptance Criteria**:
  - ✅ Monthly ($9.99) and yearly ($99.99) plans
  - ✅ 14-day free trial
  - ✅ Complete Stripe integration
  - ✅ Webhooks for state synchronization
  - ✅ Premium features: unlimited ideas, points store, analytics
- **Related Components**:
  - **Backend - Orchestration**: `server/routes.ts` — handlers POST `/api/stripe/create-checkout-session` (create session, lines ~1371-1505), POST `/api/stripe/cancel-subscription` (cancel, lines ~1508-1552), POST `/api/stripe/webhook` (webhooks, lines ~1750-1875), POST `/api/user/start-trial` (free trial, lines ~1343-1368)
  - **Backend - Validation**: `shared/premium-utils.ts` — function `hasActivePremiumAccess()` validates premium/trial/canceled status (lines ~13-46), `getTrialDaysRemaining()`
  - **Backend - Persistence**: `server/database-storage.ts` — methods `updateUserSubscription()`, `getUserByStripeCustomerId()`, `startUserTrial()` to update states
  - **Backend - Middleware**: `server/premium-middleware.ts` — `requirePremiumAccess()`, `conditionalPremiumAccess()` to protect premium routes
  - **Backend - Validation**: `shared/schema.ts` — `users` table with fields subscriptionStatus, stripeCustomerId, stripeSubscriptionId, etc. (lines ~20-30), `createCheckoutSessionSchema` (lines ~265-269)
  - **Frontend - UI**: `client/src/pages/subscription-page.tsx` — plan selection interface and subscription management
- **Use Cases**:
  - **CU-013**: User starts free trial
  - **CU-014**: User subscribes to premium plan
  - **CU-015**: System validates access to premium features

### 📝 FEAT-006: Authentication and Profiles System

- **Description**: Complete authentication system with roles and profile management
- **Priority**: High
- **Status**: Completed
- **Acceptance Criteria**:
  - ✅ Registration and login with password validation
  - ✅ User roles (creator/audience)
  - ✅ Password recovery via email
  - ✅ Customizable profiles with social media links
  - ✅ Persistent sessions with secure cookies
- **Related Components**:
  - **Backend - Authentication**: `server/auth.ts` — Passport.js configuration (lines ~36-87), handlers POST `/api/auth/register` (lines ~88-132), POST `/api/auth/login` (lines ~134-169), POST `/api/auth/logout`, POST `/api/auth/forgot-password` (lines ~207-276), POST `/api/auth/reset-password` (lines ~278-318), functions `hashPassword()`, `comparePasswords()` (lines ~23-34)
  - **Backend - Services**: `server/services/emailService.ts` — password recovery email sending, `server/services/tokenService.ts` — recovery token management
  - **Backend - Persistence**: `server/database-storage.ts` — methods `createUser()`, `getUserByUsername()`, `getUserByEmail()`, `updateUserPassword()`, `updateUserProfile()` for user management (lines ~51-78 for profile update with social links)
  - **Backend - Social Links**: `shared/schema.ts` — `users` table with social media fields: `twitterUrl`, `instagramUrl`, `youtubeUrl`, `tiktokUrl`, `threadsUrl`, `websiteUrl` (lines ~12-17)
  - **Backend - Validation**: `shared/schema.ts` — schema `insertUserSchema`, table `passwordResetTokens` (lines ~131-149, ~57-64), `updateProfileSchema` (lines ~249-262)
  - **Frontend - Profile Editor**: `client/src/components/profile-editor.tsx` — social media links form fields (lines ~407-510), handles Twitter, Instagram, YouTube, TikTok, Threads, Website
  - **Frontend - Hook**: `client/src/hooks/use-auth.tsx` — authentication provider, login/register/logout mutations, user state management (lines ~56-366)
  - **Frontend - UI**: `client/src/pages/auth-page.tsx` — login and registration forms with Zod validation (lines ~33-510)
- **Use Cases**:
  - **CU-016**: User registers on platform
  - **CU-017**: User changes from audience to creator role
  - **CU-018**: User recovers forgotten password

### 📝 FEAT-007: Public Profiles and Sharing

- **Description**: Creator public profiles with shareable links
- **Priority**: Medium
- **Status**: Completed
- **Acceptance Criteria**:
  - ✅ Public profiles accessible by username
  - ✅ Public links with unique tokens
  - ✅ Voting on public profiles
  - ✅ Profile customization with backgrounds and logos
- **Related Components**:
  - **Backend - Orchestration**: `server/routes.ts` — handlers GET `/api/creators/:username` (public profile by username, lines ~1185-1217), GET/POST `/api/public/:token` (public leaderboard by token, lines ~1222-1331), POST `/api/public/:token/ideas/:ideaId/vote` (vote on public leaderboard)
  - **Backend - Persistence**: `server/database-storage.ts` — methods `getPublicLinkByToken()`, `createPublicLink()`, `getUserByUsername()` for profiles, validation of active/expired links, `updateUserProfile()` handles `logoUrl` and `profileBackground` (lines ~51-78)
  - **Backend - Profile Customization**: `shared/schema.ts` — `users` table with `logoUrl` (line ~11) and `profileBackground` (line ~18) fields
  - **Backend - Validation**: `shared/schema.ts` — table `publicLinks` (lines ~67-74), schema `insertPublicLinkSchema` (lines ~224-236), unique token validation
  - **Frontend - Public Profile**: `client/src/pages/modern-public-profile.tsx` — public profile view with ideas, voting and suggestions (lines ~57-576)
  - **Frontend - Profile Editor**: `client/src/components/profile-editor.tsx` — logo upload and background selection UI
  - **Frontend - Public Leaderboard**: `client/src/pages/public-leaderboard-page.tsx` — shared leaderboard view by token (lines ~39-390)
  - **Frontend - Sharing**: `client/src/components/share-profile.tsx` — component to generate and share public links
- **Use Cases**:
  - **CU-019**: Creator shares public profile
  - **CU-020**: User visits creator profile
  - **CU-021**: User votes on public profile

## 🔧 Technical Capabilities

### ⚙️ CAP-001: PostgreSQL Database with Drizzle ORM

- **Description**: Type-safe persistence system with ORM and automatic migrations
- **Implementation**: Drizzle ORM with Zod schemas for validation
- **Dependencies**: PostgreSQL, drizzle-orm, drizzle-zod
- **Files**:
  - `shared/schema.ts` - Table and schema definitions
  - `server/db.ts` - Connection configuration
  - `server/database-storage.ts` - CRUD operations implementation

### ⚙️ CAP-002: Authentication with Passport.js

- **Description**: Robust authentication system with persistent sessions
- **Implementation**: Passport Local Strategy with scrypt hash
- **Dependencies**: passport, passport-local, express-session
- **Files**:
  - `server/auth.ts` - Passport configuration and auth routes
  - `server/storage.ts` - IStorage interface for user operations

### ⚙️ CAP-003: REST API with Express.js

- **Description**: Complete RESTful API with Zod validation and error handling
- **Implementation**: Express with validation middleware and logging
- **Dependencies**: express, zod, zod-validation-error
- **Files**:
  - `server/routes.ts` - All API routes definition
  - `server/index.ts` - Express server configuration

### ⚙️ CAP-004: React Frontend with TypeScript

- **Description**: Modern user interface with React 18 and TypeScript
- **Implementation**: React Query for server state, Framer Motion for animations
- **Dependencies**: react, @tanstack/react-query, framer-motion
- **Files**:
  - `client/src/App.tsx` - Main routes configuration
  - `client/src/hooks/use-auth.tsx` - Authentication hook
  - `client/src/components/` - Reusable UI components

### ⚙️ CAP-005: Stripe Payment Integration

- **Description**: Complete payment system with webhooks and subscription management
- **Implementation**: Stripe Checkout with webhooks for synchronization
- **Dependencies**: stripe, @stripe/stripe-js
- **Files**:
  - `server/routes.ts` - Stripe endpoints and webhooks
  - `client/src/pages/subscription-page.tsx` - Subscription interface

### ⚙️ CAP-006: Email Notification System

- **Description**: Email service for password recovery
- **Implementation**: Resend API with HTML templates
- **Dependencies**: resend
- **Files**:
  - `server/services/emailService.ts` - Email sending service
  - `server/services/tokenService.ts` - Recovery token management

## 📊 Non-Functional Requirements

### 🔒 REQ-001: Security

- **Description**: Robust security system with password hashing, input validation and CSRF protection
- **Implementation**:
  - Scrypt hash for passwords with random salt
  - Zod validation on all inputs
  - httpOnly and sameSite cookies for sessions
  - Authentication middleware on protected routes
- **Verification**: Authentication and validation tests in `server/__tests__/`

### ⚡ REQ-002: Performance

- **Description**: System optimized for fast response and scalability
- **Metrics**:
  - API response time < 200ms
  - Initial page load < 2s
  - Real-time updates < 100ms
- **Implementation**:
  - React Query for client-side caching
  - Database indexes on critical fields
  - gzip compression on server
  - Lazy loading of components

### 🔄 REQ-003: Availability

- **Description**: High availability system with robust error handling
- **Metrics**: 99.9% uptime target
- **Implementation**:
  - Centralized error handling
  - Detailed logging for debugging
  - Fallbacks for critical operations
  - Multi-layer data validation

<!-- User Stories removed: maintained separately in backlog management tools -->

## 🔗 Related Implementation Context

Note: API details (routes, contracts, examples) will be documented in Swagger/OpenAPI. Here only high-level components that implement the features are listed:

- `server/routes.ts` — business rules orchestration
- `server/database-storage.ts` — data persistence and consistency
- `shared/schema.ts` — shared validations and schemas
- `client/src/components/` — user interface (forms, views and flows)
- `client/src/hooks/` — UI state and logic (authentication, reactive data)

## 📈 Metrics and KPIs

### 📊 Functionality Metrics

- **Specification Coverage**: 95% (19/20 main features implemented)
- **Response Time**: <200ms average for CRUD operations
- **Availability**: 99.9% uptime target with active monitoring

### 📊 Business Metrics

- **Engagement**: Average of 3.2 votes per idea
- **Premium Conversion**: 15% of active users have premium subscription
- **Retention**: 78% of active users in last 30 days

<!-- Workflows removed: domain flows to be documented in product/process docs -->

## 📚 References

### 🔗 External Documentation

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Stripe API Reference](https://stripe.com/docs/api)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Passport.js Documentation](http://www.passportjs.org/)

### 📁 Related Files

- `README.md` - Main project documentation
- `docs/` - Detailed technical documentation
- `package.json` - Project dependencies and scripts
- `drizzle.config.ts` - Database configuration
- `jest.config.cjs` - Testing configuration
