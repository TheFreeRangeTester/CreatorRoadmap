# System Specifications - CreatorRoadmap

## Features

### FEAT-001: Idea Management System

- **Description**: Allows creators to create, edit and delete content ideas with voting system
- **Priority**: High
- **Status**: Completed
- **Related Components**:
  - `shared/schema.ts`
  - `server/routes.ts`
  - `server/database-storage.ts`
  - `client/src/components/idea-form.tsx`
  - `client/src/components/ideas-tab-view.tsx`

#### Acceptance Criteria

1. ** Creators can create ideas with title (max 100 chars) and description (max 280 chars)**

   - **Backend - Validation**: `shared/schema.ts` - `insertIdeaSchema` (lines 188-192) validates title max 100 chars, description max 280 chars
   - **Backend - Orchestration**: `server/routes.ts` - POST `/api/ideas` handler (lines 387-438) validates schema and creates idea
   - **Backend - Persistence**: `server/database-storage.ts` - `createIdea()` method (lines 109-135) inserts idea into database
   - **Frontend - Form**: `client/src/components/idea-form.tsx` - form component with Zod validation for title/description limits

2. ** Ideas are displayed ordered by votes in real-time**

   - **Backend - Ordering**: `server/database-storage.ts` - `updatePositions()` method (lines 269-290) orders ideas by votes descending
   - **Backend - Persistence**: `server/database-storage.ts` - `getIdeasWithPositions()` method (lines 293-350) returns ideas sorted by votes
   - **Frontend - Display**: `client/src/components/ideas-tab-view.tsx` - displays ideas sorted by votes (line ~358)

3. ** Creators can edit their own ideas (except if they have >100 votes)**

   - **Backend - Validation**: `server/routes.ts` - PUT `/api/ideas/:id` handler (lines 441-492) checks ownership and vote limit (lines 465-471)
   - **Backend - Persistence**: `server/database-storage.ts` - `updateIdea()` method (lines 191-220) updates idea fields
   - **Backend - Validation**: `shared/schema.ts` - `updateIdeaSchema` (lines 201-203) validates update data
   - **Frontend - Form**: `client/src/components/idea-form.tsx` - edit form with same validation as create

4. ** Creators can delete their own ideas**

   - **Backend - Orchestration**: `server/routes.ts` - DELETE `/api/ideas/:id` handler (lines 581-622) validates ownership before deletion
   - **Backend - Persistence**: `server/database-storage.ts` - `deleteIdea()` method (lines 208-217) removes idea from database

5. ** Predefined niches system (unboxing, review, tutorial, vlog, behindTheScenes, qna)**
   - **Backend - Schema**: `shared/schema.ts` - `ideas` table has `niche` field (line 45)
   - **Backend - Validation**: `shared/schema.ts` - `insertIdeaSchema` includes optional `niche` field (line 191)
   - **Frontend - Form**: `client/src/components/idea-form.tsx` - niche selector with predefined options (lines 85-92)

---

### FEAT-002: Voting System

- **Description**: Allows audience to vote on content ideas with points system
- **Priority**: High
- **Status**: Completed
- **Related Components**:
  - `server/routes.ts`
  - `server/database-storage.ts`
  - `shared/schema.ts`
  - `client/src/hooks/use-reactive-stats.tsx`
  - `client/src/components/ideas-tab-view.tsx`

#### Acceptance Criteria

1. ** Users can vote once per idea**

   - **Backend - Duplicate Prevention**: `server/routes.ts` - POST `/api/ideas/:id/vote` handler (lines 1006-1109) checks existing vote before creating (line 1046)
   - **Backend - Persistence**: `server/database-storage.ts` - `getVoteByUserOrSession()` method (lines 220-232) checks if user already voted
   - **Backend - Schema**: `shared/schema.ts` - `votes` table (lines 49-55) tracks votes with userId and ideaId

