import { ideas, users, votes, publicLinks, 
  type User, type InsertUser, type Idea, type InsertIdea, type UpdateIdea, 
  type Vote, type InsertVote, type PublicLink, type InsertPublicLink, type PublicLinkResponse } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { randomBytes } from "crypto";
import { eq, desc, and, asc, sql } from "drizzle-orm";
import { IStorage, IdeaWithPosition } from "./storage";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Idea methods
  async getIdeas(): Promise<Idea[]> {
    return db.select().from(ideas).orderBy(desc(ideas.votes));
  }

  async getIdea(id: number): Promise<Idea | undefined> {
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
    return idea;
  }

  async createIdea(insertIdea: InsertIdea, creatorId: number): Promise<Idea> {
    const now = new Date();
    
    // Count existing ideas for positioning
    const result = await db.select({ count: sql<number>`count(*)` }).from(ideas);
    const ideasCount = result[0].count;
    
    const ideaToInsert = {
      ...insertIdea,
      votes: 0,
      creatorId,
      createdAt: now,
      lastPositionUpdate: now,
      currentPosition: ideasCount + 1,
      previousPosition: null,
    };
    
    const [idea] = await db.insert(ideas).values(ideaToInsert).returning();
    
    // Update positions after adding new idea
    await this.updatePositions();
    
    return idea;
  }

  async updateIdea(id: number, updateData: UpdateIdea): Promise<Idea | undefined> {
    const [idea] = await db
      .update(ideas)
      .set({
        title: updateData.title,
        description: updateData.description,
      })
      .where(eq(ideas.id, id))
      .returning();
    
    return idea;
  }

  async deleteIdea(id: number): Promise<void> {
    // First, delete any votes for this idea
    await db.delete(votes).where(eq(votes.ideaId, id));
    
    // Then delete the idea itself
    await db.delete(ideas).where(eq(ideas.id, id));
    
    // Update positions after deleting an idea
    await this.updatePositions();
  }

  // Vote methods
  async getVoteByUserOrSession(ideaId: number, userId?: number, sessionId?: string): Promise<Vote | undefined> {
    if (userId) {
      const [vote] = await db
        .select()
        .from(votes)
        .where(and(eq(votes.ideaId, ideaId), eq(votes.userId, userId)));
      
      if (vote) return vote;
    }
    
    if (sessionId) {
      const [vote] = await db
        .select()
        .from(votes)
        .where(and(eq(votes.ideaId, ideaId), eq(votes.sessionId, sessionId)));
      
      return vote;
    }
    
    return undefined;
  }

  async createVote(vote: InsertVote, userId?: number, sessionId?: string): Promise<Vote> {
    const [newVote] = await db
      .insert(votes)
      .values({
        ...vote,
        userId: userId || null,
        sessionId: sessionId || null,
        votedAt: new Date(),
      })
      .returning();
    
    // Increment the idea vote count
    await this.incrementVote(vote.ideaId);
    
    return newVote;
  }

  async incrementVote(ideaId: number): Promise<void> {
    await db
      .update(ideas)
      .set({
        votes: sql`${ideas.votes} + 1`
      })
      .where(eq(ideas.id, ideaId));
    
    // Update positions after vote changes
    await this.updatePositions();
  }

  // Position methods
  async updatePositions(): Promise<void> {
    // Get all ideas sorted by votes
    const sortedIdeas = await db
      .select()
      .from(ideas)
      .orderBy(desc(ideas.votes), asc(ideas.createdAt));
    
    // Update positions for each idea
    for (let i = 0; i < sortedIdeas.length; i++) {
      const idea = sortedIdeas[i];
      const position = i + 1;
      
      await db
        .update(ideas)
        .set({
          previousPosition: idea.currentPosition,
          currentPosition: position,
          lastPositionUpdate: new Date()
        })
        .where(eq(ideas.id, idea.id));
    }
  }

  // Get ideas with formatted position data for the API response
  async getIdeasWithPositions(): Promise<IdeaWithPosition[]> {
    const allIdeas = await db
      .select()
      .from(ideas)
      .orderBy(desc(ideas.votes), asc(ideas.createdAt));
    
    return allIdeas.map(idea => ({
      id: idea.id,
      title: idea.title,
      description: idea.description,
      votes: idea.votes,
      createdAt: idea.createdAt,
      creatorId: idea.creatorId,
      position: {
        current: idea.currentPosition,
        previous: idea.previousPosition,
        change: idea.previousPosition && idea.currentPosition
          ? idea.previousPosition - idea.currentPosition 
          : null
      }
    }));
  }

  // Public link methods
  async createPublicLink(creatorId: number, options?: InsertPublicLink): Promise<PublicLinkResponse> {
    // Generate a secure random token (16 bytes in hex = 32 characters)
    const token = randomBytes(16).toString('hex');
    const now = new Date();

    let expiresAt = null;
    if (options?.expiresAt) {
      expiresAt = new Date(options.expiresAt);
    }
    
    const [publicLink] = await db
      .insert(publicLinks)
      .values({
        token,
        creatorId,
        createdAt: now,
        isActive: true,
        expiresAt
      })
      .returning();
    
    // Create the full URL for sharing
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const url = `${baseUrl}/l/${token}`;
    
    return {
      ...publicLink,
      url
    };
  }
  
  async getPublicLinkByToken(token: string): Promise<PublicLink | undefined> {
    const [link] = await db
      .select()
      .from(publicLinks)
      .where(eq(publicLinks.token, token));
    
    return link;
  }
  
  async getUserPublicLinks(creatorId: number): Promise<PublicLinkResponse[]> {
    const userLinks = await db
      .select()
      .from(publicLinks)
      .where(eq(publicLinks.creatorId, creatorId));
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    
    return userLinks.map(link => ({
      ...link,
      url: `${baseUrl}/l/${link.token}`
    }));
  }
  
  async togglePublicLinkStatus(id: number, isActive: boolean): Promise<PublicLink | undefined> {
    const [updatedLink] = await db
      .update(publicLinks)
      .set({ isActive })
      .where(eq(publicLinks.id, id))
      .returning();
    
    return updatedLink;
  }
  
  async deletePublicLink(id: number): Promise<void> {
    await db.delete(publicLinks).where(eq(publicLinks.id, id));
  }
}