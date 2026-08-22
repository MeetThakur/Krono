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

// Google Native M3 Expressive Palette with deep, vibrant tones
const getPlatformCardStyle = (platformId: string) => {
  switch (platformId) {
    case "codeforces":
      return {
        bg: "#1D4ED8", // Google Royal Blue
        subBg: "#172554",
        pillBg: "rgba(255, 255, 255, 0.2)",
        shadow: "#1D4ED8",
      };
    case "leetcode":
      return {
        bg: "#D97706", // Google Sunset Amber
        subBg: "#451A03",
        pillBg: "rgba(255, 255, 255, 0.2)",
        shadow: "#D97706",
      };
    case "codechef":
      return {
        bg: "#9A3412", // Google Warm Terracotta
        subBg: "#431407",
        pillBg: "rgba(255, 255, 255, 0.2)",
        shadow: "#9A3412",
      };
    case "atcoder":
      return {
        bg: "#1E293B", // Google Slate Onyx
        subBg: "#0F172A",
        pillBg: "rgba(255, 255, 255, 0.16)",
        shadow: "#1E293B",
      };
    case "geeksforgeeks":
      return {
        bg: "#059669", // Google Forest Emerald
        subBg: "#064E3B",
        pillBg: "rgba(255, 255, 255, 0.2)",
        shadow: "#059669",
      };
    case "hackerrank":
      return {
        bg: "#0D9488", // Google Deep Teal
        subBg: "#134E4A",
        pillBg: "rgba(255, 255, 255, 0.2)",
        shadow: "#0D9488",
      };
    default:
      return {
        bg: "#4F46E5",
        subBg: "#312E81",
        pillBg: "rgba(255, 255, 255, 0.2)",
        shadow: "#4F46E5",
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
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: dark ? 0.4 : 0.25,
            shadowRadius: 20,
            elevation: 8,
          },
        ]}
        elevation={0}
      >
        <View style={styles.cardInner}>
          {/* Subtle Watermark Graphic */}
          <MaterialCommunityIcons
            name={(platformConfig?.icon as any) || "code-tags"}
            size={160}
            color="#FFFFFF"
            style={styles.watermarkIcon}
          />

          {/* Top Header Row */}
          <View style={styles.topRow}>
            <View style={[styles.platformPill, { backgroundColor: styleConfig.pillBg }]}>
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
                <View style={[styles.statusIcon, { backgroundColor: styleConfig.pillBg }]}>
                  <MaterialCommunityIcons
                    name="cloud-off-outline"
                    size={12}
                    color="#FFFFFF"
                  />
                </View>
              )}
              <View style={[styles.statusIcon, { backgroundColor: styleConfig.pillBg }]}>
                <MaterialCommunityIcons
                  name="arrow-top-right"
                  size={14}
                  color="#FFFFFF"
                />
              </View>
            </View>
          </View>

          {/* Hero: Rating & Metric Unit */}
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
              <View style={[styles.rankPill, { backgroundColor: styleConfig.pillBg }]}>
                <MaterialCommunityIcons name="shield-check" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.rankText} numberOfLines={1}>
                  {rank}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Bottom Footer: Handle & Stats */}
          <View style={styles.footerRow}>
            <Text style={styles.handleText} numberOfLines={1}>
              @{handle}
            </Text>

            {maxRating && maxRating > 0 ? (
              <View style={[styles.statPill, { backgroundColor: styleConfig.pillBg }]}>
                <Text style={styles.statLabel}>PEAK</Text>
                <Text style={styles.statValue}>{maxRating}</Text>
              </View>
            ) : showProblemsSolvedInFooter && profile.problemsSolved ? (
              <View style={[styles.statPill, { backgroundColor: styleConfig.pillBg }]}>
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
    marginRight: 16,
  },
  card: {
    width: 290,
    height: 195,
    borderRadius: 32, // Google Pixel / M3 Expressive Ultra Squircles
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
  },
  cardInner: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
    position: "relative",
  },
  watermarkIcon: {
    position: "absolute",
    right: -25,
    bottom: -25,
    opacity: 0.1,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  platformLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  heroSection: {
    marginVertical: 2,
  },
  heroRating: {
    color: "#FFFFFF",
    fontSize: 40,
    lineHeight: 46,
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: -1.2,
  },
  ratingUnit: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  rankPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  rankText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.18)",
  },
  handleText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "800",
    fontSize: 13,
    maxWidth: "50%",
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 6,
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    fontFamily: "JetBrainsMono_700Bold",
  },
});
