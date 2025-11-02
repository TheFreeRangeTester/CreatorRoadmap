import { pgTable, text, serial, integer, timestamp, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  userRole: text("user_role").notNull().default("audience"), // 'creator' o 'audience'
  profileDescription: text("profile_description"),
  logoUrl: text("logo_url"),
  twitterUrl: text("twitter_url"),
  instagramUrl: text("instagram_url"),
  youtubeUrl: text("youtube_url"),
  tiktokUrl: text("tiktok_url"),
  threadsUrl: text("threads_url"),
  websiteUrl: text("website_url"),
  profileBackground: text("profile_background").default("gradient-1"),
  email: text("email").notNull().unique(),
  // Campos para suscripciones premium
  subscriptionStatus: text("subscription_status").notNull().default("free"), // 'free', 'trial', 'premium', 'canceled'
  hasUsedTrial: boolean("has_used_trial").notNull().default(false),
  trialStartDate: timestamp("trial_start_date"),
  trialEndDate: timestamp("trial_end_date"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionPlan: text("subscription_plan"), // 'monthly', 'yearly'
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  subscriptionCanceledAt: timestamp("subscription_canceled_at"), // Fecha de cancelación
});

export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  votes: integer("votes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  lastPositionUpdate: timestamp("last_position_update").notNull().defaultNow(),
  currentPosition: integer("current_position"),
  previousPosition: integer("previous_position"),
  status: text("status").notNull().default('approved'), // 'approved', 'pending'
  suggestedBy: integer("suggested_by").references(() => users.id), // ID del usuario que sugirió la idea
  niche: text("niche"), // Content niche/category (e.g., "unboxing", "review", "tutorial")
});

// A table to track votes to prevent multiple votes
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").notNull().references(() => ideas.id),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id"), // For non-authenticated users
  votedAt: timestamp("voted_at").notNull().defaultNow(),
});

// Table for password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Table for public leaderboard links
export const publicLinks = pgTable("public_links", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(), // The unique token for the public URL
  creatorId: integer("creator_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"), // Optional expiration date
});

// Table for user points (per creator)
export const userPoints = pgTable("user_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  totalPoints: integer("total_points").notNull().default(0),
  pointsEarned: integer("points_earned").notNull().default(0), // Total points ever earned
  pointsSpent: integer("points_spent").notNull().default(0), // Total points ever spent
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // Unique constraint on the combination of userId and creatorId
  // This allows a user to have different points with each creator
  userCreatorUnique: unique().on(table.userId, table.creatorId),
}));

// Table for point transactions/history
export const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'earned' or 'spent'
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(), // 'vote_given', 'idea_approved', 'suggestion_submitted'
  relatedId: integer("related_id"), // ID of the related idea, vote, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Table for store items that creators can configure
export const storeItems = pgTable("store_items", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  pointsCost: integer("points_cost").notNull(),
  maxQuantity: integer("max_quantity"), // null means unlimited
  currentQuantity: integer("current_quantity").notNull().default(0), // how many have been redeemed
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Table for store item redemptions
export const storeRedemptions = pgTable("store_redemptions", {
  id: serial("id").primaryKey(),
  storeItemId: integer("store_item_id").notNull().references(() => storeItems.id),
  userId: integer("user_id").notNull().references(() => users.id),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  pointsSpent: integer("points_spent").notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'completed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
}).extend({
  username: z.string()
    .min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" })
    .max(50, { message: "El nombre de usuario no puede exceder 50 caracteres" })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "El nombre de usuario solo puede contener letras, números, guiones y guiones bajos"
    }),
  password: z.string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(100, { message: "La contraseña no puede exceder 100 caracteres" }),
  userRole: z.enum(['creator', 'audience']).default('audience'),
  email: z.string().email({ message: "Ingresa un email válido" }),
  logoUrl: z.string().optional(),
  profileDescription: z.string().optional(),
});

export const userResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  userRole: z.enum(['creator', 'audience']).default('audience'),
  profileDescription: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  twitterUrl: z.string().nullable().optional(),
  instagramUrl: z.string().nullable().optional(),
  youtubeUrl: z.string().nullable().optional(),
  tiktokUrl: z.string().nullable().optional(),
  threadsUrl: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  profileBackground: z.string().default("gradient-1"),
  email: z.string().optional(),
  // Campos de suscripción
  subscriptionStatus: z.enum(['free', 'trial', 'premium', 'canceled']).default('free'),
  hasUsedTrial: z.boolean().default(false),
  trialStartDate: z.date().nullable().optional(),
  trialEndDate: z.date().nullable().optional(),
  subscriptionPlan: z.enum(['monthly', 'yearly']).nullable().optional(),
  subscriptionStartDate: z.date().nullable().optional(),
  subscriptionEndDate: z.date().nullable().optional(),
  subscriptionCanceledAt: z.date().nullable().optional(),
});

