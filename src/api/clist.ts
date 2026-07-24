import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_CLIST_API_KEY || "";
const API_USER = process.env.EXPO_PUBLIC_CLIST_USERNAME || "";
const BASE_URL = "https://clist.by/api/v4/json";

// Map our platform IDs to clist.by resource names
const RESOURCE_MAP: Record<string, string> = {
  codeforces: "codeforces.com",
  leetcode: "leetcode.com",
  codechef: "codechef.com",
  atcoder: "atcoder.jp",
  topcoder: "topcoder.com",
  hackerrank: "hackerrank.com",
};

interface ClistAccount {
  id: number;
  handle: string;
  name: string;
  rating: number;
  resource: string;
  resource_id: number;
  n_contests: number;
  last_activity: string;
}

interface ClistStatistic {
  account_id: number;
  contest_id: number;
  date: string;
  event: string;
  new_rating: number | null;
  old_rating: number | null;
  rating_change: number | null;
  place: number;
  score: number;
}

// ---- In-memory cache (5 min TTL) ----
const CACHE_TTL = 5 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const accountCache = new Map<string, CacheEntry<ClistAccount | null>>();
const statsCache = new Map<string, CacheEntry<ClistStatistic[]>>();

// Dedup inflight requests
const inflightAccount = new Map<string, Promise<ClistAccount | null>>();
const inflightStats = new Map<string, Promise<ClistStatistic[]>>();

function cacheKey(platformId: string, handle: string) {
  return `${platformId}:${handle}`;
}

export const clistApi = {
  /**
   * Get account info (including n_contests) for a handle on a given platform.
   * Results are cached for 5 minutes.
   */
  getAccountInfo: async (
    platformId: string,
    handle: string,
  ): Promise<ClistAccount | null> => {
    const resource = RESOURCE_MAP[platformId];
    if (!resource) return null;

    const key = cacheKey(platformId, handle);

    // Check cache
    const cached = accountCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // Dedup inflight
    const inflight = inflightAccount.get(key);
    if (inflight) return inflight;

    const promise = (async () => {
      try {
        const resp = await axios.get(`${BASE_URL}/account/`, {
          params: {
            username: API_USER,
            api_key: API_KEY,
            handle,
            resource,
            limit: 1,
          },
        });

        const objects = resp.data?.objects;
        const result =
          Array.isArray(objects) && objects.length > 0
            ? (objects[0] as ClistAccount)
            : null;

        accountCache.set(key, { data: result, timestamp: Date.now() });
        return result;
      } catch (e) {
        console.warn(
          `[clistApi] getAccountInfo failed for ${platformId}/${handle}:`,
          e,
        );
        return null;
      } finally {
        inflightAccount.delete(key);
      }
    })();

    inflightAccount.set(key, promise);
    return promise;
  },

  /**
   * Get full statistics (contest history) for an account.
   * Results are cached for 5 minutes.
   * Returns all entries sorted by date ascending.
   */
  getStatistics: async (
    platformId: string,
    handle: string,
  ): Promise<ClistStatistic[]> => {
    const resource = RESOURCE_MAP[platformId];
    if (!resource) return [];

    const key = cacheKey(platformId, handle);

    // Check cache
    const cached = statsCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // Dedup inflight
    const inflight = inflightStats.get(key);
    if (inflight) return inflight;

    const promise = (async () => {
      try {
        const account = await clistApi.getAccountInfo(platformId, handle);
        if (!account) return [];

        const resp = await axios.get(`${BASE_URL}/statistics/`, {
          params: {
            username: API_USER,
            api_key: API_KEY,
            account_id: account.id,
            order_by: "date",
            limit: 500,
          },
        });

        const objects = resp.data?.objects;
        const result = Array.isArray(objects)
          ? (objects as ClistStatistic[])
          : [];

        statsCache.set(key, { data: result, timestamp: Date.now() });
        return result;
      } catch (e) {
        console.warn(
          `[clistApi] getStatistics failed for ${platformId}/${handle}:`,
          e,
        );
        return [];
      } finally {
        inflightStats.delete(key);
      }
    })();

    inflightStats.set(key, promise);
    return promise;
  },

  /**
   * Get rating history only (entries with new_rating != null), sorted ascending.
   * Uses cached statistics.
   */
  getRatingHistory: async (
    platformId: string,
    handle: string,
  ): Promise<ClistStatistic[]> => {
    const stats = await clistApi.getStatistics(platformId, handle);
    return stats.filter((s) => s.new_rating !== null);
  },

  /**
   * Get recent contest entries sorted newest-first.
   * Uses cached statistics.
   */
  getRecentContests: async (
    platformId: string,
    handle: string,
    limit = 20,
  ): Promise<ClistStatistic[]> => {
    const stats = await clistApi.getStatistics(platformId, handle);
    // Return newest first, limited
    return [...stats].reverse().slice(0, limit);
  },
};
