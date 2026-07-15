import { Platform } from "react-native";
import { useSettingsStore } from "../stores/useSettingsStore";
import { Contest } from "../types/contest";
import type * as NotificationsType from "expo-notifications";

let Notifications: typeof NotificationsType | null = null;
try {
  Notifications = require("expo-notifications");
} catch (e) {
  console.warn("[Notifications] expo-notifications is not available in this environment.");
}


// ---------------------------------------------------------------------------
// Notification handler
// Must be called once at app startup (from _layout.tsx), NOT at module scope,
// because the native module may not be ready when this file is first imported.
// ---------------------------------------------------------------------------
export function setupNotificationHandler() {
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// ---------------------------------------------------------------------------
// Reminder intervals (minutes before contest start)
// ---------------------------------------------------------------------------
const REMINDER_INTERVALS_MINUTES = [60, 15];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a deterministic notification identifier for a contest + interval. */
function buildIdentifier(contestId: string, minutesBefore: number): string {
  return `krono-${contestId}-${minutesBefore}`;
}

/** Cancel every scheduled notification that Krono owns for a specific contest. */
async function cancelContestNotifications(contestId: string): Promise<void> {
  if (!Notifications) return;
  for (const minutes of REMINDER_INTERVALS_MINUTES) {
    try {
      await Notifications.cancelScheduledNotificationAsync(
        buildIdentifier(contestId, minutes),
      );
    } catch {
      // Ignore — identifier may not exist
    }
  }
}

// ---------------------------------------------------------------------------
// Exported service
// ---------------------------------------------------------------------------
export const notificationService = {
  // -------------------------------------------------------------------------
  // Permissions & channel setup
  // -------------------------------------------------------------------------
  requestPermissions: async (): Promise<boolean> => {
    if (!Notifications) return false;
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus === "granted" && Platform.OS === "android") {
        await notificationService.setupAndroidChannel();
      }

      return finalStatus === "granted";
    } catch (error) {
      console.warn("[Notifications] requestPermissions failed:", error);
      return false;
    }
  },

  setupAndroidChannel: async (): Promise<void> => {
    if (!Notifications) return;
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Contest Reminders",
        description:
          "Reminders before upcoming competitive programming contests",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
        showBadge: true,
      });
    } catch (error) {
      console.warn("[Notifications] setupAndroidChannel failed:", error);
    }
  },

  // -------------------------------------------------------------------------
  // Cancel all Krono-scheduled notifications
  // -------------------------------------------------------------------------
  cancelAll: async (): Promise<void> => {
    if (!Notifications) return;
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const kronoIds = scheduled
        .filter((n) => n.identifier.startsWith("krono-"))
        .map((n) => n.identifier);

      await Promise.all(
        kronoIds.map((id) =>
          Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
        ),
      );
    } catch (error) {
      console.warn("[Notifications] cancelAll failed:", error);
    }
  },

  // -------------------------------------------------------------------------
  // Cancel reminders for a single contest
  // -------------------------------------------------------------------------
  cancelContestReminders: async (contest: Contest): Promise<void> => {
    try {
      await cancelContestNotifications(contest.id);
    } catch (error) {
      console.warn("[Notifications] cancelContestReminders failed:", error);
    }
  },

  // -------------------------------------------------------------------------
  // Schedule reminders for a single contest (bell-icon toggle)
  // -------------------------------------------------------------------------
  scheduleContestReminder: async (contest: Contest): Promise<boolean> => {
    if (!Notifications) return false;
    try {
      // Always cancel first so we never double-schedule
      await cancelContestNotifications(contest.id);

      const { notificationsEnabled } = useSettingsStore.getState();
      if (!notificationsEnabled) return false;

      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) return false;

      const startDate =
        contest.startTime instanceof Date
          ? contest.startTime
          : new Date(contest.startTime);

      if (isNaN(startDate.getTime())) return false;

      const now = Date.now();
      if (startDate.getTime() <= now) return false;

      let scheduled = false;

      for (const minutes of REMINDER_INTERVALS_MINUTES) {
        const triggerMs = startDate.getTime() - minutes * 60 * 1000;
        if (triggerMs <= now) continue; // Already past

        const identifier = buildIdentifier(contest.id, minutes);
        const secondsFromNow = Math.max(
          1,
          Math.round((triggerMs - now) / 1000),
        );

        await Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title: `🏆 ${contest.name}`,
            body: `Starts in ${minutes} minute${minutes !== 1 ? "s" : ""}! Open Krono to join.`,
            data: {
              contestId: contest.id,
              platformId: contest.platformId,
            },
            sound: "default",
            ...(Platform.OS === "android" && {
              channelId: "default",
            }),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: secondsFromNow,
            repeats: false,
          },
        });

        console.log(
          `[Notifications] Scheduled "${contest.name}" reminder: ${minutes}min before (in ${secondsFromNow}s)`,
        );
        scheduled = true;
      }

      return scheduled;
    } catch (error) {
      console.warn("[Notifications] scheduleContestReminder failed:", error);
      return false;
    }
  },

  // -------------------------------------------------------------------------
  // Bulk-schedule reminders for all upcoming contests (called after sync)
  // -------------------------------------------------------------------------
  scheduleAllReminders: async (contests: Contest[]): Promise<void> => {
    if (!Notifications) return;
    try {
      const { notificationsEnabled } = useSettingsStore.getState();

      console.log(
        `[Notifications] scheduleAllReminders called. enabled=${notificationsEnabled}, contests=${contests.length}`,
      );

      // If notifications are disabled, wipe everything and bail
      if (!notificationsEnabled) {
        await notificationService.cancelAll();
        return;
      }

      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) {
        console.warn("[Notifications] Permission not granted — skipping.");
        return;
      }

      // Cancel all existing Krono notifications before rescheduling.
      // This prevents stale notifications for contests that were removed / rescheduled.
      await notificationService.cancelAll();

      const now = Date.now();
      let scheduledCount = 0;
      let skippedCount = 0;

      for (const contest of contests) {
        const startDate =
          contest.startTime instanceof Date
            ? contest.startTime
            : new Date(contest.startTime);

        if (isNaN(startDate.getTime())) {
          console.warn(
            `[Notifications] Skipping "${contest.name}" — invalid startTime: ${contest.startTime}`,
          );
          skippedCount++;
          continue;
        }
        if (startDate.getTime() <= now) {
          skippedCount++;
          continue; // Past contest
        }

        for (const minutes of REMINDER_INTERVALS_MINUTES) {
          const triggerMs = startDate.getTime() - minutes * 60 * 1000;
          if (triggerMs <= now) {
            skippedCount++;
            continue; // Reminder window already passed
          }

          const identifier = buildIdentifier(contest.id, minutes);
          const secondsFromNow = Math.max(
            1,
            Math.round((triggerMs - now) / 1000),
          );

          try {
            // Use TIME_INTERVAL instead of DATE.
            // DATE triggers can silently fail in some Expo Go / SDK combos,
            // while TIME_INTERVAL is more broadly supported.
            await Notifications.scheduleNotificationAsync({
              identifier,
              content: {
                title: `🏆 ${contest.name}`,
                body: `Starts in ${minutes} minute${minutes !== 1 ? "s" : ""}! Open Krono to join.`,
                data: {
                  contestId: contest.id,
                  platformId: contest.platformId,
                },
                sound: "default",
                ...(Platform.OS === "android" && {
                  channelId: "default",
                }),
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: secondsFromNow,
                repeats: false,
              },
            });

            scheduledCount++;
          } catch (e) {
            // One failure must not abort the rest
            console.warn(
              `[Notifications] Failed to schedule ${identifier} (in ${secondsFromNow}s):`,
              e,
            );
          }
        }
      }

      console.log(
        `[Notifications] Done. Scheduled=${scheduledCount}, Skipped=${skippedCount}`,
      );
    } catch (error) {
      console.warn("[Notifications] scheduleAllReminders failed:", error);
    }
  },

  // -------------------------------------------------------------------------
  // Test notification (fires 5 seconds from now)
  // -------------------------------------------------------------------------
  sendTestNotification: async (): Promise<void> => {
    if (!Notifications) {
      alert("Push notifications are not supported in this environment.");
      return;
    }
    try {
      const hasPermission = await notificationService.requestPermissions();

      if (!hasPermission) {
        alert(
          "Notification permission not granted. Please enable it in your device settings.",
        );
        return;
      }

      await Notifications.scheduleNotificationAsync({
        identifier: "krono-test",
        content: {
          title: "Krono Test 🔔",
          body: "Notifications are working correctly!",
          sound: "default",
          ...(Platform.OS === "android" && { channelId: "default" }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
          repeats: false,
        },
      });

      alert("Test notification scheduled — it will appear in 5 seconds.");
    } catch (error) {
      console.error("[Notifications] sendTestNotification failed:", error);
      alert(`Failed to schedule test notification: ${error}`);
    }
  },
};