// Idea schemas
export const insertIdeaSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(100, { message: "Title must be 100 characters or less" }),
  description: z.string().max(280, { message: "Description must be 280 characters or less" }).optional().default(""),
  niche: z.string().optional(),
});

// Schema específico para sugerir ideas a un creador
export const suggestIdeaSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(100, { message: "Title must be 100 characters or less" }),
  description: z.string().max(280, { message: "Description must be 280 characters or less" }).optional().default(""),
  creatorId: z.number(), // ID del creador a quien se sugiere la idea
});

export const updateIdeaSchema = insertIdeaSchema;

export const ideaResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  niche: z.string().optional().nullable(),
  votes: z.number(),
  createdAt: z.date(),
  creatorId: z.number(),
  creatorUsername: z.string().optional(), // Nombre del creador (para usar en las URLs o mostrar en la UI)
  position: z.object({
    current: z.number().nullable(),
    previous: z.number().nullable(),
    change: z.number().nullable(),
  }),
  status: z.enum(['approved', 'pending']).default('approved'),
  suggestedBy: z.number().nullable(),
  suggestedByUsername: z.string().optional(), // Nombre del usuario que sugirió la idea (para mostrar en la UI)
});

// Vote schema
export const insertVoteSchema = createInsertSchema(votes).pick({
  ideaId: true,
});

// Public link schemas
// Password reset token schemas
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).pick({
  token: true,
  email: true,
  expiresAt: true,
});

export const insertPublicLinkSchema = createInsertSchema(publicLinks)
  .omit({
    id: true,
    creatorId: true,
    createdAt: true,
    token: true,
    isActive: true
  })
  .partial()
  .extend({
    // Acepta tanto un Date como un string ISO que se convertirá a Date
    expiresAt: z.string().datetime().optional().transform(val => val ? new Date(val) : null)
  });

export const publicLinkResponseSchema = z.object({
  id: z.number(),
  token: z.string(),
  creatorId: z.number(),
  createdAt: z.date(),
  isActive: z.boolean(),
  expiresAt: z.date().nullable(),
  url: z.string(), // Full shareable URL 
});

// Schema para actualizar el perfil del usuario
export const updateProfileSchema = z.object({
  profileDescription: z.string().max(500, { message: "La descripción debe tener 500 caracteres o menos" }).optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  twitterUrl: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
  youtubeUrl: z.string().optional().nullable(),
  tiktokUrl: z.string().optional().nullable(),
  threadsUrl: z.string().optional().nullable(),
  websiteUrl: z.string().optional().nullable(),
  profileBackground: z.string().optional().nullable(),
  // Campo para actualizar el rol
  userRole: z.enum(['creator', 'audience']).optional(),
  email: z.string().optional(),
});

