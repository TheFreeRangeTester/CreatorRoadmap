import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  Lightbulb,
  ThumbsUp,
  TrendingUp,
  Users,
  Star,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useReactiveStats } from "@/hooks/use-reactive-stats";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { IdeaResponse } from "@shared/schema";
import { cn } from "@/lib/utils";

interface DashboardOverviewProps {
  className?: string;
}

interface CreatorStats {
  totalIdeas: number;
  totalVotes: number;
  pendingSuggestions: number;
  publishedIdeas: number;
  topNiche?: {
    name: string;
    votes: number;
  } | null;
}

interface AudienceStats {
  totalPoints: number;
  votesGiven: number;
  ideasSuggested: number;
  ideasApproved: number;
}

// Carousel Indicators Component
function CarouselIndicators({
  total,
  active,
}: {
  total: number;
  active: number;
}) {
  return (
    <div className="flex justify-center gap-2 mt-4 lg:hidden">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            index === active
              ? "w-6 bg-blue-600 dark:bg-blue-400"
              : "w-1.5 bg-gray-300 dark:bg-gray-600"
          )}
        />
      ))}
    </div>
  );
}

export function DashboardOverview({ className }: DashboardOverviewProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle scroll to update active slide indicator
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.offsetWidth;
      const newSlide = Math.round(scrollLeft / cardWidth);
      setActiveSlide(newSlide);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);
  const { t } = useTranslation();
  const { user } = useAuth();
  const { points: pointsData, stats } = useReactiveStats();

  // Fetch creator-specific stats
  const { data: creatorStats, isLoading: isLoadingCreatorStats } =
    useQuery<CreatorStats>({
      queryKey: ["/api/user/dashboard-stats"],
      enabled: user?.userRole === "creator",
      queryFn: async () => {
        console.log("[DASHBOARD-OVERVIEW] Fetching creator stats...");
        const response = await apiRequest("/api/user/dashboard-stats");
        const data = await response.json();
        console.log("[DASHBOARD-OVERVIEW] Creator stats received:", data);
        return data;
      },
    });

  // Fetch pending suggestions count for creators
  const { data: pendingSuggestions, isLoading: isLoadingPending } = useQuery<
    IdeaResponse[]
  >({
    queryKey: ["/api/pending-ideas"],
    enabled: user?.userRole === "creator",
  });

  const isLoading =
    user?.userRole === "creator"
      ? isLoadingCreatorStats || isLoadingPending
      : !pointsData || !stats;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  if (isLoading) {
    return (
      <div className={className}>
        {/* Mobile Carousel */}
        <div
          className="lg:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 -mx-4"
          style={{ scrollbarWidth: "none" }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 min-w-[85%] snap-center"
            >
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
            >
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <CarouselIndicators total={4} active={0} />
      </div>
    );
  }

  // Creator overview
  if (user?.userRole === "creator") {
    const stats = creatorStats || {
      totalIdeas: 0,
      totalVotes: 0,
      pendingSuggestions: pendingSuggestions?.length || 0,
      publishedIdeas: 0,
    };

    console.log("[DASHBOARD-OVERVIEW] Creator stats being used:", stats);

    const creatorMetrics = [
      {
        icon: Lightbulb,
        title: t("dashboard.overview.totalIdeas", "Total Ideas"),
        value: stats.totalIdeas,
        description: t("dashboard.overview.totalIdeasDesc", "Ideas publicadas"),
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
      {
        icon: ThumbsUp,
        title: t("dashboard.overview.totalVotes", "Total Votes"),
        value: stats.totalVotes,
        description: t("dashboard.overview.totalVotesDesc", "Votos recibidos"),
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
      },
      {
        icon: Clock,
        title: t(
          "dashboard.overview.pendingSuggestions",
          "Pending Suggestions"
        ),
        value: stats.pendingSuggestions,
        description: t(
          "dashboard.overview.pendingSuggestionsDesc",
          "Esperando aprobación"
        ),
        color: "text-orange-600",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        badge: stats.pendingSuggestions > 0 ? "attention" : undefined,
      },
      {
        icon: TrendingUp,
        title: t("dashboard.overview.topNiches", "Top Niches"),
        value:
          stats.topNiche?.name ||
          t("dashboard.overview.noNicheData", "No data yet"),
        description: t(
          "dashboard.overview.topNichesDesc",
          "Most voted category"
        ),
        color: "text-purple-600",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        isText: true,
        votes: stats.topNiche?.votes,
      },
    ];

    return (
      <div className={className}>
        {/* Mobile Carousel */}
        <div
          ref={scrollContainerRef}
          className="lg:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 -mx-4"
          style={{ scrollbarWidth: "none" }}
        >
          {creatorMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="min-w-[85%] snap-center"
            >
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg h-full">
                <CardHeader className="flex flex-col items-center justify-center space-y-3 pb-4">
                  <div className={`p-3 rounded-md ${metric.bgColor}`}>
                    <metric.icon className={`h-7 w-7 ${metric.color}`} />
                  </div>
                  <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-300 text-center">
                    {metric.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-center">
                  <div className="flex flex-col items-center justify-center mb-2">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                      {(metric as any).isText ? (
                        <div className="flex flex-col items-center">
                          <span className="text-2xl capitalize">
                            {metric.value}
                          </span>
                          {(metric as any).votes !== undefined && (
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                              {(metric as any).votes}{" "}
                              {t("ideas.votes", "votes")}
                            </span>
                          )}
                        </div>
                      ) : (
                        <>
                          {(metric.value as number).toLocaleString()}
                          {(metric as any).suffix}
                        </>
                      )}
                    </div>
                    {(metric as any).badge === "attention" && (
                      <Badge variant="destructive" className="text-xs mt-2">
                        {t("common.attention", "Attention")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Desktop Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="hidden lg:grid lg:grid-cols-2 gap-4"
        >
          {creatorMetrics.map((metric, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-md ${metric.bgColor}`}>
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(metric as any).isText ? (
                        <div className="flex flex-col">
                          <span className="text-xl capitalize">
                            {metric.value}
                          </span>
                          {(metric as any).votes !== undefined && (
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                              {(metric as any).votes}{" "}
                              {t("ideas.votes", "votes")}
                            </span>
                          )}
                        </div>
                      ) : (
                        <>
                          {(metric.value as number).toLocaleString()}
                          {(metric as any).suffix}
                        </>
                      )}
                    </div>
                    {(metric as any).badge === "attention" && (
                      <Badge variant="destructive" className="text-xs">
                        {t("common.attention", "Attention")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <CarouselIndicators
          total={creatorMetrics.length}
          active={activeSlide}
        />
      </div>
    );
  }

  // Audience overview
  if (user?.userRole === "audience") {
    console.log("[DASHBOARD-OVERVIEW] Audience stats being used:", {
      pointsData,
      stats,
    });

    const audienceMetrics = [
      {
        icon: Star,
        title: t("dashboard.overview.totalPoints", "Total Points"),
        value: pointsData?.totalPoints || 0,
        description: t(
          "dashboard.overview.totalPointsDesc",
          "Puntos disponibles"
        ),
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      },
      {
        icon: ThumbsUp,
        title: t("dashboard.overview.votesGiven", "Votes Given"),
        value: stats?.votesGiven || 0,
        description: t("dashboard.overview.votesGivenDesc", "Ideas votadas"),
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
      {
        icon: Users,
        title: t("dashboard.overview.ideasSuggested", "Ideas Suggested"),
        value: stats?.ideasSuggested || 0,
        description: t(
          "dashboard.overview.ideasSuggestedDesc",
          "Ideas enviadas"
        ),
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
      },
      {
        icon: TrendingUp,
        title: t("dashboard.overview.approvalRate", "Approval Rate"),
        value: (() => {
          const suggested = stats?.ideasSuggested || 0;
          const approved = stats?.ideasApproved || 0;
          return suggested > 0 ? Math.round((approved / suggested) * 100) : 0;
        })(),
        description: t(
          "dashboard.overview.approvalRateDesc",
          "Ideas aprobadas"
        ),
        color: "text-purple-600",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        suffix: "%",
      },
    ];

    return (
      <div className={className}>
        {/* Mobile Carousel */}
        <div
          ref={scrollContainerRef}
          className="lg:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 -mx-4"
          style={{ scrollbarWidth: "none" }}
        >
          {audienceMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="min-w-[85%] snap-center"
            >
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg h-full">
                <CardHeader className="flex flex-col items-center justify-center space-y-3 pb-4">
                  <div className={`p-3 rounded-md ${metric.bgColor}`}>
                    <metric.icon className={`h-7 w-7 ${metric.color}`} />
                  </div>
                  <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-300 text-center">
                    {metric.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {metric.value.toLocaleString()}
                    {metric.suffix}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Desktop Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="hidden lg:grid lg:grid-cols-2 gap-4"
        >
          {audienceMetrics.map((metric, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-md ${metric.bgColor}`}>
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value.toLocaleString()}
                    {metric.suffix}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <CarouselIndicators
          total={audienceMetrics.length}
          active={activeSlide}
        />
      </div>
    );
  }

  return null;
}
