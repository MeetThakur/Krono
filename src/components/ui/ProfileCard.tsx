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
  
  let platformColor = platformConfig?.color || "#181A20";
  if (profile.platformId === "atcoder") {
    platformColor = dark ? "#252836" : "#181A20";
  }

  // Detect light card backgrounds for high contrast text
  const isLightCard =
    profile.platformId === "leetcode" ||
    platformColor.toUpperCase() === "#FFFFFF";

  const textColor = isLightCard ? "#0F172A" : "#FFFFFF";
  const textMuted = isLightCard ? "rgba(15, 23, 42, 0.7)" : "rgba(255, 255, 255, 0.75)";
  const pillBg = isLightCard ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.16)";
  const pillText = isLightCard ? "#0F172A" : "#FFFFFF";

  const handle = profile.username || "Unknown";
  let heroText: string | number = profile.rating !== undefined ? profile.rating : "—";
  let maxRating = profile.maxRating;
  let rank = profile.rank || "";
  let showProblemsSolvedInFooter = true;

  if (profile.platformId === "geeksforgeeks" || profile.platformId === "hackerrank") {
    heroText = profile.problemsSolved || 0;
    rank = "Problems Solved";
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
            backgroundColor: platformColor,
            shadowColor: platformColor,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: dark ? 0.35 : 0.2,
            shadowRadius: 16,
            elevation: 6,
          },
        ]}
        elevation={0}
      >
        <View style={styles.cardInner}>
          {/* Background Watermark Icon */}
          <MaterialCommunityIcons
            name={(platformConfig?.icon as any) || "code-tags"}
            size={160}
            color={isLightCard ? "#000000" : "#FFFFFF"}
            style={[styles.watermarkIcon, { opacity: isLightCard ? 0.06 : 0.1 }]}
          />

          {/* Top Row: Platform Badge + Sync Status */}
          <View style={styles.topRow}>
            <View style={[styles.platformPill, { backgroundColor: pillBg }]}>
              <MaterialCommunityIcons
                name={(platformConfig?.icon as any) || "code-tags"}
                size={14}
                color={pillText}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.platformLabel, { color: pillText }]}>
                {platformConfig?.name || profile.platformId}
              </Text>
            </View>
            {profile.isStale && (
              <View style={[styles.stalePill, { backgroundColor: pillBg }]}>
                <MaterialCommunityIcons 
                  name="cloud-off-outline" 
                  size={13} 
                  color={pillText} 
                  style={{ opacity: 0.8 }}
                />
              </View>
            )}
          </View>

          {/* Middle: Rating Hero & Rank */}
          <View style={styles.heroContainer}>
            <Text
              style={[
                styles.heroRating,
                {
                  color: textColor,
                  fontFamily: "JetBrainsMono_700Bold",
                },
              ]}
            >
              {heroText}
            </Text>

            {rank ? (
              <View style={[styles.rankPill, { backgroundColor: pillBg }]}>
                <Text
                  style={[styles.rankText, { color: textColor }]}
                  numberOfLines={1}
                >
                  {rank}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Bottom Row: Handle & Peak stats */}
          <View style={styles.footer}>
            <Text
              style={[styles.handleText, { color: textMuted }]}
              numberOfLines={1}
            >
              @{handle}
            </Text>

            <View style={styles.statRow}>
              {maxRating !== undefined && maxRating > 0 && (
                <View style={[styles.statPill, { backgroundColor: pillBg }]}>
                  <Text style={[styles.statText, { color: pillText, fontFamily: "JetBrainsMono_700Bold" }]}>
                    Peak {maxRating}
                  </Text>
                </View>
              )}
              {showProblemsSolvedInFooter && (profile.problemsSolved || 0) > 0 && (
                <View style={[styles.statPill, { backgroundColor: pillBg, marginLeft: 6 }]}>
                  <Text style={[styles.statText, { color: pillText, fontFamily: "JetBrainsMono_700Bold" }]}>
                    {profile.problemsSolved} Solved
                  </Text>
                </View>
              )}
            </View>
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
    height: 175,
    borderRadius: 24, // M3 Expressive squircle
    overflow: "hidden",
  },
  cardInner: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    position: "relative",
  },
  watermarkIcon: {
    position: "absolute",
    right: -30,
    bottom: -30,
    transform: [{ rotate: "-10deg" }],
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  platformPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  platformLabel: {
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  stalePill: {
    padding: 4,
    borderRadius: 999,
  },
  heroContainer: {
    justifyContent: "center",
    marginVertical: 4,
  },
  heroRating: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  rankPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
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
  },
  handleText: {
    fontWeight: "600",
    fontSize: 12,
    maxWidth: "40%",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statText: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});

