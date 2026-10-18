import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { POTD, potdService } from '../services/potdService';

interface PotdState {
    leetcode: POTD | null;
    gfg: POTD | null;
    lastUpdated: string | null;
    isLoading: boolean;
    refreshPotd: () => Promise<void>;
}

export const usePotdStore = create<PotdState>()(
    persist(
        (set, get) => ({
            leetcode: null,
            gfg: null,
            lastUpdated: null,
            isLoading: false,

            refreshPotd: async () => {
                const today = new Date().toISOString().split('T')[0];
                const { lastUpdated, isLoading } = get();

                // Simple cache: if already fetched today, don't refetch unless forced (omitted logic for force)
                if (lastUpdated === today && !isLoading) {
                    // Optional: could add expiry check
                }

                set({ isLoading: true });
                
                // Fetch in parallel
                const [lcData, gfgData] = await Promise.all([
                    potdService.getLeetCodePOTD(),
                    potdService.getGfgPOTD()
                ]);

                set({
                    leetcode: lcData,
                    gfg: gfgData,
                    lastUpdated: today,
                    isLoading: false
                });
            }
        }),
        {
            name: 'krono-potd-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
