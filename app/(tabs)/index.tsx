import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBoundary } from "../../src/components/common/ErrorBoundary";
import {
  DashboardSkeleton,
  Skeleton,
} from "../../src/components/common/SkeletonLoader";
import { ContestList } from "../../src/components/contests/ContestList";
import { CumulativeStats } from "../../src/components/profile/CumulativeStats";
import { ProfileCarousel } from "../../src/components/profile/ProfileCarousel";
import { ReorderProfilesModal } from "../../src/components/profile/ReorderProfilesModal";
import { useContestStore } from "../../src/stores/useContestStore";
import { usePotdStore } from "../../src/stores/usePotdStore";
import { useProfileStore } from "../../src/stores/useProfileStore";

// Google M3 Difficulty Tonal Colors
const getDifficultyTheme = (difficulty?: string, dark: boolean = false) => {
  const d = (difficulty || "").toLowerCase();
  if (d.includes("easy") || d.includes("basic") || d.includes("school")) {
    return {
      bg: dark ? "rgba(52, 211, 153, 0.15)" : "#D1FAE5",
      text: dark ? "#34D399" : "#065F46",
    };
  }
  if (d.includes("medium") || d.includes("intermediate")) {
    return {
      bg: dark ? "rgba(251, 191, 36, 0.15)" : "#FEF3C7",
      text: dark ? "#FBBF24" : "#92400E",
    };
  }
  if (d.includes("hard") || d.includes("advanced")) {
    return {
      bg: dark ? "rgba(248, 113, 113, 0.15)" : "#FEE2E2",
      text: dark ? "#F87171" : "#991B1B",
    };
  }
  return {
    bg: dark ? "rgba(148, 163, 184, 0.15)" : "#F1F5F9",
    text: dark ? "#94A3B8" : "#475569",
  };
};

