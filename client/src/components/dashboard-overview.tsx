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
  Gift,
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

const modalContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const modalItemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
};

interface DashboardOverviewProps {
  className?: string;
  variant?: "default" | "sidebar" | "modal";
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
  topNiches?: {
    name: string;
    votes: number;
  }[];
  pendingRedemptions?: number;
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

export function DashboardOverview({
  className,
  variant = "default",
}: DashboardOverviewProps) {
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
  const isSidebar = variant === "sidebar";
  const isModal = variant === "modal";
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
    if (isModal) {
      const placeholderCount = user?.userRole === "creator" ? 5 : 4;
      return (
        <motion.div
          variants={modalContainerVariants}
          initial="hidden"
          animate="visible"
          className={cn("grid grid-cols-2 gap-3 sm:gap-4 w-full", className)}
        >
          {Array.from({ length: placeholderCount }).map((_, index) => (
            <motion.div
              key={index}
              variants={modalItemVariants}
              className="rounded-2xl bg-white/60 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50 px-4 py-4 shadow-inner flex flex-col gap-3"
            >
              <Skeleton className="h-6 w-12 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-28" />
            </motion.div>
          ))}
        </motion.div>
      );
    }

    return (
      <div className={className}>
        {/* Mobile Carousel */}
        <div
          className="lg:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 -mx-4"
          style={{ scrollbarWidth: "none" }}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Card
              key={index}
              className="rounded-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 min-w-[85%] snap-center"
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
        <div className="hidden lg:grid lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card
              key={index}
              className="rounded-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
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

        <CarouselIndicators total={5} active={0} />
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

    // Split metrics into regular cards and the Top Niche card
    // Order: Total Ideas, Total Votes, Pending Redemptions, Pending Suggestions
    const regularMetrics = [
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
        icon: Gift,
        title: t(
          "dashboard.overview.pendingRedemptions",
          "Pending Redemptions"
        ),
        value: stats.pendingRedemptions || 0,
        description: t(
          "dashboard.overview.pendingRedemptionsDesc",
          "Redemptions awaiting approval"
        ),
        color: "text-amber-600",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        badge: (stats.pendingRedemptions || 0) > 0 ? "attention" : undefined,
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
    ];

    const topNichesMetric = {
      icon: TrendingUp,
      title: t("dashboard.overview.topNiche", "Top Niche"),
      value:
        stats.topNiche?.name ||
        t("dashboard.overview.noNicheData", "No data yet"),
      description: t(
        "dashboard.overview.topNicheDesc",
        "Most voted categories"
      ),
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      isText: true,
      votes: stats.topNiche?.votes,
      topNiches: stats.topNiches,
      isDoubleHeight: true,
    };

    const creatorMetrics = [...regularMetrics, topNichesMetric];

    if (isModal) {
      const topNicheItems =
        topNichesMetric.topNiches && topNichesMetric.topNiches.length > 0
          ? topNichesMetric.topNiches.slice(0, 3)
          : null;

      return (
        <motion.div
          variants={modalContainerVariants}
          initial="hidden"
          animate="visible"
          className={cn("grid grid-cols-2 gap-3 sm:gap-4 w-full", className)}
        >
          {regularMetrics.map((metric, index) => (
            <motion.div
              key={`${metric.title}-${index}`}
              variants={modalItemVariants}
              className="rounded-2xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/60 dark:border-gray-700/50 px-4 py-4 shadow-md flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className={cn(
                    "p-2 rounded-lg flex items-center justify-center",
                    metric.bgColor
                  )}
                >
                  <metric.icon className={cn(metric.color, "h-4 w-4")} />
                </div>
                {metric.badge === "attention" && (
                  <Badge
                    variant="destructive"
                    className="text-[10px] px-1.5 py-0.5 h-fit"
                  >
                    {t("common.attention", "Attention")}
                  </Badge>
                )}
              </div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                {metric.title}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {metric.value.toLocaleString()}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                {metric.description}
              </p>
            </motion.div>
          ))}
          <motion.div
            key="top-niches-modal"
            variants={modalItemVariants}
            className="col-span-2 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 dark:from-purple-500/15 dark:via-indigo-500/15 dark:to-blue-500/15 border border-purple-200/40 dark:border-purple-500/25 px-4 py-4 shadow-md flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "p-2 rounded-lg flex items-center justify-center",
                  topNichesMetric.bgColor
                )}
              >
                <topNichesMetric.icon
                  className={cn(topNichesMetric.color, "h-4 w-4")}
                />
              </div>
              <div className="text-sm font-semibold text-purple-700 dark:text-purple-200 uppercase tracking-wide">
                {topNichesMetric.title}
              </div>
            </div>
            {topNicheItems ? (
              <div className="flex flex-col gap-2">
                {topNicheItems.map((niche, idx) => (
                  <div
                    key={`${niche.name}-${idx}`}
                    className="flex items-center justify-between gap-4 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 dark:border-gray-700/50 px-3 py-2 shadow-sm"
                  >
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100 capitalize">
                      {niche.name}
                    </span>
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-300">
                      {niche.votes} {t("ideas.votes", "votes")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("dashboard.overview.noNicheData", "No data yet")}
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
              {topNichesMetric.description}
            </p>
          </motion.div>
        </motion.div>
      );
    }

    const gridPlacement = [
      "col-start-1 row-start-1",
      "col-start-1 row-start-2",
      "col-start-2 row-start-1",
      "col-start-2 row-start-2",
    ];

    const renderDesktopMetricCard = (
      metric: (typeof regularMetrics)[number],
      index: number
    ) => (
      <motion.div
        key={metric.title}
        variants={itemVariants}
        className={cn(!isSidebar && gridPlacement[index])}
      >
        <Card
          className={cn(
            "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 flex flex-col",
            isSidebar ? "rounded-2xl" : "rounded-none h-full"
          )}
        >
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between space-y-0 pb-2.5 flex-shrink-0",
              isSidebar && "pb-3"
            )}
          >
            <CardTitle
              className={cn(
                "font-semibold text-gray-700 dark:text-gray-300 leading-tight",
                isSidebar ? "text-sm" : "text-xs"
              )}
            >
              {metric.title}
            </CardTitle>
            <div
              className={cn(
                "flex-shrink-0",
                isSidebar ? "p-2 rounded-lg" : "p-1.5 rounded-md",
                metric.bgColor
              )}
            >
              {(() => {
                const Icon = metric.icon;
                return (
                  <Icon
                    className={cn(
                      metric.color,
                      isSidebar ? "h-5 w-5" : "h-4 w-4"
                    )}
                  />
                );
              })()}
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-4 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-2 flex-wrap">
                <div
                  className={cn(
                    "font-bold text-gray-900 dark:text-white leading-tight",
                    isSidebar ? "text-3xl" : "text-2xl"
                  )}
                >
                  {metric.value.toLocaleString()}
                </div>
                {metric.badge === "attention" && (
                  <Badge
                    variant="destructive"
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 h-fit",
                      isSidebar && "text-xs"
                    )}
                  >
                    {t("common.attention", "Attention")}
                  </Badge>
                )}
              </div>
              <p
                className={cn(
                  "text-gray-500 dark:text-gray-400 leading-snug",
                  isSidebar ? "text-xs" : "text-[11px]"
                )}
              >
                {metric.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );

