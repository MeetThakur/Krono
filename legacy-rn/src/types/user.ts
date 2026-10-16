import { PlatformId } from './platform';

export interface Badge {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  earnedDate?: Date;
}

export interface UnifiedProfile {
  id: string; // unique internal id (e.g., "codeforces:tourist")
  platformId: PlatformId;
  username: string; // Handle/username on the platform
  displayName?: string;
  avatar?: string;
  
  // Rating Stats
  rating: number;
  maxRating: number;
  rank?: string; // e.g., "Candidate Master", "Guardian", "3 Star"
  globalRank?: number; // e.g. 1234
  topPercentage?: number; // e.g. 5.5%
  
  // Progress Stats
  problemsSolved: number;
  totalSubmissions: number;
  totalContests?: number;
  
  // Activity
  streak?: number;
  lastActive?: Date;
  
  // Achievements
  badges: Badge[];
  
  // Meta
  lastUpdated: Date;
  isStale: boolean; // Needs refresh
}
