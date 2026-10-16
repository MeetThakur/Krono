import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SettingsState {
    notificationsEnabled: boolean;
    backgroundSyncEnabled: boolean;

    toggleNotifications: (enabled: boolean) => Promise<void>;
    toggleBackgroundSync: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            notificationsEnabled: true,
            backgroundSyncEnabled: true,

            toggleNotifications: async (enabled: boolean) => {
                // Update the store value first so the service reads the new state
                set({ notificationsEnabled: enabled });

                try {
                    const { notificationService } =
                        await import("../services/notificationService");

                    if (!enabled) {
                        // User turned notifications OFF — cancel everything immediately
                        await notificationService.cancelAll();
                    } else {
                        // User turned notifications ON — reschedule from the current
                        // contest list so reminders are active straight away
                        const { useContestStore } =
                            await import("./useContestStore");
                        const contests =
                            useContestStore.getState().upcomingContests;

                        if (contests.length > 0) {
                            await notificationService.scheduleAllReminders(
                                contests,
                            );
                        }
                    }
                } catch (error) {
                    console.warn(
                        "[Settings] toggleNotifications side-effect failed:",
                        error,
                    );
                }
            },

            toggleBackgroundSync: (enabled: boolean) =>
                set({ backgroundSyncEnabled: enabled }),
        }),
        {
            name: "krono-settings-storage",
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
