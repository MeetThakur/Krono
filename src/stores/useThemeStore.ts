import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeColor = 'monochrome' | 'blue' | 'emerald' | 'violet' | 'rose' | 'amber';

interface ThemeState {
  isDarkMode: boolean;
  themeColor: ThemeColor;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  setThemeColor: (color: ThemeColor) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false, // Default to Light
      themeColor: 'monochrome', // Default core Krono style
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setTheme: (isDark) => set({ isDarkMode: isDark }),
      setThemeColor: (color) => set({ themeColor: color }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
