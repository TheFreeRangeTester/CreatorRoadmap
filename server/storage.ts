import {
  ideas as ideasTable, users, votes as votesTable, publicLinks as publicLinksTable,
  type User, type InsertUser, type Idea, type InsertIdea, type UpdateIdea, type SuggestIdea,
  type Vote, type InsertVote, type PublicLink, type InsertPublicLink, type PublicLinkResponse,
  type UpdateProfile, type UpdateSubscription, type UserPointsResponse, type InsertPointTransaction,
  type PointTransactionResponse, type StoreItem, type InsertStoreItem, type UpdateStoreItem,
  type StoreItemResponse, type StoreRedemption, type InsertStoreRedemption, type StoreRedemptionResponse
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomBytes } from "crypto";

const MemoryStore = createMemoryStore(session);

// Interface defining all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, profileData: UpdateProfile): Promise<User | undefined>;
  updateUserPassword(id: number, hashedPassword: string): Promise<User | undefined>;

  // Idea operations
  getIdeas(): Promise<Idea[]>;
  getIdea(id: number): Promise<Idea | undefined>;
  getIdeasByCreator(creatorId: number): Promise<Idea[]>;
  createIdea(idea: InsertIdea, creatorId: number): Promise<Idea>;
  updateIdea(id: number, idea: UpdateIdea): Promise<Idea | undefined>;
  deleteIdea(id: number): Promise<void>;

  // Idea suggestion operations
  suggestIdea(suggestion: SuggestIdea, suggestedBy: number): Promise<Idea>;
  approveIdea(id: number): Promise<Idea | undefined>;
  getPendingIdeas(creatorId: number): Promise<Idea[]>;

  // Vote operations
  getVoteByUserOrSession(ideaId: number, userId?: number, sessionId?: string): Promise<Vote | undefined>;
  createVote(vote: InsertVote, userId?: number, sessionId?: string): Promise<Vote>;
  incrementVote(ideaId: number): Promise<void>;

  // Position operations
  updatePositions(): Promise<void>;

  // Public link operations
  createPublicLink(creatorId: number, options?: InsertPublicLink): Promise<PublicLinkResponse>;
  getPublicLinkByToken(token: string): Promise<PublicLink | undefined>;
  getUserPublicLinks(creatorId: number): Promise<PublicLinkResponse[]>;
  togglePublicLinkStatus(id: number, isActive: boolean): Promise<PublicLink | undefined>;
  deletePublicLink(id: number): Promise<void>;

  // Subscription operations
  updateUserSubscription(id: number, subscriptionData: UpdateSubscription): Promise<User | undefined>;
  startUserTrial(id: number): Promise<User | undefined>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;

  // Audience stats operations
  getUserAudienceStats(userId: number): Promise<{ votesGiven: number; ideasSuggested: number; ideasApproved: number; }>;

  // Idea quota operations
  getUserIdeaQuota(userId: number): Promise<{ count: number; limit: number; hasReachedLimit: boolean; }>;

  // Points operations (per creator)
  getUserPoints(userId: number, creatorId: number): Promise<UserPointsResponse>;
  createUserPoints(userId: number, creatorId: number): Promise<UserPointsResponse>;
  updateUserPoints(userId: number, creatorId: number, pointsChange: number, type: 'earned' | 'spent', reason: string, relatedId?: number): Promise<UserPointsResponse>;
  getUserPointTransactions(userId: number, creatorId: number, limit?: number): Promise<PointTransactionResponse[]>;

  // Store operations
  getStoreItems(creatorId: number): Promise<StoreItemResponse[]>;
  getStoreItem(id: number): Promise<StoreItem | undefined>;
  createStoreItem(item: InsertStoreItem, creatorId: number): Promise<StoreItemResponse>;
  updateStoreItem(id: number, item: UpdateStoreItem): Promise<StoreItemResponse | undefined>;
  deleteStoreItem(id: number): Promise<void>;

  // Store redemption operations
  getStoreRedemptions(creatorId: number, limit?: number, offset?: number, status?: 'pending' | 'completed'): Promise<{ redemptions: StoreRedemptionResponse[]; total: number; }>;
  createStoreRedemption(redemption: InsertStoreRedemption, userId: number): Promise<StoreRedemptionResponse>;
  updateRedemptionStatus(id: number, status: 'pending' | 'completed'): Promise<StoreRedemptionResponse | undefined>;

  // Session store
  sessionStore: any;
}

