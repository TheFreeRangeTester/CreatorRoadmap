import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Youtube,
  TrendingUp,
  Users,
  Target,
  RefreshCw,
  Lock,
  AlertCircle,
  Info,
  Zap,
  BarChart3,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface YouTubeScore {
  id: number;
  ideaId: number;
  demandScore: number;
  demandLabel: "low" | "medium" | "high" | "unknown";
  competitionScore: number;
  competitionLabel: "low" | "medium" | "high" | "unknown";
  opportunityScore: number;
  opportunityLabel: "weak" | "good" | "strong" | "unknown";
  compositeLabel: "audience-led" | "market-led" | "balanced" | "low-priority" | null;
  explanation: {
    demandReason?: string;
    competitionReason?: string;
    opportunityReason?: string;
  };
  updatedAt: string;
}

interface YouTubeSnapshot {
  id: number;
  ideaId: number;
  queryTerm: string;
  videoCount: number;
  avgViews: number;
  medianViews: number;
  maxViews: number;
  avgViewsPerDay: number;
  uniqueChannels: number;
  status: "pending" | "success" | "error" | "partial";
  errorMessage: string | null;
  fetchedAt: string;
}

interface YouTubeScoreResponse {
  score: YouTubeScore | null;
  snapshot: YouTubeSnapshot | null;
  isFresh: boolean;
  message?: string;
}

interface YouTubeOpportunityPanelProps {
  ideaId: number;
  isPremium: boolean;
  audienceVotes?: number;
}