2. ** Each vote awards 1 point to the voter**

   - **Backend - Points Award**: `server/routes.ts` - POST `/api/ideas/:id/vote` handler awards 1 point via `updateUserPoints()` (line 674)
   - **Backend - Points**: `server/database-storage.ts` - `updateUserPoints()` method (lines 556-596) adds +1 point with reason 'vote_given'
   - **Backend - Transaction**: `server/database-storage.ts` - records transaction in `pointTransactions` table (lines 581-591)

3. ** Creators cannot vote on their own ideas**

   - **Backend - Self-Vote Prevention**: `server/routes.ts` - POST `/api/ideas/:id/vote` handler (line 626) validates creatorId !== userId before creating vote (lines 659-666)
   - **Backend - Self-Vote Prevention**: `server/routes.ts` - POST `/api/creators/:username/ideas/:ideaId/vote` handler (lines 1172-1295) also prevents self-votes (lines 1216-1223)

4. ** Votes update in real-time**

   - **Backend - Vote Count**: `server/database-storage.ts` - `incrementVote()` method (lines 256-266) increments vote count and updates positions
   - **Frontend - State**: `client/src/hooks/use-reactive-stats.tsx` - reactive statistics updates after voting (lines 34-166)
   - **Frontend - UI**: `client/src/components/ideas-tab-view.tsx` - vote mutation and UI updates (lines 72-119)

5. ** System prevents duplicate votes per user**
   - **Backend - Duplicate Check**: `server/routes.ts` - checks `getVoteByUserOrSession()` before creating vote (lines 1046-1050)
   - **Backend - Persistence**: `server/database-storage.ts` - `createVote()` method (lines 234-254) creates vote record
   - **Backend - Schema**: `shared/schema.ts` - `votes` table tracks userId + ideaId combination

---

### FEAT-003: Idea Suggestions System

- **Description**: Allows audience to suggest ideas to specific creators with approval system
- **Priority**: High
- **Status**: Completed (Note: Awards 2 points instead of 5 for approved suggestions)
- **Related Components**:
  - `server/routes.ts`
  - `server/database-storage.ts`
  - `shared/schema.ts`
  - `client/src/components/suggest-idea-modal.tsx`
  - `client/src/components/suggest-idea-dialog.tsx`
  - `client/src/components/ideas-tab-view.tsx`

#### Acceptance Criteria

1. ** Users can suggest ideas to specific creators**

   - **Backend - Orchestration**: `server/routes.ts` - POST `/api/creators/:username/suggest` handler (lines 769-854) processes suggestion
   - **Backend - Persistence**: `server/database-storage.ts` - `suggestIdea()` method (lines 137-158) creates idea with status='pending'
   - **Backend - Validation**: `shared/schema.ts` - `suggestIdeaSchema` (lines 195-199) validates suggestion with creatorId
   - **Frontend - UI**: `client/src/components/suggest-idea-modal.tsx` - suggestion form component
   - **Frontend - UI**: `client/src/components/suggest-idea-dialog.tsx` - alternative suggestion dialog

2. ** Each suggestion costs 3 points**

   - **Backend - Points Check**: `server/routes.ts` - POST `/api/creators/:username/suggest` handler checks points balance (line 812)
   - **Backend - Points Deduction**: `server/routes.ts` - deducts 3 points when suggesting (line 818)
   - **Backend - Points**: `server/database-storage.ts` - `updateUserPoints()` deducts 3 points with reason 'idea_suggestion'

3. ** Suggestions require creator approval**

   - **Backend - Persistence**: `server/database-storage.ts` - `suggestIdea()` creates idea with status='pending' (line 150)
   - **Backend - Persistence**: `server/database-storage.ts` - `getPendingIdeas()` method (lines 180-189) retrieves pending suggestions
   - **Backend - Orchestration**: `server/routes.ts` - GET `/api/pending-ideas` handler (lines 857-901) returns pending ideas
   - **Frontend - UI**: `client/src/components/ideas-tab-view.tsx` - displays pending list and approval controls (lines 144-221)

