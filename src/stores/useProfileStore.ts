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

import AsyncStorage from "@react-native-async-storage/async-storage";

// Cache duration: 15 minutes
const CACHE_TTL_MS = 15 * 60 * 1000;
const ORDER_STORAGE_KEY = "krono_profile_order";

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
  reorderProfiles: (orderedIds: string[]) => Promise<void>;
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
      const savedOrderStr = await AsyncStorage.getItem(ORDER_STORAGE_KEY);
      if (savedOrderStr) {
        const savedOrder: string[] = JSON.parse(savedOrderStr);
        profiles.sort((a, b) => {
          const indexA = savedOrder.indexOf(a.id);
          const indexB = savedOrder.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      }
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
      const savedOrderStr = await AsyncStorage.getItem(ORDER_STORAGE_KEY);
      if (savedOrderStr) {
        const savedOrder: string[] = JSON.parse(savedOrderStr);
        updatedProfiles.sort((a, b) => {
          const indexA = savedOrder.indexOf(a.id);
          const indexB = savedOrder.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      }
      set({
        profiles: updatedProfiles,
        isLoading: false,
        lastRefreshedAt: Date.now(),
      });
    } catch (error) {
      console.error("Global refresh error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  reorderProfiles: async (orderedIds: string[]) => {
    try {
      await AsyncStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orderedIds));
      
      // Update local state to match the new order immediately
      const currentProfiles = get().profiles;
      const sortedProfiles = [...currentProfiles].sort((a, b) => {
        const indexA = orderedIds.indexOf(a.id);
        const indexB = orderedIds.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      
      set({ profiles: sortedProfiles });
    } catch (error) {
      console.error("Reorder Profiles Error:", error);
    }
  }
}));