// Schemas para suscripciones
export const createCheckoutSessionSchema = z.object({
  plan: z.enum(['monthly', 'yearly']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const updateSubscriptionSchema = z.object({
  subscriptionStatus: z.enum(['free', 'trial', 'premium']).optional(),
  hasUsedTrial: z.boolean().optional(),
  trialStartDate: z.date().nullable().optional(),
  trialEndDate: z.date().nullable().optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  subscriptionPlan: z.enum(['monthly', 'yearly']).nullable().optional(),
  subscriptionStartDate: z.date().nullable().optional(),
  subscriptionEndDate: z.date().nullable().optional(),
});

export const subscriptionResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  url: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;

export type InsertIdea = z.infer<typeof insertIdeaSchema>;
export type SuggestIdea = z.infer<typeof suggestIdeaSchema>;
export type UpdateIdea = z.infer<typeof updateIdeaSchema>;
export type Idea = typeof ideas.$inferSelect;
export type IdeaResponse = z.infer<typeof ideaResponseSchema>;

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export type InsertPublicLink = z.infer<typeof insertPublicLinkSchema>;
export type PublicLink = typeof publicLinks.$inferSelect;
export type PublicLinkResponse = z.infer<typeof publicLinkResponseSchema>;

export type CreateCheckoutSession = z.infer<typeof createCheckoutSessionSchema>;
export type UpdateSubscription = z.infer<typeof updateSubscriptionSchema>;
export type SubscriptionResponse = z.infer<typeof subscriptionResponseSchema>;

// Points schemas and types
export const userPointsResponseSchema = z.object({
  userId: z.number(),
  totalPoints: z.number(),
  pointsEarned: z.number(),
  pointsSpent: z.number(),
});

export const insertPointTransactionSchema = createInsertSchema(pointTransactions).pick({
  userId: true,
  type: true,
  amount: true,
  reason: true,
  relatedId: true,
});

export const pointTransactionResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  creatorId: z.number(),
  type: z.enum(['earned', 'spent']),
  amount: z.number(),
  reason: z.string(),
  relatedId: z.number().nullable(),
  createdAt: z.date(),
});

export type UserPoints = typeof userPoints.$inferSelect;
export type UserPointsResponse = z.infer<typeof userPointsResponseSchema>;
export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;
export type PointTransaction = typeof pointTransactions.$inferSelect;
export type PointTransactionResponse = z.infer<typeof pointTransactionResponseSchema>;

// Store items schemas and types
export const insertStoreItemSchema = createInsertSchema(storeItems).pick({
  title: true,
  description: true,
  pointsCost: true,
  maxQuantity: true,
}).extend({
  title: z.string().min(1, { message: "Title is required" }).max(100, { message: "Title too long" }),
  description: z.string().min(1, { message: "Description is required" }).max(500, { message: "Description too long" }),
  pointsCost: z.number().min(1, { message: "Points cost must be at least 1" }),
  maxQuantity: z.number().min(1, { message: "Quantity must be at least 1" }).nullable().optional(),
});

export const updateStoreItemSchema = insertStoreItemSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const storeItemResponseSchema = z.object({
  id: z.number(),
  creatorId: z.number(),
  title: z.string(),
  description: z.string(),
  pointsCost: z.number(),
  maxQuantity: z.number().nullable(),
  currentQuantity: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isAvailable: z.boolean(), // computed field
});

export const insertStoreRedemptionSchema = createInsertSchema(storeRedemptions).pick({
  storeItemId: true,
});

export const storeRedemptionResponseSchema = z.object({
  id: z.number(),
  storeItemId: z.number(),
  userId: z.number(),
  creatorId: z.number(),
  pointsSpent: z.number(),
  status: z.enum(['pending', 'completed']),
  createdAt: z.date(),
  completedAt: z.date().nullable(),
  // Additional fields for display
  userUsername: z.string(),
  userEmail: z.string(),
  storeItemTitle: z.string(),
  storeItemDescription: z.string(),
});

export type StoreItem = typeof storeItems.$inferSelect;
export type InsertStoreItem = z.infer<typeof insertStoreItemSchema>;
export type UpdateStoreItem = z.infer<typeof updateStoreItemSchema>;
export type StoreItemResponse = z.infer<typeof storeItemResponseSchema>;

export type StoreRedemption = typeof storeRedemptions.$inferSelect;
export type InsertStoreRedemption = z.infer<typeof insertStoreRedemptionSchema>;
export type StoreRedemptionResponse = z.infer<typeof storeRedemptionResponseSchema>;

// Video planning template table
export const videoTemplates = pgTable("video_templates", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").notNull().references(() => ideas.id, { onDelete: 'cascade' }).unique(),
  pointsToCover: text("points_to_cover").array().notNull().default([]),
  visualsNeeded: text("visuals_needed").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Video template schemas
export const insertVideoTemplateSchema = createInsertSchema(videoTemplates).pick({
  ideaId: true,
  pointsToCover: true,
  visualsNeeded: true,
}).extend({
  pointsToCover: z.array(z.string()).default([]),
  visualsNeeded: z.array(z.string()).default([]),
});

export const updateVideoTemplateSchema = z.object({
  pointsToCover: z.array(z.string()),
  visualsNeeded: z.array(z.string()),
});

export const videoTemplateResponseSchema = z.object({
  id: z.number(),
  ideaId: z.number(),
  pointsToCover: z.array(z.string()),
  visualsNeeded: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type VideoTemplate = typeof videoTemplates.$inferSelect;
export type InsertVideoTemplate = z.infer<typeof insertVideoTemplateSchema>;
export type UpdateVideoTemplate = z.infer<typeof updateVideoTemplateSchema>;
export type VideoTemplateResponse = z.infer<typeof videoTemplateResponseSchema>;