4. ** Approved ideas award 5 points to suggester (Note: Currently awards 2 points)**

   - **Backend - Points Award**: `server/routes.ts` - PATCH `/api/ideas/:id/approve` handler awards 2 points (lines 958-962)
   - **Backend - Points**: `server/database-storage.ts` - `updateUserPoints()` awards points with reason 'idea_approved'

5. ** Creators can approve/reject suggestions**
   - **Backend - Orchestration**: `server/routes.ts` - PATCH `/api/ideas/:id/approve` handler (lines 904-978) approves pending idea
   - **Backend - Persistence**: `server/database-storage.ts` - `approveIdea()` method (lines 160-178) updates status to 'approved'
   - **Backend - Rejection**: `server/routes.ts` - DELETE `/api/ideas/:id` handler (lines 531-572) allows creators to delete (reject) pending ideas
   - **Frontend - UI**: `client/src/components/ideas-tab-view.tsx` - approval mutation and pending list (lines 144-221)

---

### FEAT-004: Points and Rewards System

- **Description**: Gamification system with points for participation and rewards store
- **Priority**: High
- **Status**: Completed
- **Related Components**:
  - `server/routes.ts`
  - `server/database-storage.ts`
  - `shared/schema.ts`
  - `client/src/components/store-management.tsx`
  - `client/src/components/store-item-form.tsx`
  - `client/src/components/public-store.tsx`
  - `client/src/pages/modern-public-profile.tsx`

#### Acceptance Criteria

1. ** Users earn points for voting (+1) and approved suggestions (+5)**

   - **Backend - Voting Points**: `server/routes.ts` - POST `/api/ideas/:id/vote` awards +1 point (line 1072)
   - **Backend - Suggestion Points**: `server/routes.ts` - PATCH `/api/ideas/:id/approve` awards 2 points (currently, line 961)
   - **Backend - Points Management**: `server/database-storage.ts` - `updateUserPoints()` method (lines 556-596) handles point transactions
   - **Backend - Schema**: `shared/schema.ts` - `userPoints` table (lines 77-90) stores points per user-creator pair

2. ** Creators can create store items (premium)**

   - **Backend - Premium Check**: `server/routes.ts` - POST `/api/store/items` handler validates premium access (lines 1976-1986)
   - **Backend - Orchestration**: `server/routes.ts` - POST `/api/store/items` handler (lines 1963-2006) creates store item
   - **Backend - Persistence**: `server/database-storage.ts` - `createStoreItem()` method (lines 643-672) inserts store item
   - **Backend - Validation**: `shared/schema.ts` - `insertStoreItemSchema` (lines 362-372) validates item data
   - **Frontend - Management**: `client/src/components/store-management.tsx` - store items CRUD interface
   - **Frontend - Form**: `client/src/components/store-item-form.tsx` - create/edit item form

3. ** Users can redeem items with points**

   - **Backend - Orchestration**: `server/routes.ts` - POST `/api/creators/:username/store/:itemId/redeem` handler (lines 2180-2229) processes redemption
   - **Backend - Points Check**: `server/routes.ts` - redemption endpoint checks points balance (lines 2211-2216)
   - **Backend - Redemption**: `server/routes.ts` - creates redemption and deducts points (lines 2219-2222)
   - **Backend - Persistence**: `server/database-storage.ts` - `createStoreRedemption()` method (lines 735-790) records redemption
   - **Frontend - Redemptions**: `client/src/components/public-store.tsx` - redemption UI for audience
   - **Frontend - Redemptions**: `client/src/pages/modern-public-profile.tsx` - store display and redemption

4. ** Transaction system with complete history**

   - **Backend - Persistence**: `server/database-storage.ts` - `getUserPointTransactions()` method (lines 598-619) retrieves transaction history
   - **Backend - Transaction Recording**: `server/database-storage.ts` - `updateUserPoints()` records transactions in `pointTransactions` table (lines 581-591)
   - **Backend - Schema**: `shared/schema.ts` - `pointTransactions` table (lines 93-102) stores all point transactions

5. ** Limit of 5 items per creator in store**
   - **Backend - Item Limit**: `server/routes.ts` - POST `/api/store/items` handler validates 5-item limit (lines 2039-2043)
   - **Backend - Persistence**: `server/database-storage.ts` - `getStoreItems()` method (lines 622-633) retrieves items for limit check

