import { atcoderApi } from "../api/atcoder";
import { codechefApi } from "../api/codechef";
import { codeforcesApi } from "../api/codeforces";
import { leetcodeApi } from "../api/leetcode";
import { geeksforgeeksApi } from "../api/geeksforgeeks";
import { topcoderApi } from "../api/topcoder";
import { hackerrankApi } from "../api/hackerrank";
import {
  normalizeAtCoderProfile,
  normalizeCodeChefProfile,
  normalizeCodeforcesProfile,
  normalizeLeetCodeProfile,
  normalizeGeeksForGeeksProfile,
  normalizeTopCoderProfile,
  normalizeHackerRankProfile,
} from "./dataNormalizer";
import { PlatformId } from "../types/platform";
import { UnifiedProfile } from "../types/user";

/**
 * Fetches user profile data from the corresponding platform API
 * and normalizes it into a standard UnifiedProfile structure.
 */
export async function fetchProfile(
  platformId: PlatformId,
  handle: string
): Promise<UnifiedProfile> {
  if (platformId === "codeforces") {
    // Fetch data in parallel
    const [userInfo, ratingHistory, submissions] = await Promise.all([
      codeforcesApi.getUserInfo(handle),
      codeforcesApi.getUserRating(handle).catch(() => []),
      codeforcesApi.getUserSubmissions(handle, 5000).catch(() => []),
    ]);

    return normalizeCodeforcesProfile(userInfo, ratingHistory, submissions);
  } else if (platformId === "leetcode") {
    // Get user profile including stats
    const userData = await leetcodeApi.getUserProfile(handle);

    if (!userData) {
      throw new Error("User not found");
    }

    // Get contest ranking
    let contestData = null;
    try {
      contestData = await leetcodeApi.getUserContestRanking(handle);
    } catch (e) {
      console.warn("Failed to fetch LeetCode contest ranking", e);
    }

    return normalizeLeetCodeProfile(userData, contestData);
  } else if (platformId === "codechef") {
    // Scrape user data
    const userData = await codechefApi.getUserInfo(handle);
    if (!userData || !userData.rating) {
      // If scraping completely fails or returns empty data
      if (!userData.name && !userData.rating) {
        throw new Error("User not found or profile hidden");
      }
    }
    return normalizeCodeChefProfile(userData);
  } else if (platformId === "atcoder") {
    const userData = await atcoderApi.getUserInfo(handle);
    // Basic validation: must have handle in result
    if (!userData || !userData.handle) {
      throw new Error("User not found. Note: AtCoder API is case-sensitive.");
    }
    return normalizeAtCoderProfile(userData);
  } else if (platformId === "geeksforgeeks") {
    const userData = await geeksforgeeksApi.getUserInfo(handle);
    if (!userData) {
      throw new Error("User not found");
    }
    return normalizeGeeksForGeeksProfile(userData);
  } else if (platformId === "topcoder") {
    const userData = await topcoderApi.getUserInfo(handle);
    if (!userData) {
      throw new Error("User not found");
    }
    return normalizeTopCoderProfile(userData);
  } else if (platformId === "hackerrank") {
    const userData = await hackerrankApi.getProfile(handle);
    if (!userData) {
      throw new Error("User not found");
    }
    return normalizeHackerRankProfile(userData, handle);
  }

  throw new Error(`Platform ${platformId} not implemented yet`);
}
