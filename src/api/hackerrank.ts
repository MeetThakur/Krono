import axios from "axios";

export const hackerrankApi = {
  getProfile: async (handle: string) => {
    let baseData: any = { handle };
    
    // Fetch native HackerRank API
    try {
      const resp = await axios.get(
        `https://www.hackerrank.com/rest/contests/master/hackers/${handle}/profile`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );
      if (resp.data?.model) {
        const m = resp.data.model;
        baseData = {
          handle: m.username,
          rating: 0,
          max_rating: 0,
          n_contests: m.event_count || 0,
          last_activity: m.created_at,
          avatarUrl: m.avatar,
        };
      } else {
        return null;
      }
    } catch (e) {
      console.warn("[HackerRank API] Native profile fetch failed:", e);
      return null;
    }

    // Fetch native badges to calculate total problems solved
    try {
      const badgesResp = await axios.get(
        `https://www.hackerrank.com/rest/hackers/${handle}/badges`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );
      if (badgesResp.data?.models) {
        const totalSolved = badgesResp.data.models.reduce(
          (acc: number, badge: any) => acc + (badge.solved || 0),
          0
        );
        baseData.problems_solved = totalSolved;
      }
    } catch (e) {
      console.warn("[HackerRank API] Badges fetch failed:", e);
    }

    return baseData;
  },

  getSubmissionHistory: async (handle: string): Promise<any> => {
    try {
      const resp = await axios.get(
        `https://www.hackerrank.com/rest/hackers/${handle}/submission_histories`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );
      return resp.data;
    } catch (e) {
      console.warn("[HackerRank API] submission_histories failed:", e);
      return null;
    }
  },
};
