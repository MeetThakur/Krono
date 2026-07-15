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

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onPress,
}) => {
  const { colors, dark } = useTheme();

  const platformConfig = PLATFORMS[profile.platformId];
  
  let platformColor = platformConfig?.color || "#1A1A1A";
  if (profile.platformId === "atcoder") {
    platformColor = dark ? "#333333" : "#1C1917";
  } else if (profile.platformId === "leetcode") {
    platformColor = "#8B5000"; // Dark amber/brown for contrast with white text
  }

  const textColor = "#FFFFFF";
  const textMuted = "rgba(255, 255, 255, 0.7)";
  const textFaint = "rgba(255, 255, 255, 0.5)";

  const handle = profile.username || "Unknown";
  const rating = profile.rating !== undefined ? profile.rating : "—";
  const maxRating = profile.maxRating;
  const rank = profile.rank || "";

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={({ pressed }) => [
        { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <Surface
        style={[
          styles.card,
          { backgroundColor: platformColor },
        ]}
        elevation={0}
      >
        <View style={styles.cardInner}>
          {/* Background Watermark Icon */}
          <MaterialCommunityIcons
            name={(platformConfig?.icon as any) || "code-tags"}
            size={180}
            color="#FFFFFF"
            style={styles.watermarkIcon}
          />

          {/* Card Details */}
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              {/* Platform label */}
              <Text
                style={{
                  color: textMuted,
                  fontWeight: "700",
                  fontSize: 10,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                {platformConfig?.name || profile.platformId}
              </Text>
              {profile.isStale && (
                <MaterialCommunityIcons 
                  name="cloud-off-outline" 
                  size={16} 
                  color={textMuted} 
                  style={{ opacity: 0.8 }}
                />
              )}
            </View>

            {/* Rating hero */}
            <View style={styles.heroContainer}>
              <Text
                style={{
                  fontWeight: "800",
                  color: textColor,
                  fontSize: 36,
                  lineHeight: 42,
                  letterSpacing: -1,
                  includeFontPadding: false,
                }}
              >
                {rating}
              </Text>

              {rank ? (
                <Text
                  style={{
                    color: textMuted,
                    fontWeight: "600",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  {rank}
                </Text>
              ) : null}
            </View>

            {/* Footer: handle + stats */}
            <View style={styles.footer}>
              <Text
                style={{
                  fontWeight: "600",
                  color: textMuted,
                  fontSize: 12,
                  maxWidth: "50%",
                }}
                numberOfLines={1}
              >
                @{handle}
              </Text>
              <View style={styles.statRow}>
                {maxRating !== undefined && maxRating > 0 && (
                  <Text
                    style={{
                      color: textFaint,
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    Peak {maxRating}
                  </Text>
                )}
                {(profile.problemsSolved || 0) > 0 && (
                  <Text
                    style={{
                      color: textFaint,
                      fontSize: 11,
                      fontWeight: "700",
                      marginLeft: maxRating ? 10 : 0,
                    }}
                  >
                    {profile.problemsSolved} solved
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </Surface>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 260,
    height: 165,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardInner: {
    flex: 1,
    padding: 18,
    position: "relative",
  },
  watermarkIcon: {
    position: "absolute",
    right: -40,
    bottom: -40,
    opacity: 0.1,
    transform: [{ rotate: "-15deg" }],
  },
  heroContainer: {
    flex: 1,
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