export default function DashboardScreen() {
  const router = useRouter();
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    profiles,
    loadProfiles,
    refreshProfiles,
    isLoading: isProfileLoading,
  } = useProfileStore();
  const {
    upcomingContests,
    loadContests,
    syncContests,
    isLoading: isContestLoading,
  } = useContestStore();
  const { leetcode, refreshPotd, isLoading: isPotdLoading } = usePotdStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReorderModalVisible, setReorderModalVisible] = useState(false);

  useEffect(() => {
    const initData = async () => {
      await loadProfiles();
      refreshProfiles();
      loadContests();
      refreshPotd();
    };
    initData();
  }, []);

  const handleSync = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refreshProfiles(true),
      refreshPotd(),
      syncContests()
    ]);
    setIsRefreshing(false);
  };

  const isLoading = isProfileLoading || isContestLoading || isPotdLoading;
  const now = Date.now();

  const ongoingContests = upcomingContests.filter((c) => {
    if (c.phase === "running") return true;
    const start = new Date(c.startTime).getTime();
    const end = c.endTime ? new Date(c.endTime).getTime() : start + (c.durationSeconds || 7200) * 1000;
    return start <= now && now <= end;
  });

  const upcomingOnly = upcomingContests.filter((c) => {
    if (c.phase === "running") return false;
    const start = new Date(c.startTime).getTime();
    const end = c.endTime ? new Date(c.endTime).getTime() : start + (c.durationSeconds || 7200) * 1000;
    if (start <= now && now <= end) return false;
    if (end < now) return false;
    return true;
  });

  if (isLoading && profiles.length === 0 && upcomingContests.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 12 }]}>
          <View>
            <Text style={[styles.dateSubtext, { color: colors.onSurfaceVariant }]}>OVERVIEW</Text>
            <Text style={[styles.logo, { color: colors.onSurface }]}>Krono</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.settingsBtn,
              { 
                backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                borderColor: colors.outline,
                transform: [{ scale: pressed ? 0.94 : 1 }]
              }
            ]}
            onPress={() => router.push("/settings")}
          >
            <MaterialCommunityIcons
              name="cog-outline"
              size={22}
              color={colors.onSurface}
            />
          </Pressable>
        </View>
        <DashboardSkeleton />
      </View>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const diffTheme = getDifficultyTheme(leetcode?.difficulty, dark);

  return (
    <ErrorBoundary fallbackTitle="Dashboard Error">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Google Native M3 Top App Bar */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 12 }]}>
          <View>
            <View style={[styles.dateCapsule, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
              <View style={styles.liveGreenDot} />
              <Text style={[styles.dateSubtext, { color: colors.onSurfaceVariant }]}>
                {currentDate.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.logo, { color: colors.onSurface }]}>
              Krono
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.settingsBtn,
              { 
                backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                borderColor: colors.outline,
                transform: [{ scale: pressed ? 0.94 : 1 }]
              }
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/settings");
            }}
          >
            <MaterialCommunityIcons
              name="cog-outline"
              size={22}
              color={colors.onSurface}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleSync}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Live Now Alert Banner */}
          {ongoingContests.length > 0 && (
            <View style={styles.liveSection}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/contests");
                }}
                style={({ pressed }) => [
                  styles.liveBanner,
                  {
                    backgroundColor: dark ? "rgba(239, 68, 68, 0.12)" : "rgba(239, 68, 68, 0.08)",
                    borderColor: "rgba(239, 68, 68, 0.35)",
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <View style={styles.livePulseDot} />
                <View style={{ flex: 1, marginHorizontal: 8 }}>
                  <Text style={styles.liveBannerTitle}>
                    {ongoingContests.length} {ongoingContests.length === 1 ? "Contest" : "Contests"} Active Now
                  </Text>
                  <Text numberOfLines={1} style={styles.liveBannerSub}>
                    {ongoingContests[0].name}
                  </Text>
                </View>
                <View style={styles.liveJoinBtn}>
                  <Text style={styles.liveJoinText}>Join</Text>
                  <MaterialCommunityIcons name="arrow-right" size={12} color="#FFFFFF" />
                </View>
              </Pressable>
            </View>
          )}

          {/* Profiles Carousel */}
          {profiles.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionHeading, { color: colors.onSurfaceVariant }]}>
                  PROFILES
                </Text>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setReorderModalVisible(true);
                  }}
                  style={({ pressed }) => [
                    styles.reorderBtn,
                    { 
                      backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                      transform: [{ scale: pressed ? 0.94 : 1 }]
                    }
                  ]}
                >
                  <MaterialCommunityIcons name="swap-vertical" size={14} color={colors.onSurfaceVariant} style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 11, fontWeight: "800", color: colors.onSurfaceVariant }}>
                    Reorder
                  </Text>
                </Pressable>
              </View>
              <ProfileCarousel profiles={profiles} />
            </View>
          ) : (
            <View style={styles.section}>
              <Pressable
                style={({ pressed }) => [
                  styles.connectCard,
                  {
                    backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                    borderColor: colors.outline,
                    transform: [{ scale: pressed ? 0.98 : 1 }]
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/settings");
                }}
              >
                <View style={[styles.connectIconCircle, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                  <MaterialCommunityIcons
                    name="account-plus-outline"
                    size={22}
                    color={colors.onSurface}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text
                    style={{
                      fontWeight: "900",
                      fontSize: 16,
                      color: colors.onSurface,
                    }}
                  >
                    Connect a Profile
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.onSurfaceVariant,
                      marginTop: 2,
                      fontWeight: "600",
                    }}
                  >
                    Codeforces, LeetCode, AtCoder, CodeChef...
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={colors.onSurfaceVariant}
                />
              </Pressable>
            </View>
          )}

          {/* Google M3 Bento Grid (Cumulative Stats) */}
          {profiles.length > 0 && <CumulativeStats profiles={profiles} />}

          {/* Google Daily Challenge (POTD) Widget */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.onSurfaceVariant, paddingHorizontal: 20 }]}>
              DAILY CHALLENGE
            </Text>
            <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (leetcode?.url) Linking.openURL(leetcode.url);
                }}
                style={({ pressed }) => [
                  styles.potdCard,
                  {
                    backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                    borderColor: colors.outline,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.95 : 1,
                  },
                ]}
              >
                {isPotdLoading && !leetcode ? (
                  <View style={{ gap: 8, padding: 18 }}>
                    <Skeleton width="85%" height={18} />
                    <Skeleton width="40%" height={14} />
                  </View>
                ) : (
                  <View style={styles.potdInner}>
                    {/* Left Icon Badge */}
                    <View style={[styles.potdIconBadge, { backgroundColor: "#FFA116" + "20" }]}>
                      <MaterialCommunityIcons name="code-braces" size={22} color="#FFA116" />
                    </View>

                    {/* Middle Info */}
                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: "900", color: colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          LeetCode Daily
                        </Text>
                        {leetcode?.difficulty && (
                          <View style={[styles.diffPill, { backgroundColor: diffTheme.bg }]}>
                            <Text style={[styles.diffPillText, { color: diffTheme.text }]}>
                              {leetcode.difficulty}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text
                        numberOfLines={1}
                        style={{
                          fontWeight: "900",
                          fontSize: 15,
                          color: colors.onSurface,
                          lineHeight: 20,
                        }}
                      >
                        {leetcode?.title || "Problem of the Day"}
                      </Text>
                    </View>

                    {/* Right Action Button */}
                    <View style={[styles.solveBtn, { backgroundColor: colors.primary }]}>
                      <Text style={{ color: dark ? "#0F172A" : "#FFFFFF", fontWeight: "800", fontSize: 12 }}>
                        Solve
                      </Text>
                      <MaterialCommunityIcons name="arrow-right" size={13} color={dark ? "#0F172A" : "#FFFFFF"} />
                    </View>
                  </View>
                )}
              </Pressable>
            </View>
          </View>

          {/* Upcoming Schedule Timeline */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionHeading, { color: colors.onSurfaceVariant, paddingHorizontal: 0 }]}>
                UPCOMING SCHEDULE
              </Text>
              {upcomingOnly.length > 3 && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/contests");
                  }}
                  style={({ pressed }) => [
                    styles.seeAllPill,
                    {
                      backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                      transform: [{ scale: pressed ? 0.94 : 1 }]
                    }
                  ]}
                >
                  <Text style={{ color: colors.onSurfaceVariant, fontWeight: "800", fontSize: 11 }}>
                    Full Calendar
                  </Text>
                  <MaterialCommunityIcons name="arrow-right" size={12} color={colors.onSurfaceVariant} style={{ marginLeft: 3 }} />
                </Pressable>
              )}
            </View>
            <ContestList
              contests={upcomingOnly}
              emptyMessage="No upcoming contests scheduled. Pull down to refresh."
              limit={5}
              compact
            />
          </View>
        </ScrollView>

        <ReorderProfilesModal 
          visible={isReorderModalVisible}
          onDismiss={() => setReorderModalVisible(false)}
        />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  dateCapsule: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 4,
    gap: 6,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  dateSubtext: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  logo: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  content: {
    paddingTop: 4,
  },
  liveSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  liveBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  liveBannerTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#EF4444",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  liveBannerSub: {
    fontSize: 13,
    fontWeight: "800",
    color: "#EF4444",
    marginTop: 1,
  },
  liveJoinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  liveJoinText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  reorderBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  seeAllPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  connectCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
  },
  connectIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  potdCard: {
    borderRadius: 28, // Google M3 Expressive Large Squircle
    borderWidth: 1,
    overflow: "hidden",
  },
  potdInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  potdIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  diffPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffPillText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  solveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
});
