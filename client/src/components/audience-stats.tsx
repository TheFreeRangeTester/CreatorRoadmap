import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ThumbsUp, Send, CheckCircle, BarChart3, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useReactiveStats } from "@/hooks/use-reactive-stats";

interface AudienceStatsProps {
  isVisible: boolean;
  creatorId?: number;
}

export default function AudienceStats({ isVisible, creatorId }: AudienceStatsProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { points: pointsData, stats, isLoading } = useReactiveStats(creatorId);

  // Log data when it changes (only log when data actually exists to avoid spam)
  if (stats) {
    console.log("[AUDIENCE-STATS] Current stats:", stats);
  }
  if (pointsData) {
    console.log("[POINTS-DATA] Current points:", pointsData);
  }

  if (!isVisible || !user) {
    return null;
  }

  const statsItems = [
    {
      icon: <Star className="h-5 w-5 text-purple-500" />,
      label: t("points.totalPoints", "Total Points"),
      value: pointsData?.totalPoints || 0,
      description: t("points.availableForSuggestions", "Available for suggestions"),
      color: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: <ThumbsUp className="h-5 w-5 text-blue-500" />,
      label: t("audienceStats.votesGiven", "Votes Given"),
      value: stats?.votesGiven || 0,
      description: t("audienceStats.votesGivenDesc", "Ideas you've voted for"),
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: <Send className="h-5 w-5 text-yellow-500" />,
      label: t("audienceStats.ideasSuggested", "Ideas Suggested"),
      value: stats?.ideasSuggested || 0,
      description: t("audienceStats.ideasSuggestedDesc", "Ideas you've suggested"),
      color: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      label: t("audienceStats.ideasApproved", "Ideas Approved"),
      value: stats?.ideasApproved || 0,
      description: t("audienceStats.ideasApprovedDesc", "Your ideas that were approved"),
      color: "bg-green-50 dark:bg-green-900/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 break-words">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span className="break-words">{t("audienceStats.title", "Your Activity")}</span>
          </h2>
          <p className="text-muted-foreground mt-1 break-words">
            {t("audienceStats.subtitle", "Your participation stats across all creators")}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-2 break-words">
            {t("audienceStats.pointsInfo", "Gana puntos votando • Úsalos para sugerir ideas y canjear en tiendas")}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="relative rounded-3xl glass-card w-full max-w-none overflow-hidden animate-pulse">
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="relative rounded-3xl glass-card w-full max-w-none overflow-hidden">
                <CardHeader className="pb-2 px-4 pt-4">
                  <div className="flex items-center gap-2 justify-center">
                    <CardTitle className="text-base sm:text-lg leading-tight text-center flex items-center gap-2">
                      {item.icon}
                      <span className="break-words">{item.label}</span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 text-center">
                  <div className="mb-2">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {item.value}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}