---

### FEAT-005: Premium Subscription System

- **Description**: Stripe-based subscription system for premium features
- **Priority**: High
- **Status**: Completed
- **Related Components**:
  - `server/routes.ts`
  - `server/database-storage.ts`
  - `server/premium-middleware.ts`
  - `shared/schema.ts`
  - `shared/premium-utils.ts`
  - `client/src/pages/subscription-page.tsx`

#### Acceptance Criteria

1. ** Monthly ($9.99) and yearly ($99.99) plans**

   - **Backend - Orchestration**: `server/routes.ts` - POST `/api/stripe/create-checkout-session` handler (lines 1371-1505) creates Stripe checkout session
   - **Backend - Validation**: `shared/schema.ts` - `createCheckoutSessionSchema` (lines 278-282) validates plan selection
   - **Frontend - UI**: `client/src/pages/subscription-page.tsx` - plan selection interface

2. ** 14-day free trial**

   - **Backend - Orchestration**: `server/routes.ts` - POST `/api/user/start-trial` handler (lines 1343-1368) starts free trial
   - **Backend - Persistence**: `server/database-storage.ts` - `startUserTrial()` method sets trial dates
   - **Backend - Validation**: `shared/premium-utils.ts` - `getTrialDaysRemaining()` calculates remaining trial days

3. ** Complete Stripe integration**

   - **Backend - Checkout**: `server/routes.ts` - POST `/api/stripe/create-checkout-session` handler (lines 1371-1505) creates Stripe session
   - **Backend - Cancellation**: `server/routes.ts` - POST `/api/stripe/cancel-subscription` handler (lines 1508-1552) cancels subscription
   - **Backend - Schema**: `shared/schema.ts` - `users` table has Stripe fields: `stripeCustomerId`, `stripeSubscriptionId` (lines 25-26)

4. ** Webhooks for state synchronization**

   - **Backend - Webhooks**: `server/routes.ts` - POST `/api/stripe/webhook` handler (lines 1865-1989) processes Stripe webhook events
   - **Backend - Persistence**: `server/database-storage.ts` - `updateUserSubscription()` method (lines 410-418) updates subscription state
   - **Backend - Persistence**: `server/database-storage.ts` - `getUserByStripeCustomerId()` method (lines 438-445) retrieves user by Stripe ID

5. ** Premium features: unlimited ideas, points store, analytics**
   - **Backend - Validation**: `shared/premium-utils.ts` - `hasActivePremiumAccess()` function (lines 13-46) validates premium/trial/canceled status
   - **Backend - Middleware**: `server/premium-middleware.ts` - `requirePremiumAccess()`, `conditionalPremiumAccess()` protect premium routes
   - **Backend - Idea Limit**: `server/routes.ts` - POST `/api/ideas` handler checks quota with `conditionalPremiumAccess` (line 387)
   - **Backend - Store Access**: `server/routes.ts` - POST `/api/store/items` handler requires premium (lines 1976-1986)

---

### FEAT-006: Authentication and Profiles System

- **Description**: Complete authentication system with roles and profile management
- **Priority**: High
- **Status**: Completed
- **Related Components**:
  - `server/auth.ts`
  - `server/routes.ts`
  - `server/database-storage.ts`
  - `server/services/emailService.ts`
  - `server/services/tokenService.ts`
  - `shared/schema.ts`
  - `client/src/pages/auth-page.tsx`
  - `client/src/hooks/use-auth.tsx`
  - `client/src/components/profile-editor.tsx`

#### Acceptance Criteria

