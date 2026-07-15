import axios from "axios";
import { CodeChefContest, CodeChefUserInfo } from "../types/api";

const BASE_URL = "https://www.codechef.com";

export const codechefApi = {
  /**
   * Returns information about upcoming contests.
   * Uses CodeChef's internal API.
   */
  getContestList: async (): Promise<CodeChefContest[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/list/contests/all`, {
        params: {
          sort_by: "START",
          sorting_order: "asc",
          offset: 0,
          mode: "all",
        },
        headers: {
          // Standard headers to look like a browser if needed
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
      });

      // The API returns { present_contests: [], future_contests: [], past_contests: [] }
      const present = response.data.present_contests || [];
      const future = response.data.future_contests || [];

      return [...present, ...future];
    } catch (error) {
      console.error("CodeChef getContestList error:", error);
      throw error;
    }
  },

  /**
   * Returns information about a user.
   * Since there is no official public API, this scrapes the user profile page.
   * Fallback to basic info if scraping is blocked.
   */
  getUserInfo: async (handle: string): Promise<CodeChefUserInfo> => {
    try {
      // NOTE: This is a scraper. It may break if CodeChef changes their UI.
      // We rely on simple string matching (Regex) to avoid heavy DOM parsers.
      const response = await axios.get(`${BASE_URL}/users/${handle}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "text/html",
        },
      });

      const html = response.data as string;

      // 1. Rating History and Rating (via Drupal.settings JSON)
      let rating = 0;
      let maxRating = 0;
      let ratingHistory: any[] = [];
      const settingsMatch = html.match(/jQuery\.extend\(Drupal\.settings,\s*(\{.*?\})\);/s);
      if (settingsMatch) {
        try {
          const ccData = JSON.parse(settingsMatch[1]);
          ratingHistory = ccData.date_versus_rating?.all || [];
          if (ratingHistory.length > 0) {
             rating = parseInt(ratingHistory[ratingHistory.length - 1].rating, 10);
             maxRating = Math.max(...ratingHistory.map((x: any) => parseInt(x.rating, 10)));
          }
        } catch(e) {
          console.warn("CodeChef rating parsing failed", e);
        }
      }

      // If json is missing, fallback to regex
      if (!rating) {
        const ratingMatch = html.match(/<div class="rating-number">(\d+)<\/div>/);
        rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;
      }

      // 3. Stars
      let starRating: string | undefined;
      const standardMatch = html.match(/>\s*(\d+)&#9733;/);
      const simpleMatch = html.match(/>\s*(\d+)\s*★/);
      const textMatch = html.match(/(\d+)\s*Star/i);

      if (standardMatch) {
        starRating = standardMatch[1];
      } else if (simpleMatch) {
        starRating = simpleMatch[1];
      } else if (textMatch) {
        starRating = textMatch[1];
      }

      // 4. Rank (Global)
      const globalRankMatch = html.match(/Global Rank:.*?<strong[^>]*>\s*(\d+)/is);

      let calculatedStar = 1;
      if (rating >= 2500) calculatedStar = 7;
      else if (rating >= 2200) calculatedStar = 6;
      else if (rating >= 2000) calculatedStar = 5;
      else if (rating >= 1800) calculatedStar = 4;
      else if (rating >= 1600) calculatedStar = 3;
      else if (rating >= 1400) calculatedStar = 2;

      let parsedRank = `${starRating || calculatedStar} Star`;

      // 5. Problems Solved
      let problemsSolved = 0;
      const solvedPatterns = [
        /Fully Solved\s*\((\d+)\)/i,
        /Problems Solved\s*:\s*(\d+)/i,
        />\s*Solved\s*:\s*(\d+)/i,
      ];
      for (const pattern of solvedPatterns) {
        const match = html.match(pattern);
        if (match) {
          problemsSolved = parseInt(match[1], 10);
          break;
        }
      }

      // 6. Name and Avatar
      const avatarMatch = html.match(/<img[^>]*class=['"]profileImage['"][^>]*src=['"]([^'"]+)['"]/) || html.match(/<img src="([^"]+)"[^>]*class="user-img/);
      const nameMatch = html.match(/<h1[^>]*>\s*([^<]+)\s*<\/h1>/) || html.match(/<h1[^>]*>(?:<span[^>]*>)?([^<]+)(?:<\/span>)?<\/h1>/);

      // 8. Total Contests
      const contestsMatch = html.match(/Contests \((.*?)\)/i) || html.match(/Contests[a-zA-Z\s<>]*:\s*(?:<strong>|<b>)?\s*(\d+)/i);
      const totalContests = contestsMatch ? parseInt(contestsMatch[1], 10) : ratingHistory.length;

      return {
        handle,
        rating,
        maxRating: maxRating || rating,
        rank: parsedRank,
        globalRank: globalRankMatch ? parseInt(globalRankMatch[1], 10) : undefined,
        problemsSolved,
        totalContests,
        ratingHistory,
        avatar: avatarMatch ? avatarMatch[1] : undefined,
        name: nameMatch ? nameMatch[1].trim() : handle,
      };
    } catch (error) {
      console.error("CodeChef getUserInfo error:", error);
      // If we fail (e.g. 403), return null so the store can handle it gracefully
      throw error;
    }
  },
};
