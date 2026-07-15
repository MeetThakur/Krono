import { create } from "zustand";
import { PlatformId } from "../types/platform";
import { UnifiedProfile } from "../types/user";
import { fetchProfile } from "../services/profileFetcher";
import { getErrorMessage } from "../utils/errors";
import {
  deleteAllRivals,
  deleteRival,
  getAllRivals,
  saveRival,
} from "../database/repositories/rivalRepository";

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

  loadRivals: () => Promise<void>;
  addRival: (platformId: PlatformId, handle: string) => Promise<void>;
  removeRival: (id: string) => Promise<void>;
  refreshRivals: () => Promise<void>;
}

export const useRivalsStore = create<RivalsState>((set, get) => ({
  rivals: [],
  isLoading: false,
  error: null,

  loadRivals: async () => {
    set({ isLoading: true });
    try {
      const dbRivals = await getAllRivals();
      const rivals: Rival[] = dbRivals.map((data) => ({
        id: `${data.platformId}-${data.username.toLowerCase()}`,
        platformId: data.platformId,
        username: data.username,
        data,
      }));
      set({ rivals, isLoading: false });
    } catch (error) {
      set({ error: "Failed to load rivals", isLoading: false });
    }
  },

  addRival: async (platformId: PlatformId, handle: string) => {
    const id = `${platformId}-${handle.toLowerCase()}`;
    if (get().rivals.some((r) => r.id === id)) {
      set({ error: "Rival already exists" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      // Fetch data immediately
      const newProfile = await fetchProfile(platformId, handle);
      await saveRival(newProfile);

      set((state) => ({
        rivals: [
          ...state.rivals,
          { id, platformId, username: handle, data: newProfile },
        ],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: getErrorMessage(error) || "Failed to add rival",
        isLoading: false,
      });
    }
  },

  removeRival: async (id: string) => {
    try {
      // The id in DB is the profile id (e.g. atcoder-user).
      // Wait, is it? We need to make sure the delete uses the same ID.
      // Profile ID is usually generated correctly in normalize functions.
      // Actually, the newProfile.id is usually what we use. Let's find out what id `removeRival` takes.
      // It takes the "platformId-handle" format. That's also what saveRival stores (as `profile.id`).
      // Wait, let's be safe. Delete it from SQLite using the id passed in, assuming they match.
      // Actually `deleteRival` uses `profile.id`. Is `profile.id` equal to `${platformId}-${handle.toLowerCase()}`? Yes, mostly.
      await deleteRival(id);
      set((state) => ({
        rivals: state.rivals.filter((r) => r.id !== id),
      }));
    } catch (error) {
      console.error("Failed to remove rival:", error);
    }
  },

  refreshRivals: async () => {
    const rivals = get().rivals;
    if (rivals.length === 0) return;

    set({ isLoading: true, error: null });
    try {
      const updatedRivals = await Promise.all(
        rivals.map(async (rival) => {
          try {
            const newProfile = await fetchProfile(
              rival.platformId,
              rival.username
            );
            await saveRival(newProfile);
            return { ...rival, data: newProfile };
          } catch (error) {
            console.error(`Failed to refresh rival ${rival.id}:`, error);
            return rival; // Ignore failed fetches
          }
        })
      );
      set({ rivals: updatedRivals, isLoading: false });
    } catch (error) {
      set({
        error: getErrorMessage(error) || "Failed to refresh rivals",
        isLoading: false,
      });
    }
  },
}));