1. ** Registration and login with password validation**

   - **Backend - Authentication**: `server/auth.ts` - POST `/api/auth/register` handler (lines 88-132) validates and creates user
   - **Backend - Authentication**: `server/auth.ts` - POST `/api/auth/login` handler (lines 134-169) authenticates user
   - **Backend - Password Hashing**: `server/auth.ts` - `hashPassword()` function (lines 23-27) uses scrypt for password hashing
   - **Backend - Password Comparison**: `server/auth.ts` - `comparePasswords()` function (lines 29-34) securely compares passwords
   - **Backend - Validation**: `shared/schema.ts` - `insertUserSchema` (lines 142-160) validates username (min 3, max 50), password (min 6, max 100), email
   - **Frontend - UI**: `client/src/pages/auth-page.tsx` - login and registration forms with Zod validation (lines 33-510)
   - **Frontend - Hook**: `client/src/hooks/use-auth.tsx` - authentication provider with login/register/logout mutations (lines 56-366)

2. ** User roles (creator/audience)**

   - **Backend - Schema**: `shared/schema.ts` - `users` table has `userRole` field (line 9) with default 'audience'
   - **Backend - Role Update**: `server/routes.ts` - PATCH `/api/user/role` handler (lines 54-92) allows upgrading from audience to creator
   - **Backend - Validation**: `shared/schema.ts` - `insertUserSchema` includes `userRole` enum validation (line 156)
   - **Frontend - Hook**: `client/src/hooks/use-auth.tsx` - manages user role in state

3. ** Password recovery via email**

   - **Backend - Orchestration**: `server/auth.ts` - POST `/api/auth/forgot-password` handler (lines 207-276) generates reset token
   - **Backend - Orchestration**: `server/auth.ts` - POST `/api/auth/reset-password` handler (lines 278-318) validates token and resets password
   - **Backend - Services**: `server/services/emailService.ts` - sends password recovery email
   - **Backend - Services**: `server/services/tokenService.ts` - manages recovery token generation and validation
   - **Backend - Persistence**: `server/database-storage.ts` - `updateUserPassword()` method (lines 80-93) updates password hash
   - **Backend - Schema**: `shared/schema.ts` - `passwordResetTokens` table (lines 58-64) stores reset tokens

4. ** Customizable profiles with social media links**

   - **Backend - Persistence**: `server/database-storage.ts` - `updateUserProfile()` method (lines 51-78) updates profile fields including social links
   - **Backend - Schema**: `shared/schema.ts` - `users` table has social media fields: `twitterUrl`, `instagramUrl`, `youtubeUrl`, `tiktokUrl`, `threadsUrl`, `websiteUrl` (lines 12-17)
   - **Backend - Validation**: `shared/schema.ts` - `updateProfileSchema` (lines 262-275) validates profile updates
   - **Backend - Orchestration**: `server/routes.ts` - PATCH `/api/user/profile` handler (lines 21-51) updates user profile
   - **Frontend - Profile Editor**: `client/src/components/profile-editor.tsx` - social media links form fields (lines 407-510)

5. ** Persistent sessions with secure cookies**
   - **Backend - Session Configuration**: `server/auth.ts` - session settings (lines 41-54) configure secure cookies with httpOnly, sameSite
   - **Backend - Passport**: `server/auth.ts` - Passport.js configuration (lines 63-86) with serializeUser/deserializeUser
   - **Backend - Session Store**: `server/database-storage.ts` - PostgreSQL session store using connect-pg-simple (lines 18-28)

---

### FEAT-007: Public Profiles and Sharing

- **Description**: Creator public profiles with shareable links
- **Priority**: Medium
- **Status**: Completed
- **Related Components**:
  - `server/routes.ts`
  - `server/database-storage.ts`
  - `shared/schema.ts`
  - `client/src/pages/modern-public-profile.tsx`
  - `client/src/pages/public-leaderboard-page.tsx`
  - `client/src/pages/creator-profile-unified.tsx`
  - `client/src/components/share-profile.tsx`
  - `client/src/components/profile-editor.tsx`

#### Acceptance Criteria

1. ** Public profiles accessible by username**

   - **Backend - Orchestration**: `server/routes.ts` - GET `/api/creators/:username` handler (lines 1185-1217) retrieves public profile by username
   - **Backend - Persistence**: `server/database-storage.ts` - `getUserByUsername()` method (lines 36-39) retrieves user by username
   - **Frontend - Public Profile**: `client/src/pages/modern-public-profile.tsx` - public profile view with ideas, voting and suggestions (lines 57-576)

