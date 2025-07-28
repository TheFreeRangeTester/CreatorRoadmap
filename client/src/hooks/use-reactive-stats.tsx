import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';

interface UserPointsData {
  userId: number;
  totalPoints: number;
  pointsEarned: number;
  pointsSpent: number;
}

interface AudienceStatsData {
  votesGiven: number | string;
  ideasSuggested: number | string;
  ideasApproved: number | string;
}

interface NormalizedStatsData {
  votesGiven: number;
  ideasSuggested: number;
  ideasApproved: number;
}

interface ReactiveStats {
  points: UserPointsData | null;
  stats: NormalizedStatsData | null;
  isLoading: boolean;
  updatePoints: (newPoints: Partial<UserPointsData>) => void;
  updateStats: (newStats: Partial<NormalizedStatsData>) => void;
  addVote: () => void;
  spendPoints: (amount: number, type: 'suggestion' | 'store') => void;
}

export function useReactiveStats(): ReactiveStats {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Local reactive state
  const [localPoints, setLocalPoints] = useState<UserPointsData | null>(null);
  const [localStats, setLocalStats] = useState<NormalizedStatsData | null>(null);
  
  // Query for points data
  const { data: pointsData, isLoading: pointsLoading } = useQuery<UserPointsData>({
    queryKey: ['/api/user/points'],
    enabled: !!user,
    refetchOnWindowFocus: false,
  });
  
  // Query for stats data
  const { data: statsData, isLoading: statsLoading } = useQuery<AudienceStatsData>({
    queryKey: ['/api/user/audience-stats'],
    enabled: !!user,
    refetchOnWindowFocus: false,
  });
  
  // Update local state when server data changes
  useEffect(() => {
    if (pointsData) {
      console.log('[REACTIVE-STATS] Syncing points from server:', pointsData);
      setLocalPoints(pointsData);
    }
  }, [pointsData]);
  
  useEffect(() => {
    if (statsData) {
      console.log('[REACTIVE-STATS] Syncing stats from server:', statsData);
      // Convert string values to numbers if needed
      const normalizedStats = {
        votesGiven: typeof statsData.votesGiven === 'string' ? parseInt(statsData.votesGiven) : statsData.votesGiven,
        ideasSuggested: typeof statsData.ideasSuggested === 'string' ? parseInt(statsData.ideasSuggested) : statsData.ideasSuggested,
        ideasApproved: typeof statsData.ideasApproved === 'string' ? parseInt(statsData.ideasApproved) : statsData.ideasApproved,
      };
      setLocalStats(normalizedStats);
    }
  }, [statsData]);
  
  // Function to update points optimistically
  const updatePoints = useCallback((newPoints: Partial<UserPointsData>) => {
    setLocalPoints(current => current ? { ...current, ...newPoints } : null);
  }, []);
  
  // Function to update stats optimistically
  const updateStats = useCallback((newStats: Partial<NormalizedStatsData>) => {
    setLocalStats(current => current ? { ...current, ...newStats } : null);
  }, []);
  
  // Function to handle voting (adds 1 point and 1 vote)
  const addVote = useCallback(() => {
    console.log('[REACTIVE-STATS] Adding vote: +1 point, +1 vote stat');
    
    // Update points optimistically
    setLocalPoints(current => {
      if (!current) return null;
      const updated = {
        ...current,
        totalPoints: current.totalPoints + 1,
        pointsEarned: current.pointsEarned + 1,
      };
      console.log('[REACTIVE-STATS] Points updated:', updated);
      return updated;
    });
    
    // Update stats optimistically
    setLocalStats(current => {
      if (!current) return null;
      const updated = {
        ...current,
        votesGiven: current.votesGiven + 1,
      };
      console.log('[REACTIVE-STATS] Stats updated:', updated);
      return updated;
    });
    
    // Invalidate cache to sync with server
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/points'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/audience-stats'] });
    }, 100);
  }, [queryClient]);
  
  // Function to handle spending points
  const spendPoints = useCallback((amount: number, type: 'suggestion' | 'store') => {
    console.log(`[REACTIVE-STATS] Spending ${amount} points for ${type}`);
    
    setLocalPoints(current => {
      if (!current) return null;
      const updated = {
        ...current,
        totalPoints: Math.max(0, current.totalPoints - amount),
        pointsSpent: current.pointsSpent + amount,
      };
      console.log('[REACTIVE-STATS] Points after spending:', updated);
      return updated;
    });
    
    // If it's a suggestion, also update the suggestions count
    if (type === 'suggestion') {
      setLocalStats(current => {
        if (!current) return null;
        return {
          ...current,
          ideasSuggested: current.ideasSuggested + 1,
        };
      });
    }
    
    // Invalidate cache to sync with server
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/points'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/audience-stats'] });
    }, 100);
  }, [queryClient]);
  
  return {
    points: localPoints || pointsData || null,
    stats: localStats,
    isLoading: pointsLoading || statsLoading,
    updatePoints,
    updateStats,
    addVote,
    spendPoints,
  };
}