import { create } from "zustand";
import { atcoderApi } from "../api/atcoder";
import { codechefApi } from "../api/codechef";
import { codeforcesApi } from "../api/codeforces";
import { leetcodeApi } from "../api/leetcode";
import {
    getUpcomingContests,
    saveContest,
    saveContests,
} from "../database/repositories/contestRepository";
import {
    normalizeAtCoderContest,
    normalizeCodeChefContest,
    normalizeCodeforcesContest,
    normalizeLeetCodeContest,
} from "../services/dataNormalizer";
import { Contest } from "../types/contest";
import { getErrorMessage } from "../utils/errors";

interface ContestState {
  upcomingContests: Contest[];
  isLoading: boolean;
  error: string | null;
  lastSyncTime: Date | null;

  // Actions
  loadContests: () => Promise<void>;
  syncContests: () => Promise<void>;
  toggleReminder: (contestId: string, enable: boolean) => Promise<void>;
}

export const useContestStore = create<ContestState>((set, get) => ({
  upcomingContests: [],
  isLoading: false,
  error: null,
  lastSyncTime: null,

  loadContests: async () => {
    set({ isLoading: true });
    try {
      const cached = await getUpcomingContests();
      if (cached && cached.length > 0) {
        set({ upcomingContests: cached, isLoading: false });
        // Background sync to ensure fresh data
        get().syncContests();
      } else {
        // No cache, trigger full sync
        await get().syncContests();
      }
    } catch (error) {
      console.warn("Failed to load cached contests, syncing directly:", error);
      await get().syncContests();
    }
  },

  syncContests: async () => {
    set({ isLoading: true, error: null });
    try {
      const allContests: Contest[] = [];

      // Parallel fetch across platforms
      const [cfResult, lcResult, ccResult, acResult] = await Promise.allSettled([
        codeforcesApi.getContestList().then((res) => (res || []).map(normalizeCodeforcesContest)),
        leetcodeApi.getUpcomingContests().then((res) => (res || []).map(normalizeLeetCodeContest)),
        codechefApi.getContestList().then((res) => (res || []).map(normalizeCodeChefContest)),
        atcoderApi.getContestList().then((res) => (res || []).map(normalizeAtCoderContest)),
      ]);

      if (cfResult.status === "fulfilled") allContests.push(...cfResult.value);
      else console.warn("Failed to fetch Codeforces contests:", cfResult.reason);

      if (lcResult.status === "fulfilled") allContests.push(...lcResult.value);
      else console.warn("Failed to fetch LeetCode contests:", lcResult.reason);

      if (ccResult.status === "fulfilled") allContests.push(...ccResult.value);
      else console.warn("Failed to fetch CodeChef contests:", ccResult.reason);

      if (acResult.status === "fulfilled") allContests.push(...acResult.value);
      else console.warn("Failed to fetch AtCoder contests:", acResult.reason);

      // 5. Save to database if any contests fetched (preserves existing reminderSet via UPSERT)
      if (allContests.length > 0) {
        try {
          await saveContests(allContests);
        } catch (dbError) {
          console.warn("Failed to cache contests to database:", dbError);
        }
      }

      // 6. Reload from DB or filter in-memory with reminder preservation
      let upcoming: Contest[] = [];
      try {
        upcoming = await getUpcomingContests();
      } catch (e) {
        // Fallback to in-memory filter preserving existing reminder settings
        const prevMap = new Map(get().upcomingContests.map((c) => [c.id, c]));
        const now = Date.now();
        upcoming = allContests
          .filter((c) => {
            const end = new Date(c.endTime).getTime();
            return end > now;
          })
          .map((c) => {
            const prev = prevMap.get(c.id);
            return prev
              ? {
                  ...c,
                  reminderSet: prev.reminderSet,
                  scheduledReminders: prev.scheduledReminders,
                }
              : c;
          })
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      }

      set({
        upcomingContests: upcoming,
        isLoading: false,
        lastSyncTime: new Date(),
      });

      // 7. Schedule notifications for upcoming contests
      try {
        const { notificationService } =
          await import("../services/notificationService");
        await notificationService.scheduleAllReminders(upcoming);
      } catch (e) {
        console.warn("⚠️ Failed to schedule notifications:", e);
      }
    } catch (error) {
      console.error("Failed to sync contests:", error);
      set({
        error: getErrorMessage(error) || "Failed to sync contests",
        isLoading: false,
      });
    }
  },

  toggleReminder: async (contestId: string, enable: boolean) => {
    const { upcomingContests } = get();
    const contest = upcomingContests.find((c) => c.id === contestId);

    if (contest) {
      let updatedContest = { ...contest };

      if (enable) {
        try {
          const { notificationService } =
            await import("../services/notificationService");
          await notificationService.scheduleContestReminder(contest);
        } catch (e) {
          console.warn("Notifications not available");
        }
        updatedContest.reminderSet = true;
      } else {
        try {
          const { notificationService } =
            await import("../services/notificationService");
          await notificationService.cancelContestReminders(contest);
        } catch (e) {
          console.warn("Notifications not available");
        }
        updatedContest.reminderSet = false;
      }

      try {
        await saveContest(updatedContest);
      } catch (e) {
        console.warn("Failed to persist reminder to DB:", e);
      }

      set((state) => ({
        upcomingContests: state.upcomingContests.map((c) =>
          c.id === contestId ? updatedContest : c,
        ),
      }));
    }
  },
}));