2. ** Public links with unique tokens**

   - **Backend - Orchestration**: `server/routes.ts` - GET/POST `/api/public/:token` handlers (lines 1222-1331) handle public leaderboard by token
   - **Backend - Persistence**: `server/database-storage.ts` - `getPublicLinkByToken()` method retrieves link by token
   - **Backend - Persistence**: `server/database-storage.ts` - `createPublicLink()` method creates unique token link
   - **Backend - Schema**: `shared/schema.ts` - `publicLinks` table (lines 67-74) stores tokens with unique constraint
   - **Backend - Validation**: `shared/schema.ts` - `insertPublicLinkSchema` (lines 237-249) validates public link data
   - **Frontend - Public Leaderboard**: `client/src/pages/public-leaderboard-page.tsx` - shared leaderboard view by token (lines 39-390)
   - **Frontend - Sharing**: `client/src/components/share-profile.tsx` - component to generate and share public links

3. ** Voting on public profiles**

   - **Backend - Orchestration**: `server/routes.ts` - POST `/api/public/:token/ideas/:ideaId/vote` handler allows voting on public leaderboard
   - **Backend - Orchestration**: `server/routes.ts` - POST `/api/creators/:username/ideas/:ideaId/vote` handler (lines 1112-1235) allows voting on public profile
   - **Frontend - Public Profile**: `client/src/pages/modern-public-profile.tsx` - vote handlers on public profiles
   - **Frontend - Public Profile**: `client/src/pages/creator-profile-unified.tsx` - vote handlers on unified profile

4. ** Profile customization with backgrounds and logos**
   - **Backend - Persistence**: `server/database-storage.ts` - `updateUserProfile()` method handles `logoUrl` and `profileBackground` (lines 61, 68)
   - **Backend - Schema**: `shared/schema.ts` - `users` table has `logoUrl` (line 11) and `profileBackground` (line 18) fields
   - **Frontend - Profile Editor**: `client/src/components/profile-editor.tsx` - logo upload and background selection UI

---

### FEAT-008: Analytics and Statistics System

- **Description**: Comprehensive analytics and statistics tracking for creators and audience members
- **Priority**: Medium
- **Status**: Completed
- **Related Components**:
  - `server/routes.ts`
  - `server/database-storage.ts`
  - `shared/schema.ts`
  - `client/src/components/dashboard-overview.tsx`
  - `client/src/components/audience-stats.tsx`
  - `client/src/hooks/use-reactive-stats.tsx`
  - `client/src/components/ideas-tab-view.tsx`

#### Acceptance Criteria

1. ** Creator dashboard with key metrics (total ideas, total votes, pending suggestions, top niches, pending redemptions)**

   - **Backend - Orchestration**: `server/routes.ts` - GET `/api/user/dashboard-stats` handler (lines 281-324) returns creator dashboard stats
   - **Backend - Persistence**: `server/database-storage.ts` - methods retrieve ideas, votes, pending suggestions, redemptions
   - **Frontend - Dashboard**: `client/src/components/dashboard-overview.tsx` - creator statistics display with cards and carousel (lines 100-865)

2. ** Audience statistics tracking (total points, votes given, ideas suggested, ideas approved)**

   - **Backend - Orchestration**: `server/routes.ts` - GET `/api/user/audience-stats` handler returns audience statistics
   - **Backend - Persistence**: `server/database-storage.ts` - `getUserAudienceStats()` method retrieves audience stats
   - **Frontend - Audience Stats**: `client/src/components/audience-stats.tsx` - component displaying audience member statistics

3. ** Persistent niche statistics with vote tracking**

   - **Backend - Niche Statistics**: `server/database-storage.ts` - `incrementNicheStats()` method (lines 908-929) tracks votes per niche
   - **Backend - Niche Tracking**: `server/routes.ts` - automatic niche stats increment on vote endpoints (lines 1058-1065, 1184-1191, 1344-1351)
   - **Backend - Schema**: `shared/schema.ts` - `nicheStats` table (lines 131-139) stores creatorId, niche, totalVotes

