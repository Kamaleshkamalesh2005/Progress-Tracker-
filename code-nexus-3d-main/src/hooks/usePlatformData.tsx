import { useState, useEffect, useCallback } from 'react';
import { PlatformService, PlatformStats } from '@/services/platforms';
import { useAuth } from '@/hooks/useAuth';

export interface UsePlatformDataReturn {
  platformStats: PlatformStats[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  syncData: () => Promise<void>;
  totalProblemsSolved: number;
  totalEasySolved: number;
  totalMediumSolved: number;
  totalHardSolved: number;
  currentStreak: number;
  maxStreak: number;
  totalBadges: number;
}

export function usePlatformData(): UsePlatformDataReturn {
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPlatformData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const stats = await PlatformService.getAllPlatformStats(user.id);
      setPlatformStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch platform data');
      console.error('Error fetching platform data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refreshData = useCallback(async () => {
    await fetchPlatformData();
  }, [fetchPlatformData]);

  const syncData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await PlatformService.syncPlatformData(user.id);
      await fetchPlatformData(); // Refresh data after sync
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync platform data');
      console.error('Error syncing platform data:', err);
    }
  }, [user?.id, fetchPlatformData]);

  // Calculate aggregated stats
  const totalProblemsSolved = platformStats.reduce((sum, stat) => sum + stat.problemsSolved, 0);
  const totalEasySolved = platformStats.reduce((sum, stat) => sum + stat.easySolved, 0);
  const totalMediumSolved = platformStats.reduce((sum, stat) => sum + stat.mediumSolved, 0);
  const totalHardSolved = platformStats.reduce((sum, stat) => sum + stat.hardSolved, 0);
  const currentStreak = Math.max(...platformStats.map(stat => stat.currentStreak), 0);
  const maxStreak = Math.max(...platformStats.map(stat => stat.maxStreak), 0);
  const totalBadges = platformStats.reduce((sum, stat) => sum + stat.badges.length, 0);

  useEffect(() => {
    fetchPlatformData();
  }, [fetchPlatformData]);

  // Auto-sync data every 5 minutes
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      syncData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [syncData, user?.id]);

  return {
    platformStats,
    loading,
    error,
    refreshData,
    syncData,
    totalProblemsSolved,
    totalEasySolved,
    totalMediumSolved,
    totalHardSolved,
    currentStreak,
    maxStreak,
    totalBadges,
  };
}



