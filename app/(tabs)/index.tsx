import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import React, { useEffect } from "react";
import {
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { ErrorBoundary } from "../../src/components/common/ErrorBoundary";
import {
    DashboardSkeleton,
    Skeleton,
} from "../../src/components/common/SkeletonLoader";
import { ContestList } from "../../src/components/contests/ContestList";
import { CumulativeStats } from "../../src/components/profile/CumulativeStats";
import { ProfileCarousel } from "../../src/components/profile/ProfileCarousel";
import { useContestStore } from "../../src/stores/useContestStore";
import { usePotdStore } from "../../src/stores/usePotdStore";
import { useProfileStore } from "../../src/stores/useProfileStore";

// Difficulty → color
const getDifficultyColor = (difficulty?: string): string => {
  const d = (difficulty || "").toLowerCase();
  if (d.includes("easy") || d.includes("basic") || d.includes("school"))
    return "#10B981"; // Vibrant green
  if (d.includes("medium") || d.includes("intermediate")) return "#F59E0B"; // Vibrant amber
  if (d.includes("hard") || d.includes("advanced")) return "#EF4444"; // Vibrant red
  return "#6B7280";
};



export default function DashboardScreen() {
  const router = useRouter();
  const { colors, dark } = useTheme();

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

  useEffect(() => {
    const initProfiles = async () => {
      await loadProfiles();
      refreshProfiles();
    };
    initProfiles();
    loadContests();
    refreshPotd();
  }, []);

  const handleSync = async () => {
    refreshProfiles(true);
    refreshPotd();
    syncContests();
  };

  const isLoading = isProfileLoading || isContestLoading || isPotdLoading;

  const now = Date.now();
  const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

  const ongoingContests = upcomingContests.filter((c) => {
    if (c.phase === "running") return true;
    const start =
      c.startTime instanceof Date
        ? c.startTime.getTime()
        : new Date(c.startTime).getTime();
    const end = c.endTime
      ? c.endTime instanceof Date
        ? c.endTime.getTime()
        : new Date(c.endTime).getTime()
      : start;
    return start <= now && now <= end;
  });

  const upcomingOnly = upcomingContests.filter((c) => {
    if (c.phase === "running") return false;
    const start =
      c.startTime instanceof Date
        ? c.startTime.getTime()
        : new Date(c.startTime).getTime();
    const end = c.endTime
      ? c.endTime instanceof Date
        ? c.endTime.getTime()
        : new Date(c.endTime).getTime()
      : start;
    if (start <= now && now <= end) return false;
    return start <= sevenDaysFromNow;
  });



  if (isLoading && profiles.length === 0 && upcomingContests.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.onSurfaceVariant }]}>TODAY</Text>
            <Text style={[styles.logo, { color: colors.onSurface }]}>Krono</Text>
          </View>
          <MaterialCommunityIcons
            name="cog-outline"
            size={22}
            color={colors.onSurfaceVariant}
            onPress={() => router.push("/settings")}
          />
        </View>
        <DashboardSkeleton />
      </View>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <ErrorBoundary fallbackTitle="Dashboard Error">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Minimal header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.onSurfaceVariant }]}>
              {currentDate}
            </Text>
            <Text style={[styles.logo, { color: colors.onSurface }]}>
              Krono
            </Text>
          </View>
          <MaterialCommunityIcons
            name="cog-outline"
            size={24}
            color={colors.onSurfaceVariant}
            onPress={() => router.push("/settings")}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleSync}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Profiles */}
          {profiles.length > 0 ? (
            <View style={styles.section}>
              <Text
                style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
              >
                YOUR PROFILES
              </Text>
              <ProfileCarousel profiles={profiles} />
            </View>
          ) : (
            <View style={styles.section}>
              <View
                style={[
                  styles.connectCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: dark ? 0.04 : 0.02,
                    shadowRadius: 4,
                    elevation: 2,
                  },
                ]}
                onTouchEnd={() => router.push("/settings")}
              >
                <MaterialCommunityIcons
                  name="account-plus-outline"
                  size={20}
                  color={colors.onSurfaceVariant}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 14,
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
                    }}
                  >
                    LeetCode, Codeforces, CodeChef...
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={18}
                  color={colors.onSurfaceVariant}
                  style={{ opacity: 0.5 }}
                />
              </View>
            </View>
          )}

          {/* Total Stats */}
          {profiles.length > 0 && <CumulativeStats profiles={profiles} />}

          {/* Daily Challenge */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
            >
              DAILY CHALLENGE
            </Text>
            <View style={{ paddingHorizontal: 20 }}>
              <View
                style={[
                  styles.potdCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: dark ? 0.04 : 0.02,
                    shadowRadius: 4,
                    elevation: 2,
                  },
                ]}
                onTouchEnd={() =>
                  leetcode?.url && Linking.openURL(leetcode.url)
                }
              >
                {isPotdLoading && !leetcode ? (
                  <View style={{ gap: 8, padding: 16 }}>
                    <Skeleton width="85%" height={14} />
                    <Skeleton width="40%" height={12} />
                  </View>
                ) : (
                  <View style={styles.potdInner}>
                    <View
                      style={[
                        styles.potdDot,
                        { backgroundColor: "#FFA116" },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontWeight: "700",
                          fontSize: 14,
                          color: colors.onSurface,
                        }}
                      >
                        {leetcode?.title || "No problem today"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.onSurfaceVariant,
                          marginTop: 3,
                          fontWeight: "600",
                        }}
                      >
                        LeetCode
                      </Text>
                    </View>
                    {leetcode?.difficulty && (
                      <View
                        style={[
                          styles.diffBadge,
                          {
                            backgroundColor:
                              getDifficultyColor(leetcode.difficulty) + "18",
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: getDifficultyColor(leetcode.difficulty),
                            fontWeight: "700",
                            fontSize: 11,
                          }}
                        >
                          {leetcode.difficulty}
                        </Text>
                      </View>
                    )}
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={18}
                      color={colors.onSurfaceVariant}
                      style={{ opacity: 0.4, marginLeft: 4 }}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Live Now */}
          {ongoingContests.length > 0 && (
            <View style={styles.section}>
              <View style={styles.liveHeader}>
                <View style={styles.liveDot} />
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 14,
                    color: "#FF453A",
                    letterSpacing: 0.3,
                  }}
                >
                  LIVE NOW
                </Text>
              </View>
              <ContestList contests={ongoingContests} emptyMessage="" compact />
            </View>
          )}

          {/* Upcoming Contests — compact on dashboard */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.onSurfaceVariant, paddingHorizontal: 0 },
                ]}
              >
                UPCOMING
              </Text>
              {upcomingOnly.length > 3 && (
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "600",
                    fontSize: 13,
                  }}
                  onPress={() => router.push("/contests")}
                >
                  See all
                </Text>
              )}
            </View>
            <ContestList
              contests={upcomingOnly}
              emptyMessage="No contests in the next 7 days."
              limit={5}
              compact
            />
          </View>
        </ScrollView>
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
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 12,
  },
  logo: {
    fontWeight: "900",
    fontSize: 28,
    letterSpacing: -1,
  },
  greeting: {
    opacity: 0.8,
  },
  content: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 36,
  },
  sectionLabel: {
    fontWeight: "600",
    letterSpacing: 1,
    fontSize: 11,
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  connectCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  potdCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  potdInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 10,
  },
  potdDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF453A",
  },
});
