import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
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
  email: z.string().optional(), // Eliminada la validación de email
});

// Idea schemas
export const insertIdeaSchema = createInsertSchema(ideas).pick({
  title: true,
  description: true,
}).extend({
  title: z.string().min(1, { message: "Title is required" }).max(100, { message: "Title must be 100 characters or less" }),
  description: z.string().max(280, { message: "Description must be 280 characters or less" }),
});

// Schema específico para sugerir ideas a un creador
export const suggestIdeaSchema = createInsertSchema(ideas).pick({
  title: true,
  description: true,
}).extend({
  title: z.string().min(1, { message: "Title is required" }).max(100, { message: "Title must be 100 characters or less" }),
  description: z.string().max(280, { message: "Description must be 280 characters or less" }),
  creatorId: z.number(), // ID del creador a quien se sugiere la idea
});

export const updateIdeaSchema = insertIdeaSchema;

export const ideaResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
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
