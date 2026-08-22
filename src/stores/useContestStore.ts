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

      // 1. Fetch from Codeforces
      try {
        const cfContestsRaw = await codeforcesApi.getContestList();
        if (cfContestsRaw && cfContestsRaw.length > 0) {
          const cfContests = cfContestsRaw.map(normalizeCodeforcesContest);
          allContests.push(...cfContests);
        }
      } catch (cfError) {
        console.warn("Failed to fetch Codeforces contests:", cfError);
      }

      // 2. Fetch from LeetCode
      try {
        const lcContestsRaw = await leetcodeApi.getUpcomingContests();
        if (lcContestsRaw && lcContestsRaw.length > 0) {
          const lcContests = lcContestsRaw.map(normalizeLeetCodeContest);
          allContests.push(...lcContests);
        }
      } catch (lcError) {
        console.warn("Failed to fetch LeetCode contests:", lcError);
      }

      // 3. Fetch from CodeChef
      try {
        const ccContestsRaw = await codechefApi.getContestList();
        if (ccContestsRaw && ccContestsRaw.length > 0) {
          const ccContests = ccContestsRaw.map(normalizeCodeChefContest);
          allContests.push(...ccContests);
        }
      } catch (ccError) {
        console.warn("Failed to fetch CodeChef contests:", ccError);
      }

      // 4. Fetch from AtCoder
      try {
        const acContestsRaw = await atcoderApi.getContestList();
        if (acContestsRaw && acContestsRaw.length > 0) {
          const acContests = acContestsRaw.map(normalizeAtCoderContest);
          allContests.push(...acContests);
        }
      } catch (acError) {
        console.warn("Failed to fetch AtCoder contests:", acError);
      }

      // 5. Save to database if any contests fetched
      if (allContests.length > 0) {
        try {
          await saveContests(allContests);
        } catch (dbError) {
          console.warn("Failed to cache contests to database:", dbError);
        }
      }

      // 6. Reload from DB or filter in-memory
      let upcoming: Contest[] = [];
      try {
        upcoming = await getUpcomingContests();
      } catch (e) {
        // Fallback to in-memory filter if DB query fails
        const now = Date.now();
        upcoming = allContests.filter((c) => {
          const end = new Date(c.endTime).getTime();
          return end > now;
        }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
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
