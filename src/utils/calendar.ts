import { Linking, Platform } from "react-native";
import { Contest } from "../types/contest";
import { PLATFORMS } from "../types/platform";

/**
 * Formats a Date object into UTC string format required by calendar templates (YYYYMMDDTHHmmssZ)
 */
function formatToCalendarDate(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d+/g, "");
}

/**
 * Opens the native calendar or Google Calendar with the contest details pre-filled.
 */
export async function addContestToCalendar(contest: Contest): Promise<void> {
  const startDate = new Date(contest.startTime);
  const durationMs = (contest.durationSeconds || 7200) * 1000;
  const endDate = contest.endTime ? new Date(contest.endTime) : new Date(startDate.getTime() + durationMs);

  const startFormatted = formatToCalendarDate(startDate);
  const endFormatted = formatToCalendarDate(endDate);

  const platformConfig = PLATFORMS[contest.platformId];
  const platformName = platformConfig?.name || contest.platformId;

  const title = encodeURIComponent(`[${platformName}] ${contest.name}`);
  const details = encodeURIComponent(
    `Coding contest on ${platformName}.\n\nContest Link: ${contest.url || "N/A"}\nTracked via Krono app.`
  );
  const location = encodeURIComponent(contest.url || platformName);

  // Google Calendar URL schema (works on Android intent & iOS/Web browser)
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startFormatted}/${endFormatted}&details=${details}&location=${location}`;

  try {
    const supported = await Linking.canOpenURL(googleCalendarUrl);
    if (supported) {
      await Linking.openURL(googleCalendarUrl);
    } else {
      // Fallback
      await Linking.openURL(googleCalendarUrl);
    }
  } catch (error) {
    console.error("Failed to open calendar:", error);
    // Direct attempt
    Linking.openURL(googleCalendarUrl);
  }
}
