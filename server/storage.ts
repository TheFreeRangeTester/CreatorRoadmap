import { ideas as ideasTable, users, votes as votesTable, type User, type InsertUser, type Idea, type InsertIdea, type UpdateIdea, type Vote, type InsertVote } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface defining all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Idea operations
  getIdeas(): Promise<Idea[]>;
  getIdea(id: number): Promise<Idea | undefined>;
  createIdea(idea: InsertIdea, creatorId: number): Promise<Idea>;
  updateIdea(id: number, idea: UpdateIdea): Promise<Idea | undefined>;
  deleteIdea(id: number): Promise<void>;
  
  // Vote operations
  getVoteByUserOrSession(ideaId: number, userId?: number, sessionId?: string): Promise<Vote | undefined>;
  createVote(vote: InsertVote, userId?: number, sessionId?: string): Promise<Vote>;
  incrementVote(ideaId: number): Promise<void>;
  
  // Position operations
  updatePositions(): Promise<void>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export interface IdeaWithPosition {
  id: number;
  title: string;
  description: string;
  votes: number;
  createdAt: Date;
  creatorId: number;
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
  currentUserId: number;
  currentIdeaId: number;
  currentVoteId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.ideas = new Map();
    this.votes = new Map();
    this.currentUserId = 1;
    this.currentIdeaId = 1;
    this.currentVoteId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Idea methods
  async getIdeas(): Promise<Idea[]> {
    return Array.from(this.ideas.values());
  }

  async getIdea(id: number): Promise<Idea | undefined> {
    return this.ideas.get(id);
  }

  async createIdea(insertIdea: InsertIdea, creatorId: number): Promise<Idea> {
    const id = this.currentIdeaId++;
    const now = new Date();
    
    // Get the current count of ideas for positioning
    const ideasCount = this.ideas.size;
    
    const idea: Idea = {
      ...insertIdea,
      id,
      votes: 0,
      createdAt: now,
      creatorId,
      lastPositionUpdate: now,
      currentPosition: ideasCount + 1, // New idea starts at the bottom
      previousPosition: null, // No previous position for new ideas
    };
    
    this.ideas.set(id, idea);
    
    // Update positions after adding a new idea
    await this.updatePositions();
    
    return idea;
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
    
    return sortedIdeas.map(idea => ({
      id: idea.id,
      title: idea.title,
      description: idea.description,
      votes: idea.votes,
      createdAt: idea.createdAt,
      creatorId: idea.creatorId,
      position: {
        current: idea.currentPosition,
        previous: idea.previousPosition,
        change: idea.previousPosition 
          ? idea.previousPosition - idea.currentPosition 
          : null
      }
    }));
  }
}

export const storage = new MemStorage();
