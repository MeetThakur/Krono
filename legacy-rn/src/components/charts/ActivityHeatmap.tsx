import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { clistApi } from "../../api/clist";
import { codeforcesApi } from "../../api/codeforces";
import { leetcodeApi } from "../../api/leetcode";
import { hackerrankApi } from "../../api/hackerrank";
import { UnifiedProfile } from "../../types/user";
import { Skeleton } from "../common/SkeletonLoader";

const WEEKS = 13; // ~3 months
const DAYS_PER_WEEK = 7;
const CELL_SIZE = 12;
const CELL_GAP = 3;

const DAY_LABELS = ["", "M", "", "W", "", "F", ""];

interface ActivityHeatmapProps {
  profiles: UnifiedProfile[];
}

/**
 * GitHub-style activity heatmap showing daily problem-solving activity.
 * Uses Codeforces submissions API for CF profiles,
 * and clist.by statistics (contest dates) for all other platforms.
 */
export function ActivityHeatmap({ profiles }: ActivityHeatmapProps) {
  const { colors, dark } = useTheme();
  const [activityMap, setActivityMap] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchActivity = useCallback(async () => {
    setIsLoading(true);
    const map: Record<string, number> = {};

    for (const profile of profiles) {
      try {
        if (profile.platformId === "codeforces") {
          // CF uses native submissions API
          const subs = await codeforcesApi.getUserSubmissions(
            profile.username,
            10000,
          );
          if (Array.isArray(subs)) {
            const accepted = subs.filter((s: any) => s.verdict === "OK");
            for (const sub of accepted) {
              const date = new Date(sub.creationTimeSeconds * 1000);
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
              map[key] = (map[key] || 0) + 1;
            }
          }
        } else if (profile.platformId === "leetcode") {
          const calendar = await leetcodeApi.getUserCalendar(profile.username);
          if (calendar) {
            const parsed = JSON.parse(calendar);
            for (const timestamp in parsed) {
              const date = new Date(parseInt(timestamp, 10) * 1000);
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
              map[key] = (map[key] || 0) + parsed[timestamp];
            }
          }
        } else if (profile.platformId === "hackerrank") {
          const calendar = await hackerrankApi.getSubmissionHistory(profile.username);
          if (calendar && typeof calendar === "object") {
            for (const dateString in calendar) {
              // dateString is "YYYY-MM-DD"
              map[dateString] = (map[dateString] || 0) + calendar[dateString];
            }
          }
        } else {
          // For AC, CC, TC — use clist.by statistics (cached)
          const stats = await clistApi.getStatistics(
            profile.platformId,
            profile.username,
          );
          for (const stat of stats) {
            if (stat.date) {
              const date = new Date(stat.date);
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
              map[key] = (map[key] || 0) + 1;
            }
          }
        }
      } catch (e) {
        console.warn(`[ActivityHeatmap] Failed for ${profile.platformId}:`, e);
      }
    }

    setActivityMap(map);
    setTotalCount(Object.values(map).reduce((a, b) => a + b, 0));
    setIsLoading(false);
  }, [profiles]);

  useEffect(() => {
    if (profiles.length > 0) {
      fetchActivity();
    }
  }, [profiles.length]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Skeleton
          width="100%"
          height={CELL_SIZE * DAYS_PER_WEEK + CELL_GAP * 6 + 60}
          borderRadius={12}
        />
      </View>
    );
  }

  // Don't render if no data
  if (Object.keys(activityMap).length === 0 && totalCount === 0) return null;

  // Build grid: last WEEKS weeks ending today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (WEEKS * 7 - 1));
  const dayOfWeek = startDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startDate.setDate(startDate.getDate() + mondayOffset);

  const values = Object.values(activityMap);
  const maxCount = values.length > 0 ? Math.max(...values) : 1;

  const weeks: { key: string; count: number }[][] = [];
  const cursor = new Date(startDate);

  for (let w = 0; w < WEEKS; w++) {
    const week: { key: string; count: number }[] = [];
    for (let d = 0; d < DAYS_PER_WEEK; d++) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      const isFuture = cursor.getTime() > today.getTime();
      week.push({
        key,
        count: isFuture ? -1 : activityMap[key] || 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const getColor = (count: number): string => {
    if (count < 0) return "transparent";
    if (count === 0)
      return dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.25) return dark ? "#0e4429" : "#9be9a8";
    if (intensity < 0.5) return dark ? "#006d32" : "#40c463";
    if (intensity < 0.75) return dark ? "#26a641" : "#30a14e";
    return dark ? "#39d353" : "#216e39";
  };

  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  let recentCount = 0;
  for (const [dateStr, count] of Object.entries(activityMap)) {
    const d = new Date(dateStr);
    if (d >= ninetyDaysAgo && d <= today) recentCount += count;
  }

  return (
    <View style={styles.container}>
      <Surface
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
          },
        ]}
        elevation={0}
      >
        <View style={styles.header}>
          <Text variant="labelMedium" style={{ fontWeight: "700" }}>
            Activity
          </Text>
          <Text variant="labelSmall" style={{ color: colors.outline }}>
            {recentCount} activities (90d)
          </Text>
        </View>

        <View style={styles.gridWrapper}>
          {/* Day labels */}
          <View style={styles.dayLabels}>
            {DAY_LABELS.map((label, i) => (
              <Text
                key={i}
                style={[
                  styles.dayLabel,
                  {
                    color: colors.outline,
                    height: CELL_SIZE,
                    lineHeight: CELL_SIZE,
                  },
                ]}
              >
                {label}
              </Text>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {weeks.map((week, wi) => (
              <View key={wi} style={styles.weekColumn}>
                {week.map((day) => (
                  <View
                    key={day.key}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: getColor(day.count),
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                      },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text
            variant="labelSmall"
            style={{
              color: colors.outline,
              marginRight: 4,
            }}
          >
            Less
          </Text>
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <View
              key={pct}
              style={[
                styles.legendCell,
                {
                  backgroundColor: getColor(pct * maxCount || 0),
                },
              ]}
            />
          ))}
          <Text
            variant="labelSmall"
            style={{
              color: colors.outline,
              marginLeft: 4,
            }}
          >
            More
          </Text>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  gridWrapper: {
    flexDirection: "row",
  },
  dayLabels: {
    marginRight: 4,
    justifyContent: "space-between",
  },
  dayLabel: {
    fontSize: 9,
    width: 14,
    textAlign: "right",
  },
  grid: {
    flexDirection: "row",
    gap: CELL_GAP,
    flex: 1,
    justifyContent: "flex-end",
  },
  weekColumn: {
    gap: CELL_GAP,
  },
  cell: {
    borderRadius: 2,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 2,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
