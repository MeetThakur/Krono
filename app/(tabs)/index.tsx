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

// Minimal difficulty colors
const getDifficultyColor = (difficulty?: string, dark: boolean = false): string => {
  const d = (difficulty || "").toLowerCase();
  if (d.includes("easy") || d.includes("basic") || d.includes("school"))
    return dark ? "#34D399" : "#059669";
  if (d.includes("medium") || d.includes("intermediate"))
    return dark ? "#FBBF24" : "#D97706";
  if (d.includes("hard") || d.includes("advanced"))
    return dark ? "#F87171" : "#DC2626";
  return dark ? "#94A3B8" : "#64748B";
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
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.onSurfaceVariant }]}>OVERVIEW</Text>
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
              size={20}
              color={colors.onSurface}
            />
          </Pressable>
        </View>
        <DashboardSkeleton />
      </View>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <ErrorBoundary fallbackTitle="Dashboard Error">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Minimal M3 Top App Bar */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
          <View>
            <View style={[styles.datePill, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
              <MaterialCommunityIcons name="calendar-today" size={11} color={colors.onSurfaceVariant} style={{ marginRight: 5 }} />
              <Text style={[styles.greeting, { color: colors.onSurfaceVariant }]}>
                {currentDate}
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
              size={20}
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
          {/* Live Now Banner */}
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
                    backgroundColor: dark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.08)",
                    borderColor: "rgba(239, 68, 68, 0.3)",
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <View style={styles.liveDot} />
                <View style={{ flex: 1, marginHorizontal: 8 }}>
                  <Text style={styles.liveBannerTitle}>
                    {ongoingContests.length} {ongoingContests.length === 1 ? "Contest" : "Contests"} Live Now
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

          {/* Profiles Section */}
          {profiles.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
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
                  <Text style={{ fontSize: 11, fontWeight: "700", color: colors.onSurfaceVariant }}>
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
                    size={20}
                    color={colors.onSurface}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text
                    style={{
                      fontWeight: "800",
                      fontSize: 15,
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
                      fontWeight: "500",
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

          {/* Cumulative Stats */}
          {profiles.length > 0 && <CumulativeStats profiles={profiles} />}

          {/* Daily Challenge (POTD) */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
            >
              DAILY CHALLENGE
            </Text>
            <View style={{ paddingHorizontal: 20 }}>
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
                  <View style={{ gap: 8, padding: 16 }}>
                    <Skeleton width="85%" height={16} />
                    <Skeleton width="40%" height={12} />
                  </View>
                ) : (
                  <View style={styles.potdInner}>
                    <View style={[styles.potdIconBadge, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                      <MaterialCommunityIcons name="code-tags" size={18} color={colors.onSurface} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text
                        style={{
                          fontSize: 10,
                          color: colors.onSurfaceVariant,
                          fontWeight: "700",
                          letterSpacing: 0.4,
                          textTransform: "uppercase",
                          marginBottom: 2,
                        }}
                      >
                        LeetCode Daily
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontWeight: "800",
                          fontSize: 14,
                          color: colors.onSurface,
                          lineHeight: 19,
                        }}
                      >
                        {leetcode?.title || "Problem of the Day"}
                      </Text>
                    </View>
                    {leetcode?.difficulty && (
                      <View
                        style={[
                          styles.diffBadge,
                          {
                            backgroundColor:
                              getDifficultyColor(leetcode.difficulty, dark) + "18",
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: getDifficultyColor(leetcode.difficulty, dark),
                            fontWeight: "800",
                            fontSize: 11,
                          }}
                        >
                          {leetcode.difficulty}
                        </Text>
                      </View>
                    )}
                    <MaterialCommunityIcons
                      name="open-in-new"
                      size={16}
                      color={colors.onSurfaceVariant}
                      style={{ opacity: 0.5, marginLeft: 6 }}
                    />
                  </View>
                )}
              </Pressable>
            </View>
          </View>

          {/* Upcoming Contests */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.onSurfaceVariant, paddingHorizontal: 0 },
                ]}
              >
                UPCOMING ROUNDS
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
                  <Text
                    style={{
                      color: colors.onSurfaceVariant,
                      fontWeight: "700",
                      fontSize: 11,
                    }}
                  >
                    View all
                  </Text>
                  <MaterialCommunityIcons name="arrow-right" size={12} color={colors.onSurfaceVariant} style={{ marginLeft: 3 }} />
                </Pressable>
              )}
            </View>
            <ContestList
              contests={upcomingOnly}
              emptyMessage="No upcoming contests found. Pull down to refresh."
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
    paddingBottom: 14,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  logo: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  content: {
    paddingTop: 8,
  },
  liveSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  liveBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  liveBannerTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#EF4444",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  liveBannerSub: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EF4444",
  },
  liveJoinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  liveJoinText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 20,
    marginBottom: 10,
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
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  connectIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  potdCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  potdInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  potdIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
