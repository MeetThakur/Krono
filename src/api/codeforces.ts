import axios from 'axios';
import {
  CodeforcesUserInfo,
  CodeforcesUserRating,
  CodeforcesSubmission,
  CodeforcesContest,
} from '../types/api';

const BASE_URL = 'https://codeforces.com/api';

export const codeforcesApi = {
  /**
   * Returns information about one or more users.
   * @param handles Semicolon-separated list of handles
   */
  getUserInfo: async (handles: string): Promise<CodeforcesUserInfo[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/user.info`, {
        params: { handles },
      });
      if (response.data.status === 'OK') {
        return response.data.result;
      }
      throw new Error(response.data.comment || 'Failed to fetch user info');
    } catch (error) {
      console.error('Codeforces getUserInfo error:', error);
      throw error;
    }
  },

  /**
   * Returns rating history of the specified user.
   */
  getUserRating: async (handle: string): Promise<CodeforcesUserRating[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/user.rating`, {
        params: { handle },
      });
      if (response.data.status === 'OK') {
        return response.data.result;
      }
      throw new Error(response.data.comment || 'Failed to fetch user rating');
    } catch (error) {
      console.error('Codeforces getUserRating error:', error);
      throw error;
    }
  },

  /**
   * Returns submissions of specified user.
   * count can be up to 10000.
   */
  getUserSubmissions: async (handle: string, count: number = 50): Promise<CodeforcesSubmission[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/user.status`, {
        params: { handle, from: 1, count },
      });
      if (response.data.status === 'OK') {
        return response.data.result;
      }
      throw new Error(response.data.comment || 'Failed to fetch user submissions');
    } catch (error) {
      console.error('Codeforces getUserSubmissions error:', error);
      throw error;
    }
  },

  /**
   * Returns information about all available contests.
   */
  getContestList: async (gym: boolean = false): Promise<CodeforcesContest[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/contest.list`, {
        params: { gym },
      });
      if (response.data.status === 'OK') {
        return response.data.result;
      }
      throw new Error(response.data.comment || 'Failed to fetch contest list');
    } catch (error) {
      console.error('Codeforces getContestList error:', error);
      throw error;
    }
  },
};
