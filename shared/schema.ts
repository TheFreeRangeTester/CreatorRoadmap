import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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
});

export const userResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
});

// Idea schemas
export const insertIdeaSchema = createInsertSchema(ideas).pick({
  title: true,
  description: true,
}).extend({
  title: z.string().min(1, { message: "Title is required" }).max(100, { message: "Title must be 100 characters or less" }),
  description: z.string().max(280, { message: "Description must be 280 characters or less" }),
});

export const updateIdeaSchema = insertIdeaSchema;

export const ideaResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  votes: z.number(),
  createdAt: z.date(),
  creatorId: z.number(),
  position: z.object({
    current: z.number().nullable(),
    previous: z.number().nullable(),
    change: z.number().nullable(),
  }),
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
  .partial();

export const publicLinkResponseSchema = z.object({
  id: z.number(),
  token: z.string(),
  creatorId: z.number(),
  createdAt: z.date(),
  isActive: z.boolean(),
  expiresAt: z.date().nullable(),
  url: z.string(), // Full shareable URL 
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserResponse = z.infer<typeof userResponseSchema>;

export type InsertIdea = z.infer<typeof insertIdeaSchema>;
export type UpdateIdea = z.infer<typeof updateIdeaSchema>;
export type Idea = typeof ideas.$inferSelect;
export type IdeaResponse = z.infer<typeof ideaResponseSchema>;

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

export type InsertPublicLink = z.infer<typeof insertPublicLinkSchema>;
export type PublicLink = typeof publicLinks.$inferSelect;
export type PublicLinkResponse = z.infer<typeof publicLinkResponseSchema>;
