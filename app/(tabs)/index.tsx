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
import { Text, useTheme } from "react-native-paper";
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

// Difficulty → color
const getDifficultyColor = (difficulty?: string): string => {
  const d = (difficulty || "").toLowerCase();
  if (d.includes("easy") || d.includes("basic") || d.includes("school"))
    return "#10B981"; // Vibrant emerald
  if (d.includes("medium") || d.includes("intermediate")) return "#F59E0B"; // Vibrant amber
  if (d.includes("hard") || d.includes("advanced")) return "#EF4444"; // Vibrant rose
  return "#64748B";
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
    const initProfiles = async () => {
      await loadProfiles();
      refreshProfiles();
    };
    initProfiles();
    loadContests();
    refreshPotd();
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
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.onSurfaceVariant }]}>TODAY</Text>
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
        {/* Expressive top app bar */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
          <View>
            <View style={[styles.datePill, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
              <MaterialCommunityIcons name="calendar-today" size={12} color={colors.onSurfaceVariant} style={{ marginRight: 5 }} />
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
          {/* Profiles Carousel */}
          {profiles.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
                  CONNECTED PROFILES
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
                  <MaterialCommunityIcons name="swap-vertical" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 12, fontWeight: "700", color: colors.primary }}>
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
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: dark ? 0.15 : 0.03,
                    shadowRadius: 10,
                    elevation: 2,
                    transform: [{ scale: pressed ? 0.98 : 1 }]
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/settings");
                }}
              >
                <View style={[styles.connectIconCircle, { backgroundColor: colors.primaryContainer }]}>
                  <MaterialCommunityIcons
                    name="account-plus-outline"
                    size={22}
                    color={colors.primary}
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
                    borderColor: dark ? "#FFA11640" : "#FFA11670",
                    shadowColor: "#FFA116",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: dark ? 0.2 : 0.1,
                    shadowRadius: 16,
                    elevation: 4,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.96 : 1,
                  },
                ]}
              >
                {isPotdLoading && !leetcode ? (
                  <View style={{ gap: 8, padding: 18 }}>
                    <Skeleton width="85%" height={16} />
                    <Skeleton width="40%" height={12} />
                  </View>
                ) : (
                  <View style={styles.potdInner}>
                    <View style={[styles.potdIconBadge, { backgroundColor: "rgba(255, 161, 22, 0.15)" }]}>
                      <MaterialCommunityIcons name="code-braces" size={22} color="#FFA116" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#FFA116",
                            fontWeight: "800",
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                          }}
                        >
                          LeetCode POTD
                        </Text>
                      </View>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontWeight: "800",
                          fontSize: 15,
                          color: colors.onSurface,
                          lineHeight: 20,
                        }}
                      >
                        {leetcode?.title || "No problem today"}
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
                            fontWeight: "800",
                            fontSize: 11,
                          }}
                        >
                          {leetcode.difficulty}
                        </Text>
                      </View>
                    )}
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={colors.onSurfaceVariant}
                      style={{ opacity: 0.5, marginLeft: 4 }}
                    />
                  </View>
                )}
              </Pressable>
            </View>
          </View>

          {/* Live Now */}
          {ongoingContests.length > 0 && (
            <View style={styles.section}>
              <View style={styles.liveHeader}>
                <View style={styles.liveDot} />
                <Text
                  style={{
                    fontWeight: "800",
                    fontSize: 12,
                    color: "#EF4444",
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  LIVE ROUNDS NOW
                </Text>
              </View>
              <ContestList contests={ongoingContests} emptyMessage="" compact />
            </View>
          )}

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
                      color: colors.primary,
                      fontWeight: "700",
                      fontSize: 12,
                    }}
                  >
                    See all
                  </Text>
                  <MaterialCommunityIcons name="arrow-right" size={13} color={colors.primary} style={{ marginLeft: 3 }} />
                </Pressable>
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 4,
  },
  logo: {
    fontWeight: "900",
    fontSize: 32,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  greeting: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  content: {
    paddingTop: 10,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontWeight: "800",
    letterSpacing: 1.2,
    fontSize: 11,
    paddingHorizontal: 20,
    textTransform: "uppercase",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
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
    paddingVertical: 5,
    borderRadius: 999,
  },
  connectCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 24, // M3 Expressive squircle
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
    borderRadius: 24, // M3 Expressive squircle
    borderWidth: 1.5,
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
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 6,
  },
  liveHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
});