    const renderTopNichesCard = () => (
      <motion.div
        key="top-niches"
        variants={itemVariants}
        className={cn(!isSidebar && "col-start-3 row-start-1 row-span-2")}
      >
        <Card
          className={cn(
            "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 flex flex-col",
            isSidebar ? "rounded-2xl" : "rounded-none h-full"
          )}
        >
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between space-y-0 pb-3 flex-shrink-0",
              isSidebar && "pb-4"
            )}
          >
            <CardTitle
              className={cn(
                "font-semibold text-gray-700 dark:text-gray-300 leading-tight",
                isSidebar ? "text-base" : "text-sm"
              )}
            >
              {topNichesMetric.title}
            </CardTitle>
            <div
              className={cn(
                "flex-shrink-0",
                isSidebar ? "p-2.5 rounded-xl" : "p-2 rounded-md",
                topNichesMetric.bgColor
              )}
            >
              <topNichesMetric.icon
                className={cn(
                  topNichesMetric.color,
                  isSidebar ? "h-6 w-6" : "h-5 w-5"
                )}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {topNichesMetric.topNiches &&
              topNichesMetric.topNiches.length > 0 ? (
                topNichesMetric.topNiches.map((niche, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex flex-col space-y-1 border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0 last:pb-0",
                      isSidebar && "pb-4"
                    )}
                  >
                    <div
                      className={cn(
                        "font-bold text-gray-900 dark:text-white capitalize",
                        isSidebar ? "text-lg" : "text-lg"
                      )}
                    >
                      {niche.name}
                    </div>
                    <div
                      className={cn(
                        "text-gray-500 dark:text-gray-400",
                        isSidebar ? "text-sm" : "text-xs"
                      )}
                    >
                      {niche.votes} {t("ideas.votes", "votes")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col space-y-1">
                  <div className="text-lg font-bold text-gray-400 dark:text-gray-500">
                    {t("dashboard.overview.noNicheData", "No data yet")}
                  </div>
                </div>
              )}
            </div>
            <p
              className={cn(
                "text-gray-500 dark:text-gray-400 leading-snug mt-4",
                isSidebar ? "text-sm" : "text-xs"
              )}
            >
              {topNichesMetric.description}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );

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
              <Card className="rounded-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg h-full">
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
                        <div className="flex flex-col items-center space-y-3 w-full">
                          {(metric as any).topNiches &&
                          (metric as any).topNiches.length > 0 ? (
                            (metric as any).topNiches.map(
                              (niche: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex flex-col items-center space-y-1"
                                >
                                  <span className="text-2xl capitalize">
                                    {niche.name}
                                  </span>
                                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    {niche.votes} {t("ideas.votes", "votes")}
                                  </span>
                                </div>
                              )
                            )
                          ) : (
                            <span className="text-2xl capitalize">
                              {metric.value}
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

        {/* Desktop display */}
        {isSidebar ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex lg:flex-col gap-4"
          >
            <div className="flex flex-col gap-4">
              {regularMetrics.map((metric, index) =>
                renderDesktopMetricCard(metric, index)
              )}
            </div>
            {renderTopNichesCard()}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hidden lg:grid lg:grid-cols-3 gap-5 auto-rows-fr"
          >
            {regularMetrics.map((metric, index) =>
              renderDesktopMetricCard(metric, index)
            )}
            {renderTopNichesCard()}
          </motion.div>
        )}

        {!isSidebar && !isModal && (
          <CarouselIndicators
            total={creatorMetrics.length}
            active={activeSlide}
          />
        )}
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
              <Card className="rounded-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg h-full">
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
          className="hidden lg:grid lg:grid-cols-4 gap-4"
        >
          {audienceMetrics.map((metric, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="rounded-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
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