4. ** Real-time reactive statistics updates**

   - **Frontend - Reactive Stats**: `client/src/hooks/use-reactive-stats.tsx` - hook for real-time statistics updates with optimistic updates (lines 34-166)
   - **Frontend - State**: `client/src/components/ideas-tab-view.tsx` - invalidates queries after voting to update stats

5. ** Top niches analysis per creator**

   - **Backend - Niche Statistics**: `server/database-storage.ts` - `getTopNiche()` method (lines 931-947) returns top performing niche ordered by total votes from audience
   - **Backend - Niche Statistics**: `server/database-storage.ts` - `getTopNiches()` method (lines 949-963) returns top 2 niches (default limit) ordered by total votes from audience (`orderBy(desc(nicheStats.totalVotes))`)
   - **Backend - API**: `server/routes.ts` - GET `/api/stats` handler (line 300) calls `getTopNiches(creatorId, 2)` to fetch top 2 niches
   - **Frontend - Dashboard**: `client/src/components/dashboard-overview.tsx` - displays top 2 niches based on audience votes (lines 507-580)

6. ** Per-creator audience statistics**
   - **Backend - Persistence**: `server/database-storage.ts` - `getUserPoints()` method retrieves points per creator
   - **Backend - Persistence**: `server/database-storage.ts` - `getUserPointTransactions()` method retrieves transaction history per creator
   - **Frontend - Stats**: `client/src/components/audience-stats.tsx` - displays per-creator statistics

---

### FEAT-009: Comments and Discussion System

- **Description**: Interactive commenting system allowing audience members to discuss and provide feedback on content ideas
- **Priority**: Low
- **Status**: Planned
- **Related Components**:
  - `server/routes.ts`
  - `server/database-storage.ts`
  - `server/premium-middleware.ts`
  - `server/services/moderationService.ts`
  - `server/websocket.ts`
  - `shared/schema.ts`
  - `client/src/components/idea-comments.tsx`
  - `client/src/components/comment-form.tsx`
  - `client/src/components/comment-moderation.tsx`
  - `client/src/hooks/use-comments-websocket.tsx`

#### Acceptance Criteria

1. ** Users can comment on published ideas**

   - **Backend - Orchestration**: `server/routes.ts` - handlers POST `/api/ideas/:id/comments` (create comment), GET `/api/ideas/:id/comments` (list comments)
   - **Backend - Persistence**: `server/database-storage.ts` - methods `createComment()`, `getCommentsByIdea()`
   - **Backend - Validation**: `shared/schema.ts` - table `comments` with fields id, ideaId, userId, content, createdAt, schema `insertCommentSchema`
   - **Frontend - Comments UI**: `client/src/components/idea-comments.tsx` - comment thread display component
   - **Frontend - Comment Form**: `client/src/components/comment-form.tsx` - comment creation and editing form

2. ** Creators can moderate comments (premium feature)**

   - **Backend - Moderation**: `server/routes.ts` - DELETE `/api/comments/:id` (delete comment), moderation endpoints
   - **Backend - Persistence**: `server/database-storage.ts` - methods `moderateComment()`, `updateComment()`, `deleteComment()`
   - **Backend - Premium Check**: `server/premium-middleware.ts` - premium access validation for moderation
   - **Frontend - Moderation Panel**: `client/src/components/comment-moderation.tsx` - moderation interface for creators (premium)

3. ** Comment threading with replies support**

   - **Backend - Schema**: `shared/schema.ts` - `comments` table with `parentCommentId` field for threading
   - **Backend - Persistence**: `server/database-storage.ts` - methods support parent-child comment relationships
   - **Frontend - Comments UI**: `client/src/components/idea-comments.tsx` - nested comment display

4. ** Real-time comment updates via WebSocket**

   - **Backend - WebSocket**: `server/websocket.ts` - real-time comment broadcasting service
   - **Frontend - WebSocket Hook**: `client/src/hooks/use-comments-websocket.tsx` - real-time comment updates hook

