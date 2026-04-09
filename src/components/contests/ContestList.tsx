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

export const ContestList: React.FC<ContestListProps> = ({
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
      <ActivityIndicator
        size="small"
        color={colors.primary}
        style={{ marginTop: 20 }}
      />
    );
  }

  if (contests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text
          variant="bodyMedium"
          style={{ color: colors.onSurfaceVariant, opacity: 0.6 }}
        >
          {emptyMessage}
        </Text>
      </View>
    );
  }

  // Compact mode for dashboard — minimal contest rows
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {displayedContests.map((contest) => {
          const startTime = new Date(contest.startTime);
          const platformConfig = PLATFORMS[contest.platformId];
          let platformColor = platformConfig?.color || colors.primary;
          if (contest.platformId === "atcoder" && !dark) {
            platformColor = "#000000";
          }

          return (
            <Pressable
              key={contest.id}
              style={({ pressed }) => [
                styles.compactRow,
                {
                  backgroundColor: pressed
                    ? dark
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.02)"
                    : "transparent",
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (contest.url) Linking.openURL(contest.url);
              }}
            >
              <View
                style={[styles.platformDot, { backgroundColor: platformColor }]}
              />
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.onSurface,
                  }}
                >
                  {contest.name}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: colors.onSurfaceVariant,
                  marginLeft: 12,
                }}
              >
                {format(startTime, "MMM d, HH:mm")}
              </Text>
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
          platformColor = "#000000";
        }

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
          <View
            key={contest.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: dark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.05)",
              },
            ]}
          >
            <View style={styles.contentContainer}>
              {/* Header */}
              <View style={styles.row}>
                <View style={styles.platformRow}>
                  <View
                    style={[
                      styles.platformDot,
                      { backgroundColor: platformColor },
                    ]}
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
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.onSurfaceVariant,
                    fontWeight: "500",
                  }}
                >
                  {format(startTime, "MMM d, HH:mm")}
                </Text>
              </View>

              {/* Title */}
              <Text
                numberOfLines={2}
                style={{
                  fontWeight: "700",
                  fontSize: 16,
                  marginTop: 10,
                  marginBottom: 6,
                  color: colors.onSurface,
                  lineHeight: 22,
                }}
              >
                {contest.name}
              </Text>

              {/* Duration */}
              <View style={styles.metaRow}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={13}
                  color={colors.onSurfaceVariant}
                />
                <Text
                  style={{
                    marginLeft: 4,
                    color: colors.onSurfaceVariant,
                    fontWeight: "500",
                    fontSize: 12,
                  }}
                >
                  {durationText}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actionBar}>
                <Pressable
                  style={({ pressed }) => [
                    styles.registerBtn,
                    {
                      backgroundColor: colors.primary,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (contest.url) Linking.openURL(contest.url);
                  }}
                >
                  <Text
                    style={{
                      color: colors.onPrimary,
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    Open
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.reminderBtn,
                    {
                      backgroundColor: contest.reminderSet
                        ? colors.primary + "12"
                        : dark
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.04)",
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    toggleReminder(contest.id, !contest.reminderSet);
                  }}
                >
                  <MaterialCommunityIcons
                    name={contest.reminderSet ? "bell-ring" : "bell-outline"}
                    size={16}
                    color={
                      contest.reminderSet
                        ? colors.primary
                        : colors.onSurfaceVariant
                    }
                  />
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 20,
  },
  compactContainer: {
    paddingHorizontal: 20,
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  contentContainer: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  platformDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.1)",
  },
  registerBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  reminderBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
});
