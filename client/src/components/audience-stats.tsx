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
}

export default function AudienceStats({ isVisible }: AudienceStatsProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { points: pointsData, stats, isLoading } = useReactiveStats();

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto px-4 py-6"
    >
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                {t("audienceStats.title", "Your Activity")}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t("audienceStats.subtitle", "Your participation stats across all creators")}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statsItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-4 rounded-lg ${item.color} border border-gray-200 dark:border-gray-700`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {item.icon}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {item.label}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {item.value}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          )}

        </CardContent>
      </Card>
    </motion.div>
  );
}