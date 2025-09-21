import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

export function LeaderboardSkeleton() {
  return (
    <div className="container px-4 mx-auto py-8 dark:bg-gray-950 min-h-screen">
      {/* Header Skeleton */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-500/50" />
            <Skeleton className="h-10 md:h-12 w-48" />
          </div>
          <Skeleton className="h-6 w-64" />
        </div>
        
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </motion.div>

      {/* Creator Info Skeleton */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top 3 Podium Skeleton */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-5 w-64 mx-auto" />
        </div>

        {/* Desktop Podium Layout */}
        <div className="hidden md:grid grid-cols-3 gap-6 max-w-4xl mx-auto items-end">
          {/* Second Place */}
          <motion.div
            className="transform translate-y-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <PodiumSkeleton rank={2} height="h-64" />
          </motion.div>
          
          {/* First Place - Tallest */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <PodiumSkeleton rank={1} height="h-80" isWinner />
          </motion.div>
          
          {/* Third Place */}
          <motion.div
            className="transform translate-y-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <PodiumSkeleton rank={3} height="h-56" />
          </motion.div>
        </div>

        {/* Mobile Podium Layout */}
        <div className="md:hidden space-y-4">
          <PodiumSkeleton rank={1} height="h-32" isWinner isMobile />
          <PodiumSkeleton rank={2} height="h-28" isMobile />
          <PodiumSkeleton rank={3} height="h-24" isMobile />
        </div>
      </motion.div>

      {/* Rest of Ideas Skeleton */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="mb-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
          >
            <IdeaCardSkeleton position={index + 4} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function PodiumSkeleton({ 
  rank, 
  height, 
  isWinner = false, 
  isMobile = false 
}: { 
  rank: number; 
  height: string; 
  isWinner?: boolean; 
  isMobile?: boolean; 
}) {
  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500/50" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400/50" />;
      case 3: return <Award className="w-6 h-6 text-amber-600/50" />;
      default: return null;
    }
  };

  return (
    <Card className={`${height} relative overflow-hidden ${
      isWinner ? 'ring-2 ring-yellow-500/20 shadow-xl' : ''
    } ${isMobile ? 'flex items-center p-4' : 'p-6'}`}>
      <CardContent className={`${isMobile ? 'flex items-center gap-4 p-0 w-full' : 'h-full flex flex-col justify-between p-0'}`}>
        {/* Rank Badge */}
        <div className={`flex items-center gap-2 ${isMobile ? '' : 'mb-4'}`}>
          {getRankIcon(rank)}
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>

        {/* Content */}
        <div className={`${isMobile ? 'flex-1' : 'flex-1 flex flex-col justify-center'}`}>
          <Skeleton className={`${isMobile ? 'h-5 w-32 mb-2' : 'h-6 w-full mb-3'}`} />
          <Skeleton className={`${isMobile ? 'h-4 w-48' : 'h-4 w-full mb-2'}`} />
          {!isMobile && <Skeleton className="h-4 w-3/4" />}
        </div>

        {/* Vote Button */}
        <div className={`${isMobile ? 'flex flex-col items-end gap-2' : 'mt-4'}`}>
          <Skeleton className={`${isMobile ? 'h-8 w-16' : 'h-10 w-full'} rounded-full`} />
          {isMobile && <Skeleton className="h-4 w-12" />}
        </div>
      </CardContent>
    </Card>
  );
}

function IdeaCardSkeleton({ position }: { position: number }) {
  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4">
      <div className="flex items-start gap-4">
        {/* Position */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}