import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";
import React from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import { useContestStore } from "../../stores/useContestStore";
import { Contest } from "../../types/contest";
import { PLATFORMS } from "../../types/platform";

interface ContestListProps {
  contests: Contest[];
  emptyMessage?: string;
  limit?: number;
  isLoading?: boolean;
  compact?: boolean;
}

export const ContestList: React.FC<ContestListProps> = React.memo(({
  contests,
  emptyMessage = "No contests found.",
  limit,
  isLoading = false,
  compact = false,
}) => {
  const { colors, dark } = useTheme();
  const { toggleReminder } = useContestStore();

  const displayedContests = limit ? contests.slice(0, limit) : contests;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="small"
          color={colors.primary}
        />
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
          style={{ opacity: 0.5, marginBottom: 8 }}
        />
        <Text
          variant="bodyMedium"
          style={{ color: colors.onSurfaceVariant, fontWeight: "600" }}
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
          let platformColor = platformConfig?.color || colors.primary;
          if (contest.platformId === "atcoder" && !dark) {
            platformColor = "#181A20";
          }

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
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: dark ? 0.15 : 0.03,
                  shadowRadius: 10,
                  elevation: 2,
                },
              ]}
            >
              <View
                style={[styles.compactPlatformPill, { backgroundColor: platformColor + "18" }]}
              >
                <MaterialCommunityIcons
                  name={(platformConfig?.icon as any) || "code-tags"}
                  size={16}
                  color={platformColor}
                />
              </View>
              <View style={{ flex: 1 }}>
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
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: platformColor,
                    marginTop: 2,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  {platformConfig?.name}
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
        let platformColor = platformConfig?.color || colors.primary;

        if (contest.platformId === "atcoder" && !dark) {
          platformColor = "#181A20";
        }

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
                borderColor: isLive ? "#EF4444" : colors.outline,
                borderWidth: isLive ? 1.5 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                opacity: pressed ? 0.95 : 1,
                shadowColor: isLive ? "#EF4444" : "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: isLive ? (dark ? 0.25 : 0.15) : (dark ? 0.2 : 0.04),
                shadowRadius: 14,
                elevation: 3,
              },
            ]}
          >
            <View style={styles.contentContainer}>
              {/* Header: Platform pill + Time/Live status */}
              <View style={styles.row}>
                <View style={[styles.platformPill, { backgroundColor: platformColor + "18" }]}>
                  <MaterialCommunityIcons
                    name={(platformConfig?.icon as any) || "code-tags"}
                    size={14}
                    color={platformColor}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: platformColor,
                      fontSize: 11,
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {platformConfig?.name}
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
                  fontSize: 16,
                  marginTop: 12,
                  marginBottom: 8,
                  color: colors.onSurface,
                  lineHeight: 22,
                }}
              >
                {contest.name}
              </Text>

              {/* Duration & Meta */}
              <View style={styles.metaRow}>
                <View style={[styles.metaPill, { backgroundColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }]}>
                  <MaterialCommunityIcons
                    name="clock-outline"
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

              {/* Actions */}
              <View style={[styles.actionBar, { borderTopColor: colors.outline }]}>
                <Pressable
                  style={({ pressed }) => [
                    styles.registerBtn,
                    {
                      backgroundColor: colors.primary,
                      opacity: pressed ? 0.88 : 1,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (contest.url) Linking.openURL(contest.url);
                  }}
                >
                  <MaterialCommunityIcons
                    name="open-in-new"
                    size={15}
                    color={dark ? "#0F172A" : "#FFFFFF"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: dark ? "#0F172A" : "#FFFFFF",
                      fontSize: 13,
                      fontWeight: "700",
                    }}
                  >
                    View Contest
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.reminderBtn,
                    {
                      backgroundColor: contest.reminderSet
                        ? colors.primaryContainer
                        : (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                      borderColor: contest.reminderSet ? colors.primary : colors.outline,
                      borderWidth: 1,
                      transform: [{ scale: pressed ? 0.94 : 1 }],
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    toggleReminder(contest.id, !contest.reminderSet);
                  }}
                >
                  <MaterialCommunityIcons
                    name={contest.reminderSet ? "bell-ring" : "bell-outline"}
                    size={18}
                    color={
                      contest.reminderSet
                        ? colors.primary
                        : colors.onSurfaceVariant
                    }
                  />
                </Pressable>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingHorizontal: 20,
  },
  compactContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 20, // M3 Expressive squircle
    borderWidth: 1,
  },
  compactPlatformPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: 24, // M3 Expressive squircle
    overflow: "hidden",
  },
  contentContainer: {
    padding: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  platformPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#EF4444",
    marginRight: 6,
  },
  liveText: {
    color: "#EF4444",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  timeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  registerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 999, // M3 Pill button
  },
  reminderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});

