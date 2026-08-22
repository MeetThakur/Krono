import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
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
          size={36}
          color={colors.onSurfaceVariant}
          style={{ opacity: 0.3, marginBottom: 8 }}
        />
        <Text
          style={{
            fontSize: 13,
            color: colors.onSurfaceVariant,
            textAlign: "center",
          }}
        >
          {emptyMessage}
        </Text>
      </View>
    );
  }

  // Compact mode for dashboard
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {displayedContests.map((contest) => {
          const startTime = new Date(contest.startTime);
          const platformConfig = PLATFORMS[contest.platformId];
          const platformColor = platformConfig?.color || colors.primary;

          return (
            <Pressable
              key={contest.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (contest.url) Linking.openURL(contest.url);
              }}
              style={({ pressed }) => [
                styles.compactRow,
                {
                  backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                  borderColor: colors.outline,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  opacity: pressed ? 0.95 : 1,
                },
              ]}
            >
              <View
                style={[styles.compactPlatformPill, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}
              >
                <View style={[styles.platformDot, { backgroundColor: platformColor }]} />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: colors.onSurfaceVariant,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                    marginLeft: 5,
                  }}
                >
                  {platformConfig?.name || contest.platformId}
                </Text>
              </View>
              
              <View style={{ flex: 1, marginHorizontal: 8 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.onSurface,
                  }}
                >
                  {contest.name}
                </Text>
              </View>
              
              <View style={[styles.timeBadge, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "JetBrainsMono_700Bold",
                    color: colors.onSurfaceVariant,
                  }}
                >
                  {format(startTime, "MMM d, HH:mm")}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Full card mode for Contests tab
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

        return (
          <Pressable
            key={contest.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (contest.url) Linking.openURL(contest.url);
            }}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                borderColor: isLive ? "rgba(239, 68, 68, 0.4)" : colors.outline,
                borderWidth: 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                opacity: pressed ? 0.95 : 1,
              },
            ]}
          >
            <View style={styles.contentContainer}>
              {/* Header: Platform pill + Time/Live status */}
              <View style={styles.row}>
                <View style={[styles.platformPill, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                  <View style={[styles.platformDot, { backgroundColor: platformColor }]} />
                  <Text
                    style={{
                      color: colors.onSurfaceVariant,
                      fontSize: 11,
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginLeft: 5,
                    }}
                  >
                    {platformConfig?.name || contest.platformId}
                  </Text>
                </View>

                {isLive ? (
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE NOW</Text>
                  </View>
                ) : (
                  <View style={[styles.timeBadge, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.onSurfaceVariant,
                        fontFamily: "JetBrainsMono_700Bold",
                      }}
                    >
                      {format(startTime, "MMM d, HH:mm")}
                    </Text>
                  </View>
                )}
              </View>

              {/* Title */}
              <Text
                numberOfLines={2}
                style={{
                  fontWeight: "700",
                  fontSize: 15,
                  marginTop: 12,
                  marginBottom: 8,
                  color: colors.onSurface,
                  lineHeight: 21,
                }}
              >
                {contest.name}
              </Text>

              {/* Duration & Meta */}
              <View style={styles.metaRow}>
                <View style={[styles.metaPill, { backgroundColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }]}>
                  <MaterialCommunityIcons
                    name="timer-outline"
                    size={13}
                    color={colors.onSurfaceVariant}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      color: colors.onSurfaceVariant,
                      fontWeight: "600",
                      fontSize: 11,
                    }}
                  >
                    {durationText}
                  </Text>
                </View>
              </View>

              {/* Action Bar */}
              <View style={[styles.actionBar, { borderTopColor: colors.outline }]}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (contest.url) Linking.openURL(contest.url);
                  }}
                  style={({ pressed }) => [
                    styles.registerBtn,
                    {
                      backgroundColor: colors.primary,
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: dark ? "#0F172A" : "#FFFFFF",
                      fontWeight: "800",
                      fontSize: 13,
                    }}
                  >
                    Open Contest
                  </Text>
                  <MaterialCommunityIcons
                    name="open-in-new"
                    size={14}
                    color={dark ? "#0F172A" : "#FFFFFF"}
                    style={{ marginLeft: 4 }}
                  />
                </Pressable>

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
                      borderColor: contest.reminderSet ? colors.primary : colors.outline,
                      borderWidth: 1,
                      transform: [{ scale: pressed ? 0.92 : 1 }],
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={contest.reminderSet ? "bell-ring" : "bell-outline"}
                    size={18}
                    color={contest.reminderSet ? colors.primary : colors.onSurfaceVariant}
                  />
                </Pressable>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  compactContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  compactPlatformPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  platformDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
  },
  contentContainer: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  platformPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
    marginRight: 4,
  },
  liveText: {
    color: "#EF4444",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  registerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 999,
  },
  reminderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
