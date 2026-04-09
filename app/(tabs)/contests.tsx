import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, isSameDay, isTomorrow } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import {
    Linking,
    Pressable,
    RefreshControl,
    SectionList,
    StyleSheet,
    View,
} from "react-native";
import {
    ActivityIndicator,
    Chip,
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
      platformColor = "#000000";
    }

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: dark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.05)",
          },
        ]}
      >
        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.row}>
            <View style={styles.platformRow}>
              <View
                style={[
                  styles.platformDot,
                  { backgroundColor: platformColor },
                ]}
              />
              <Text
                style={{
                  color: platformColor,
                  fontSize: 11,
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
                fontWeight: "500",
              }}
            >
              {format(startDate, "MMM d, HH:mm")}
            </Text>
          </View>

          {/* Title */}
          <Text
            numberOfLines={1}
            style={{
              fontWeight: "700",
              fontSize: 16,
              marginTop: 10,
              marginBottom: 6,
              color: colors.onSurface,
            }}
          >
            {item.name}
          </Text>

          {/* Duration */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={13}
              color={colors.onSurfaceVariant}
            />
            <Text
              style={{
                marginLeft: 4,
                color: colors.onSurfaceVariant,
                fontWeight: "500",
                fontSize: 12,
              }}
            >
              {durationText}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionBar}>
            <Pressable
              style={({ pressed }) => [
                styles.registerBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={() => item.url && Linking.openURL(item.url)}
            >
              <Text
                style={{
                  color: colors.onPrimary,
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                Open
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.reminderBtn,
                {
                  backgroundColor: item.reminderSet
                    ? colors.primary + "12"
                    : dark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                },
              ]}
              onPress={() => toggleReminder(item.id, !item.reminderSet)}
            >
              <MaterialCommunityIcons
                name={item.reminderSet ? "bell-ring" : "bell-outline"}
                size={16}
                color={
                  item.reminderSet ? colors.primary : colors.onSurfaceVariant
                }
              />
            </Pressable>
          </View>
        </View>
      </View>
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
        <View style={styles.chipsContainer}>
          <Chip
            selected={selectedPlatform === "all"}
            onPress={() => setSelectedPlatform("all")}
            style={[
              styles.chip,
              selectedPlatform === "all"
                ? { backgroundColor: colors.onSurface }
                : {
                    backgroundColor: dark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                  },
            ]}
            textStyle={{
              color:
                selectedPlatform === "all"
                  ? colors.surface
                  : colors.onSurfaceVariant,
              fontWeight: "600",
              fontSize: 12,
            }}
            showSelectedOverlay
          >
            All
          </Chip>
          {Object.values(PLATFORMS).map((platform) => {
            let platformColor = platform.color;
            if (platform.id === "atcoder" && !dark) {
              platformColor = "#000000";
            }
            const isSelected = selectedPlatform === platform.id;
            return (
              <Chip
                key={platform.id}
                selected={isSelected}
                onPress={() => setSelectedPlatform(platform.id)}
                style={[
                  styles.chip,
                  isSelected
                    ? { backgroundColor: platformColor }
                    : {
                        backgroundColor: dark
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.04)",
                      },
                ]}
                textStyle={{
                  color: isSelected ? "#FFFFFF" : colors.onSurfaceVariant,
                  fontWeight: "600",
                  fontSize: 12,
                }}
                showSelectedOverlay
              >
                {platform.name}
              </Chip>
            );
          })}
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderContestItem}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeaderRow}>
              {section.isLive && <View style={styles.liveDot} />}
              <Text
                style={{
                  color: section.isLive ? "#FF453A" : colors.onSurfaceVariant,
                  fontWeight: "600",
                  fontSize: 12,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                }}
              >
                {section.title}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
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
                  style={{ opacity: 0.2, marginBottom: 12 }}
                />
                <Text
                  style={{
                    color: colors.onSurfaceVariant,
                    fontWeight: "600",
                    fontSize: 15,
                  }}
                >
                  No contests found
                </Text>
                <Text
                  style={{
                    color: colors.onSurfaceVariant,
                    opacity: 0.6,
                    textAlign: "center",
                    marginTop: 4,
                    fontSize: 13,
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
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 8,
  },
  title: {
    fontWeight: "900",
    fontSize: 28,
    letterSpacing: -1,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 0,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    paddingBottom: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF453A",
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  contentContainer: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  platformDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.1)",
  },
  registerBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  reminderBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
});
