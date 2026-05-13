import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlatformId } from "../types/platform";
import { UnifiedProfile } from "../types/user";
import { codeforcesApi } from "../api/codeforces";
import { leetcodeApi } from "../api/leetcode";
import { codechefApi } from "../api/codechef";
import { atcoderApi } from "../api/atcoder";
import {
  normalizeAtCoderProfile,
  normalizeCodeChefProfile,
  normalizeCodeforcesProfile,
  normalizeLeetCodeProfile,
} from "../services/dataNormalizer";

export interface Rival {
  id: string; // "platformId-handle"
  platformId: PlatformId;
  username: string;
  data: UnifiedProfile | null;
}

interface RivalsState {
  rivals: Rival[];
  isLoading: boolean;
  error: string | null;

  addRival: (platformId: PlatformId, handle: string) => Promise<void>;
  removeRival: (id: string) => void;
  refreshRivals: () => Promise<void>;
}

export const useRivalsStore = create<RivalsState>()(
  persist(
    (set, get) => ({
      rivals: [],
      isLoading: false,
      error: null,

      addRival: async (platformId: PlatformId, handle: string) => {
        const id = `${platformId}-${handle.toLowerCase()}`;
        if (get().rivals.some((r) => r.id === id)) {
          set({ error: "Rival already exists" });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          // Fetch data immediately
          let newProfile: UnifiedProfile | null = null;
          if (platformId === "codeforces") {
            const [userInfo, ratingHistory, submissions] = await Promise.all([
              codeforcesApi.getUserInfo(handle),
              codeforcesApi.getUserRating(handle).catch(() => []),
              codeforcesApi.getUserSubmissions(handle, 1).catch(() => []), // Minimal submissions
            ]);
            newProfile = normalizeCodeforcesProfile(userInfo, ratingHistory, submissions);
          } else if (platformId === "leetcode") {
            const userData = await leetcodeApi.getUserProfile(handle);
            if (userData) {
              const contestData = await leetcodeApi.getUserContestRanking(handle).catch(() => null);
              newProfile = normalizeLeetCodeProfile(userData, contestData);
            }
          } else if (platformId === "codechef") {
            const userData = await codechefApi.getUserInfo(handle);
            if (userData) newProfile = normalizeCodeChefProfile(userData);
          } else if (platformId === "atcoder") {
            const userData = await atcoderApi.getUserInfo(handle);
            if (userData) newProfile = normalizeAtCoderProfile(userData);
          }

          if (!newProfile) {
            throw new Error("User not found");
          }

          set((state) => ({
            rivals: [
              ...state.rivals,
              { id, platformId, username: handle, data: newProfile },
            ],
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message || "Failed to add rival", isLoading: false });
        }
      },

      removeRival: (id: string) => {
        set((state) => ({
          rivals: state.rivals.filter((r) => r.id !== id),
        }));
      },

      refreshRivals: async () => {
        const rivals = get().rivals;
        if (rivals.length === 0) return;

        set({ isLoading: true, error: null });
        try {
          const updatedRivals = await Promise.all(
            rivals.map(async (rival) => {
              try {
                let newProfile: UnifiedProfile | null = null;
                if (rival.platformId === "codeforces") {
                  const userInfo = await codeforcesApi.getUserInfo(rival.username);
                  newProfile = normalizeCodeforcesProfile(userInfo, [], []);
                } else if (rival.platformId === "leetcode") {
                  const userData = await leetcodeApi.getUserProfile(rival.username);
                  if (userData) {
                    const contestData = await leetcodeApi.getUserContestRanking(rival.username).catch(() => null);
                    newProfile = normalizeLeetCodeProfile(userData, contestData);
                  }
                } else if (rival.platformId === "codechef") {
                  const userData = await codechefApi.getUserInfo(rival.username);
                  if (userData) newProfile = normalizeCodeChefProfile(userData);
                } else if (rival.platformId === "atcoder") {
                  const userData = await atcoderApi.getUserInfo(rival.username);
                  if (userData) newProfile = normalizeAtCoderProfile(userData);
                }

                if (newProfile) {
                  return { ...rival, data: newProfile };
                }
                return rival;
              } catch (e) {
                return rival; // Ignore failed fetches
              }
            })
          );
          set({ rivals: updatedRivals, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || "Failed to refresh rivals", isLoading: false });
        }
      },
    }),
    {
      name: "rivals-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