5. ** Comment reactions (like/dislike) with points integration**

   - **Backend - Orchestration**: `server/routes.ts` - POST `/api/comments/:id/reactions` (add reaction)
   - **Backend - Points**: Integration with points system for reaction rewards
   - **Frontend - Comments UI**: Reaction buttons and display

6. ** Comment notifications for creators**

   - **Backend - Notification**: Notification system for new comments on creator's ideas
   - **Frontend - Notifications**: Notification display component

7. ** Spam detection and moderation tools**
   - **Backend - Moderation**: `server/services/moderationService.ts` - spam detection and content filtering
   - **Backend - Persistence**: `server/database-storage.ts` - spam flagging and moderation status

---

### FEAT-010: Push Notifications System

- **Description**: Real-time push notifications for users about important events and updates
- **Priority**: Medium
- **Status**: Planned
- **Related Components**:
  - `server/routes.ts`
  - `server/database-storage.ts`
  - `server/services/pushNotificationService.ts`
  - `shared/schema.ts`
  - `client/public/sw.js`
  - `client/src/hooks/use-push-notifications.tsx`
  - `client/src/components/notification-badge.tsx`
  - `client/src/components/notification-center.tsx`
  - `client/src/components/notification-settings.tsx`
  - `client/src/lib/push-platform-adapter.ts`

#### Acceptance Criteria

1. ** Users receive push notifications for new votes on their ideas**

   - **Backend - Notification Service**: `server/services/pushNotificationService.ts` - sends push notifications when ideas receive votes
   - **Backend - Orchestration**: `server/routes.ts` - POST `/api/notifications/subscribe` handler registers device tokens
   - **Backend - Persistence**: `server/database-storage.ts` - `createNotificationSubscription()` method stores device tokens
   - **Backend - Schema**: `shared/schema.ts` - `notificationSubscriptions` table stores userId, deviceToken, platform
   - **Frontend - Service Worker**: `client/public/sw.js` - service worker handles push notifications
   - **Frontend - Hook**: `client/src/hooks/use-push-notifications.tsx` - manages notification subscription and permissions

2. ** Creators receive notifications for approved suggestions**

   - **Backend - Notification Trigger**: `server/routes.ts` - PATCH `/api/ideas/:id/approve` handler triggers notification to suggester
   - **Backend - Notification Service**: `server/services/pushNotificationService.ts` - `sendSuggestionApprovedNotification()` method
   - **Frontend - Notification Display**: `client/src/components/notification-badge.tsx` - displays notification count badge

3. ** Users receive notifications for store item redemptions**

   - **Backend - Notification Trigger**: `server/routes.ts` - POST `/api/creators/:username/store/:itemId/redeem` handler triggers notification to creator
   - **Backend - Notification Service**: `server/services/pushNotificationService.ts` - `sendRedemptionNotification()` method
   - **Frontend - Notification Center**: `client/src/components/notification-center.tsx` - displays all notifications in a dropdown

4. ** Cross-platform support (web, iOS, Android)**

   - **Backend - Platform Detection**: `server/services/pushNotificationService.ts` - detects platform and uses appropriate push service (FCM, APNS, Web Push)
   - **Backend - Schema**: `shared/schema.ts` - `notificationSubscriptions` table has `platform` field (web/ios/android)
   - **Frontend - Platform Adapter**: `client/src/lib/push-platform-adapter.ts` - adapts push API for different platforms

5. ** Notification preferences and settings**
   - **Backend - Orchestration**: `server/routes.ts` - GET/PUT `/api/user/notification-preferences` handlers manage preferences
   - **Backend - Persistence**: `server/database-storage.ts` - `getNotificationPreferences()`, `updateNotificationPreferences()` methods
   - **Backend - Schema**: `shared/schema.ts` - `notificationPreferences` table stores user preferences per notification type
   - **Frontend - Settings**: `client/src/components/notification-settings.tsx` - UI for managing notification preferences
