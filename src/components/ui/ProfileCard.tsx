import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Surface, useTheme } from "react-native-paper";
import { PLATFORMS } from "../../types/platform";
import { UnifiedProfile } from "../../types/user";

interface ProfileCardProps {
  profile: UnifiedProfile;
  onPress?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = React.memo(({
  profile,
  onPress,
}) => {
  const { colors, dark } = useTheme();

  const platformConfig = PLATFORMS[profile.platformId];
  const platformColor = platformConfig?.color || colors.primary;

  const handle = profile.username || "Unknown";
  let heroText: string | number = profile.rating !== undefined ? profile.rating : "—";
  let maxRating = profile.maxRating;
  let rank = profile.rank || "";
  let showProblemsSolvedInFooter = true;

  if (profile.platformId === "geeksforgeeks" || profile.platformId === "hackerrank") {
    heroText = profile.problemsSolved || 0;
    rank = "Solved";
    maxRating = 0;
    showProblemsSolvedInFooter = false;
  }

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.pressable,
        {
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <Surface
        style={[
          styles.card,
          {
            backgroundColor: dark ? colors.surfaceVariant : colors.surface,
            borderColor: colors.outline,
          },
        ]}
        elevation={0}
      >
        <View style={styles.cardInner}>
          {/* Top Bar: Platform & Status */}
          <View style={styles.topRow}>
            <View style={[styles.platformPill, { backgroundColor: dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)" }]}>
              <View style={[styles.platformDot, { backgroundColor: platformColor }]} />
              <Text style={[styles.platformLabel, { color: colors.onSurfaceVariant }]}>
                {platformConfig?.name || profile.platformId}
              </Text>
            </View>
            
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {profile.isStale && (
                <View style={[styles.statusIcon, { backgroundColor: dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)" }]}>
                  <MaterialCommunityIcons 
                    name="cloud-off-outline" 
                    size={12} 
                    color={colors.onSurfaceVariant} 
                  />
                </View>
              )}
              <View style={[styles.statusIcon, { backgroundColor: dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)" }]}>
                <MaterialCommunityIcons 
                  name="arrow-top-right" 
                  size={12} 
                  color={colors.onSurfaceVariant} 
                />
              </View>
            </View>
          </View>

          {/* Rating / Score Hero */}
          <View style={styles.heroContainer}>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
              <Text
                style={[
                  styles.heroRating,
                  {
                    color: colors.onSurface,
                    fontFamily: "JetBrainsMono_700Bold",
                  },
                ]}
              >
                {heroText}
              </Text>
              <Text style={[styles.ratingUnit, { color: colors.onSurfaceVariant }]}>
                {profile.platformId === "geeksforgeeks" || profile.platformId === "hackerrank" ? "problems" : "rating"}
              </Text>
            </View>

            {rank ? (
              <View style={[styles.rankPill, { backgroundColor: dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)" }]}>
                <Text
                  style={[styles.rankText, { color: colors.onSurfaceVariant }]}
                  numberOfLines={1}
                >
                  {rank}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Bottom Row: Handle & Peak */}
          <View style={[styles.footer, { borderTopColor: dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)" }]}>
            <Text
              style={[styles.handleText, { color: colors.onSurface }]}
              numberOfLines={1}
            >
              @{handle}
            </Text>

            {maxRating && maxRating > 0 ? (
              <View style={styles.statChip}>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                  PEAK
                </Text>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color: colors.onSurface,
                      fontFamily: "JetBrainsMono_700Bold",
                    },
                  ]}
                >
                  {maxRating}
                </Text>
              </View>
            ) : showProblemsSolvedInFooter && profile.problemsSolved ? (
              <View style={styles.statChip}>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                  SOLVED
                </Text>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color: colors.onSurface,
                      fontFamily: "JetBrainsMono_700Bold",
                    },
                  ]}
                >
                  {profile.problemsSolved}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Surface>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  pressable: {
    marginRight: 12,
  },
  card: {
    width: 270,
    height: 180,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardInner: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  platformPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  platformDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  platformLabel: {
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  heroContainer: {
    marginVertical: 2,
  },
  heroRating: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  ratingUnit: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  rankPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  rankText: {
    fontWeight: "700",
    fontSize: 11,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
  },
  handleText: {
    fontWeight: "700",
    fontSize: 12,
    maxWidth: "50%",
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "700",
  },
});
