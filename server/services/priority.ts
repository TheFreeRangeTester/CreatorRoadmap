import { db } from "../db";
import { ideas, users, youtubeScores } from "@shared/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

export interface PriorityScore {
  ideaId: number;
  voteScore: number;
  opportunityScore: number | null;
  effectiveOpportunityScore: number | null;
  priorityScore: number;
  hasYouTubeData: boolean;
  isStale: boolean;
}

export interface IdeaWithPriority {
  idea: typeof ideas.$inferSelect;
  priority: PriorityScore;
  youtubeScore?: typeof youtubeScores.$inferSelect | null;
}

export class PriorityService {
  private normalizeVotes(votes: number, maxVotes: number): number {
    if (maxVotes === 0) return 0;
    return Math.round((votes / maxVotes) * 100);
  }

  private calculatePriorityScore(
    voteScore: number,
    opportunityScore: number | null,
    weight: number
  ): number {
    if (opportunityScore === null) {
      return voteScore;
    }
    const w = weight / 100;
    return Math.round(w * voteScore + (1 - w) * opportunityScore);
  }

  async getCreatorPriorityWeight(creatorId: number): Promise<number> {
    const [creator] = await db
      .select({ priorityWeight: users.priorityWeight })
      .from(users)
      .where(eq(users.id, creatorId))
      .limit(1);

    return creator?.priorityWeight ?? 55;
  }

  async updateCreatorPriorityWeight(creatorId: number, weight: number): Promise<void> {
    const clampedWeight = Math.max(30, Math.min(70, weight));
    await db
      .update(users)
      .set({ priorityWeight: clampedWeight })
      .where(eq(users.id, creatorId));
  }

  async getIdeasWithPriority(
    creatorId: number,
    statusFilter: 'approved' | 'completed' = 'approved'
  ): Promise<IdeaWithPriority[]> {
    const creatorIdeas = await db
      .select()
      .from(ideas)
      .where(and(eq(ideas.creatorId, creatorId), eq(ideas.status, statusFilter)))
      .orderBy(desc(ideas.votes));

    if (creatorIdeas.length === 0) {
      return [];
    }

    const ideaIds = creatorIdeas.map((i) => i.id);
    const youtubeScoresData = await db
      .select()
      .from(youtubeScores)
      .where(inArray(youtubeScores.ideaId, ideaIds));

    const scoreMap = new Map(youtubeScoresData.map((s) => [s.ideaId, s]));

    const maxVotes = Math.max(...creatorIdeas.map((i) => i.votes), 1);
    const priorityWeight = await this.getCreatorPriorityWeight(creatorId);

    const results: IdeaWithPriority[] = creatorIdeas.map((idea) => {
      const ytScore = scoreMap.get(idea.id);
      const voteScore = this.normalizeVotes(idea.votes, maxVotes);
      const opportunityScore = ytScore?.opportunityScore ?? null;

      const isStale = ytScore?.updatedAt
        ? (new Date().getTime() - new Date(ytScore.updatedAt).getTime()) / (1000 * 60 * 60) > 24
        : false;

      const hasYouTubeData = opportunityScore !== null;

      let effectiveOpportunity = opportunityScore;
      if (isStale && opportunityScore !== null) {
        effectiveOpportunity = Math.round(opportunityScore * 0.8);
      }

      const priorityScore = this.calculatePriorityScore(
        voteScore,
        effectiveOpportunity,
        priorityWeight
      );

      return {
        idea,
        priority: {
          ideaId: idea.id,
          voteScore,
          opportunityScore,
          effectiveOpportunityScore: effectiveOpportunity,
          priorityScore,
          hasYouTubeData,
          isStale,
        },
        youtubeScore: ytScore || null,
      };
    });

    results.sort((a, b) => b.priority.priorityScore - a.priority.priorityScore);

    return results;
  }

  async getPriorityScoreForIdea(
    ideaId: number,
    creatorId: number
  ): Promise<PriorityScore | null> {
    const [idea] = await db
      .select()
      .from(ideas)
      .where(and(eq(ideas.id, ideaId), eq(ideas.creatorId, creatorId)))
      .limit(1);

    if (!idea) return null;

    const creatorIdeas = await db
      .select({ votes: ideas.votes })
      .from(ideas)
      .where(and(eq(ideas.creatorId, creatorId), eq(ideas.status, 'approved')));

    const maxVotes = Math.max(...creatorIdeas.map((i) => i.votes), 1);

    const [ytScore] = await db
      .select()
      .from(youtubeScores)
      .where(eq(youtubeScores.ideaId, ideaId))
      .limit(1);

    const voteScore = this.normalizeVotes(idea.votes, maxVotes);
    const opportunityScore = ytScore?.opportunityScore ?? null;
    const priorityWeight = await this.getCreatorPriorityWeight(creatorId);

    const isStale = ytScore?.updatedAt
      ? (new Date().getTime() - new Date(ytScore.updatedAt).getTime()) / (1000 * 60 * 60) > 24
      : false;

    const hasYouTubeData = opportunityScore !== null;

    let effectiveOpportunity = opportunityScore;
    if (isStale && opportunityScore !== null) {
      effectiveOpportunity = Math.round(opportunityScore * 0.8);
    }

    const priorityScore = this.calculatePriorityScore(
      voteScore,
      effectiveOpportunity,
      priorityWeight
    );

    return {
      ideaId,
      voteScore,
      opportunityScore,
      effectiveOpportunityScore: effectiveOpportunity,
      priorityScore,
      hasYouTubeData,
      isStale,
    };
  }
}

export const priorityService = new PriorityService();
