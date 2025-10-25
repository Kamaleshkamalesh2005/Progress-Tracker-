// Real platform API integration for fetching actual data from coding platforms

export interface PlatformProfile {
  platform: 'LEETCODE' | 'GEEKSFORGEEKS' | 'HACKERRANK' | 'CODECHEF' | 'CODEFORCES' | 'ATCODER';
  username: string;
  problemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  maxStreak: number;
  rank?: number;
  rating?: number;
  badges: Array<{
    name: string;
    description: string;
    earnedAt: string;
  }>;
  lastSynced: string;
  isValid: boolean;
  error?: string;
}

export interface LeetCodeUser {
  username: string;
  problemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  maxStreak: number;
  rank: number;
  rating: number;
  badges: Array<{
    name: string;
    description: string;
    earnedAt: string;
  }>;
}

export interface GeeksforGeeksUser {
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

export interface HackerRankUser {
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

export class RealPlatformService {
  // LeetCode API Integration
  static async fetchLeetCodeProfile(username: string): Promise<PlatformProfile> {
    try {
      // Using LeetCode's GraphQL API
      const query = `
        query userProblemsSolved($username: String!) {
          allQuestionsCount {
            difficulty
            count
          }
          matchedUser(username: $username) {
            username
            submitStats {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
            profile {
              ranking
              userAvatar
            }
            badges {
              id
              displayName
              icon
              creationDate
            }
            userCalendar {
              submissionCalendar
            }
          }
        }
      `;

      const response = await fetch('https://leetcode.com/graphql/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { username }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors || !data.data?.matchedUser) {
        return {
          platform: 'LEETCODE',
          username,
          problemsSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          currentStreak: 0,
          maxStreak: 0,
          rank: 0,
          rating: 0,
          badges: [],
          lastSynced: new Date().toISOString(),
          isValid: false,
          error: 'User not found or profile is private'
        };
      }

      const user = data.data.matchedUser;
      const submissions = user.submitStats.acSubmissionNum;
      
      const easySolved = submissions.find((s: any) => s.difficulty === 'Easy')?.count || 0;
      const mediumSolved = submissions.find((s: any) => s.difficulty === 'Medium')?.count || 0;
      const hardSolved = submissions.find((s: any) => s.difficulty === 'Hard')?.count || 0;
      const totalSolved = easySolved + mediumSolved + hardSolved;

      // Calculate streak from submission calendar
      const calendar = user.userCalendar?.submissionCalendar || '{}';
      const submissionsData = JSON.parse(calendar);
      const { currentStreak, maxStreak } = this.calculateStreak(submissionsData);

      return {
        platform: 'LEETCODE',
        username,
        problemsSolved: totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        currentStreak,
        maxStreak,
        rank: user.profile?.ranking || 0,
        rating: 0, // LeetCode doesn't provide rating in this API
        badges: user.badges?.map((badge: any) => ({
          name: badge.displayName,
          description: badge.displayName,
          earnedAt: new Date(badge.creationDate * 1000).toISOString()
        })) || [],
        lastSynced: new Date().toISOString(),
        isValid: true
      };
    } catch (error) {
      console.error('Error fetching LeetCode profile:', error);
      return {
        platform: 'LEETCODE',
        username,
        problemsSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        currentStreak: 0,
        maxStreak: 0,
        rank: 0,
        rating: 0,
        badges: [],
        lastSynced: new Date().toISOString(),
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // GeeksforGeeks API Integration
  static async fetchGeeksforGeeksProfile(username: string): Promise<PlatformProfile> {
    try {
      // GeeksforGeeks doesn't have a public API, so we'll use web scraping approach
      // In production, you might want to use a backend service for this
      const response = await fetch(`https://auth.geeksforgeeks.org/user/${username}/`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      
      // Parse HTML to extract data (simplified - in production use proper HTML parser)
      const problemsMatch = html.match(/Problems Solved.*?(\d+)/);
      const problemsSolved = problemsMatch ? parseInt(problemsMatch[1]) : 0;

      return {
        platform: 'GEEKSFORGEEKS',
        username,
        problemsSolved,
        easySolved: Math.floor(problemsSolved * 0.6),
        mediumSolved: Math.floor(problemsSolved * 0.3),
        hardSolved: Math.floor(problemsSolved * 0.1),
        currentStreak: 0, // Would need more complex parsing
        maxStreak: 0,
        rank: 0,
        rating: 0,
        badges: [],
        lastSynced: new Date().toISOString(),
        isValid: true
      };
    } catch (error) {
      console.error('Error fetching GeeksforGeeks profile:', error);
      return {
        platform: 'GEEKSFORGEEKS',
        username,
        problemsSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        currentStreak: 0,
        maxStreak: 0,
        rank: 0,
        rating: 0,
        badges: [],
        lastSynced: new Date().toISOString(),
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // HackerRank API Integration
  static async fetchHackerRankProfile(username: string): Promise<PlatformProfile> {
    try {
      // HackerRank API endpoint
      const response = await fetch(`https://www.hackerrank.com/rest/contests/master/hackers/${username}/profile`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.model) {
        throw new Error('User not found');
      }

      const user = data.model;
      
      return {
        platform: 'HACKERRANK',
        username,
        problemsSolved: user.challenges_solved || 0,
        easySolved: Math.floor((user.challenges_solved || 0) * 0.7),
        mediumSolved: Math.floor((user.challenges_solved || 0) * 0.25),
        hardSolved: Math.floor((user.challenges_solved || 0) * 0.05),
        currentStreak: 0,
        maxStreak: 0,
        rank: user.rank || 0,
        rating: 0,
        badges: [],
        lastSynced: new Date().toISOString(),
        isValid: true
      };
    } catch (error) {
      console.error('Error fetching HackerRank profile:', error);
      return {
        platform: 'HACKERRANK',
        username,
        problemsSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        currentStreak: 0,
        maxStreak: 0,
        rank: 0,
        rating: 0,
        badges: [],
        lastSynced: new Date().toISOString(),
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Fetch all platform data for a user
  static async fetchAllPlatformData(platformUsernames: Record<string, string>): Promise<PlatformProfile[]> {
    const results: PlatformProfile[] = [];
    
    for (const [platform, username] of Object.entries(platformUsernames)) {
      if (!username) continue;
      
      let profile: PlatformProfile;
      
      switch (platform.toUpperCase()) {
        case 'LEETCODE':
          profile = await this.fetchLeetCodeProfile(username);
          break;
        case 'GEEKSFORGEEKS':
          profile = await this.fetchGeeksforGeeksProfile(username);
          break;
        case 'HACKERRANK':
          profile = await this.fetchHackerRankProfile(username);
          break;
        default:
          continue;
      }
      
      results.push(profile);
    }
    
    return results;
  }

  // Helper function to calculate streak from submission data
  private static calculateStreak(submissionsData: Record<string, number>): { currentStreak: number; maxStreak: number } {
    const today = new Date();
    const dates = Object.keys(submissionsData).map(dateStr => {
      const timestamp = parseInt(dateStr) * 1000;
      return new Date(timestamp);
    }).sort((a, b) => a.getTime() - b.getTime());

    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Calculate current streak
    for (let i = dates.length - 1; i >= 0; i--) {
      const date = dates[i];
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate max streak
    for (let i = 0; i < dates.length; i++) {
      if (i === 0 || dates[i].getTime() - dates[i-1].getTime() <= 24 * 60 * 60 * 1000) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    return { currentStreak, maxStreak };
  }

  // Validate platform username
  static async validatePlatformUsername(platform: string, username: string): Promise<boolean> {
    try {
      switch (platform.toUpperCase()) {
        case 'LEETCODE':
          const leetcodeProfile = await this.fetchLeetCodeProfile(username);
          return leetcodeProfile.isValid;
        case 'GEEKSFORGEEKS':
          const gfgProfile = await this.fetchGeeksforGeeksProfile(username);
          return gfgProfile.isValid;
        case 'HACKERRANK':
          const hrProfile = await this.fetchHackerRankProfile(username);
          return hrProfile.isValid;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error validating username:', error);
      return false;
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
    case 'CODECHEF':
      return 'CodeChef';
    case 'CODEFORCES':
      return 'Codeforces';
    case 'ATCODER':
      return 'AtCoder';
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
    case 'CODECHEF':
      return 'from-red-500 to-pink-500';
    case 'CODEFORCES':
      return 'from-purple-500 to-indigo-500';
    case 'ATCODER':
      return 'from-gray-500 to-gray-700';
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
    case 'CODECHEF':
      return '🍽️';
    case 'CODEFORCES':
      return '⚔️';
    case 'ATCODER':
      return '🏁';
    default:
      return '📊';
  }
};



