import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { codechefApi } from "../../api/codechef";
import { codeforcesApi } from "../../api/codeforces";
import { leetcodeApi } from "../../api/leetcode";
import { clistApi } from "../../api/clist";
import { PlatformId, PLATFORMS } from "../../types/platform";
import { UnifiedProfile } from "../../types/user";
import { Skeleton } from "../common/SkeletonLoader";

interface RatingPoint {
  date: number; // timestamp ms
  rating: number;
  label?: string; // contest name
}

interface RatingChartProps {
  profiles: UnifiedProfile[];
}

const CHART_HEIGHT = 160;
const CHART_PADDING = 16;

export function RatingChart({ profiles }: RatingChartProps) {
  const { colors, dark } = useTheme();
  const [historyMap, setHistoryMap] = useState<Record<string, RatingPoint[]>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);

  const screenWidth = Dimensions.get("window").width - 40;

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    const result: Record<string, RatingPoint[]> = {};

    for (const profile of profiles) {
      try {
        if (profile.platformId === "codeforces") {
          // Codeforces has a direct API
          const data = await codeforcesApi.getUserRating(profile.username);
          if (Array.isArray(data) && data.length > 0) {
            result[profile.platformId] = data.map((d: any) => ({
              date: d.ratingUpdateTimeSeconds * 1000,
              rating: d.newRating,
              label: d.contestName,
            }));
          }
        } else if (profile.platformId === "leetcode") {
          // LeetCode contest ranking API
          const data = await leetcodeApi.getUserContestRanking(
            profile.username,
          );
          if (data?.history && Array.isArray(data.history)) {
            const attended = data.history.filter((h: any) => h.attended);
            if (attended.length > 0) {
              result[profile.platformId] = attended.map((h: any) => ({
                date: h.contest.startTime * 1000,
                rating: Math.round(h.rating),
                label: h.contest.title,
              }));
            }
          }
        } else if (profile.platformId === "atcoder") {
          // AtCoder has official history JSON
          try {
            const axios = require("axios");
            const resp = await axios.get(
              `https://atcoder.jp/users/${profile.username}/history/json`,
            );
            if (Array.isArray(resp.data) && resp.data.length > 0) {
              result[profile.platformId] = resp.data.map((d: any) => ({
                date: new Date(d.EndTime).getTime(),
                rating: d.NewRating,
                label: d.ContestName,
              }));
            }
          } catch (e) {
            console.warn("[RatingChart] AC history failed", e);
          }
        } else if (profile.platformId === "codechef") {
          // CodeChef native history
          const info = await codechefApi.getUserInfo(profile.username);
          if (info && info.ratingHistory && Array.isArray(info.ratingHistory) && info.ratingHistory.length > 0) {
            result[profile.platformId] = info.ratingHistory.map((s: any) => ({
              date: new Date(s.end_date.replace(" ", "T")).getTime(),
              rating: parseInt(s.rating),
              label: s.name,
            }));
          }
        } else if (profile.platformId === "topcoder") {
          // TopCoder history via clist
          const history = await clistApi.getRatingHistory("topcoder", profile.username);
          if (Array.isArray(history) && history.length > 0) {
            result[profile.platformId] = history.map((s: any) => ({
              date: new Date(s.date).getTime(),
              rating: s.new_rating,
              label: s.event,
            }));
          }
        }
      } catch (e) {
        console.warn(`[RatingChart] Failed to fetch ${profile.platformId}:`, e);
      }
    }

    setHistoryMap(result);
    setIsLoading(false);
  }, [profiles]);

  useEffect(() => {
    if (profiles.length > 0) {
      fetchHistory();
    }
  }, [profiles.length]);

  const platformKeys = Object.keys(historyMap) as PlatformId[];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Skeleton width="100%" height={CHART_HEIGHT} borderRadius={12} />
      </View>
    );
  }

  if (platformKeys.length === 0) return null;

  return (
    <View style={styles.container}>
      {platformKeys.map((platformId) => {
        let points = historyMap[platformId];
        if (!points || points.length < 2) return null;

        // If there are many contests, only show the most recent ones to prevent a cluttered graph
        const MAX_POINTS = 40;
        if (points.length > MAX_POINTS) {
          points = points.slice(-MAX_POINTS);
        }

        const platformConfig = PLATFORMS[platformId];
        let color = platformConfig?.color || colors.primary;
        if (platformId === "atcoder" && !dark) color = "#000";

        const ratings = points.map((p) => p.rating);
        const minR = Math.min(...ratings);
        const maxR = Math.max(...ratings);
        const rangeR = maxR - minR || 1;

        const chartWidth = screenWidth - CHART_PADDING * 2;

        return (
          <Surface
            key={platformId}
            style={[
              styles.chartCard,
              {
                backgroundColor: colors.surface,
                borderColor: dark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)",
              },
            ]}
            elevation={0}
          >
            <View style={styles.chartHeader}>
              <View style={[styles.platformDot, { backgroundColor: color }]} />
              <Text variant="labelMedium" style={{ fontWeight: "700" }}>
                {platformConfig?.name} Rating
              </Text>
              <Text
                variant="labelSmall"
                style={{
                  marginLeft: "auto",
                  color: colors.outline,
                }}
              >
                {points[points.length - 1].rating}
              </Text>
            </View>

            <View style={[styles.chartArea, { height: CHART_HEIGHT }]}>
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                <View
                  key={pct}
                  style={[
                    styles.gridLine,
                    {
                      bottom: pct * (CHART_HEIGHT - 20),
                      backgroundColor: dark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.03)",
                    },
                  ]}
                />
              ))}

              {points.map((point, i) => {
                const x = (i / (points.length - 1)) * chartWidth;
                const y =
                  ((point.rating - minR) / rangeR) * (CHART_HEIGHT - 30);

                return (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        left: x + CHART_PADDING - 3,
                        bottom: y + 5,
                        backgroundColor: color,
                      },
                    ]}
                  />
                );
              })}

              {points.slice(0, -1).map((point, i) => {
                const next = points[i + 1];
                const x1 =
                  (i / (points.length - 1)) * chartWidth + CHART_PADDING;
                const x2 =
                  ((i + 1) / (points.length - 1)) * chartWidth + CHART_PADDING;
                const y1 =
                  ((point.rating - minR) / rangeR) * (CHART_HEIGHT - 30) + 5;
                const y2 =
                  ((next.rating - minR) / rangeR) * (CHART_HEIGHT - 30) + 5;

                const dx = x2 - x1;
                const dy = y2 - y1;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(-dy, dx) * (180 / Math.PI);

                return (
                  <View
                    key={`line-${i}`}
                    style={{
                      position: "absolute",
                      left: x1,
                      bottom: y1,
                      width: length,
                      height: 2,
                      backgroundColor: color,
                      opacity: 0.5,
                      transform: [
                        {
                          rotate: `${angle}deg`,
                        },
                      ],
                      transformOrigin: "left bottom",
                    }}
                  />
                );
              })}
            </View>

            <View style={styles.chartFooter}>
              <Text variant="labelSmall" style={{ color: colors.outline }}>
                Low: {minR}
              </Text>
              <Text variant="labelSmall" style={{ color: colors.outline }}>
                Peak: {maxR}
              </Text>
            </View>
          </Surface>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 12,
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  platformDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chartArea: {
    position: "relative",
    overflow: "hidden",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
  },
  dot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chartFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
});
