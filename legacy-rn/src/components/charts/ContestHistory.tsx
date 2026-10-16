import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { codechefApi } from "../../api/codechef";
import { codeforcesApi } from "../../api/codeforces";
import { leetcodeApi } from "../../api/leetcode";
import { clistApi } from "../../api/clist";
import { UnifiedProfile } from "../../types/user";
import { Skeleton } from "../common/SkeletonLoader";

interface ContestHistoryProps {
  profiles: UnifiedProfile[];
}

interface ContestEntry {
  event: string;
  date: string;
  place: number;
  ratingChange: number | null;
  newRating: number | null;
}

/**
 * Shows recent contest participation history.
 * Uses LeetCode's own GraphQL API for LC profiles.
 * Uses clist.by for CF, AC, CC profiles.
 */
export function ContestHistory({ profiles }: ContestHistoryProps) {
  const { colors, dark } = useTheme();
  const [entries, setEntries] = useState<ContestEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profiles.length === 0) return;

    const profile = profiles[0];
    setIsLoading(true);
    setEntries([]);

    if (profile.platformId === "leetcode") {
      // LeetCode: use its own GraphQL API
      leetcodeApi
        .getUserContestRanking(profile.username)
        .then((data) => {
          if (data?.history && Array.isArray(data.history)) {
            // Keep chronological order for computing deltas
            const attendedAsc = data.history.filter((h: any) => h.attended);
            // Compute rating change by comparing consecutive contests
            const withChanges = attendedAsc.map((h: any, i: number) => {
              const curRating = h.rating ? Math.round(h.rating) : null;
              const prevRating =
                i > 0 && attendedAsc[i - 1].rating
                  ? Math.round(attendedAsc[i - 1].rating)
                  : null;
              const change =
                curRating !== null && prevRating !== null
                  ? curRating - prevRating
                  : null;
              return {
                event: h.contest?.title || "Contest",
                date: h.contest?.startTime
                  ? new Date(h.contest.startTime * 1000).toISOString()
                  : "",
                place: h.ranking || 0,
                ratingChange: change,
                newRating: curRating,
              };
            });
            // Show newest first, limited to 20
            setEntries(withChanges.reverse().slice(0, 20));
          }
        })
        .catch((e) => {
          console.warn("[ContestHistory] LC fetch failed:", e);
        })
        .finally(() => setIsLoading(false));
    } else if (profile.platformId === "atcoder") {
      // AtCoder: official history JSON
      const axios = require("axios");
      axios
        .get(`https://atcoder.jp/users/${profile.username}/history/json`)
        .then((resp: any) => {
          if (Array.isArray(resp.data)) {
            const mapped: ContestEntry[] = resp.data.map((h: any, i: number) => {
              const prevRating = i > 0 ? resp.data[i - 1].NewRating : null;
              const change =
                prevRating !== null ? h.NewRating - prevRating : null;
              return {
                event: h.ContestName || "Contest",
                date: h.EndTime || "",
                place: h.Place || 0,
                ratingChange: change,
                newRating: h.NewRating,
              };
            });
            setEntries(mapped.reverse().slice(0, 20));
          }
        })
        .catch((e: any) => {
          console.warn("[ContestHistory] AC fetch failed:", e);
        })
        .finally(() => setIsLoading(false));
    } else if (profile.platformId === "codeforces") {
      codeforcesApi
        .getUserRating(profile.username)
        .then((data: any) => {
          if (Array.isArray(data)) {
            const mapped: ContestEntry[] = data.map((d: any) => ({
              event: d.contestName || "Contest",
              date: new Date(d.ratingUpdateTimeSeconds * 1000).toISOString(),
              place: d.rank || 0,
              ratingChange: d.newRating - d.oldRating,
              newRating: d.newRating,
            }));
            setEntries(mapped.reverse().slice(0, 20));
          }
        })
        .catch((e) => console.warn("[ContestHistory] CF fetch failed:", e))
        .finally(() => setIsLoading(false));
    } else if (profile.platformId === "codechef") {
      codechefApi
        .getUserInfo(profile.username)
        .then((info: any) => {
          if (info.ratingHistory && Array.isArray(info.ratingHistory)) {
            const mapped: ContestEntry[] = info.ratingHistory.map(
              (d: any, i: number) => {
                const prevRating =
                  i > 0 ? parseInt(info.ratingHistory[i - 1].rating) : null;
                const curRating = parseInt(d.rating);
                const change =
                  prevRating !== null ? curRating - prevRating : null;
                return {
                  event: d.name || "Contest",
                  date: d.end_date ? new Date(d.end_date.replace(" ", "T")).toISOString() : "",
                  place: parseInt(d.rank) || 0,
                  ratingChange: change,
                  newRating: curRating,
                };
              }
            );
            setEntries(mapped.reverse().slice(0, 20));
          }
        })
        .catch((e) => console.warn("[ContestHistory] CC fetch failed:", e))
        .finally(() => setIsLoading(false));
    } else if (profile.platformId === "topcoder") {
      clistApi
        .getRatingHistory("topcoder", profile.username)
        .then((history: any) => {
          if (Array.isArray(history)) {
            const mapped: ContestEntry[] = history.map((s: any) => ({
              event: s.event || "Contest",
              date: s.date ? new Date(s.date).toISOString() : "",
              place: s.place || 0,
              ratingChange: s.rating_change,
              newRating: s.new_rating,
            }));
            // Clist rating history is sorted ascending by date.
            // Reverse to show newest first.
            setEntries(mapped.reverse().slice(0, 20));
          }
        })
        .catch((e: any) => console.warn("[ContestHistory] TC fetch failed:", e))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [profiles]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Skeleton width="100%" height={200} borderRadius={16} />
      </View>
    );
  }

  if (entries.length === 0) return null;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

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
        {entries.map((entry, i) => (
          <View
            key={i}
            style={[
              styles.row,
              i < entries.length - 1 && {
                borderBottomWidth: 0.5,
                borderBottomColor: dark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.05)",
              },
            ]}
          >
            {/* Rank badge */}
            <View
              style={[
                styles.rankBadge,
                {
                  backgroundColor: dark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
                },
              ]}
            >
              <Text
                style={{
                  fontWeight: "800",
                  fontSize: 11,
                  color: colors.onSurfaceVariant,
                }}
              >
                #{entry.place}
              </Text>
            </View>

            {/* Event + date */}
            <View style={styles.eventInfo}>
              <Text
                variant="bodySmall"
                numberOfLines={1}
                style={{
                  fontWeight: "600",
                  color: colors.onSurface,
                }}
              >
                {entry.event}
              </Text>
              <Text
                variant="labelSmall"
                style={{
                  color: colors.onSurfaceVariant,
                  marginTop: 1,
                  fontSize: 10,
                }}
              >
                {formatDate(entry.date)}
              </Text>
            </View>

            {/* Rating change */}
            {entry.ratingChange !== null ? (
              <View style={styles.ratingChange}>
                <MaterialCommunityIcons
                  name={
                    entry.ratingChange >= 0
                      ? "arrow-up-bold"
                      : "arrow-down-bold"
                  }
                  size={12}
                  color={entry.ratingChange >= 0 ? "#22C55E" : "#EF4444"}
                />
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 12,
                    color: entry.ratingChange >= 0 ? "#22C55E" : "#EF4444",
                    marginLeft: 2,
                  }}
                >
                  {entry.ratingChange > 0
                    ? `+${entry.ratingChange}`
                    : entry.ratingChange}
                </Text>
              </View>
            ) : (
              <Text
                style={{
                  fontSize: 11,
                  color: colors.outline,
                  fontWeight: "500",
                }}
              >
                —
              </Text>
            )}
          </View>
        ))}
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
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  rankBadge: {
    width: 36,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  eventInfo: {
    flex: 1,
  },
  ratingChange: {
    flexDirection: "row",
    alignItems: "center",
  },
});
