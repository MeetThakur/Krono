import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { useContestStore } from "../../stores/useContestStore";
import { Contest } from "../../types/contest";
import { PLATFORMS } from "../../types/platform";
import { ContestsSkeleton } from "../common/SkeletonLoader";

interface ContestListProps {
  contests: Contest[];
  emptyMessage?: string;
  limit?: number;
  compact?: boolean;
}

export function ContestList({
  contests,
  emptyMessage = "No upcoming contests found.",
  limit,
  compact = false,
}: ContestListProps) {
  const { colors, dark } = useTheme();
  const { toggleReminder, isLoading } = useContestStore();

  const displayedContests = useMemo(() => {
    return limit ? contests.slice(0, limit) : contests;
  }, [contests, limit]);

  if (isLoading && contests.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ContestsSkeleton />
      </View>
    );
  }

  if (contests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="calendar-blank-outline"
          size={40}
          color={colors.onSurfaceVariant}
          style={{ opacity: 0.35, marginBottom: 10 }}
        />
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: colors.onSurfaceVariant,
            textAlign: "center",
          }}
        >
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {displayedContests.map((contest) => {
        const startTime = new Date(contest.startTime);
        const platformConfig = PLATFORMS[contest.platformId];
        const platformColor = platformConfig?.color || colors.primary;

        const isLive = contest.phase === "running";
        const totalMinutes = Math.round(contest.durationSeconds / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const durationText =
          hours > 0
            ? minutes > 0
              ? `${hours}h ${minutes}m`
              : `${hours}h`
            : `${minutes}m`;

        const dayNumber = format(startTime, "d");
        const monthShort = format(startTime, "MMM").toUpperCase();
        const timeFormatted = format(startTime, "HH:mm");

        return (
          <Pressable
            key={contest.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (contest.url) Linking.openURL(contest.url);
            }}
            style={({ pressed }) => [
              styles.timelineItemRow,
              {
                transform: [{ scale: pressed ? 0.98 : 1 }],
                opacity: pressed ? 0.95 : 1,
              },
            ]}
          >
            {/* Google Calendar Date Squircle */}
            <View
              style={[
                styles.dateBox,
                {
                  backgroundColor: isLive
                    ? (dark ? "#450A0A" : "#FEE2E2")
                    : (dark ? colors.surfaceVariant : colors.surface),
                  borderColor: isLive ? "#EF4444" : colors.outline,
                },
              ]}
            >
              {isLive ? (
                <>
                  <View style={styles.livePulseDot} />
                  <Text style={[styles.liveText, { color: "#EF4444" }]}>LIVE</Text>
                </>
              ) : (
                <>
                  <Text
                    style={[
                      styles.dateDay,
                      { color: colors.onSurface, fontFamily: "JetBrainsMono_700Bold" },
                    ]}
                  >
                    {dayNumber}
                  </Text>
                  <Text
                    style={[
                      styles.dateMonth,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {monthShort}
                  </Text>
                </>
              )}
            </View>

            {/* Right M3 Ticket Card */}
            <Surface
              style={[
                styles.card,
                {
                  backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                  borderColor: isLive ? "rgba(239, 68, 68, 0.4)" : colors.outline,
                },
              ]}
              elevation={0}
            >
              {/* Top Row: Platform Pill + Time + Duration */}
              <View style={styles.cardHeader}>
                <View style={[styles.platformPill, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                  <View style={[styles.platformDot, { backgroundColor: platformColor }]} />
                  <Text style={[styles.platformName, { color: colors.onSurfaceVariant }]}>
                    {platformConfig?.name || contest.platformId}
                  </Text>
                </View>

                <View style={styles.metaBadges}>
                  <View style={[styles.timeChip, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                    <MaterialCommunityIcons name="clock-outline" size={11} color={colors.onSurfaceVariant} style={{ marginRight: 3 }} />
                    <Text style={[styles.timeChipText, { color: colors.onSurfaceVariant, fontFamily: "JetBrainsMono_700Bold" }]}>
                      {timeFormatted}
                    </Text>
                  </View>
                  <View style={[styles.timeChip, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                    <Text style={[styles.timeChipText, { color: colors.onSurfaceVariant }]}>
                      {durationText}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Contest Title */}
              <Text
                numberOfLines={2}
                style={[
                  styles.contestTitle,
                  { color: colors.onSurface },
                ]}
              >
                {contest.name}
              </Text>

              {/* Bottom Actions Row */}
              <View style={[styles.cardFooter, { borderTopColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    toggleReminder(contest.id, !contest.reminderSet);
                  }}
                  style={({ pressed }) => [
                    styles.reminderBtn,
                    {
                      backgroundColor: contest.reminderSet
                        ? (dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)")
                        : (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                      transform: [{ scale: pressed ? 0.92 : 1 }],
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={contest.reminderSet ? "bell-ring" : "bell-outline"}
                    size={14}
                    color={contest.reminderSet ? colors.primary : colors.onSurfaceVariant}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: contest.reminderSet ? colors.primary : colors.onSurfaceVariant,
                      marginLeft: 4,
                    }}
                  >
                    {contest.reminderSet ? "Reminder Set" : "Remind"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (contest.url) Linking.openURL(contest.url);
                  }}
                  style={({ pressed }) => [
                    styles.openBtn,
                    {
                      backgroundColor: colors.primary,
                      transform: [{ scale: pressed ? 0.94 : 1 }],
                    },
                  ]}
                >
                  <Text style={[styles.openBtnText, { color: dark ? "#0F172A" : "#FFFFFF" }]}>
                    Open
                  </Text>
                  <MaterialCommunityIcons
                    name="arrow-top-right"
                    size={13}
                    color={dark ? "#0F172A" : "#FFFFFF"}
                  />
                </Pressable>
              </View>
            </Surface>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 12,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  timelineItemRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateBox: {
    width: 54,
    height: 64,
    borderRadius: 18, // Google Calendar M3 Date Squircle
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 22,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginBottom: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  card: {
    flex: 1,
    borderRadius: 24, // Google M3 Expressive Card
    borderWidth: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  platformPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  platformDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  platformName: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  metaBadges: {
    flexDirection: "row",
    gap: 5,
  },
  timeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timeChipText: {
    fontSize: 10,
    fontWeight: "700",
  },
  contestTitle: {
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
  },
  reminderBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  openBtnText: {
    fontSize: 11,
    fontWeight: "800",
  },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
