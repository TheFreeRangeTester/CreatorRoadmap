import { db } from "../db";
import { youtubeSnapshots, youtubeScores, youtubeApiUsage, youtubeUserUsage, ideas } from "@shared/schema";
import { eq, and, gte, desc } from "drizzle-orm";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const CACHE_TTL_HOURS = 48; // Extended cache duration
const DAILY_QUOTA_LIMIT = 9000; // Leave buffer from 10,000
const USER_DAILY_LIMIT = 10; // Max YouTube analyses per user per day

interface YouTubeSearchResult {
  items: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      channelId: string;
      channelTitle: string;
      publishedAt: string;
    };
  }>;
  pageInfo: { totalResults: number };
}

interface YouTubeVideoStats {
  items: Array<{
    id: string;
    statistics: {
      viewCount: string;
      likeCount: string;
      commentCount: string;
    };
    snippet: {
      channelId: string;
      publishedAt: string;
    };
  }>;
}

interface ScoreExplanation {
  demandReason: string;
  competitionReason: string;
  opportunityReason: string;
}

export class YouTubeService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async getQuotaUsageToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usage = await db
      .select()
      .from(youtubeApiUsage)
      .where(gte(youtubeApiUsage.date, today));

    return usage.reduce((sum, u) => sum + u.unitsUsed, 0);
  }

  private async trackQuotaUsage(units: number): Promise<void> {
    await db.insert(youtubeApiUsage).values({
      unitsUsed: units,
      requestCount: 1,
    });
  }

  async canMakeRequest(unitsNeeded: number): Promise<boolean> {
    const usedToday = await this.getQuotaUsageToday();
    return usedToday + unitsNeeded <= DAILY_QUOTA_LIMIT;
  }

  // User rate limiting methods
  private getTodayDateString(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }

  async getUserDailyUsage(userId: number): Promise<number> {
    const today = this.getTodayDateString();
    const usage = await db
      .select()
      .from(youtubeUserUsage)
      .where(and(
        eq(youtubeUserUsage.userId, userId),
        eq(youtubeUserUsage.date, today)
      ))
      .limit(1);
    
    return usage[0]?.requestCount || 0;
  }

  async canUserMakeRequest(userId: number): Promise<boolean> {
    const usedToday = await this.getUserDailyUsage(userId);
    return usedToday < USER_DAILY_LIMIT;
  }

  async getUserRemainingRequests(userId: number): Promise<number> {
    const usedToday = await this.getUserDailyUsage(userId);
    return Math.max(0, USER_DAILY_LIMIT - usedToday);
  }

  private async trackUserUsage(userId: number): Promise<void> {
    const today = this.getTodayDateString();
    const existing = await db
      .select()
      .from(youtubeUserUsage)
      .where(and(
        eq(youtubeUserUsage.userId, userId),
        eq(youtubeUserUsage.date, today)
      ))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(youtubeUserUsage)
        .set({ 
          requestCount: existing[0].requestCount + 1,
          updatedAt: new Date()
        })
        .where(eq(youtubeUserUsage.id, existing[0].id));
    } else {
      await db.insert(youtubeUserUsage).values({
        userId,
        date: today,
        requestCount: 1,
      });
    }
  }

  async getCachedScore(ideaId: number): Promise<{
    score: typeof youtubeScores.$inferSelect | null;
    snapshot: typeof youtubeSnapshots.$inferSelect | null;
    isFresh: boolean;
  }> {
    const score = await db
      .select()
      .from(youtubeScores)
      .where(eq(youtubeScores.ideaId, ideaId))
      .limit(1);

    if (!score.length) {
      return { score: null, snapshot: null, isFresh: false };
    }

    const snapshot = score[0].snapshotId
      ? await db
          .select()
          .from(youtubeSnapshots)
          .where(eq(youtubeSnapshots.id, score[0].snapshotId))
          .limit(1)
      : [];

    const snapshotData = snapshot[0] || null;
    const isFresh = snapshotData
      ? this.isSnapshotFresh(snapshotData.fetchedAt)
      : false;

    return {
      score: score[0],
      snapshot: snapshotData,
      isFresh,
    };
  }

  private isSnapshotFresh(fetchedAt: Date): boolean {
    const now = new Date();
    const hoursSinceFetch =
      (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceFetch < CACHE_TTL_HOURS;
  }

  async fetchAndScore(ideaId: number, forceRefresh = false, userId?: number): Promise<{
    success: boolean;
    score?: typeof youtubeScores.$inferSelect;
    snapshot?: typeof youtubeSnapshots.$inferSelect;
    error?: string;
    rateLimitInfo?: { remaining: number; limit: number };
  }> {
    if (!this.isConfigured()) {
      return { success: false, error: "YouTube API key not configured" };
    }

    // Check cache first
    if (!forceRefresh) {
      const cached = await this.getCachedScore(ideaId);
      if (cached.isFresh && cached.score && cached.snapshot) {
        return {
          success: true,
          score: cached.score,
          snapshot: cached.snapshot,
        };
      }
    }

    // Check user rate limit if userId provided
    if (userId) {
      const canRequest = await this.canUserMakeRequest(userId);
      if (!canRequest) {
        const remaining = await this.getUserRemainingRequests(userId);
        return { 
          success: false, 
          error: "Daily analysis limit reached. Try again tomorrow.",
          rateLimitInfo: { remaining, limit: USER_DAILY_LIMIT }
        };
      }
    }

    // Get idea title for search query
    const idea = await db
      .select()
      .from(ideas)
      .where(eq(ideas.id, ideaId))
      .limit(1);

    if (!idea.length) {
      return { success: false, error: "Idea not found" };
    }

    const queryTerm = this.extractSearchQuery(idea[0].title, idea[0].niche);

    // Check quota
    const quotaNeeded = 101; // 100 for search + ~1 for video details
    if (!(await this.canMakeRequest(quotaNeeded))) {
      return { success: false, error: "Daily YouTube API quota exceeded" };
    }

    // Track user usage before making request
    if (userId) {
      await this.trackUserUsage(userId);
    }

    try {
      // Fetch from YouTube
      const searchData = await this.searchVideos(queryTerm);
      await this.trackQuotaUsage(100);

      if (!searchData.items?.length) {
        // No results - create snapshot with zeros
        const snapshot = await this.createSnapshot(ideaId, queryTerm, {
          videoCount: 0,
          avgViews: 0,
          medianViews: 0,
          maxViews: 0,
          avgViewsPerDay: 0,
          uniqueChannels: 0,
          topChannels: [],
          rawResponse: searchData,
          status: "success",
        });

        const score = await this.calculateAndSaveScore(
          ideaId,
          snapshot.id,
          0,
          0,
          0,
          0,
          idea[0].votes
        );

        return { success: true, score, snapshot };
      }

      // Get video statistics
      const videoIds = searchData.items.map((item) => item.id.videoId);
      const statsData = await this.getVideoStats(videoIds);
      await this.trackQuotaUsage(1);

      // Calculate metrics
      const metrics = this.calculateMetrics(searchData, statsData);

      // Create snapshot
      const snapshot = await this.createSnapshot(ideaId, queryTerm, {
        ...metrics,
        rawResponse: { search: searchData, stats: statsData },
        status: "success",
      });

      // Calculate and save score
      const score = await this.calculateAndSaveScore(
        ideaId,
        snapshot.id,
        metrics.videoCount,
        metrics.avgViews,
        metrics.avgViewsPerDay,
        metrics.uniqueChannels,
        idea[0].votes
      );

      return { success: true, score, snapshot };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      
      // Create error snapshot
      await this.createSnapshot(ideaId, queryTerm, {
        videoCount: 0,
        avgViews: 0,
        medianViews: 0,
        maxViews: 0,
        avgViewsPerDay: 0,
        uniqueChannels: 0,
        topChannels: [],
        rawResponse: {},
        status: "error",
        errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }

  private extractSearchQuery(title: string, niche?: string | null): string {
    // Clean up title for search - remove special characters, limit length
    let query = title
      .replace(/[¿?¡!]/g, "")
      .replace(/\.{2,}/g, " ")
      .trim();

    // If title is too long, take first meaningful part
    if (query.length > 50) {
      query = query.substring(0, 50).split(" ").slice(0, -1).join(" ");
    }

    return query;
  }

  private async searchVideos(query: string): Promise<YouTubeSearchResult> {
    const params = new URLSearchParams({
      key: this.apiKey!,
      q: query,
      part: "snippet",
      type: "video",
      order: "relevance",
      maxResults: "50",
      publishedAfter: this.getDateMonthsAgo(6).toISOString(),
    });

    console.log(`[YouTube] Searching for: "${query}"`);
    console.log(`[YouTube] URL: ${YOUTUBE_API_BASE}/search?q=${encodeURIComponent(query)}&...`);
    
    const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      console.error(`[YouTube] API Error:`, JSON.stringify(error, null, 2));
      throw new Error(error.error?.message || "YouTube API error");
    }

    const data = await response.json();
    console.log(`[YouTube] Found ${data.items?.length || 0} videos (totalResults: ${data.pageInfo?.totalResults})`);
    return data;
  }

  private async getVideoStats(videoIds: string[]): Promise<YouTubeVideoStats> {
    const params = new URLSearchParams({
      key: this.apiKey!,
      id: videoIds.join(","),
      part: "statistics,snippet",
    });

    const response = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "YouTube API error");
    }

    return response.json();
  }

  private getDateMonthsAgo(months: number): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date;
  }

  private calculateMetrics(
    searchData: YouTubeSearchResult,
    statsData: YouTubeVideoStats
  ): {
    videoCount: number;
    avgViews: number;
    medianViews: number;
    maxViews: number;
    avgViewsPerDay: number;
    uniqueChannels: number;
    topChannels: Array<{ id: string; name: string; views: number }>;
  } {
    const videoCount = searchData.items.length;
    const views = statsData.items.map((v) =>
      parseInt(v.statistics.viewCount || "0")
    );
    
    const sortedViews = [...views].sort((a, b) => b - a);
    const avgViews =
      views.length > 0
        ? Math.round(views.reduce((a, b) => a + b, 0) / views.length)
        : 0;
    const medianViews =
      views.length > 0
        ? sortedViews[Math.floor(sortedViews.length / 2)]
        : 0;
    const maxViews = sortedViews[0] || 0;

    // Calculate velocity (views per day since publish)
    const now = new Date();
    let totalVelocity = 0;
    statsData.items.forEach((video) => {
      const publishDate = new Date(video.snippet.publishedAt);
      const daysOld = Math.max(
        1,
        (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const viewCount = parseInt(video.statistics.viewCount || "0");
      totalVelocity += viewCount / daysOld;
    });
    const avgViewsPerDay = Math.round(
      totalVelocity / Math.max(1, statsData.items.length)
    );

    // Count unique channels
    const channelMap = new Map<string, { name: string; views: number }>();
    searchData.items.forEach((item, idx) => {
      const stat = statsData.items[idx];
      const views = stat ? parseInt(stat.statistics.viewCount || "0") : 0;
      const existing = channelMap.get(item.snippet.channelId);
      if (existing) {
        existing.views += views;
      } else {
        channelMap.set(item.snippet.channelId, {
          name: item.snippet.channelTitle,
          views,
        });
      }
    });

    const topChannels = Array.from(channelMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      videoCount,
      avgViews,
      medianViews,
      maxViews,
      avgViewsPerDay,
      uniqueChannels: channelMap.size,
      topChannels,
    };
  }

  private async createSnapshot(
    ideaId: number,
    queryTerm: string,
    data: {
      videoCount: number;
      avgViews: number;
      medianViews: number;
      maxViews: number;
      avgViewsPerDay: number;
      uniqueChannels: number;
      topChannels: Array<{ id: string; name: string; views: number }>;
      rawResponse: unknown;
      status: "pending" | "success" | "error" | "partial";
      errorMessage?: string;
    }
  ): Promise<typeof youtubeSnapshots.$inferSelect> {
    const [snapshot] = await db
      .insert(youtubeSnapshots)
      .values({
        ideaId,
        queryTerm,
        videoCount: data.videoCount,
        avgViews: data.avgViews,
        medianViews: data.medianViews,
        maxViews: data.maxViews,
        avgViewsPerDay: data.avgViewsPerDay,
        uniqueChannels: data.uniqueChannels,
        topChannelsJson: data.topChannels,
        rawResponseJson: data.rawResponse,
        status: data.status,
        errorMessage: data.errorMessage,
      })
      .returning();

    return snapshot;
  }

  private async calculateAndSaveScore(
    ideaId: number,
    snapshotId: number,
    videoCount: number,
    avgViews: number,
    avgViewsPerDay: number,
    uniqueChannels: number,
    fanlistVotes: number
  ): Promise<typeof youtubeScores.$inferSelect> {
    // Calculate Demand Score (0-100)
    // Higher is better - more videos with good views = higher demand
    const demandScore = this.calculateDemandScore(
      videoCount,
      avgViews,
      avgViewsPerDay
    );
    const demandLabel = this.scoreToLabel(demandScore) as "low" | "medium" | "high";

    // Calculate Competition Score (0-100)
    // Higher = more competition = harder to break in
    const competitionScore = this.calculateCompetitionScore(
      videoCount,
      avgViews,
      uniqueChannels
    );
    const competitionLabel = this.scoreToLabel(competitionScore) as "low" | "medium" | "high";

    // Calculate Opportunity Score (0-100)
    // Balance of demand vs competition
    const opportunityScore = this.calculateOpportunityScore(
      demandScore,
      competitionScore
    );
    const opportunityLabel = this.opportunityScoreToLabel(opportunityScore);

    // Calculate Composite Label (combining Fanlist votes with YouTube data)
    const normalizedVotes = Math.min(100, fanlistVotes * 10); // Normalize votes to 0-100 scale
    const compositeLabel = this.getCompositeLabel(
      normalizedVotes,
      opportunityScore
    );

    // Generate explanations
    const explanation: ScoreExplanation = {
      demandReason: this.getDemandExplanation(
        videoCount,
        avgViews,
        avgViewsPerDay,
        demandLabel
      ),
      competitionReason: this.getCompetitionExplanation(
        videoCount,
        uniqueChannels,
        competitionLabel
      ),
      opportunityReason: this.getOpportunityExplanation(
        demandLabel,
        competitionLabel,
        opportunityLabel
      ),
    };

    // Upsert score
    const existingScore = await db
      .select()
      .from(youtubeScores)
      .where(eq(youtubeScores.ideaId, ideaId))
      .limit(1);

    if (existingScore.length) {
      const [updated] = await db
        .update(youtubeScores)
        .set({
          snapshotId,
          demandScore,
          demandLabel,
          competitionScore,
          competitionLabel,
          opportunityScore,
          opportunityLabel,
          compositeLabel,
          explanationJson: explanation,
          updatedAt: new Date(),
        })
        .where(eq(youtubeScores.ideaId, ideaId))
        .returning();
      return updated;
    }

    const [score] = await db
      .insert(youtubeScores)
      .values({
        ideaId,
        snapshotId,
        demandScore,
        demandLabel,
        competitionScore,
        competitionLabel,
        opportunityScore,
        opportunityLabel,
        compositeLabel,
        explanationJson: explanation,
      })
      .returning();

    return score;
  }

  private calculateDemandScore(
    videoCount: number,
    avgViews: number,
    avgViewsPerDay: number
  ): number {
    // Logarithmic scaling to handle wide ranges
    const videoCountScore = Math.min(40, Math.log10(videoCount + 1) * 20);
    const viewsScore = Math.min(40, Math.log10(avgViews + 1) * 8);
    const velocityScore = Math.min(20, Math.log10(avgViewsPerDay + 1) * 10);

    return Math.round(
      Math.min(100, videoCountScore + viewsScore + velocityScore)
    );
  }

  private calculateCompetitionScore(
    videoCount: number,
    avgViews: number,
    uniqueChannels: number
  ): number {
    // More videos and channels = more competition
    const volumeScore = Math.min(50, Math.log10(videoCount + 1) * 25);
    const channelScore = Math.min(30, Math.log10(uniqueChannels + 1) * 15);
    // High avg views = established players = harder competition
    const establishedScore = Math.min(20, Math.log10(avgViews + 1) * 4);

    return Math.round(
      Math.min(100, volumeScore + channelScore + establishedScore)
    );
  }

  private calculateOpportunityScore(
    demandScore: number,
    competitionScore: number
  ): number {
    // High demand + low competition = high opportunity
    // Opportunity = Demand weighted by inverse of competition
    // When competition is high (100), opportunity is reduced significantly
    // When competition is low (0), opportunity reflects demand directly
    const competitionPenalty = competitionScore / 100; // 0 to 1
    const score = demandScore * (1 - competitionPenalty * 0.7);
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  private scoreToLabel(score: number): string {
    if (score < 30) return "low";
    if (score < 70) return "medium";
    return "high";
  }

  private opportunityScoreToLabel(
    score: number
  ): "weak" | "good" | "strong" | "unknown" {
    if (score < 35) return "weak";
    if (score < 65) return "good";
    return "strong";
  }

  private getCompositeLabel(
    audienceScore: number,
    opportunityScore: number
  ): "audience-led" | "market-led" | "balanced" | "low-priority" {
    if (audienceScore >= 50 && opportunityScore >= 50) return "balanced";
    if (audienceScore >= 60 && opportunityScore >= 30) return "audience-led";
    if (opportunityScore >= 60 && audienceScore < 50) return "market-led";
    return "low-priority";
  }

  private getDemandExplanation(
    videoCount: number,
    avgViews: number,
    velocity: number,
    label: string
  ): string {
    // Return structured key for frontend i18n: key|param1|param2
    if (label === "high") {
      return `demand.high|${videoCount}|${avgViews}`;
    }
    if (label === "medium") {
      return `demand.medium|${videoCount}|${avgViews}`;
    }
    return `demand.low|${videoCount}|${avgViews}`;
  }

  private getCompetitionExplanation(
    videoCount: number,
    uniqueChannels: number,
    label: string
  ): string {
    // Return structured key for frontend i18n: key|param1
    if (label === "high") {
      return `competition.high|${uniqueChannels}`;
    }
    if (label === "medium") {
      return `competition.medium|${uniqueChannels}`;
    }
    return `competition.low|${uniqueChannels}`;
  }

  private getOpportunityExplanation(
    demandLabel: string,
    competitionLabel: string,
    opportunityLabel: string
  ): string {
    // Return structured key for frontend i18n
    if (opportunityLabel === "strong") {
      if (demandLabel === "high" && competitionLabel === "low") {
        return "opportunity.strongIdeal";
      }
      return "opportunity.strongGood";
    }
    if (opportunityLabel === "good") {
      if (demandLabel === "high" && competitionLabel === "high") {
        return "opportunity.goodCompetitive";
      }
      return "opportunity.goodBalanced";
    }
    if (demandLabel === "low") {
      return "opportunity.lowDemand";
    }
    return "opportunity.highCompetition";
  }
}

export const youtubeService = new YouTubeService();
