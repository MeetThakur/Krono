import axios from "axios";

const BASE_URL = "https://www.codechef.com";

export const codechefApi = {
  /**
   * Returns information about upcoming contests.
   * Uses CodeChef's internal API.
   */
  getContestList: async () => {
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
  getUserInfo: async (handle: string) => {
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

      // Extract data using Regex
      // 1. Rating
      const ratingMatch = html.match(/<div class="rating-number">(\d+)<\/div>/);
      const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;

      // 2. Max Rating (Usually in <small>(Highest Rating 1234)</small>)
      const maxRatingMatch = html.match(/\(Highest Rating (\d+)\)/);
      const maxRating = maxRatingMatch
        ? parseInt(maxRatingMatch[1], 10)
        : rating;

      // 3. Stars (e.g. "3★")
      // We try multiple patterns to be robust against HTML changes
      let starRating: string | undefined;

      // Pattern A: Standard "rating-star" block
      // <div class="rating-star"> \n <span> \n 3★ \n </span> </div>
      const standardMatch = html.match(
        /class="rating-star"[\s\S]*?>\s*(\d+)\s*★/,
      );

      // Pattern B: Simple "<span>3★</span>" or similar
      const simpleMatch = html.match(/>\s*(\d+)\s*★\s*</);

      // Pattern C: Text based "3 Star"
      const textMatch = html.match(/(\d+)\s*Star/i);

      if (standardMatch) {
        starRating = standardMatch[1];
      } else if (simpleMatch) {
        starRating = simpleMatch[1];
      } else if (textMatch) {
        starRating = textMatch[1];
      }

      // 4. Rank (Global and Country)
      const globalRankMatch = html.match(/Global Rank:<\/strong>\s*(\d+)/i);

      // Determine the "Named Rank" based on rating points (Verified via User Image)
      // <= 1399 : 1 Star
      // 1400 - 1599 : 2 Stars
      // 1600 - 1799 : 3 Stars
      // 1800 - 1999 : 4 Stars
      // 2000 - 2199 : 5 Stars
      // 2200 - 2499 : 6 Stars
      // >= 2500 : 7 Stars

      let calculatedStar = 1;
      if (rating >= 2500) calculatedStar = 7;
      else if (rating >= 2200) calculatedStar = 6;
      else if (rating >= 2000) calculatedStar = 5;
      else if (rating >= 1800) calculatedStar = 4;
      else if (rating >= 1600) calculatedStar = 3;
      else if (rating >= 1400) calculatedStar = 2;

      // Handle "Star" suffix - User requested singular "Star" always
      const starSuffix = "Star";
      let parsedRank = `${calculatedStar} ${starSuffix}`;

      // 5. Problems Solved
      let problemsSolved = 0;
      const solvedPatterns = [
        /Fully Solved\s*\((\d+)\)/i, // Standard: Fully Solved (595)
        /Problems Solved\s*:\s*(\d+)/i, // Variation
        />\s*Solved\s*:\s*(\d+)/i,
        /class="content"\s*>\s*(\d+)\s*<\/h5>/, // Sometimes inside h5 content block
      ];

      for (const pattern of solvedPatterns) {
        const match = html.match(pattern);
        if (match) {
          problemsSolved = parseInt(match[1], 10);
          break;
        }
      }

      // 6. Name and Avatar
      const avatarMatch = html.match(/<img src="([^"]+)"[^>]*class="user-img/);

      // 7. Name
      const nameMatch = html.match(
        /<h1[^>]*>(?:<span[^>]*>)?([^<]+)(?:<\/span>)?<\/h1>/,
      );

      // 8. Total Contests
      const contestsMatch = html.match(/Contests[a-zA-Z\s<>]*:\s*(?:<strong>|<b>)?\s*(\d+)/i) || html.match(/"contests"\s*:\s*(\d+)/i) || html.match(/Contests[^0-9]*(\d+)/i);
      const totalContests = contestsMatch ? parseInt(contestsMatch[1], 10) : 0;

      // 9. Rating History (Scrape all_rating array)
      let ratingHistory: any[] = [];
      const ratingHistoryMatch = html.match(/var all_rating = (\[.*?\]);/s);
      if (ratingHistoryMatch) {
        try {
          ratingHistory = JSON.parse(ratingHistoryMatch[1]);
        } catch(e) {
          console.warn("CodeChef rating parsing failed", e);
        }
      }

      return {
        handle,
        rating,
        maxRating,
        rank: parsedRank, // Return "3 Star" instead of "1234"
        globalRank: globalRankMatch
          ? parseInt(globalRankMatch[1], 10)
          : undefined,
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
