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
    // Always ensure platform color has readable contrast
    if (item.platformId === "atcoder") {
      platformColor = dark ? "#E5E5E5" : "#111111";
    }
    // Determine if platform color is light (needs dark text on register btn)
    const isLightColor = platformColor.toUpperCase() === "#FFFFFF" ||
      platformColor.toUpperCase() === "#FFA116" || // LeetCode orange (old)
      platformColor.toUpperCase() === "#FFBF00" || // LeetCode bright yellow
      platformColor.toUpperCase() === "#E5E5E5";
    const registerTextColor = isLightColor ? "#111111" : "#FFFFFF";
    const badgeBg = dark
      ? platformColor + "25"
      : platformColor + "18";

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          if (item.url) Linking.openURL(item.url);
        }}
        style={({ pressed }) => [
          { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
        ]}
      >
        <Surface
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderLeftWidth: 3,
              borderLeftColor: platformColor,
            },
          ]}
          elevation={0}
        >
          {/* Top row: badge + date */}
          <View style={styles.cardHeader}>
            <View style={[styles.platformBadge, { backgroundColor: badgeBg }]}>
              <MaterialCommunityIcons
                name={(platformConfig?.icon as any) || "code-tags"}
                size={12}
                color={platformColor}
              />
              <Text
                style={{
                  color: platformColor,
                  fontSize: 10,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                {platformConfig?.name}
              </Text>
            </View>

            <View style={styles.dateChip}>
              <MaterialCommunityIcons
                name="calendar-outline"
                size={11}
                color={colors.onSurfaceVariant}
              />
              <Text
                style={{
                  fontSize: 11,
                  color: colors.onSurfaceVariant,
                  fontWeight: "600",
                  marginLeft: 4,
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
              fontWeight: "700",
              fontSize: 15,
              marginTop: 14,
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
            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="timer-outline"
                size={14}
                color={colors.onSurfaceVariant}
              />
              <Text
                style={{
                  color: colors.onSurfaceVariant,
                  fontWeight: "600",
                  fontSize: 12,
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
                      ? platformColor + "25"
                      : colors.surfaceVariant,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleReminder(item.id, !item.reminderSet);
                }}
              >
                <MaterialCommunityIcons
                  name={item.reminderSet ? "bell-ring" : "bell-outline"}
                  size={16}
                  color={item.reminderSet ? platformColor : colors.onSurfaceVariant}
                />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.registerBtn,
                  {
                    backgroundColor: platformColor,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (item.url) Linking.openURL(item.url);
                }}
              >
                <Text
                  style={{
                    color: registerTextColor,
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  Register
                </Text>
                <MaterialCommunityIcons
                  name="arrow-top-right"
                  size={13}
                  color={registerTextColor}
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
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
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
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
          <View>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              {upcomingContests.length > 0 ? `${upcomingContests.length} upcoming` : "upcoming"}
            </Text>
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
            style={[
              styles.chip,
              {
                backgroundColor:
                  selectedPlatform === "all"
                    ? colors.onSurface
                    : colors.surface,
                borderColor:
                  selectedPlatform === "all"
                    ? colors.onSurface
                    : colors.outline,
              },
            ]}
          >
            <Text
              style={{
                color:
                  selectedPlatform === "all"
                    ? colors.background
                    : colors.onSurfaceVariant,
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              All
            </Text>
          </Pressable>

          {Object.values(PLATFORMS)
            .filter((p) => ["codeforces", "leetcode", "codechef", "atcoder"].includes(p.id))
            .map((platform) => {
            let platformColor = platform.color;
            if (platform.id === "atcoder") {
              platformColor = dark ? "#E5E5E5" : "#111111";
            }
            const isSelected = selectedPlatform === platform.id;
            const chipIsLight =
              platformColor.toUpperCase() === "#FFFFFF" ||
              platformColor.toUpperCase() === "#E5E5E5" ||
              platformColor.toUpperCase() === "#FFBF00";
            const chipTextColor = isSelected
              ? chipIsLight ? "#111111" : "#FFFFFF"
              : colors.onSurface;

            return (
              <Pressable
                key={platform.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedPlatform(platform.id);
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? platformColor : colors.surface,
                    borderColor: isSelected ? platformColor : colors.outline,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={(platform.icon as any) || "code-tags"}
                  size={13}
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
                      color: "#FF453A",
                      fontWeight: "800",
                      fontSize: 11,
                      letterSpacing: 1,
                    }}
                  >
                    LIVE
                  </Text>
                </View>
              )}
              {!section.isLive && (
                <Text
                  style={{
                    color: colors.onSurfaceVariant,
                    fontWeight: "700",
                    fontSize: 11,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  {section.title}
                </Text>
              )}
            </View>
          )}
          contentContainerStyle={styles.listContent}
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
                  style={{ opacity: 0.2, marginBottom: 16 }}
                />
                <Text
                  style={{
                    color: colors.onSurface,
                    fontWeight: "800",
                    fontSize: 17,
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
                  Try changing filters or pull to refresh.
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
    paddingBottom: 14,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  title: {
    fontWeight: "900",
    fontSize: 30,
    letterSpacing: -0.5,
  },
  chipsScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chipsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 14,
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
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1.5,
    alignSelf: "center",
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 4,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FF453A18",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FF453A",
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
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
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    height: 1,
    marginTop: 14,
    marginBottom: 12,
    opacity: 0.5,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
});
