import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { useContestStore } from '../stores/useContestStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { notificationService } from './notificationService';

export const BACKGROUND_SYNC_TASK = 'BACKGROUND_SYNC_TASK';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const { backgroundSyncEnabled } = useSettingsStore.getState();
    if (!backgroundSyncEnabled) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    console.log('[BackgroundFetch] Starting contest sync...');
    
    // 1. Fetch latest contests (syncContests handles DB sync + scheduling reminders)
    const { syncContests } = useContestStore.getState();
    await syncContests();

    const latestContests = useContestStore.getState().upcomingContests;
    if (latestContests.length > 0) {
      console.log(`[BackgroundFetch] Successfully synced ${latestContests.length} upcoming contests.`);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('[BackgroundFetch] Failed to sync:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundTask = async () => {
    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
        if (!isRegistered) {
            await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
                minimumInterval: 60 * 60 * 6, // 6 hours
                stopOnTerminate: false, // Continue even if app is closed (Android)
                startOnBoot: true, // Restart on boot (Android)
            });
            console.log('[BackgroundFetch] Task registered');
        }
    } catch (e) {
        // Just log in dev, don't warn loudly as this is expected in Expo Go
        console.log('Background fetch registration failed or restricted:', e);
    }
};
