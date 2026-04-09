import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
        leetcodeApi
          .getUserContestRanking(profile.username)
          .then((data) => {
            if (data?.ranking?.attendedContestsCount != null) {
              setContestCount(data.ranking.attendedContestsCount);
            }
          })
          .catch(() => {});
      }
    }
  }, [profile?.id, visible]);

  if (!profile) return null;

  const platformConfig = PLATFORMS[profile.platformId];
  
  // Handle AtCoder color based on theme (Black in light mode, White in dark mode)
  let effectivePlatformColor = platformConfig?.color || colors.primary;
  if (profile.platformId === "atcoder") {
    effectivePlatformColor = dark ? "#FFFFFF" : "#18181B";
  }

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
          { backgroundColor: colors.background },
        ]}
      >
        {/* Header Navigation */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={[styles.platformPill, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
            <MaterialCommunityIcons
              name={(platformConfig?.icon as any) || "code-tags"}
              size={14}
              color={effectivePlatformColor}
            />
            <Text
              style={{
                color: effectivePlatformColor,
                fontWeight: "700",
                fontSize: 11,
                marginLeft: 6,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {platformConfig?.name}
            </Text>
          </View>
          
          <Pressable
            onPress={onDismiss}
            style={[
              styles.closeBtn,
              { backgroundColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" },
            ]}
          >
            <MaterialCommunityIcons
              name="close"
              size={18}
              color={colors.onSurfaceVariant}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Identity Section */}
          <View style={styles.identitySection}>
            <Text
              style={{
                fontSize: 40,
                fontWeight: "900",
                color: colors.onSurface,
                letterSpacing: -1.5,
                marginBottom: 6,
              }}
              numberOfLines={1}
            >
              {profile.username}
            </Text>
            
            <View style={styles.rankRow}>
              {profile.rank ? (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: effectivePlatformColor,
                  }}
                >
                  {profile.rank}
                </Text>
              ) : null}

              {profile.rank && profile.globalRank ? (
                <View style={[styles.dot, { backgroundColor: colors.onSurfaceVariant }]} />
              ) : null}

              {profile.globalRank ? (
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: colors.onSurfaceVariant,
                  }}
                >
                  Global Rank <Text style={{ fontWeight: "700", color: colors.onSurface }}>#{profile.globalRank.toLocaleString()}</Text>
                </Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.hDivider, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]} />

          {/* Primary Stat: Rating */}
          <View style={styles.ratingSection}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.onSurfaceVariant,
                letterSpacing: 1,
                marginBottom: 4,
                textTransform: "uppercase",
              }}
            >
              Current Rating
            </Text>
            <Text
              style={{
                fontSize: 84,
                fontWeight: "900",
                color: effectivePlatformColor,
                letterSpacing: -3,
                lineHeight: 96,
                includeFontPadding: false,
              }}
            >
              {profile.rating ?? "—"}
            </Text>
          </View>

          {/* Secondary Stats */}
          <View style={styles.secondaryStatsRow}>
            <View style={styles.statBox}>
              <Text style={{ fontSize: 28, fontWeight: "800", color: colors.onSurface, letterSpacing: -0.5 }}>
                {profile.problemsSolved ?? 0}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: colors.onSurfaceVariant, marginTop: 4, letterSpacing: 0.5, textTransform: "uppercase" }}>
                Problems Solved
              </Text>
            </View>

            <View style={[styles.vDivider, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]} />

            <View style={styles.statBox}>
              <Text style={{ fontSize: 28, fontWeight: "800", color: colors.onSurface, letterSpacing: -0.5 }}>
                {profile.totalContests ?? contestCount ?? "—"}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: colors.onSurfaceVariant, marginTop: 4, letterSpacing: 0.5, textTransform: "uppercase" }}>
                Contests Played
              </Text>
            </View>
          </View>

          <View style={[styles.hDivider, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]} />

          {/* Charts */}
          <View style={styles.chartSection}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.onSurfaceVariant },
              ]}
            >
              RATING HISTORY
            </Text>
            <RatingChart profiles={[profile]} />
          </View>

          <View style={styles.chartSection}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.onSurfaceVariant },
              ]}
            >
              RECENT ACTIVITY
            </Text>
            <ContestHistory profiles={[profile]} />
          </View>

          <View style={{ height: 60 }} />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  platformPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingTop: 16,
  },
  identitySection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 10,
    opacity: 0.4,
  },
  ratingSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  secondaryStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  statBox: {
    flex: 1,
    alignItems: "flex-start",
  },
  hDivider: {
    height: 1,
    marginHorizontal: 24,
  },
  vDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 24,
  },
  chartSection: {
    marginTop: 32,
  },
  sectionTitle: {
    paddingHorizontal: 24,
    marginBottom: 16,
    fontWeight: "700",
    letterSpacing: 0.8,
    fontSize: 11,
  },
});
