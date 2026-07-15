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
      const contests = await getUpcomingContests();
      set({ upcomingContests: contests, isLoading: false });
    } catch (error) {
      set({ error: "Failed to load contests", isLoading: false });
    }
  },

  syncContests: async () => {
    set({ isLoading: true, error: null });
    try {
      // 1. Fetch from Codeforces
      const cfContestsRaw = await codeforcesApi.getContestList();
      const cfContests = cfContestsRaw.map(normalizeCodeforcesContest);

      // 2. Fetch from LeetCode
      let lcContests: Contest[] = [];
      try {
        const lcContestsRaw = await leetcodeApi.getUpcomingContests();
        if (lcContestsRaw && lcContestsRaw.length > 0) {
          lcContests = lcContestsRaw.map(normalizeLeetCodeContest);
        }
      } catch (lcError) {
        console.warn("Failed to fetch LeetCode contests:", lcError);
        // Continue without LeetCode contests
      }

      // 3. Fetch from CodeChef
      let ccContests: Contest[] = [];
      try {
        const ccContestsRaw = await codechefApi.getContestList();
        if (ccContestsRaw && ccContestsRaw.length > 0) {
          ccContests = ccContestsRaw.map(normalizeCodeChefContest);
        }
      } catch (ccError) {
        console.warn("Failed to fetch CodeChef contests:", ccError);
      }

      // 4. Fetch from AtCoder
      let acContests: Contest[] = [];
      try {
        const acContestsRaw = await atcoderApi.getContestList();
        if (acContestsRaw && acContestsRaw.length > 0) {
          acContests = acContestsRaw.map(normalizeAtCoderContest);
        }
      } catch (acError) {
        console.warn("Failed to fetch AtCoder contests:", acError);
      }

      // 5. Combine and save to DB (local cache)
      const allContests = [
        ...cfContests,
        ...lcContests,
        ...ccContests,
        ...acContests,
      ];
      await saveContests(allContests);

      // 6. Reload from DB to get the sorted, filtered list
      const upcoming = await getUpcomingContests();

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
        console.log(
          `✅ Scheduled notifications for ${upcoming.length} contests`,
        );
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
        // Schedule - use dynamic import to avoid startup issues
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

      await saveContest(updatedContest);

      set((state) => ({
        upcomingContests: state.upcomingContests.map((c) =>
          c.id === contestId ? updatedContest : c,
        ),
      }));
    }
  },
}));
