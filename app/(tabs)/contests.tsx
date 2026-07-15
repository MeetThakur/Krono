import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, isSameDay, isTomorrow } from "date-fns";
import * as Haptics from "expo-haptics";

import React, { useEffect, useMemo, useState } from "react";
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
import { ErrorBoundary } from "../../src/components/common/ErrorBoundary";
import { ContestsSkeleton } from "../../src/components/common/SkeletonLoader";
import { useContestStore } from "../../src/stores/useContestStore";
import { Contest } from "../../src/types/contest";
import { PLATFORMS, PlatformId } from "../../src/types/platform";

export default function ContestsScreen() {
  const { colors, dark } = useTheme();
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
      const startDate = new Date(contest.startTime);
      const endDate = new Date(contest.endTime);
      if (isNaN(startDate.getTime())) return;

      const isRunning =
        contest.phase === "running" || (startDate <= now && endDate >= now);

      if (isRunning) {
        ongoing.push(contest);
      } else if (isSameDay(startDate, now)) {
        today.push(contest);
      } else if (isTomorrow(startDate)) {
        tomorrow.push(contest);
      } else {
        const diffTime = Math.abs(startDate.getTime() - now.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
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

  const renderContestItem = ({ item }: { item: Contest }) => {
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
    if (item.platformId === "atcoder" && !dark) {
      platformColor = "#111111";
    }

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (item.url) Linking.openURL(item.url);
        }}
        style={({ pressed }) => [
          { opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <Surface
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
            },
          ]}
          elevation={0}
        >
        <View style={styles.cardHeader}>
          <View style={[styles.platformBadge, { backgroundColor: platformColor + "15" }]}>
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
              fontWeight: "600",
            }}
          >
            {format(startDate, "MMM d, HH:mm")}
          </Text>
        </View>

        <Text
          numberOfLines={2}
          style={{
            fontWeight: "800",
            fontSize: 16,
            marginTop: 12,
            marginBottom: 16,
            color: colors.onSurface,
            lineHeight: 22,
          }}
        >
          {item.name}
        </Text>

        <View style={styles.cardFooter}>
          <View style={[styles.durationBadge, { backgroundColor: colors.background }]}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color={colors.onSurfaceVariant}
            />
            <Text
              style={{
                color: colors.onSurfaceVariant,
                fontWeight: "700",
                fontSize: 11,
              }}
            >
              {durationText}
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              style={[
                styles.actionBtn,
                {
                  backgroundColor: item.reminderSet
                    ? colors.primary + "1A"
                    : colors.background,
                },
              ]}
              onPress={() => toggleReminder(item.id, !item.reminderSet)}
            >
              <MaterialCommunityIcons
                name={item.reminderSet ? "bell-ring" : "bell-outline"}
                size={18}
                color={
                  item.reminderSet ? colors.primary : colors.onSurfaceVariant
                }
              />
            </Pressable>
            <Pressable
              style={[
                styles.actionBtn,
                {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => item.url && Linking.openURL(item.url)}
            >
              <MaterialCommunityIcons
                name="arrow-top-right"
                size={18}
                color={dark ? "#111111" : "#FFFFFF"}
              />
            </Pressable>
          </View>
        </View>
        </Surface>
      </Pressable>
    );
  };

  if (isLoading && upcomingContests.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
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
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            Contests
          </Text>
        </View>

        {/* Chips Filter */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            <Pressable
              onPress={() => setSelectedPlatform("all")}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedPlatform === "all" ? colors.onSurface : colors.surface,
                },
              ]}
            >
              <Text
                style={{
                  color: selectedPlatform === "all" ? colors.background : colors.onSurfaceVariant,
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                All
              </Text>
            </Pressable>
            {Object.values(PLATFORMS).map((platform) => {
              let platformColor = platform.color;
              if (platform.id === "atcoder" && !dark) {
                platformColor = "#111111";
              }
              const isSelected = selectedPlatform === platform.id;
              const isLightBg = platformColor.toUpperCase() === "#FFFFFF";
              
              return (
                <Pressable
                  key={platform.id}
                  onPress={() => setSelectedPlatform(platform.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? platformColor : colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isSelected ? (isLightBg ? "#111111" : "#FFFFFF") : colors.onSurfaceVariant,
                      fontWeight: "700",
                      fontSize: 12,
                    }}
                  >
                    {platform.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderContestItem}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeaderRow, { backgroundColor: colors.background }]}>
              {section.isLive && <View style={styles.liveDot} />}
              <Text
                style={{
                  color: section.isLive ? "#FF453A" : colors.onSurfaceVariant,
                  fontWeight: "800",
                  fontSize: 12,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                {section.title}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
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
                  size={48}
                  color={colors.onSurfaceVariant}
                  style={{ opacity: 0.2, marginBottom: 16 }}
                />
                <Text
                  style={{
                    color: colors.onSurfaceVariant,
                    fontWeight: "800",
                    fontSize: 16,
                  }}
                >
                  No contests found
                </Text>
                <Text
                  style={{
                    color: colors.onSurfaceVariant,
                    opacity: 0.6,
                    textAlign: "center",
                    marginTop: 8,
                    fontSize: 14,
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
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontWeight: "900",
    fontSize: 32,
    letterSpacing: -1,
  },
  chipsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 24,
    paddingBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF453A",
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  platformBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
});