const labelColors = {
  low: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  high: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  unknown: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  weak: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  good: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  strong: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const compositeColors = {
  "audience-led": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "market-led": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  balanced: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  "low-priority": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const getLabelKey = (label: string): string => {
  const keyMap: Record<string, string> = {
    low: "low",
    medium: "medium",
    high: "high",
    unknown: "unknown",
    weak: "weak",
    good: "good",
    strong: "strong",
    "audience-led": "audienceLed",
    "market-led": "marketLed",
    balanced: "balanced",
    "low-priority": "lowPriority",
  };
  return keyMap[label] || label;
};

export default function YouTubeOpportunityPanel({
  ideaId,
  isPremium,
  audienceVotes = 0,
}: YouTubeOpportunityPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: scoreData, isLoading, error } = useQuery<YouTubeScoreResponse>({
    queryKey: [`/api/youtube/score/${ideaId}`],
    enabled: isPremium,
  });

  const fetchMutation = useMutation({
    mutationFn: async (forceRefresh: boolean) => {
      const res = await apiRequest(`/api/youtube/score/${ideaId}`, {
        method: "POST",
        body: JSON.stringify({ forceRefresh }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/youtube/score/${ideaId}`] });
      setIsRefreshing(false);
    },
    onError: () => {
      setIsRefreshing(false);
    },
  });

  const handleFetch = (forceRefresh = false) => {
    setIsRefreshing(true);
    fetchMutation.mutate(forceRefresh);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return t("youtubeOpportunity.timeAgo.justNow");
    if (diffHours < 24) return t("youtubeOpportunity.timeAgo.hoursAgo", { hours: diffHours });
    return t("youtubeOpportunity.timeAgo.daysAgo", { days: diffDays });
  };

  const parseExplanation = (explanation: string | undefined, defaultKey: string): string => {
    if (!explanation) return t(defaultKey);
    
    const parts = explanation.split("|");
    const key = parts[0];
    
    if (key.startsWith("demand.")) {
      const level = key.replace("demand.", "");
      const videoCount = parts[1] || "0";
      const avgViews = parts[2] ? Number(parts[2]).toLocaleString() : "0";
      return t(`youtubeOpportunity.explanations.demand.${level}`, { videoCount, avgViews });
    }
    
    if (key.startsWith("competition.")) {
      const level = key.replace("competition.", "");
      const channels = parts[1] || "0";
      return t(`youtubeOpportunity.explanations.competition.${level}`, { channels });
    }
    
    if (key.startsWith("opportunity.")) {
      const level = key.replace("opportunity.", "");
      return t(`youtubeOpportunity.explanations.opportunity.${level}`);
    }
    
    return explanation;
  };

  if (!isPremium) {
    return (
      <Card className="relative overflow-hidden border-dashed border-purple-300 dark:border-purple-700">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-950/40 dark:to-indigo-950/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6">
          <Lock className="h-8 w-8 text-purple-500 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {t("youtubeOpportunity.premiumRequired.title")}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 max-w-xs">
            {t("youtubeOpportunity.premiumRequired.description")}
          </p>
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            onClick={() => window.location.href = "/pricing"}
            data-testid="button-upgrade-youtube"
          >
            <Zap className="h-4 w-4 mr-2" />
            {t("youtubeOpportunity.premiumRequired.cta")}
          </Button>
        </div>
        <CardHeader className="pb-2 filter blur-sm">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Youtube className="h-5 w-5 text-red-500" />
            YouTube Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent className="filter blur-sm">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-6 w-12 bg-gray-200 rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-6 w-12 bg-gray-200 rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-18 bg-gray-200 rounded" />
              <div className="h-6 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Youtube className="h-5 w-5 text-red-500" />
            YouTube Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !scoreData) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Youtube className="h-5 w-5 text-red-500" />
            YouTube Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t("youtubeOpportunity.errors.fetchFailed")}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFetch(false)}
              disabled={fetchMutation.isPending}
              data-testid="button-retry-youtube"
            >
              {fetchMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {t("common.refresh")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!scoreData.score || !scoreData.snapshot) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Youtube className="h-5 w-5 text-red-500" />
            YouTube Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <BarChart3 className="h-8 w-8 text-purple-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t("youtubeOpportunity.premiumRequired.benefit1")}
            </p>
            <Button
              size="sm"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              onClick={() => handleFetch(false)}
              disabled={fetchMutation.isPending}
              data-testid="button-analyze-youtube"
            >
              {fetchMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Youtube className="h-4 w-4 mr-2" />
              )}
              {t("youtubeOpportunity.analyze")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { score, snapshot } = scoreData;

  return (
    <Card className="border-red-100 dark:border-red-900/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Youtube className="h-5 w-5 text-red-500" />
            YouTube Opportunity
          </CardTitle>
          <div className="flex items-center gap-2">
            {score.compositeLabel && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      <Badge
                        className={cn(
                          "text-xs",
                          compositeColors[score.compositeLabel]
                        )}
                        data-testid="badge-composite-label"
                      >
                        {t(`youtubeOpportunity.labels.${getLabelKey(score.compositeLabel)}`)}
                      </Badge>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <p className="font-medium">
                        {t(`youtubeOpportunity.compositeTooltips.${getLabelKey(score.compositeLabel)}`)}
                      </p>
                      <div className="text-xs space-y-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                        <p><span className="text-green-500 font-semibold">{t("youtubeOpportunity.labels.balanced")}:</span> {t("youtubeOpportunity.compositeLegend.balanced")}</p>
                        <p><span className="text-purple-500 font-semibold">{t("youtubeOpportunity.labels.audienceLed")}:</span> {t("youtubeOpportunity.compositeLegend.audienceLed")}</p>
                        <p><span className="text-blue-500 font-semibold">{t("youtubeOpportunity.labels.marketLed")}:</span> {t("youtubeOpportunity.compositeLegend.marketLed")}</p>
                        <p><span className="text-gray-400 font-semibold">{t("youtubeOpportunity.labels.lowPriority")}:</span> {t("youtubeOpportunity.compositeLegend.lowPriority")}</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handleFetch(true)}
                    disabled={isRefreshing || fetchMutation.isPending}
                    data-testid="button-refresh-youtube"
                  >
                    <RefreshCw
                      className={cn(
                        "h-4 w-4",
                        (isRefreshing || fetchMutation.isPending) && "animate-spin"
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("youtubeOpportunity.refresh")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("youtubeOpportunity.search")}: "{snapshot.queryTerm}" · {formatTimeAgo(snapshot.fetchedAt)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-3 cursor-help"
                  data-testid="score-demand"
                >
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {t("youtubeOpportunity.demand")}
                  </div>
                  <Badge
                    className={cn("text-sm font-medium", labelColors[score.demandLabel])}
                  >
                    {t(`youtubeOpportunity.labels.${getLabelKey(score.demandLabel)}`)}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{parseExplanation(score.explanation?.demandReason, "youtubeOpportunity.tooltips.demandDefault")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-3 cursor-help"
                  data-testid="score-competition"
                >
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <Users className="h-3.5 w-3.5" />
                    {t("youtubeOpportunity.competition")}
                  </div>
                  <Badge
                    className={cn(
                      "text-sm font-medium",
                      score.competitionLabel === "low"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : score.competitionLabel === "high"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : labelColors[score.competitionLabel]
                    )}
                  >
                    {t(`youtubeOpportunity.labels.${getLabelKey(score.competitionLabel)}`)}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{parseExplanation(score.explanation?.competitionReason, "youtubeOpportunity.tooltips.competitionDefault")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-3 cursor-help border border-purple-100 dark:border-purple-800/30"
                  data-testid="score-opportunity"
                >
                  <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 mb-1">
                    <Target className="h-3.5 w-3.5" />
                    {t("youtubeOpportunity.opportunity")}
                  </div>
                  <Badge
                    className={cn(
                      "text-sm font-medium",
                      score.opportunityLabel === "strong"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : score.opportunityLabel === "good"
                        ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
                        : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                    )}
                  >
                    {t(`youtubeOpportunity.labels.${getLabelKey(score.opportunityLabel)}`)}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-2">
                  <p className="font-medium">{parseExplanation(score.explanation?.opportunityReason, "youtubeOpportunity.dataInfo")}</p>
                  <div className="text-xs space-y-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                    <p><span className="text-green-500 font-semibold">{t("youtubeOpportunity.labels.strong")}:</span> {t("youtubeOpportunity.opportunityLegend.strong")}</p>
                    <p><span className="text-yellow-500 font-semibold">{t("youtubeOpportunity.labels.good")}:</span> {t("youtubeOpportunity.opportunityLegend.good")}</p>
                    <p><span className="text-gray-400 font-semibold">{t("youtubeOpportunity.labels.weak")}:</span> {t("youtubeOpportunity.opportunityLegend.weak")}</p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>
              <strong className="text-gray-700 dark:text-gray-300">{snapshot.videoCount}</strong> {t("youtubeOpportunity.videos")}
            </span>
            <span>
              <strong className="text-gray-700 dark:text-gray-300">{formatNumber(snapshot.avgViews)}</strong> {t("youtubeOpportunity.avgViews")}
            </span>
            <span>
              <strong className="text-gray-700 dark:text-gray-300">{snapshot.uniqueChannels}</strong> {t("youtubeOpportunity.channels")}
            </span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  {t("youtubeOpportunity.dataInfo")}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