export interface IdeaWithPosition {
  id: number;
  title: string;
  description: string;
  votes: number;
  createdAt: Date;
  creatorId: number;
  status: string;
  suggestedBy: number | null;
  suggestedByUsername?: string;
  position: {
    current: number | null;
    previous: number | null;
    change: number | null;
  };
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ideas: Map<number, Idea>;
  private votes: Map<number, Vote>;
  private publicLinks: Map<number, PublicLink>;
  private userPointsMap: Map<number, UserPointsResponse>;
  private pointTransactionsMap: Map<number, PointTransactionResponse>;
  private storeItems: Map<number, StoreItem>;
  private storeRedemptions: Map<number, StoreRedemption>;
  private audienceStatsMap: Map<number, { votesGiven: number; ideasSuggested: number; ideasApproved: number }>;
  currentUserId: number;
  currentIdeaId: number;
  currentVoteId: number;
  currentPublicLinkId: number;
  currentPointTransactionId: number;
  currentStoreItemId: number;
  currentStoreRedemptionId: number;
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.ideas = new Map();
    this.votes = new Map();
    this.publicLinks = new Map();
    this.userPointsMap = new Map();
    this.pointTransactionsMap = new Map();
    this.storeItems = new Map();
    this.storeRedemptions = new Map();
    this.audienceStatsMap = new Map();
    this.currentUserId = 1;
    this.currentIdeaId = 1;
    this.currentVoteId = 1;
    this.currentPublicLinkId = 1;
    this.currentPointTransactionId = 1;
    this.currentStoreItemId = 1;
    this.currentStoreRedemptionId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });

    // Initialize with demo data
    this.initializeDemoData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      profileDescription: insertUser.profileDescription || null,
      logoUrl: insertUser.logoUrl || null,
      twitterUrl: null,
      instagramUrl: null,
      youtubeUrl: null,
      tiktokUrl: null,
      threadsUrl: null,
      websiteUrl: null,
      profileBackground: "gradient-1",
      email: insertUser.email,
      // Subscription fields
      subscriptionStatus: 'free',
      hasUsedTrial: false,
      trialStartDate: null,
      trialEndDate: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionPlan: null,
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      subscriptionCanceledAt: null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserProfile(id: number, profileData: UpdateProfile): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      profileDescription: profileData.profileDescription ?? user.profileDescription,
      logoUrl: profileData.logoUrl !== undefined ? profileData.logoUrl : user.logoUrl,
      twitterUrl: profileData.twitterUrl !== undefined ? profileData.twitterUrl : user.twitterUrl,
      instagramUrl: profileData.instagramUrl !== undefined ? profileData.instagramUrl : user.instagramUrl,
      youtubeUrl: profileData.youtubeUrl !== undefined ? profileData.youtubeUrl : user.youtubeUrl,
      tiktokUrl: profileData.tiktokUrl !== undefined ? profileData.tiktokUrl : user.tiktokUrl,
      threadsUrl: profileData.threadsUrl !== undefined ? profileData.threadsUrl : user.threadsUrl,
      websiteUrl: profileData.websiteUrl !== undefined ? profileData.websiteUrl : user.websiteUrl,
      profileBackground: profileData.profileBackground !== undefined ? profileData.profileBackground : user.profileBackground,
      // Campos de Google
      // No longer using Google ID
      email: profileData.email !== undefined ? profileData.email : user.email,
      // No longer using Google authentication
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      password: hashedPassword,
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Idea methods
  async getIdeas(): Promise<Idea[]> {
    return Array.from(this.ideas.values());
  }

  async getIdea(id: number): Promise<Idea | undefined> {
    return this.ideas.get(id);
  }

  async getIdeasByCreator(creatorId: number): Promise<Idea[]> {
    const allIdeas = Array.from(this.ideas.values());
    return allIdeas.filter(idea => idea.creatorId === creatorId);
  }

  async createIdea(insertIdea: InsertIdea, creatorId: number): Promise<Idea> {
    const id = this.currentIdeaId++;
    const now = new Date();

    // Nueva idea con posiciones en null inicialmente
    const idea: Idea = {
      ...insertIdea,
      id,
      votes: 0,
      createdAt: now,
      creatorId,
      lastPositionUpdate: now,
      currentPosition: null,  // Inicialmente null
      previousPosition: null, // Siempre null para ideas nuevas
      status: 'approved',     // Por defecto las ideas creadas por el creador están aprobadas
      suggestedBy: null       // No es una idea sugerida
    };

    // Insertar la idea con posiciones en null
    this.ideas.set(id, idea);

    // Actualizar posiciones de todas las ideas, incluida la nueva
    await this.updatePositions();

    // Obtener la idea actualizada con la nueva posición
    return this.ideas.get(id)!;
  }

  async updateIdea(id: number, updateData: UpdateIdea): Promise<Idea | undefined> {
    const idea = this.ideas.get(id);
    if (!idea) return undefined;

    const updatedIdea: Idea = {
      ...idea,
      title: updateData.title,
      description: updateData.description,
    };

    this.ideas.set(id, updatedIdea);
    return updatedIdea;
  }

  async deleteIdea(id: number): Promise<void> {
    this.ideas.delete(id);

    // Remove votes for this idea
    Array.from(this.votes.entries()).forEach(([voteId, vote]) => {
      if (vote.ideaId === id) {
        this.votes.delete(voteId);
      }
    });

    // Update positions after deleting an idea
    await this.updatePositions();
  }

  // Idea suggestion methods
  async suggestIdea(suggestion: SuggestIdea, suggestedBy: number): Promise<Idea> {
    const id = this.currentIdeaId++;
    const now = new Date();

    // Nueva idea sugerida
    const idea: Idea = {
      id,
      title: suggestion.title,
      description: suggestion.description,
      votes: 0,
      creatorId: suggestion.creatorId,
      createdAt: now,
      lastPositionUpdate: now,
      currentPosition: null,
      previousPosition: null,
      status: 'pending',
      suggestedBy: suggestedBy
    };

    this.ideas.set(id, idea);
    return idea;
  }

  async approveIdea(id: number): Promise<Idea | undefined> {
    const idea = this.ideas.get(id);
    if (!idea) return undefined;

    const updatedIdea: Idea = {
      ...idea,
      status: 'approved'
    };

    this.ideas.set(id, updatedIdea);

    // Actualizar posiciones después de aprobar
    await this.updatePositions();

    return updatedIdea;
  }

  async getPendingIdeas(creatorId: number): Promise<Idea[]> {
    return Array.from(this.ideas.values())
      .filter(idea => idea.creatorId === creatorId && idea.status === 'pending');
  }

  // Vote methods
  async getVoteByUserOrSession(ideaId: number, userId?: number, sessionId?: string): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(vote => {
      if (vote.ideaId !== ideaId) return false;
      if (userId && vote.userId === userId) return true;
      if (sessionId && vote.sessionId === sessionId) return true;
      return false;
    });
  }

  async createVote(vote: InsertVote, userId?: number, sessionId?: string): Promise<Vote> {
    const id = this.currentVoteId++;
    const newVote: Vote = {
      ...vote,
      id,
      userId: userId || null,
      sessionId: sessionId || null,
      votedAt: new Date(),
    };

    this.votes.set(id, newVote);

    // Increment the idea vote count
    await this.incrementVote(vote.ideaId);

    return newVote;
  }

  async incrementVote(ideaId: number): Promise<void> {
    const idea = this.ideas.get(ideaId);
    if (idea) {
      idea.votes += 1;
      this.ideas.set(ideaId, idea);

      // Update positions after vote changes
      await this.updatePositions();
    }
  }

  // Position methods
  async updatePositions(): Promise<void> {
    // Sort ideas by votes (descending)
    const sortedIdeas = Array.from(this.ideas.values()).sort((a, b) => b.votes - a.votes);

    // Update positions
    sortedIdeas.forEach((idea, index) => {
      const position = index + 1;
      const previousPosition = idea.currentPosition;

      this.ideas.set(idea.id, {
        ...idea,
        previousPosition: previousPosition,
        currentPosition: position,
        lastPositionUpdate: new Date()
      });
    });
  }

  // Get ideas with formatted position data for the API response
  async getIdeasWithPositions(): Promise<IdeaWithPosition[]> {
    const ideas = await this.getIdeas();
    const sortedIdeas = ideas.sort((a, b) => b.votes - a.votes);

    const ideasWithPosition = await Promise.all(sortedIdeas.map(async idea => {
      // Obtener el nombre de usuario del que sugirió la idea, si existe
      let suggestedByUsername = undefined;
      if (idea.suggestedBy) {
        const suggester = await this.getUser(idea.suggestedBy);
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
    const id = this.currentPublicLinkId++;
    const now = new Date();

    let expiresAt = null;
    if (options?.expiresAt) {
      expiresAt = new Date(options.expiresAt);
    }

    const publicLink: PublicLink = {
      id,
      token,
      creatorId,
      createdAt: now,
      isActive: true,
      expiresAt
    };

    this.publicLinks.set(id, publicLink);

    // Create the full URL for sharing
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const url = `${baseUrl}/l/${token}`;

    return {
      ...publicLink,
      url
    };
  }

  async getPublicLinkByToken(token: string): Promise<PublicLink | undefined> {
    return Array.from(this.publicLinks.values()).find(link => link.token === token);
  }

  async getUserPublicLinks(creatorId: number): Promise<PublicLinkResponse[]> {
    const userLinks = Array.from(this.publicLinks.values())
      .filter(link => link.creatorId === creatorId);

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    return userLinks.map(link => ({
      ...link,
      url: `${baseUrl}/l/${link.token}`
    }));
  }

  async togglePublicLinkStatus(id: number, isActive: boolean): Promise<PublicLink | undefined> {
    const link = this.publicLinks.get(id);
    if (!link) return undefined;

    const updatedLink: PublicLink = {
      ...link,
      isActive
    };

    this.publicLinks.set(id, updatedLink);
    return updatedLink;
  }

  async deletePublicLink(id: number): Promise<void> {
    this.publicLinks.delete(id);
  }

  // Subscription methods
  async updateUserSubscription(id: number, subscriptionData: UpdateSubscription): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...subscriptionData
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async startUserTrial(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 días

    const updatedUser: User = {
      ...user,
      subscriptionStatus: 'trial',
      hasUsedTrial: true,
      trialStartDate: now,
      trialEndDate: trialEndDate
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.stripeCustomerId === stripeCustomerId);
  }

  async getUserAudienceStats(userId: number): Promise<{ votesGiven: number; ideasSuggested: number; ideasApproved: number; }> {
    // Count votes given by user
    const votesGiven = Array.from(this.votes.values()).filter(vote => vote.userId === userId).length;

    // Count ideas suggested by user
    const ideasSuggested = Array.from(this.ideas.values()).filter(idea => idea.suggestedBy === userId).length;

    // Count approved ideas suggested by user
    const ideasApproved = Array.from(this.ideas.values()).filter(
      idea => idea.suggestedBy === userId && idea.status === 'approved'
    ).length;

    return {
      votesGiven,
      ideasSuggested,
      ideasApproved,
    };
  }

  async getUserIdeaQuota(userId: number): Promise<{ count: number; limit: number; hasReachedLimit: boolean; }> {
    // Obtener información del usuario para verificar si tiene premium
    const user = this.users.get(userId);
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
    const count = Array.from(this.ideas.values()).filter(idea =>
      idea.creatorId === userId && (idea.status === 'approved' || idea.status === 'pending')
    ).length;

    const hasReachedLimit = !hasPremium && count >= limit;

    return {
      count,
      limit,
      hasReachedLimit
    };
  }

  // Points operations
  async getUserPoints(userId: number, creatorId: number): Promise<UserPointsResponse> {
    const key = `${userId}-${creatorId}`;
    let userPoints = this.userPointsMap.get(key);
    if (!userPoints) {
      userPoints = await this.createUserPoints(userId, creatorId);
    }
    return userPoints;
  }

  async createUserPoints(userId: number, creatorId: number): Promise<UserPointsResponse> {
    const userPoints: UserPointsResponse = {
      userId,
      totalPoints: 0,
      pointsEarned: 0,
      pointsSpent: 0,
    };
    const key = `${userId}-${creatorId}`;
    this.userPointsMap.set(key, userPoints);
    return userPoints;
  }

  async updateUserPoints(userId: number, creatorId: number, pointsChange: number, type: 'earned' | 'spent', reason: string, relatedId?: number): Promise<UserPointsResponse> {
    let currentPoints = await this.getUserPoints(userId, creatorId);

    // Update points
    const updatedPoints: UserPointsResponse = {
      userId,
      totalPoints: type === 'earned'
        ? currentPoints.totalPoints + pointsChange
        : currentPoints.totalPoints - pointsChange,
      pointsEarned: type === 'earned'
        ? currentPoints.pointsEarned + pointsChange
        : currentPoints.pointsEarned,
      pointsSpent: type === 'spent'
        ? currentPoints.pointsSpent + pointsChange
        : currentPoints.pointsSpent,
    };

    // Save updated points
    const key = `${userId}-${creatorId}`;
    this.userPointsMap.set(key, updatedPoints);

    // Record transaction
    const transaction: PointTransactionResponse = {
      id: this.currentPointTransactionId++,
      userId,
      creatorId,
      type,
      amount: pointsChange,
      reason,
      relatedId: relatedId || null,
      createdAt: new Date(),
    };
    this.pointTransactionsMap.set(transaction.id, transaction);

    return updatedPoints;
  }

  async getUserPointTransactions(userId: number, creatorId: number, limit: number = 50): Promise<PointTransactionResponse[]> {
    const transactions = Array.from(this.pointTransactionsMap.values())
      .filter(t => t.userId === userId && t.creatorId === creatorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return transactions;
  }

  // Store operations
  async getStoreItems(creatorId: number): Promise<StoreItemResponse[]> {
    const items = Array.from(this.storeItems.values())
      .filter(item => item.creatorId === creatorId);

    return items.map(item => ({
      ...item,
      isAvailable: item.isActive && (item.maxQuantity === null || item.currentQuantity < item.maxQuantity)
    }));
  }

  async getStoreItem(id: number): Promise<StoreItem | undefined> {
    return this.storeItems.get(id);
  }

  async createStoreItem(item: InsertStoreItem, creatorId: number): Promise<StoreItemResponse> {
    const id = this.currentStoreItemId++;
    const now = new Date();

    const storeItem: StoreItem = {
      id,
      creatorId,
      ...item,
      maxQuantity: item.maxQuantity ?? null,
      currentQuantity: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    this.storeItems.set(id, storeItem);

    return {
      ...storeItem,
      isAvailable: true
    };
  }

  async updateStoreItem(id: number, item: UpdateStoreItem): Promise<StoreItemResponse | undefined> {
    const existingItem = this.storeItems.get(id);
    if (!existingItem) return undefined;

    const updatedItem: StoreItem = {
      ...existingItem,
      ...item,
      updatedAt: new Date(),
    };

    this.storeItems.set(id, updatedItem);

    return {
      ...updatedItem,
      isAvailable: updatedItem.isActive && (updatedItem.maxQuantity === null || updatedItem.currentQuantity < updatedItem.maxQuantity)
    };
  }

  async deleteStoreItem(id: number): Promise<void> {
    this.storeItems.delete(id);
    // Also delete all redemptions for this item
    Array.from(this.storeRedemptions.entries()).forEach(([redemptionId, redemption]) => {
      if (redemption.storeItemId === id) {
        this.storeRedemptions.delete(redemptionId);
      }
    });
  }

  async getStoreRedemptions(creatorId: number, limit: number = 10, offset: number = 0, status?: 'pending' | 'completed'): Promise<{ redemptions: StoreRedemptionResponse[]; total: number; }> {
    let allRedemptions = Array.from(this.storeRedemptions.values())
      .filter(redemption => redemption.creatorId === creatorId);

    // Apply status filter if provided
    if (status) {
      allRedemptions = allRedemptions.filter(redemption => redemption.status === status);
    }

    allRedemptions = allRedemptions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = allRedemptions.length;
    const redemptions = allRedemptions.slice(offset, offset + limit);

    // Enrich with user and store item data
    const enrichedRedemptions: StoreRedemptionResponse[] = redemptions.map(redemption => {
      const user = this.users.get(redemption.userId);
      const storeItem = this.storeItems.get(redemption.storeItemId);

      return {
        ...redemption,
        status: redemption.status as 'pending' | 'completed',
        userUsername: user?.username || 'Unknown',
        userEmail: user?.email || 'Unknown',
        storeItemTitle: storeItem?.title || 'Unknown',
        storeItemDescription: storeItem?.description || 'Unknown',
      };
    });

    return { redemptions: enrichedRedemptions, total };
  }

  async createStoreRedemption(redemption: InsertStoreRedemption, userId: number): Promise<StoreRedemptionResponse> {
    const storeItem = this.storeItems.get(redemption.storeItemId);
    if (!storeItem) {
      throw new Error('Store item not found');
    }

    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const id = this.currentStoreRedemptionId++;
    const now = new Date();

    const storeRedemption: StoreRedemption = {
      id,
      ...redemption,
      userId,
      creatorId: storeItem.creatorId,
      pointsSpent: storeItem.pointsCost,
      status: 'pending',
      createdAt: now,
      completedAt: null,
    };

    this.storeRedemptions.set(id, storeRedemption);

    // Update store item quantity
    const updatedItem = {
      ...storeItem,
      currentQuantity: storeItem.currentQuantity + 1,
      updatedAt: now,
    };
    this.storeItems.set(storeItem.id, updatedItem);

    return {
      ...storeRedemption,
      status: storeRedemption.status as 'pending' | 'completed',
      userUsername: user.username,
      userEmail: user.email,
      storeItemTitle: storeItem.title,
      storeItemDescription: storeItem.description,
    };
  }

  async updateRedemptionStatus(id: number, status: 'pending' | 'completed'): Promise<StoreRedemptionResponse | undefined> {
    const redemption = this.storeRedemptions.get(id);
    if (!redemption) return undefined;

    const updatedRedemption: StoreRedemption = {
      ...redemption,
      status,
      completedAt: status === 'completed' ? new Date() : null,
    };

    this.storeRedemptions.set(id, updatedRedemption);

    // Get user and store item data for response
    const user = this.users.get(redemption.userId);
    const storeItem = this.storeItems.get(redemption.storeItemId);

    return {
      ...updatedRedemption,
      status: updatedRedemption.status as 'pending' | 'completed',
      userUsername: user?.username || 'Unknown',
      userEmail: user?.email || 'Unknown',
      storeItemTitle: storeItem?.title || 'Unknown',
      storeItemDescription: storeItem?.description || 'Unknown',
    };
  }

  // Initialize demo data for testing
  private initializeDemoData() {
    // Create demo users
    const demoCreator: User = {
      id: 1,
      username: 'demo_creator',
      email: 'creator@demo.com',
      hashedPassword: 'hashed_password',
      userRole: 'creator',
      displayName: 'Demo Creator',
      bio: 'I create amazing content for my audience',
      profileImageUrl: null,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscriptionStatus: 'active',
      subscriptionTier: 'pro',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    };

    const demoAudience: User = {
      id: 2,
      username: 'demo_audience',
      email: 'audience@demo.com',
      hashedPassword: 'hashed_password',
      userRole: 'audience',
      displayName: 'Demo Audience',
      bio: 'I love voting for great content ideas',
      profileImageUrl: null,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscriptionStatus: 'active',
      subscriptionTier: 'free',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    this.users.set(1, demoCreator);
    this.users.set(2, demoAudience);

    // Create demo ideas
    const now = new Date();
    const demoIdeas: Idea[] = [
      {
        id: 1,
        title: 'Tutorial de React Hooks Avanzados',
        description: 'Un tutorial completo sobre useCallback, useMemo y useRef con ejemplos prácticos',
        votes: 15,
        creatorId: 1,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'approved',
        voteCount: 15,
        lastPositionUpdate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        position: 1,
      },
      {
        id: 2,
        title: 'Comparativa de Frameworks JavaScript',
        description: 'Análisis detallado de React vs Vue vs Angular en 2024',
        votes: 23,
        creatorId: 1,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        status: 'approved',
        voteCount: 23,
        lastPositionUpdate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        position: 2,
      },
      {
        id: 3,
        title: 'Guía de TypeScript para Principiantes',
        description: 'Desde tipos básicos hasta generics avanzados',
        votes: 8,
        creatorId: 1,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        status: 'approved',
        voteCount: 8,
        lastPositionUpdate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        position: 3,
      },
      {
        id: 4,
        title: 'Tutorial de Next.js 14',
        description: 'Nuevas características y mejores prácticas',
        votes: 0,
        creatorId: 1,
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
        updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        status: 'pending',
        voteCount: 0,
        lastPositionUpdate: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        position: null,
      },
      {
        id: 5,
        title: 'Optimización de Performance en React',
        description: 'Técnicas para mejorar el rendimiento de aplicaciones React',
        votes: 0,
        creatorId: 1,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        status: 'pending',
        voteCount: 0,
        lastPositionUpdate: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        position: null,
      },
    ];

    demoIdeas.forEach(idea => {
      this.ideas.set(idea.id, idea);
    });

    // Create demo votes
    const demoVotes: Vote[] = [
      {
        id: 1,
        ideaId: 1,
        userId: 2,
        sessionId: null,
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        ideaId: 2,
        userId: 2,
        sessionId: null,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 3,
        ideaId: 3,
        userId: 2,
        sessionId: null,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    demoVotes.forEach(vote => {
      this.votes.set(vote.id, vote);
    });

    // Create demo user points
    this.userPointsMap.set(2, {
      totalPoints: 150,
      pointsUsed: 50,
      pointsAvailable: 100,
    });

    // Create demo audience stats
    this.audienceStatsMap.set(2, {
      votesGiven: 3,
      ideasSuggested: 2,
      ideasApproved: 1,
    });

    // Update current IDs to avoid conflicts
    this.currentUserId = 3;
    this.currentIdeaId = 6;
    this.currentVoteId = 4;

    console.log('[STORAGE] Demo data initialized successfully');
  }
}

import { DatabaseStorage } from "./database-storage";

// Use DatabaseStorage for persistent data
export const storage = new DatabaseStorage();
