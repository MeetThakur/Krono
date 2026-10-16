import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const ONBOARDING_KEY = "krono_onboarding_completed";

interface OnboardingState {
  hasCompleted: boolean | null; // null = still loading
  isLoading: boolean;
  checkOnboarding: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasCompleted: null,
  isLoading: true,

  checkOnboarding: async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      set({ hasCompleted: value === "true", isLoading: false });
    } catch {
      // If reading fails, assume not completed
      set({ hasCompleted: false, isLoading: false });
    }
  },

  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      set({ hasCompleted: true });
    } catch (e) {
      console.warn("[Onboarding] Failed to save:", e);
    }
  },

  resetOnboarding: async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      set({ hasCompleted: false });
    } catch (e) {
      console.warn("[Onboarding] Failed to reset:", e);
    }
  },
}));
