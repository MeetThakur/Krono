import axios from 'axios';
import {
  LeetCodeUserProfile,
  LeetCodeContestRanking,
  LeetCodeContestHistory,
  LeetCodeUpcomingContest,
} from '../types/api';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

// GraphQL queries for LeetCode
const USER_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        realName
        userAvatar
        ranking
      }
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
        totalSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

const USER_CONTEST_RANKING_QUERY = `
  query userContestRankingInfo($username: String!) {
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      topPercentage
    }
    userContestRankingHistory(username: $username) {
      attended
      rating
      ranking
      contest {
        title
        startTime
      }
    }
  }
`;

const UPCOMING_CONTESTS_QUERY = `
  query {
    topTwoContests {
      title
      titleSlug
      startTime
      duration
    }
  }
`;

export const leetcodeApi = {
  /**
   * Get user profile and submission stats
   */
  getUserProfile: async (username: string): Promise<LeetCodeUserProfile> => {
    try {
      const response = await axios.post(
        LEETCODE_GRAPHQL_URL,
        {
          query: USER_PROFILE_QUERY,
          variables: { username },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0]?.message || 'GraphQL error');
      }

      return response.data.data.matchedUser;
    } catch (error) {
      console.error('LeetCode getUserProfile error:', error);
      throw error;
    }
  },

  /**
   * Get user contest ranking and history
   */
  getUserContestRanking: async (username: string): Promise<{ ranking: LeetCodeContestRanking; history: LeetCodeContestHistory[] }> => {
    try {
      const response = await axios.post(
        LEETCODE_GRAPHQL_URL,
        {
          query: USER_CONTEST_RANKING_QUERY,
          variables: { username },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0]?.message || 'GraphQL error');
      }

      return {
        ranking: response.data.data.userContestRanking,
        history: response.data.data.userContestRankingHistory,
      };
    } catch (error) {
      console.error('LeetCode getUserContestRanking error:', error);
      throw error;
    }
  },

  /**
   * Get upcoming contests (top 2)
   */
  getUpcomingContests: async (): Promise<LeetCodeUpcomingContest[]> => {
    try {
      const response = await axios.post(
        LEETCODE_GRAPHQL_URL,
        {
          query: UPCOMING_CONTESTS_QUERY,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0]?.message || 'GraphQL error');
      }

      return response.data.data.topTwoContests;
    } catch (error) {
      console.error('LeetCode getUpcomingContests error:', error);
      throw error;
    }
  },
};
