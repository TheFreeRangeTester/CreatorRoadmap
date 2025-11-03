import {
  ideas, users, votes, publicLinks, userPoints, pointTransactions, storeItems, storeRedemptions, videoTemplates, nicheStats,
  type User, type InsertUser, type Idea, type InsertIdea, type UpdateIdea, type SuggestIdea,
  type Vote, type InsertVote, type PublicLink, type InsertPublicLink, type PublicLinkResponse,
  type UpdateProfile, type UpdateSubscription, type UserPointsResponse, type InsertPointTransaction,
  type PointTransactionResponse, type StoreItem, type InsertStoreItem, type UpdateStoreItem,
  type StoreItemResponse, type StoreRedemption, type InsertStoreRedemption, type StoreRedemptionResponse,
  type VideoTemplate, type InsertVideoTemplate, type UpdateVideoTemplate, type VideoTemplateResponse,
  type NicheStat
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { randomBytes } from "crypto";
import { eq, desc, and, asc, sql, or } from "drizzle-orm";
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
    const [user] = await db.select().from(users).where(eq(sql`LOWER(${users.username})`, username.toLowerCase()));
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

  async getIdeasByCreator(creatorId: number): Promise<Idea[]> {
    return db.select().from(ideas).where(eq(ideas.creatorId, creatorId)).orderBy(desc(ideas.votes));
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
      description: suggestion.description || "", // Usar cadena vacía si no se proporciona descripción
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
        niche: updateData.niche,
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
        niche: idea.niche,
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

  // Subscription methods
  async updateUserSubscription(id: number, subscriptionData: UpdateSubscription): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(subscriptionData)
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  async startUserTrial(id: number): Promise<User | undefined> {
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 días

    const [updatedUser] = await db
      .update(users)
      .set({
        subscriptionStatus: 'trial',
        hasUsedTrial: true,
        trialStartDate: now,
        trialEndDate: trialEndDate
      })
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, stripeCustomerId));

    return user;
  }

  async getUserAudienceStats(userId: number): Promise<{ votesGiven: number; ideasSuggested: number; ideasApproved: number; }> {
    // Count votes given by user
    const votesResult = await db.select({ count: sql<number>`count(*)` })
      .from(votes)
      .where(eq(votes.userId, userId));

    // Count ideas suggested by user
    const suggestedResult = await db.select({ count: sql<number>`count(*)` })
      .from(ideas)
      .where(eq(ideas.suggestedBy, userId));

    // Count approved ideas suggested by user
    const approvedResult = await db.select({ count: sql<number>`count(*)` })
      .from(ideas)
      .where(and(eq(ideas.suggestedBy, userId), eq(ideas.status, 'approved')));

    return {
      votesGiven: votesResult[0]?.count || 0,
      ideasSuggested: suggestedResult[0]?.count || 0,
      ideasApproved: approvedResult[0]?.count || 0,
    };
  }

  async getUserIdeaQuota(userId: number): Promise<{ count: number; limit: number; hasReachedLimit: boolean; }> {
    // Obtener información del usuario para verificar si tiene premium
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verificar si el usuario tiene acceso premium
    const { hasActivePremiumAccess } = await import('@shared/premium-utils');
    const hasPremium = hasActivePremiumAccess({
      subscriptionStatus: user.subscriptionStatus as "free" | "trial" | "premium" | "canceled",
      trialEndDate: user.trialEndDate,
      subscriptionEndDate: user.subscriptionEndDate
    });

    // Usuarios premium tienen límite ilimitado (representado como 999999)
    const limit = hasPremium ? 999999 : 10;

    // Contar ideas creadas por el usuario (incluyendo aprobadas y pendientes, pero no rechazadas)
    const [{ count: ideaCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ideas)
      .where(and(
        eq(ideas.creatorId, userId),
        or(
          eq(ideas.status, 'approved'),
          eq(ideas.status, 'pending')
        )
      ));

    const count = Number(ideaCount) || 0;
    const hasReachedLimit = !hasPremium && count >= limit;

    return {
      count,
      limit,
      hasReachedLimit
    };
  }

  // Points operations
  async getUserPoints(userId: number, creatorId: number): Promise<UserPointsResponse> {
    const [userPointsRecord] = await db
      .select()
      .from(userPoints)
      .where(and(
        eq(userPoints.userId, userId),
        eq(userPoints.creatorId, creatorId)
      ));

    if (!userPointsRecord) {
      // Create initial points record if it doesn't exist
      return await this.createUserPoints(userId, creatorId);
    }

    return {
      userId: userPointsRecord.userId,
      totalPoints: userPointsRecord.totalPoints,
      pointsEarned: userPointsRecord.pointsEarned,
      pointsSpent: userPointsRecord.pointsSpent,
    };
  }

  async createUserPoints(userId: number, creatorId: number): Promise<UserPointsResponse> {
    const [newUserPoints] = await db
      .insert(userPoints)
      .values({
        userId,
        creatorId,
        totalPoints: 0,
        pointsEarned: 0,
        pointsSpent: 0
      })
      .returning();

    return {
      userId: newUserPoints.userId,
      totalPoints: newUserPoints.totalPoints,
      pointsEarned: newUserPoints.pointsEarned,
      pointsSpent: newUserPoints.pointsSpent,
    };
  }

  async updateUserPoints(userId: number, creatorId: number, pointsChange: number, type: 'earned' | 'spent', reason: string, relatedId?: number): Promise<UserPointsResponse> {
    // Get current points or create if doesn't exist
    let currentPoints = await this.getUserPoints(userId, creatorId);

    const updateData: any = { updatedAt: new Date() };

    if (type === 'earned') {
      updateData.totalPoints = currentPoints.totalPoints + pointsChange;
      updateData.pointsEarned = currentPoints.pointsEarned + pointsChange;
    } else { // spent
      updateData.totalPoints = currentPoints.totalPoints - pointsChange;
      updateData.pointsSpent = currentPoints.pointsSpent + pointsChange;
    }

    // Update points in transaction
    await db.transaction(async (tx) => {
      // Update user points
      await tx
        .update(userPoints)
        .set(updateData)
        .where(and(
          eq(userPoints.userId, userId),
          eq(userPoints.creatorId, creatorId)
        ));

      // Record transaction
      await tx
        .insert(pointTransactions)
        .values({
          userId,
          creatorId,
          type,
          amount: pointsChange,
          reason,
          relatedId: relatedId || null,
        });
    });

    // Return updated points
    return await this.getUserPoints(userId, creatorId);
  }

  async getUserPointTransactions(userId: number, creatorId: number, limit: number = 50): Promise<PointTransactionResponse[]> {
    const transactions = await db
      .select()
      .from(pointTransactions)
      .where(and(
        eq(pointTransactions.userId, userId),
        eq(pointTransactions.creatorId, creatorId)
      ))
      .orderBy(desc(pointTransactions.createdAt))
      .limit(limit);

    return transactions.map(t => ({
      id: t.id,
      userId: t.userId,
      creatorId: t.creatorId,
      type: t.type as 'earned' | 'spent',
      amount: t.amount,
      reason: t.reason,
      relatedId: t.relatedId,
      createdAt: t.createdAt,
    }));
  }

  // Store operations
  async getStoreItems(creatorId: number): Promise<StoreItemResponse[]> {
    const items = await db
      .select()
      .from(storeItems)
      .where(eq(storeItems.creatorId, creatorId))
      .orderBy(desc(storeItems.createdAt));

    return items.map(item => ({
      ...item,
      isAvailable: item.isActive && (item.maxQuantity === null || item.currentQuantity < item.maxQuantity)
    }));
  }

  async getStoreItem(id: number): Promise<StoreItem | undefined> {
    const [item] = await db
      .select()
      .from(storeItems)
      .where(eq(storeItems.id, id));
    return item;
  }

  async createStoreItem(item: InsertStoreItem, creatorId: number): Promise<StoreItemResponse> {
    const [storeItem] = await db
      .insert(storeItems)
      .values({
        ...item,
        creatorId,
        currentQuantity: 0,
        isActive: true,
      })
      .returning();

    return {
      ...storeItem,
      isAvailable: true
    };
  }

  async updateStoreItem(id: number, item: UpdateStoreItem): Promise<StoreItemResponse | undefined> {
    const [updatedItem] = await db
      .update(storeItems)
      .set({
        ...item,
        updatedAt: new Date(),
      })
      .where(eq(storeItems.id, id))
      .returning();

    if (!updatedItem) return undefined;

    return {
      ...updatedItem,
      isAvailable: updatedItem.isActive && (updatedItem.maxQuantity === null || updatedItem.currentQuantity < updatedItem.maxQuantity)
    };
  }

  async deleteStoreItem(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      // Delete all redemptions for this item first
      await tx.delete(storeRedemptions).where(eq(storeRedemptions.storeItemId, id));
      // Then delete the item
      await tx.delete(storeItems).where(eq(storeItems.id, id));
    });
  }

  async getStoreRedemptions(creatorId: number, limit: number = 10, offset: number = 0, status?: 'pending' | 'completed'): Promise<{ redemptions: StoreRedemptionResponse[]; total: number; }> {
    // Build where conditions
    const whereConditions = [eq(storeRedemptions.creatorId, creatorId)];
    if (status) {
      whereConditions.push(eq(storeRedemptions.status, status));
    }

    // Get total count
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(storeRedemptions)
      .where(and(...whereConditions));

    const total = totalResult.count;

    // Get redemptions with user and store item data
    const redemptions = await db
      .select({
        id: storeRedemptions.id,
        storeItemId: storeRedemptions.storeItemId,
        userId: storeRedemptions.userId,
        creatorId: storeRedemptions.creatorId,
        pointsSpent: storeRedemptions.pointsSpent,
        status: storeRedemptions.status,
        createdAt: storeRedemptions.createdAt,
        completedAt: storeRedemptions.completedAt,
        userUsername: users.username,
        userEmail: users.email,
        storeItemTitle: storeItems.title,
        storeItemDescription: storeItems.description,
      })
      .from(storeRedemptions)
      .innerJoin(users, eq(storeRedemptions.userId, users.id))
      .innerJoin(storeItems, eq(storeRedemptions.storeItemId, storeItems.id))
      .where(and(...whereConditions))
      .orderBy(desc(storeRedemptions.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      redemptions: redemptions.map(r => ({
        ...r,
        status: r.status as 'pending' | 'completed'
      })),
      total
    };
  }

  async createStoreRedemption(redemption: InsertStoreRedemption, userId: number): Promise<StoreRedemptionResponse> {
    const result = await db.transaction(async (tx) => {
      // Get store item
      const [storeItem] = await tx
        .select()
        .from(storeItems)
        .where(eq(storeItems.id, redemption.storeItemId));

      if (!storeItem) {
        throw new Error('Store item not found');
      }

      // Check if item is available
      if (!storeItem.isActive || (storeItem.maxQuantity !== null && storeItem.currentQuantity >= storeItem.maxQuantity)) {
        throw new Error('Store item is not available');
      }

      // Create redemption
      const [newRedemption] = await tx
        .insert(storeRedemptions)
        .values({
          ...redemption,
          userId,
          creatorId: storeItem.creatorId,
          pointsSpent: storeItem.pointsCost,
          status: 'pending',
        })
        .returning();

      // Update store item quantity
      await tx
        .update(storeItems)
        .set({
          currentQuantity: storeItem.currentQuantity + 1,
          updatedAt: new Date(),
        })
        .where(eq(storeItems.id, storeItem.id));

      return { newRedemption, storeItem };
    });

    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    return {
      ...result.newRedemption,
      status: result.newRedemption.status as 'pending' | 'completed',
      userUsername: user?.username || 'Unknown',
      userEmail: user?.email || 'Unknown',
      storeItemTitle: result.storeItem.title,
      storeItemDescription: result.storeItem.description,
    };
  }

  async updateRedemptionStatus(id: number, status: 'pending' | 'completed'): Promise<StoreRedemptionResponse | undefined> {
    const [updatedRedemption] = await db
      .update(storeRedemptions)
      .set({
        status,
        completedAt: status === 'completed' ? new Date() : null,
      })
      .where(eq(storeRedemptions.id, id))
      .returning();

    if (!updatedRedemption) return undefined;

    // Get additional data for response
    const [redemptionData] = await db
      .select({
        userUsername: users.username,
        userEmail: users.email,
        storeItemTitle: storeItems.title,
        storeItemDescription: storeItems.description,
      })
      .from(storeRedemptions)
      .innerJoin(users, eq(storeRedemptions.userId, users.id))
      .innerJoin(storeItems, eq(storeRedemptions.storeItemId, storeItems.id))
      .where(eq(storeRedemptions.id, id));

    return {
      ...updatedRedemption,
      status: updatedRedemption.status as 'pending' | 'completed',
      userUsername: redemptionData?.userUsername || 'Unknown',
      userEmail: redemptionData?.userEmail || 'Unknown',
      storeItemTitle: redemptionData?.storeItemTitle || 'Unknown',
      storeItemDescription: redemptionData?.storeItemDescription || 'Unknown',
    };
  }

  // Video template methods
  async getVideoTemplate(ideaId: number): Promise<VideoTemplateResponse | undefined> {
    const [template] = await db
      .select()
      .from(videoTemplates)
      .where(eq(videoTemplates.ideaId, ideaId));

    return template;
  }

  async createVideoTemplate(insertTemplate: InsertVideoTemplate): Promise<VideoTemplateResponse> {
    const [template] = await db
      .insert(videoTemplates)
      .values(insertTemplate)
      .returning();

    return template;
  }

  async updateVideoTemplate(ideaId: number, updateData: UpdateVideoTemplate): Promise<VideoTemplateResponse | undefined> {
    const [template] = await db
      .update(videoTemplates)
      .set({
        pointsToCover: updateData.pointsToCover,
        visualsNeeded: updateData.visualsNeeded,
        updatedAt: new Date(),
      })
      .where(eq(videoTemplates.ideaId, ideaId))
      .returning();

    return template;
  }

  async deleteVideoTemplate(ideaId: number): Promise<void> {
    await db.delete(videoTemplates).where(eq(videoTemplates.ideaId, ideaId));
  }

  async incrementNicheStats(creatorId: number, niche: string, votes: number = 1): Promise<void> {
    const [existing] = await db
      .select()
      .from(nicheStats)
      .where(and(eq(nicheStats.creatorId, creatorId), eq(nicheStats.niche, niche)));

    if (existing) {
      await db
        .update(nicheStats)
        .set({
          totalVotes: existing.totalVotes + votes,
          updatedAt: new Date(),
        })
        .where(eq(nicheStats.id, existing.id));
    } else {
      await db.insert(nicheStats).values({
        creatorId,
        niche,
        totalVotes: votes,
      });
    }
  }

  async getTopNiche(creatorId: number): Promise<{ name: string; votes: number } | null> {
    const [topNiche] = await db
      .select()
      .from(nicheStats)
      .where(eq(nicheStats.creatorId, creatorId))
      .orderBy(desc(nicheStats.totalVotes))
      .limit(1);

    if (!topNiche) {
      return null;
    }

    return {
      name: topNiche.niche,
      votes: topNiche.totalVotes,
    };
  }

  async getTopNiches(creatorId: number, limit: number = 2): Promise<{ name: string; votes: number }[]> {
    const topNiches = await db
      .select()
      .from(nicheStats)
      .where(eq(nicheStats.creatorId, creatorId))
      .orderBy(desc(nicheStats.totalVotes))
      .limit(limit);

    console.log(`[GET-TOP-NICHES] Found ${topNiches.length} niches for creator ${creatorId}:`, topNiches);

    return topNiches.map(niche => ({
      name: niche.niche,
      votes: niche.totalVotes,
    }));
  }
}