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

// Google Native M3 Expressive Platform Colors
const getPlatformCardStyle = (platformId: string) => {
  switch (platformId) {
    case "codeforces":
      return {
        bg: "#1D4ED8", // Rich M3 Royal Blue
        accent: "#93C5FD",
        shadow: "#1D4ED8",
      };
    case "leetcode":
      return {
        bg: "#C25E00", // Rich M3 Warm Amber
        accent: "#FDE68A",
        shadow: "#C25E00",
      };
    case "codechef":
      return {
        bg: "#85371E", // Rich M3 Warm Sienna / Terracotta
        accent: "#FECDD3",
        shadow: "#85371E",
      };
    case "atcoder":
      return {
        bg: "#1E293B", // Rich M3 Deep Slate
        accent: "#CBD5E1",
        shadow: "#1E293B",
      };
    case "geeksforgeeks":
      return {
        bg: "#065F46", // Rich M3 Forest Emerald
        accent: "#A7F3D0",
        shadow: "#065F46",
      };
    case "hackerrank":
      return {
        bg: "#047857", // Rich M3 Jade
        accent: "#6EE7B7",
        shadow: "#047857",
      };
    default:
      return {
        bg: "#4338CA",
        accent: "#C7D2FE",
        shadow: "#4338CA",
      };
  }
};

export const ProfileCard: React.FC<ProfileCardProps> = React.memo(({
  profile,
  onPress,
}) => {
  const { dark } = useTheme();
  const platformConfig = PLATFORMS[profile.platformId];
  const styleConfig = getPlatformCardStyle(profile.platformId);

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
            backgroundColor: styleConfig.bg,
            shadowColor: styleConfig.shadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: dark ? 0.35 : 0.22,
            shadowRadius: 18,
            elevation: 6,
          },
        ]}
        elevation={0}
      >
        <View style={styles.cardInner}>
          {/* Subtle Watermark Icon */}
          <MaterialCommunityIcons
            name={(platformConfig?.icon as any) || "code-tags"}
            size={150}
            color="#FFFFFF"
            style={styles.watermarkIcon}
          />

          {/* Top Bar: Platform Pill + Status */}
          <View style={styles.topRow}>
            <View style={styles.platformPill}>
              <MaterialCommunityIcons
                name={(platformConfig?.icon as any) || "code-tags"}
                size={14}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.platformLabel}>
                {platformConfig?.name || profile.platformId}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {profile.isStale && (
                <View style={styles.iconPill}>
                  <MaterialCommunityIcons
                    name="cloud-off-outline"
                    size={12}
                    color="#FFFFFF"
                  />
                </View>
              )}
              <View style={styles.iconPill}>
                <MaterialCommunityIcons
                  name="arrow-top-right"
                  size={13}
                  color="#FFFFFF"
                />
              </View>
            </View>
          </View>

          {/* Hero: Monospace Rating & Rank */}
          <View style={styles.heroSection}>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
              <Text style={styles.heroRating}>
                {heroText}
              </Text>
              <Text style={styles.ratingUnit}>
                {profile.platformId === "geeksforgeeks" || profile.platformId === "hackerrank" ? "SOLVED" : "RATING"}
              </Text>
            </View>

            {rank ? (
              <View style={styles.rankPill}>
                <Text style={styles.rankText} numberOfLines={1}>
                  {rank}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Footer: Handle & Peak stats */}
          <View style={styles.footerRow}>
            <Text style={styles.handleText} numberOfLines={1}>
              @{handle}
            </Text>

            {maxRating && maxRating > 0 ? (
              <View style={styles.statPill}>
                <Text style={styles.statLabel}>PEAK</Text>
                <Text style={styles.statValue}>{maxRating}</Text>
              </View>
            ) : showProblemsSolvedInFooter && profile.problemsSolved ? (
              <View style={styles.statPill}>
                <Text style={styles.statLabel}>SOLVED</Text>
                <Text style={styles.statValue}>{profile.problemsSolved}</Text>
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
    marginRight: 14,
  },
  card: {
    width: 275,
    height: 185,
    borderRadius: 28, // Google M3 Expressive Large Corner
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  cardInner: {
    flex: 1,
    padding: 18,
    justifyContent: "space-between",
    position: "relative",
  },
  watermarkIcon: {
    position: "absolute",
    right: -25,
    bottom: -25,
    opacity: 0.08,
    transform: [{ rotate: "-12deg" }],
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  platformPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  platformLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  iconPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroSection: {
    marginVertical: 4,
  },
  heroRating: {
    color: "#FFFFFF",
    fontSize: 36,
    lineHeight: 42,
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: -1,
  },
  ratingUnit: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  rankPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  rankText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.14)",
  },
  handleText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "700",
    fontSize: 13,
    maxWidth: "50%",
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 5,
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    fontFamily: "JetBrainsMono_700Bold",
  },
});
