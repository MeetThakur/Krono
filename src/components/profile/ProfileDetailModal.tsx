import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { clistApi } from "../../api/clist";
import { leetcodeApi } from "../../api/leetcode";
import { PLATFORMS } from "../../types/platform";
import { UnifiedProfile } from "../../types/user";
import { ContestHistory } from "../charts/ContestHistory";
import { RatingChart } from "../charts/RatingChart";

interface ProfileDetailModalProps {
  profile: UnifiedProfile | null;
  visible: boolean;
  onDismiss: () => void;
}

export function ProfileDetailModal({
  profile,
  visible,
  onDismiss,
}: ProfileDetailModalProps) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const [contestCount, setContestCount] = useState<number | null>(null);

  useEffect(() => {
    if (profile && visible) {
      setContestCount(null);

      if (profile.platformId === "leetcode") {
        // LeetCode: use its own GraphQL API (clist.by doesn't index LC)
        leetcodeApi
          .getUserContestRanking(profile.username)
          .then((data) => {
            if (data?.ranking?.attendedContestsCount != null) {
              setContestCount(data.ranking.attendedContestsCount);
            }
          })
          .catch(() => {});
      } else {
        // CF, AC, CC: use clist.by
        clistApi
          .getAccountInfo(profile.platformId, profile.username)
          .then((acc) => {
            if (acc) setContestCount(acc.n_contests);
          });
      }
    }
  }, [profile?.id, visible]);

  if (!profile) return null;

  const platformConfig = PLATFORMS[profile.platformId];
  let platformColor = platformConfig?.color || colors.primary;
  if (profile.platformId === "atcoder" && !dark) platformColor = "#000000";
  const onPlatformColor =
    profile.platformId === "atcoder" && dark ? "#000000" : "#FFFFFF";

  const stats = [
    {
      label: "Rating",
      value: profile.rating ?? "—",
      icon: "star-outline" as const,
    },
    {
      label: "Peak",
      value: profile.maxRating ?? "—",
      icon: "arrow-up-bold" as const,
    },
    {
      label: "Solved",
      value: profile.problemsSolved ?? 0,
      icon: "check-circle-outline" as const,
    },
    {
      label: "Contests",
      value: profile.totalContests ?? contestCount ?? "…",
      icon: "trophy-outline" as const,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        {/* Header — full platform color */}
        <View
          style={[
            styles.header,
            { backgroundColor: platformColor, paddingTop: insets.top + 8 },
          ]}
        >
          {/* Profile Row */}
          <View style={styles.profileRow}>
            {/* Left: Icon + Username + Rank */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                flex: 1,
              }}
            >
              <View
                style={[
                  styles.avatarCircle,
                  {
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignSelf: "center",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={(platformConfig?.icon as any) || "code-tags"}
                  size={20}
                  color={onPlatformColor}
                />
              </View>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text
                  style={{
                    fontWeight: "800",
                    color: onPlatformColor,
                    fontSize: 18,
                    letterSpacing: -0.3,
                  }}
                  numberOfLines={1}
                >
                  {profile.username}
                </Text>
                {profile.rank ? (
                  <Text
                    style={{
                      color: onPlatformColor,
                      opacity: 0.8,
                      fontWeight: "600",
                      fontSize: 12,
                      marginTop: 1,
                    }}
                  >
                    {profile.rank}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Right: Close button and optional Global Rank */}
            <View
              style={{
                alignItems: "flex-end",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <Pressable
                onPress={onDismiss}
                style={styles.closeButton}
                hitSlop={12}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={18}
                  color={onPlatformColor}
                />
              </Pressable>

              {profile.globalRank ? (
                <View style={{ alignItems: "flex-end", marginTop: 8 }}>
                  <Text
                    style={{
                      color: onPlatformColor,
                      fontWeight: "900",
                      fontSize: 16,
                    }}
                  >
                    #{profile.globalRank.toLocaleString()}
                  </Text>
                  <Text
                    style={{
                      color: onPlatformColor,
                      opacity: 0.7,
                      fontSize: 10,
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Global Rank
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Scrollable content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <Surface
                key={stat.label}
                style={[
                  styles.statCard,
                  {
                    backgroundColor: dark
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.02)",
                    borderColor: dark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.05)",
                  },
                ]}
                elevation={0}
              >
                <View
                  style={[
                    styles.statIconWrapper,
                    { backgroundColor: colors.surfaceVariant },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={stat.icon}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.statContent}>
                  <Text
                    variant="labelSmall"
                    style={{
                      color: colors.onSurfaceVariant,
                      textTransform: "uppercase",
                      fontSize: 10,
                      fontWeight: "700",
                      letterSpacing: 0.5,
                      marginBottom: 2,
                    }}
                  >
                    {stat.label}
                  </Text>
                  <Text
                    variant="titleLarge"
                    style={{
                      fontWeight: "900",
                      color: colors.onSurface,
                      letterSpacing: -0.5,
                    }}
                  >
                    {stat.value}
                  </Text>
                </View>
              </Surface>
            ))}
          </View>

          {/* Rating History */}
          <View style={styles.chartSection}>
            <Text
              variant="titleMedium"
              style={[styles.chartLabel, { color: colors.onSurfaceVariant }]}
            >
              Rating History
            </Text>
            <RatingChart profiles={[profile]} />
          </View>

          {/* Contest History */}
          <View style={styles.chartSection}>
            <Text
              variant="titleMedium"
              style={[styles.chartLabel, { color: colors.onSurfaceVariant }]}
            >
              Contest History
            </Text>
            <ContestHistory profiles={[profile]} />
          </View>

          {/* Extra bottom padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 0,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
  },
  ratingBlock: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: (Dimensions.get("window").width - 40 - 12) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statContent: {
    alignItems: "flex-start",
  },
  chartSection: {
    marginTop: 28,
  },
  chartLabel: {
    paddingHorizontal: 24,
    marginBottom: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase" as any,
    fontSize: 12,
  },
});
