// Platform integration services for LeetCode, GeeksforGeeks, and HackerRank

export interface PlatformStats {
  platform: 'LEETCODE' | 'GEEKSFORGEEKS' | 'HACKERRANK';
  username: string;
  problemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  maxStreak: number;
  rank?: number;
  badges: Array<{
    name: string;
    description: string;
    earnedAt: string;
  }>;
  lastSynced: string;
}

export interface LeetCodeProfile {
  username: string;
  problemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  maxStreak: number;
  rank: number;
  badges: Array<{
    name: string;
    description: string;
    earnedAt: string;
  }>;
}

export interface GeeksforGeeksProfile {
  username: string;
  problemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  maxStreak: number;
  rank: number;
  badges: Array<{
    name: string;
    description: string;
    earnedAt: string;
  }>;
}

export interface HackerRankProfile {
  username: string;
  problemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  maxStreak: number;
  rank: number;
  badges: Array<{
    name: string;
    description: string;
    earnedAt: string;
  }>;
}

// Mock API responses - In production, these would be real API calls
export class PlatformService {
  // LeetCode Integration
  static async getLeetCodeProfile(username: string): Promise<LeetCodeProfile | null> {
    try {
      // In production, this would make a real API call to LeetCode
      // For now, we'll simulate with mock data based on username
      const mockData: LeetCodeProfile = {
        username,
        problemsSolved: Math.floor(Math.random() * 500) + 50,
        easySolved: Math.floor(Math.random() * 200) + 20,
        mediumSolved: Math.floor(Math.random() * 250) + 30,
        hardSolved: Math.floor(Math.random() * 100) + 5,
        currentStreak: Math.floor(Math.random() * 30) + 1,
        maxStreak: Math.floor(Math.random() * 100) + 10,
        rank: Math.floor(Math.random() * 10000) + 1000,
        badges: [
          {
            name: 'Problem Solver',
            description: 'Solved 100+ problems',
            earnedAt: new Date().toISOString(),
          },
          {
            name: 'Streak Master',
            description: 'Maintained 30+ day streak',
            earnedAt: new Date().toISOString(),
          },
        ],
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockData;
    } catch (error) {
      console.error('Error fetching LeetCode profile:', error);
      return null;
    }
  }

  // GeeksforGeeks Integration
  static async getGeeksforGeeksProfile(username: string): Promise<GeeksforGeeksProfile | null> {
    try {
      const mockData: GeeksforGeeksProfile = {
        username,
        problemsSolved: Math.floor(Math.random() * 300) + 30,
        easySolved: Math.floor(Math.random() * 150) + 15,
        mediumSolved: Math.floor(Math.random() * 120) + 10,
        hardSolved: Math.floor(Math.random() * 50) + 5,
        currentStreak: Math.floor(Math.random() * 20) + 1,
        maxStreak: Math.floor(Math.random() * 60) + 5,
        rank: Math.floor(Math.random() * 5000) + 500,
        badges: [
          {
            name: 'Algorithm Expert',
            description: 'Solved 50+ algorithm problems',
            earnedAt: new Date().toISOString(),
          },
        ],
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockData;
    } catch (error) {
      console.error('Error fetching GeeksforGeeks profile:', error);
      return null;
    }
  }

  // HackerRank Integration
  static async getHackerRankProfile(username: string): Promise<HackerRankProfile | null> {
    try {
      const mockData: HackerRankProfile = {
        username,
        problemsSolved: Math.floor(Math.random() * 200) + 20,
        easySolved: Math.floor(Math.random() * 100) + 10,
        mediumSolved: Math.floor(Math.random() * 80) + 8,
        hardSolved: Math.floor(Math.random() * 30) + 2,
        currentStreak: Math.floor(Math.random() * 15) + 1,
        maxStreak: Math.floor(Math.random() * 40) + 3,
        rank: Math.floor(Math.random() * 2000) + 200,
        badges: [
          {
            name: 'Code Warrior',
            description: 'Solved 25+ challenges',
            earnedAt: new Date().toISOString(),
          },
        ],
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockData;
    } catch (error) {
      console.error('Error fetching HackerRank profile:', error);
      return null;
    }
  }

  // Get all platform stats for a user
  static async getAllPlatformStats(userId: string): Promise<PlatformStats[]> {
    try {
      // In production, this would fetch usernames from the database
      // and then fetch stats from each platform
      const platforms = ['LEETCODE', 'GEEKSFORGEEKS', 'HACKERRANK'] as const;
      const stats: PlatformStats[] = [];

      for (const platform of platforms) {
        const username = `user_${userId}_${platform.toLowerCase()}`;
        let profile;

        switch (platform) {
          case 'LEETCODE':
            profile = await this.getLeetCodeProfile(username);
            break;
          case 'GEEKSFORGEEKS':
            profile = await this.getGeeksforGeeksProfile(username);
            break;
          case 'HACKERRANK':
            profile = await this.getHackerRankProfile(username);
            break;
        }

        if (profile) {
          stats.push({
            platform,
            username: profile.username,
            problemsSolved: profile.problemsSolved,
            easySolved: profile.easySolved,
            mediumSolved: profile.mediumSolved,
            hardSolved: profile.hardSolved,
            currentStreak: profile.currentStreak,
            maxStreak: profile.maxStreak,
            rank: profile.rank,
            badges: profile.badges,
            lastSynced: new Date().toISOString(),
          });
        }
      }

      return stats;
    } catch (error) {
      console.error('Error fetching all platform stats:', error);
      return [];
    }
  }

  // Sync platform data (to be called periodically)
  static async syncPlatformData(userId: string): Promise<void> {
    try {
      const stats = await this.getAllPlatformStats(userId);
      
      // In production, this would save to the database
      console.log('Synced platform data for user:', userId, stats);
      
      // Update last synced timestamp
      const lastSynced = new Date().toISOString();
      console.log('Last synced:', lastSynced);
    } catch (error) {
      console.error('Error syncing platform data:', error);
    }
  }
}

// Utility functions
export const formatPlatformName = (platform: string): string => {
  switch (platform) {
    case 'LEETCODE':
      return 'LeetCode';
    case 'GEEKSFORGEEKS':
      return 'GeeksforGeeks';
    case 'HACKERRANK':
      return 'HackerRank';
    default:
      return platform;
  }
};

export const getPlatformColor = (platform: string): string => {
  switch (platform) {
    case 'LEETCODE':
      return 'from-orange-500 to-yellow-500';
    case 'GEEKSFORGEEKS':
      return 'from-green-500 to-emerald-500';
    case 'HACKERRANK':
      return 'from-blue-500 to-cyan-500';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

export const getPlatformIcon = (platform: string): string => {
  switch (platform) {
    case 'LEETCODE':
      return '🧮';
    case 'GEEKSFORGEEKS':
      return '📚';
    case 'HACKERRANK':
      return '💻';
    default:
      return '📊';
  }
};



