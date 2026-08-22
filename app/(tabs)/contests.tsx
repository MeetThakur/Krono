import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, isSameDay, isTomorrow } from "date-fns";
import * as Haptics from "expo-haptics";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Linking,
    Pressable,
    RefreshControl,
    ScrollView,
    SectionList,
    StyleSheet,
    View,
} from "react-native";
import {
    ActivityIndicator,
    Surface,
    Text,
    useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBoundary } from "../../src/components/common/ErrorBoundary";
import { ContestsSkeleton } from "../../src/components/common/SkeletonLoader";
import { useContestStore } from "../../src/stores/useContestStore";
import { Contest } from "../../src/types/contest";
import { PLATFORMS, PlatformId } from "../../src/types/platform";

export default function ContestsScreen() {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    upcomingContests,
    loadContests,
    syncContests,
    isLoading,
    toggleReminder,
  } = useContestStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | "all">(
    "all",
  );

  useEffect(() => {
    loadContests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await syncContests();
    setRefreshing(false);
  };

  const sections = useMemo(() => {
    const filtered = upcomingContests.filter((contest) => {
      return (
        selectedPlatform === "all" || contest.platformId === selectedPlatform
      );
    });

    const ongoing: Contest[] = [];
    const today: Contest[] = [];
    const tomorrow: Contest[] = [];
    const thisWeek: Contest[] = [];
    const upcoming: Contest[] = [];

    const now = new Date();

    filtered.forEach((contest) => {
      const start = new Date(contest.startTime);
      const end = new Date(start.getTime() + contest.durationSeconds * 1000);

      if (start <= now && end >= now) {
        ongoing.push(contest);
      } else if (isSameDay(start, now)) {
        today.push(contest);
      } else if (isTomorrow(start)) {
        tomorrow.push(contest);
      } else {
        const daysDiff = Math.floor(
          (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
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
    let platformColor = platformConfig?.color || colors.primary;
    if (item.platformId === "atcoder") {
      platformColor = dark ? "#FFFFFF" : "#181A20";
    }

    const isLightColor = platformColor.toUpperCase() === "#FFFFFF" ||
      platformColor.toUpperCase() === "#FFA116" ||
      platformColor.toUpperCase() === "#FFBF00";
    const registerTextColor = isLightColor ? "#0F172A" : "#FFFFFF";
    const badgeBg = platformColor + "18";

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
              borderColor: colors.outline,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: dark ? 0.2 : 0.04,
              shadowRadius: 14,
              elevation: 3,
            },
          ]}
          elevation={0}
        >
          {/* Top row: badge + date */}
          <View style={styles.cardHeader}>
            <View style={[styles.platformBadge, { backgroundColor: badgeBg }]}>
              <MaterialCommunityIcons
                name={(platformConfig?.icon as any) || "code-tags"}
                size={14}
                color={platformColor}
              />
              <Text
                style={{
                  color: platformColor,
                  fontSize: 11,
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginLeft: 5,
                }}
              >
                {platformConfig?.name}
              </Text>
            </View>

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
                {format(startDate, "MMM d, HH:mm")}
              </Text>
            </View>
          </View>

          {/* Contest title */}
          <Text
            numberOfLines={2}
            style={{
              fontWeight: "800",
              fontSize: 16,
              marginTop: 12,
              marginBottom: 4,
              color: colors.onSurface,
              lineHeight: 22,
            }}
          >
            {item.name}
          </Text>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.outline }]} />

          {/* Footer row */}
          <View style={styles.cardFooter}>
            {/* Duration */}
            <View style={[styles.metaPill, { backgroundColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }]}>
              <MaterialCommunityIcons
                name="timer-outline"
                size={14}
                color={colors.onSurfaceVariant}
              />
              <Text
                style={{
                  color: colors.onSurfaceVariant,
                  fontWeight: "600",
                  fontSize: 11,
                  marginLeft: 5,
                }}
              >
                {durationText}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.iconBtn,
                  {
                    backgroundColor: item.reminderSet
                      ? colors.primaryContainer
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
                  styles.registerBtn,
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
                <Text
                  style={{
                    color: dark ? "#0F172A" : "#FFFFFF",
                    fontWeight: "800",
                    fontSize: 12,
                  }}
                >
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
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
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
        {/* Expressive Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
          <View>
            <View style={[styles.countPill, { backgroundColor: colors.primaryContainer }]}>
              <MaterialCommunityIcons name="trophy" size={12} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.subtitle, { color: colors.primary }]}>
                {upcomingContests.length > 0 ? `${upcomingContests.length} rounds scheduled` : "Timeline"}
              </Text>
            </View>
            <Text style={[styles.title, { color: colors.onSurface }]}>
              Contests
            </Text>
          </View>
        </View>

        {/* Platform filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          style={styles.chipsScroll}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPlatform("all");
            }}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor:
                  selectedPlatform === "all"
                    ? colors.primary
                    : (dark ? colors.surfaceVariant : colors.surface),
                borderColor:
                  selectedPlatform === "all"
                    ? "transparent"
                    : colors.outline,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <MaterialCommunityIcons
              name="apps"
              size={15}
              color={selectedPlatform === "all" ? (dark ? "#0F172A" : "#FFFFFF") : colors.onSurfaceVariant}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                color:
                  selectedPlatform === "all"
                    ? (dark ? "#0F172A" : "#FFFFFF")
                    : colors.onSurface,
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              All
            </Text>
          </Pressable>

          {Object.values(PLATFORMS)
            .filter((p) => ["codeforces", "leetcode", "codechef", "atcoder", "geeksforgeeks", "hackerrank"].includes(p.id))
            .map((platform) => {
            let platformColor = platform.color;
            if (platform.id === "atcoder") {
              platformColor = dark ? "#FFFFFF" : "#181A20";
            }
            const isSelected = selectedPlatform === platform.id;
            const chipIsLight =
              platformColor.toUpperCase() === "#FFFFFF" ||
              platformColor.toUpperCase() === "#FFBF00";
            const chipTextColor = isSelected
              ? chipIsLight ? "#0F172A" : "#FFFFFF"
              : colors.onSurface;

            return (
              <Pressable
                key={platform.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedPlatform(platform.id);
                }}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: isSelected ? platformColor : (dark ? colors.surfaceVariant : colors.surface),
                    borderColor: isSelected ? "transparent" : colors.outline,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={(platform.icon as any) || "code-tags"}
                  size={14}
                  color={isSelected ? chipTextColor : platformColor}
                />
                <Text
                  style={{
                    color: chipTextColor,
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  {platform.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderContestItem}
          renderSectionHeader={({ section }) => (
            <View
              style={[
                styles.sectionHeaderRow,
                { backgroundColor: colors.background },
              ]}
            >
              {section.isLive && (
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text
                    style={{
                      color: "#EF4444",
                      fontWeight: "800",
                      fontSize: 11,
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                    }}
                  >
                    LIVE ROUNDS
                  </Text>
                </View>
              )}
              {!section.isLive && (
                <Text
                  style={{
                    color: colors.onSurfaceVariant,
                    fontWeight: "800",
                    fontSize: 11,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                  }}
                >
                  {section.title}
                </Text>
              )}
            </View>
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
          initialNumToRender={10}
          windowSize={5}
          maxToRenderPerBatch={10}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="trophy-broken"
                  size={52}
                  color={colors.onSurfaceVariant}
                  style={{ opacity: 0.3, marginBottom: 16 }}
                />
                <Text
                  style={{
                    color: colors.onSurface,
                    fontWeight: "800",
                    fontSize: 18,
                    marginBottom: 6,
                  }}
                >
                  No contests found
                </Text>
                <Text
                  style={{
                    color: colors.onSurfaceVariant,
                    textAlign: "center",
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  Try changing platform filters or pull to refresh.
                </Text>
              </View>
            ) : (
              <ActivityIndicator
                style={{ marginTop: 20 }}
                color={colors.primary}
              />
            )
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
    paddingBottom: 10,
  },
  countPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontWeight: "900",
    fontSize: 32,
    letterSpacing: -0.8,
  },
  chipsScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chipsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 2,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "center",
  },
  listContent: {
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 10,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#EF4444",
  },
  cardPressable: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 24, // M3 Expressive squircle
    padding: 18,
    borderWidth: 1,
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
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  divider: {
    height: 1,
    marginTop: 12,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999, // M3 pill button
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
});

