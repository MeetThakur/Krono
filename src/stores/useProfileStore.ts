import { create } from "zustand";
import {
  deleteAllProfiles,
  deleteProfile,
  getAllProfiles,
  saveProfile,
} from "../database/repositories/profileRepository";
import { fetchProfile } from "../services/profileFetcher";
import { PlatformId } from "../types/platform";
import { UnifiedProfile } from "../types/user";
import { getErrorMessage } from "../utils/errors";

// Cache duration: 15 minutes
const CACHE_TTL_MS = 15 * 60 * 1000;

interface ProfileState {
  profiles: UnifiedProfile[];
  isLoading: boolean;
  error: string | null;
  lastRefreshedAt: number | null; // Unix timestamp of last refresh

  // Actions
  loadProfiles: () => Promise<void>;
  addProfile: (platform: PlatformId, handle: string) => Promise<void>;
  removeProfile: (id: string) => Promise<void>;
  removeAllProfiles: () => Promise<void>;
  refreshProfiles: (force?: boolean) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  isLoading: false,
  error: null,
  lastRefreshedAt: null,

  loadProfiles: async () => {
    set({ isLoading: true });
    try {
      const profiles = await getAllProfiles();
      set({ profiles, isLoading: false });
    } catch (error) {
      set({ error: "Failed to load profiles", isLoading: false });
    }
  },

  addProfile: async (platform: PlatformId, handle: string) => {
    set({ isLoading: true, error: null });

    try {
      const newProfile = await fetchProfile(platform, handle);
      await saveProfile(newProfile);

      // Reload from DB to ensure sync
      const profiles = await getAllProfiles();
      set({ profiles, isLoading: false, lastRefreshedAt: Date.now() });
    } catch (error) {
      console.error("Add Profile Error:", error);
      set({
        error: getErrorMessage(error) || "Failed to add profile",
        isLoading: false,
      });
    }
  },

  removeProfile: async (id: string) => {
    try {
      await deleteProfile(id);
      set((state) => ({
        profiles: state.profiles.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error("Failed to remove profile:", error);
    }
  },

  removeAllProfiles: async () => {
    try {
      await deleteAllProfiles();
      set({ profiles: [], lastRefreshedAt: null });
    } catch (error) {
      console.error("Failed to clear profiles:", error);
    }
  },

  refreshProfiles: async (force = false) => {
    const { lastRefreshedAt, profiles } = get();

    // Skip if recently refreshed (within CACHE_TTL_MS) and not forced
    if (
      !force &&
      lastRefreshedAt &&
      Date.now() - lastRefreshedAt < CACHE_TTL_MS
    ) {
      console.log("Profile stats cached — skipping refresh");
      return;
    }

    if (profiles.length === 0) return;

    set({ isLoading: true });

    try {
      // Create an array of promises to fetch updated data for each profile
      await Promise.all(
        profiles.map(async (profile) => {
          try {
            const { platformId, username } = profile;
            const newProfile = await fetchProfile(platformId, username);
            await saveProfile(newProfile);
          } catch (err) {
            console.error(`Failed to refresh profile ${profile.id}:`, err);
            // Continue with other profiles even if one fails
          }
        })
      );

      // Reload updated data from DB
      const updatedProfiles = await getAllProfiles();
      set({
        profiles: updatedProfiles,
        isLoading: false,
        lastRefreshedAt: Date.now(),
      });
    } catch (error) {
      console.error("Global refresh error:", error);
      set({ isLoading: false });
    }
  },
}));
