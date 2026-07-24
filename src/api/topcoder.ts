import { clistApi } from "./clist";

export interface TopCoderUserInfo {
  handle: string;
  rating: number;
  name: string;
  totalContests: number;
}

export const topcoderApi = {
  getUserInfo: async (handle: string): Promise<TopCoderUserInfo | null> => {
    try {
      const account = await clistApi.getAccountInfo("topcoder", handle);
      
      if (!account) {
        throw new Error("User not found on Clist");
      }

      return {
        handle: account.handle,
        rating: account.rating,
        name: account.name || account.handle,
        totalContests: account.n_contests,
      };
    } catch (error) {
      console.error("TopCoder getUserInfo error:", error);
      throw error;
    }
  },
};
