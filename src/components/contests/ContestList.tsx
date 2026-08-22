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

        return (
          <Pressable
            key={contest.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (contest.url) Linking.openURL(contest.url);
            }}
            style={({ pressed }) => [
              styles.cardPressable,
              {
                transform: [{ scale: pressed ? 0.98 : 1 }],
                opacity: pressed ? 0.95 : 1,
              },
            ]}
          >
            <Surface
              style={[
                styles.card,
                {
                  backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                  borderColor: isLive ? "rgba(239, 68, 68, 0.45)" : colors.outline,
                  borderWidth: 1,
                },
              ]}
              elevation={0}
            >
              {/* Top Row: Platform Badge + Date/Time */}
              <View style={styles.cardHeader}>
                <View style={[styles.platformBadge, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                  <View style={[styles.platformDot, { backgroundColor: platformColor }]} />
                  <Text
                    style={{
                      color: colors.onSurfaceVariant,
                      fontSize: 11,
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                      marginLeft: 5,
                    }}
                  >
                    {platformConfig?.name || contest.platformId}
                  </Text>
                </View>

                {isLive ? (
                  <View style={styles.livePill}>
                    <View style={styles.livePulseDot} />
                    <Text style={styles.liveText}>LIVE NOW</Text>
                  </View>
                ) : (
                  <View style={[styles.dateChip, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                    <MaterialCommunityIcons
                      name="calendar-clock"
                      size={12}
                      color={colors.onSurfaceVariant}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.onSurfaceVariant,
                        fontWeight: "700",
                        marginLeft: 5,
                        fontFamily: "JetBrainsMono_700Bold",
                      }}
                    >
                      {format(startTime, "MMM d, HH:mm")}
                    </Text>
                  </View>
                )}
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

              {/* Footer: Duration + Reminder + Open Action */}
              <View style={[styles.cardFooter, { borderTopColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]}>
                <View style={[styles.metaPill, { backgroundColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }]}>
                  <MaterialCommunityIcons
                    name="timer-outline"
                    size={13}
                    color={colors.onSurfaceVariant}
                  />
                  <Text
                    style={{
                      color: colors.onSurfaceVariant,
                      fontWeight: "700",
                      fontSize: 11,
                      marginLeft: 5,
                    }}
                  >
                    {durationText}
                  </Text>
                </View>

                <View style={styles.actionsRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.iconBtn,
                      {
                        backgroundColor: contest.reminderSet
                          ? (dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)")
                          : (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                        borderColor: contest.reminderSet ? colors.primary : colors.outline,
                        transform: [{ scale: pressed ? 0.92 : 1 }],
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      toggleReminder(contest.id, !contest.reminderSet);
                    }}
                  >
                    <MaterialCommunityIcons
                      name={contest.reminderSet ? "bell-ring" : "bell-outline"}
                      size={15}
                      color={contest.reminderSet ? colors.primary : colors.onSurfaceVariant}
                    />
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.openBtn,
                      {
                        backgroundColor: colors.primary,
                        transform: [{ scale: pressed ? 0.94 : 1 }],
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      if (contest.url) Linking.openURL(contest.url);
                    }}
                  >
                    <Text style={[styles.openBtnText, { color: dark ? "#0F172A" : "#FFFFFF" }]}>
                      Open
                    </Text>
                    <MaterialCommunityIcons
                      name="open-in-new"
                      size={12}
                      color={dark ? "#0F172A" : "#FFFFFF"}
                    />
                  </Pressable>
                </View>
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
  cardPressable: {
    marginBottom: 2,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  platformBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  platformDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
  },
  liveText: {
    color: "#EF4444",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  contestTitle: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
    marginTop: 12,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  openBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
