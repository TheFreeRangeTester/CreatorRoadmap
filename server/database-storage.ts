import { ideas, users, votes, publicLinks, 
  type User, type InsertUser, type Idea, type InsertIdea, type UpdateIdea, type SuggestIdea,
  type Vote, type InsertVote, type PublicLink, type InsertPublicLink, type PublicLinkResponse,
  type UpdateProfile } from "@shared/schema";
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUserProfile(id: number, profileData: UpdateProfile): Promise<User | undefined> {
    // Obtener el usuario actual
    const [currentUser] = await db.select().from(users).where(eq(users.id, id));
    if (!currentUser) return undefined;
    
    // Actualizar sólo los campos proporcionados
    const [updatedUser] = await db
      .update(users)
      .set({
        profileDescription: profileData.profileDescription ?? currentUser.profileDescription,
        logoUrl: profileData.logoUrl !== undefined ? profileData.logoUrl : currentUser.logoUrl,
        twitterUrl: profileData.twitterUrl !== undefined ? profileData.twitterUrl : currentUser.twitterUrl,
        instagramUrl: profileData.instagramUrl !== undefined ? profileData.instagramUrl : currentUser.instagramUrl,
        youtubeUrl: profileData.youtubeUrl !== undefined ? profileData.youtubeUrl : currentUser.youtubeUrl,
        tiktokUrl: profileData.tiktokUrl !== undefined ? profileData.tiktokUrl : currentUser.tiktokUrl,
        threadsUrl: profileData.threadsUrl !== undefined ? profileData.threadsUrl : currentUser.threadsUrl,
        websiteUrl: profileData.websiteUrl !== undefined ? profileData.websiteUrl : currentUser.websiteUrl,
        profileBackground: profileData.profileBackground ?? currentUser.profileBackground,
        // Campos de rol
        userRole: profileData.userRole ?? currentUser.userRole,
        // Email field
        email: profileData.email !== undefined ? profileData.email : currentUser.email
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, id))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error("Error updating user password:", error);
      throw error;
    }
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
    
    // Nueva idea con 0 votos y posiciones en null inicialmente
    const ideaToInsert = {
      ...insertIdea,
      votes: 0,
      creatorId,
      createdAt: now,
      lastPositionUpdate: now,
      currentPosition: null,  // Inicialmente null
      previousPosition: null, // Siempre null para ideas nuevas
      status: 'approved',     // Por defecto las ideas creadas por el creador están aprobadas
      suggestedBy: null       // No es una idea sugerida
    };
    
    // Insertar la idea con posiciones en null
    const [idea] = await db.insert(ideas).values(ideaToInsert).returning();
    
    // Actualizar posiciones de todas las ideas, incluida la nueva
    await this.updatePositions();
    
    // Obtener la idea actualizada para devolverla
    const [updatedIdea] = await db.select().from(ideas).where(eq(ideas.id, idea.id));
    
    return updatedIdea;
  }
  
  async suggestIdea(suggestion: SuggestIdea, suggestedBy: number): Promise<Idea> {
    const now = new Date();
    
    // Nueva idea sugerida con 0 votos, estado pendiente y usuario que la sugiere
    const ideaToInsert = {
      title: suggestion.title,
      description: suggestion.description,
      votes: 0,
      creatorId: suggestion.creatorId,  // ID del creador a quien se le sugiere
      createdAt: now,
      lastPositionUpdate: now,
      currentPosition: null,
      previousPosition: null,
      status: 'pending',      // Las ideas sugeridas inician como pendientes
      suggestedBy: suggestedBy // ID del usuario que la sugirió
    };
    
    // Insertar la idea sugerida
    const [idea] = await db.insert(ideas).values(ideaToInsert).returning();
    
    return idea;
  }
  
  async approveIdea(id: number): Promise<Idea | undefined> {
    // Actualizar el estado de la idea a 'approved'
    const [idea] = await db
      .update(ideas)
      .set({ status: 'approved' })
      .where(eq(ideas.id, id))
      .returning();
    
    if (idea) {
      // Después de aprobar, actualizar posiciones
      await this.updatePositions();
      
      // Obtener la idea actualizada
      const [updatedIdea] = await db.select().from(ideas).where(eq(ideas.id, id));
      return updatedIdea;
    }
    
    return undefined;
  }
  
  async getPendingIdeas(creatorId: number): Promise<Idea[]> {
    // Obtener todas las ideas pendientes para un creador
    return db
      .select()
      .from(ideas)
      .where(and(
        eq(ideas.creatorId, creatorId),
        eq(ideas.status, 'pending')
      ));
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
    // Ahora únicamente verificamos por userId, ya que todos los votos requieren autenticación
    if (userId) {
      const [vote] = await db
        .select()
        .from(votes)
        .where(and(eq(votes.ideaId, ideaId), eq(votes.userId, userId)));
      
      return vote;
    }
    
    return undefined;
  }

  async createVote(vote: InsertVote, userId?: number, sessionId?: string): Promise<Vote> {
    // Ahora requerimos un userId para todos los votos
    if (!userId) {
      throw new Error("User ID is required to vote");
    }
    
    const [newVote] = await db
      .insert(votes)
      .values({
        ...vote,
        userId: userId,
        sessionId: null, // Ya no usamos sessión para votar
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
    
    // Convertir ideas a IdeaWithPosition con información del sugeridor
    const ideasWithPosition = await Promise.all(allIdeas.map(async idea => {
      // Obtener el nombre de usuario del que sugirió la idea, si existe
      let suggestedByUsername = undefined;
      if (idea.suggestedBy) {
        const [suggester] = await db
          .select()
          .from(users)
          .where(eq(users.id, idea.suggestedBy));
        
        if (suggester) {
          suggestedByUsername = suggester.username;
        }
      }
      
      return {
        id: idea.id,
        title: idea.title,
        description: idea.description,
        votes: idea.votes,
        createdAt: idea.createdAt,
        creatorId: idea.creatorId,
        status: idea.status,
        suggestedBy: idea.suggestedBy,
        suggestedByUsername,
        position: {
          current: idea.currentPosition,
          previous: idea.previousPosition,
          // Si no hay posición previa o es igual a la actual, el cambio es 0 (sin cambio)
          change: idea.previousPosition && idea.currentPosition && idea.previousPosition !== idea.currentPosition
            ? idea.previousPosition - idea.currentPosition 
            : 0
        }
      };
    }));
    
    return ideasWithPosition;
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
    const protocol = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
    const baseUrl = process.env.REPL_SLUG ? `${protocol}${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000';
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