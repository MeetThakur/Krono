// Codeforces API Types
export interface CodeforcesUserInfo {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
  avatar?: string;
  titlePhoto?: string;
  firstName?: string;
  lastName?: string;
}

export interface CodeforcesUserRating {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

export interface CodeforcesSubmission {
  id: number;
  contestId: number;
  creationTimeSeconds: number;
  problem: {
    contestId: number;
    index: string;
    name: string;
    rating?: number;
    tags: string[];
  };
  verdict: string;
  passedTestCount: number;
}

export interface CodeforcesContest {
  id: number;
  name: string;
  type: string;
  phase: string;
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds: number;
  relativeTimeSeconds: number;
}

// LeetCode API Types
export interface LeetCodeUserProfile {
  username: string;
  profile: {
    realName: string;
    userAvatar: string;
    ranking: number;
  };
  submitStats: {
    acSubmissionNum: { difficulty: string; count: number }[];
    totalSubmissionNum: { difficulty: string; count: number }[];
  };
}

export interface LeetCodeContestRanking {
  attendedContestsCount: number;
  rating: number;
  globalRanking: number;
  topPercentage: number;
}

export interface LeetCodeContestHistory {
  attended: boolean;
  rating: number;
  ranking: number;
  contest: {
    title: string;
    startTime: number;
  };
}

export interface LeetCodeUpcomingContest {
  title: string;
  titleSlug: string;
  startTime: number;
  duration: number;
}

// CodeChef API Types
export interface CodeChefContest {
  contest_code: string;
  contest_name: string;
  contest_start_date: string;
  contest_end_date: string;
  contest_duration: number;
}

export interface CodeChefUserInfo {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  globalRank?: number;
  problemsSolved: number;
  totalContests: number;
  ratingHistory: any[];
  avatar?: string;
  name: string;
}

// AtCoder API Types
export interface AtCoderContest {
  id: string;
  start_epoch_second: number;
  duration_second: number;
  title: string;
  rate_change: string;
}

export interface AtCoderUserInfo {
  handle: string;
  rating: number;
  maxRating: number;
  problemsSolved: number;
  totalContests: number;
  avatar?: string;
  rank?: string;
}
