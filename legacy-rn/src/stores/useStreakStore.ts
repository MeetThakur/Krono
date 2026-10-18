import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { leetcodeApi } from "../api/leetcode";
import { codeforcesApi } from "../api/codeforces";
import { UnifiedProfile } from "../types/user";

export function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function getYesterdayKey(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
}

export function getDateKeyForDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

interface StreakState {
  currentStreak: number;
  bestStreak: number;
  dailyGoal: number; // default: 2
  dailyHistory: Record<string, number>; // "YYYY-MM-DD" -> count of solved problems
  baselineProblemsSolved: Record<string, number>; // profileId -> previous total solved count
  lastActiveDate: string | null;
  isLoading: boolean;

  // Actions
  setDailyGoal: (goal: number) => void;
  recordManualSolve: (date?: string) => void;
  syncStreakWithProfiles: (profiles: UnifiedProfile[]) => Promise<void>;
  computeStreakFromHistory: () => void;
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      bestStreak: 0,
      dailyGoal: 2,
      dailyHistory: {},
      baselineProblemsSolved: {},
      lastActiveDate: null,
      isLoading: false,

      setDailyGoal: (goal: number) => {
        set({ dailyGoal: Math.max(1, goal) });
      },

      recordManualSolve: (dateKey?: string) => {
        const key = dateKey || getTodayKey();
        const history = { ...get().dailyHistory };
        history[key] = (history[key] || 0) + 1;
        set({ dailyHistory: history });
        get().computeStreakFromHistory();
      },

      computeStreakFromHistory: () => {
        const { dailyHistory, bestStreak } = get();
        const todayStr = getTodayKey();
        const yesterdayStr = getYesterdayKey();

        const todayCount = dailyHistory[todayStr] || 0;
        const yesterdayCount = dailyHistory[yesterdayStr] || 0;

        // If no activity today and no activity yesterday, streak is broken
        if (todayCount === 0 && yesterdayCount === 0) {
          set({ currentStreak: 0 });
          return;
        }

        // Count consecutive days backward starting from either today or yesterday
        let streak = 0;
        const checkDate = new Date();
        if (todayCount === 0) {
          // Check from yesterday
          checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
          const key = getDateKeyForDate(checkDate);
          if ((dailyHistory[key] || 0) > 0) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        const newBest = Math.max(bestStreak, streak);
        const lastActive = todayCount > 0 ? todayStr : yesterdayCount > 0 ? yesterdayStr : null;

        set({
          currentStreak: streak,
          bestStreak: newBest,
          lastActiveDate: lastActive,
        });
      },

      syncStreakWithProfiles: async (profiles: UnifiedProfile[]) => {
        if (!profiles || profiles.length === 0) return;
        set({ isLoading: true });

        try {
          const history = { ...get().dailyHistory };
          const baselines = { ...get().baselineProblemsSolved };
          const todayKey = getTodayKey();

          // 1. Check LeetCode submission calendar if present
          const lcProfile = profiles.find((p) => p.platformId === "leetcode");
          if (lcProfile) {
            try {
              const calendarStr = await leetcodeApi.getUserCalendar(lcProfile.username);
              if (calendarStr) {
                const parsed: Record<string, number> = JSON.parse(calendarStr);
                for (const ts in parsed) {
                  const count = parsed[ts];
                  if (count > 0) {
                    const d = new Date(parseInt(ts, 10) * 1000);
                    const k = getDateKeyForDate(d);
                    history[k] = Math.max(history[k] || 0, count);
                  }
                }
              }
            } catch (err) {
              console.warn("[StreakStore] LeetCode calendar sync failed:", err);
            }
          }

          // 2. Check Codeforces recent submissions
          const cfProfile = profiles.find((p) => p.platformId === "codeforces");
          if (cfProfile) {
            try {
              const recentSubs = await codeforcesApi.getUserSubmissions(cfProfile.username, 100);
              if (Array.isArray(recentSubs)) {
                for (const sub of recentSubs) {
                  if (sub.verdict === "OK") {
                    const d = new Date(sub.creationTimeSeconds * 1000);
                    const k = getDateKeyForDate(d);
                    history[k] = (history[k] || 0) + 1;
                  }
                }
              }
            } catch (err) {
              console.warn("[StreakStore] CF sync failed:", err);
            }
          }

          // 3. Track aggregate solved problem count increase for other platforms
          let newSolvesToday = 0;
          for (const p of profiles) {
            const currentTotal = p.problemsSolved || 0;
            const previousTotal = baselines[p.id];

            if (previousTotal !== undefined && currentTotal > previousTotal) {
              const diff = currentTotal - previousTotal;
              newSolvesToday += diff;
            }
            baselines[p.id] = currentTotal;
          }

          if (newSolvesToday > 0) {
            history[todayKey] = (history[todayKey] || 0) + newSolvesToday;
          }

          set({
            dailyHistory: history,
            baselineProblemsSolved: baselines,
            isLoading: false,
          });

          get().computeStreakFromHistory();
        } catch (error) {
          console.warn("[StreakStore] syncStreakWithProfiles failed:", error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "krono-streak-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
