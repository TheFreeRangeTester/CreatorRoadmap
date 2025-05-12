import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Podría estar vacío para usuarios de Google
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
  // Campos para autenticación con Google
  email: text("email").unique(),
  googleId: text("google_id").unique(),
  isGoogleUser: boolean("is_google_user").default(false),
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
}).extend({
  // Campos opcionales para autenticación con Google
  userRole: z.enum(['creator', 'audience']).default('audience'),
  email: z.string().email().optional(),
  googleId: z.string().optional(),
  isGoogleUser: z.boolean().optional(),
  logoUrl: z.string().optional(), // Para la foto de perfil de Google
  profileDescription: z.string().optional(), // Para descripción inicial
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
  // Campos de Google
  email: z.string().email().optional(),
  isGoogleUser: z.boolean().optional().default(false),
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
  logoUrl: z.string().url({ message: "Debe ser una URL válida" }).optional().nullable(),
  twitterUrl: z.string().url({ message: "Debe ser una URL válida" }).optional().nullable(),
  instagramUrl: z.string().url({ message: "Debe ser una URL válida" }).optional().nullable(),
  youtubeUrl: z.string().url({ message: "Debe ser una URL válida" }).optional().nullable(),
  tiktokUrl: z.string().url({ message: "Debe ser una URL válida" }).optional().nullable(), 
  threadsUrl: z.string().url({ message: "Debe ser una URL válida" }).optional().nullable(),
  websiteUrl: z.string().url({ message: "Debe ser una URL válida" }).optional().nullable(),
  profileBackground: z.string().optional().nullable(),
  // Campo para actualizar el rol
  userRole: z.enum(['creator', 'audience']).optional(),
  // Campos adicionales para Google
  googleId: z.string().optional(),
  email: z.string().email().optional(),
  isGoogleUser: z.boolean().optional(),
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

export type InsertPublicLink = z.infer<typeof insertPublicLinkSchema>;
export type PublicLink = typeof publicLinks.$inferSelect;
export type PublicLinkResponse = z.infer<typeof publicLinkResponseSchema>;
