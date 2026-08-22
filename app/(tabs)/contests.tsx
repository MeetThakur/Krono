import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, isSameDay, isTomorrow } from "date-fns";
import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo, useState } from "react";
import {
  Linking,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  View,
} from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBoundary } from "../../src/components/common/ErrorBoundary";
import { ContestsSkeleton } from "../../src/components/common/SkeletonLoader";
import { PlatformSelector } from "../../src/components/contests/PlatformSelector";
import { useContestStore } from "../../src/stores/useContestStore";
import { Contest } from "../../src/types/contest";
import { Platform, PlatformId, PLATFORMS } from "../../src/types/platform";

export default function ContestsScreen() {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    upcomingContests,
    isLoading,
    syncContests,
    toggleReminder,
  } = useContestStore();

  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await syncContests();
    setRefreshing(false);
  };

  const sections = useMemo(() => {
    const now = new Date();
    const nowMs = now.getTime();

    const filtered = upcomingContests.filter((contest) => {
      const matchPlatform = selectedPlatform === "all" || contest.platformId === selectedPlatform;
      if (!matchPlatform) return false;
      const start = new Date(contest.startTime).getTime();
      const end = contest.endTime ? new Date(contest.endTime).getTime() : start + (contest.durationSeconds || 7200) * 1000;
      return end >= nowMs;
    });

    const ongoing: Contest[] = [];
    const today: Contest[] = [];
    const tomorrow: Contest[] = [];
    const thisWeek: Contest[] = [];
    const upcoming: Contest[] = [];

    filtered.forEach((contest) => {
      const start = new Date(contest.startTime);
      const startMs = start.getTime();
      const endMs = contest.endTime ? new Date(contest.endTime).getTime() : startMs + (contest.durationSeconds || 7200) * 1000;

      if (startMs <= nowMs && endMs >= nowMs) {
        ongoing.push(contest);
      } else if (isSameDay(start, now)) {
        today.push(contest);
      } else if (isTomorrow(start)) {
        tomorrow.push(contest);
      } else {
        const daysDiff = (startMs - nowMs) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 7) {
          thisWeek.push(contest);
        } else {
          upcoming.push(contest);
        }
      }
    });

    const result = [];
    if (ongoing.length > 0)
      result.push({ title: "Live Now", data: ongoing, isLive: true });
    if (today.length > 0)
      result.push({ title: "Today", data: today, isLive: false });
    if (tomorrow.length > 0)
      result.push({ title: "Tomorrow", data: tomorrow, isLive: false });
    if (thisWeek.length > 0)
      result.push({ title: "This Week", data: thisWeek, isLive: false });
    if (upcoming.length > 0)
      result.push({ title: "Later", data: upcoming, isLive: false });

    return result;
  }, [upcomingContests, selectedPlatform]);

  const availablePlatforms = useMemo(() => {
    return (Object.values(PLATFORMS) as Platform[]).filter(
      (p: Platform) => ["codeforces", "leetcode", "codechef", "atcoder", "geeksforgeeks", "hackerrank"].includes(p.id)
    );
  }, []);

  const renderContestItem = useCallback(({ item }: { item: Contest }) => {
    const startDate = new Date(item.startTime);
    const totalMinutes = Math.round(item.durationSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const durationText =
      hours > 0
        ? minutes > 0
          ? `${hours}h ${minutes}m`
          : `${hours}h`
        : `${minutes}m`;

    const platformConfig = PLATFORMS[item.platformId];
    const platformColor = platformConfig?.color || colors.primary;
    const isLive = item.phase === "running";

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (item.url) Linking.openURL(item.url);
        }}
        style={({ pressed }) => [
          styles.cardPressable,
          { transform: [{ scale: pressed ? 0.98 : 1 }], opacity: pressed ? 0.95 : 1 },
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
                  letterSpacing: 0.5,
                }}
              >
                {platformConfig?.name || item.platformId}
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
                  size={13}
                  color={colors.onSurfaceVariant}
                />
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.onSurfaceVariant,
                    fontWeight: "700",
                    marginLeft: 6,
                    fontFamily: "JetBrainsMono_700Bold",
                  }}
                >
                  {format(startDate, "MMM d, HH:mm")}
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
            {item.name}
          </Text>

          {/* Footer: Duration + Reminder + Open Action */}
          <View style={[styles.cardFooter, { borderTopColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]}>
            <View style={[styles.metaPill, { backgroundColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }]}>
              <MaterialCommunityIcons
                name="timer-outline"
                size={14}
                color={colors.onSurfaceVariant}
              />
              <Text
                style={{
                  color: colors.onSurfaceVariant,
                  fontWeight: "700",
                  fontSize: 11,
                  marginLeft: 6,
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
                    backgroundColor: item.reminderSet
                      ? (dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)")
                      : (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                    borderColor: item.reminderSet ? colors.primary : colors.outline,
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  toggleReminder(item.id, !item.reminderSet);
                }}
              >
                <MaterialCommunityIcons
                  name={item.reminderSet ? "bell-ring" : "bell-outline"}
                  size={16}
                  color={item.reminderSet ? colors.primary : colors.onSurfaceVariant}
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
                  if (item.url) Linking.openURL(item.url);
                }}
              >
                <Text style={[styles.openBtnText, { color: dark ? "#0F172A" : "#FFFFFF" }]}>
                  Open
                </Text>
                <MaterialCommunityIcons
                  name="open-in-new"
                  size={13}
                  color={dark ? "#0F172A" : "#FFFFFF"}
                />
              </Pressable>
            </View>
          </View>
        </Surface>
      </Pressable>
    );
  }, [colors, dark, toggleReminder]);

  if (isLoading && upcomingContests.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 12 }]}>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            Contests
          </Text>
        </View>
        <ContestsSkeleton />
      </View>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="Contests Error">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 12 }]}>
          <View>
            <View style={[styles.countPill, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
              <MaterialCommunityIcons name="calendar-month-outline" size={11} color={colors.onSurfaceVariant} style={{ marginRight: 4 }} />
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                {upcomingContests.length > 0 ? `${upcomingContests.length} rounds scheduled` : "Timeline"}
              </Text>
            </View>
            <Text style={[styles.title, { color: colors.onSurface }]}>
              Contests
            </Text>
          </View>
        </View>

        {/* Spacious Platform Filter Chips */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 6 }}>
          <PlatformSelector
            platforms={availablePlatforms}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={(p) => setSelectedPlatform(p)}
            hideAllOption={false}
          />
        </View>

        {/* Grouped Contest List */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderContestItem}
          renderSectionHeader={({ section: { title, isLive } }) => (
            <View style={styles.sectionHeaderRow}>
              {isLive ? (
                <View style={styles.livePill}>
                  <View style={styles.livePulseDot} />
                  <Text style={{ color: "#EF4444", fontWeight: "900", fontSize: 11, letterSpacing: 0.6 }}>
                    LIVE NOW
                  </Text>
                </View>
              ) : (
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "900",
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    color: colors.onSurfaceVariant,
                  }}
                >
                  {title}
                </Text>
              )}
            </View>
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={54}
                color={colors.onSurfaceVariant}
                style={{ opacity: 0.3, marginBottom: 12 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: colors.onSurface,
                  marginBottom: 4,
                }}
              >
                No contests found
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.onSurfaceVariant,
                  textAlign: "center",
                  maxWidth: 240,
                }}
              >
                {selectedPlatform === "all"
                  ? "Pull down to refresh and fetch the latest schedule"
                  : `No upcoming contests for ${PLATFORMS[selectedPlatform]?.name || selectedPlatform}`}
              </Text>
            </View>
          }
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
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  countPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 10,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#EF4444",
  },
  liveText: {
    color: "#EF4444",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  cardPressable: {
    marginBottom: 10,
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
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  platformDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
  },
  openBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
});
