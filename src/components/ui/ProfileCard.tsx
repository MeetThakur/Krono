import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
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
  const isDarkMode = dark;

  const platformConfig = PLATFORMS[profile.platformId];
  let platformColor = platformConfig?.color || colors.primary;

  if (profile.platformId === "atcoder" && !isDarkMode) {
    platformColor = "#000000";
  }

  const onPlatformColor =
    profile.platformId === "atcoder" && isDarkMode ? "#000000" : "#FFFFFF";

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
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <Surface
        style={[styles.card, { backgroundColor: platformColor }]}
        elevation={0}
      >
        {/* Subtle watermark */}
        <View style={styles.watermarkContainer}>
          <MaterialCommunityIcons
            name={(platformConfig?.icon as any) || "code-tags"}
            size={100}
            color={onPlatformColor}
            style={{ opacity: 0.06 }}
          />
        </View>

        <View style={styles.cardInner}>
          {/* Platform label */}
          <Text
            variant="labelSmall"
            style={{
              color: onPlatformColor,
              fontWeight: "600",
              fontSize: 11,
              letterSpacing: 1.5,
              opacity: 0.7,
            }}
          >
            {profile.platformId?.toUpperCase()}
          </Text>

          {/* Rating hero */}
          <View style={styles.heroContainer}>
            <Text
              style={{
                fontWeight: "900",
                color: onPlatformColor,
                fontSize: 42,
                lineHeight: 48,
                letterSpacing: -2,
                includeFontPadding: false,
              }}
            >
              {rating}
            </Text>

            {rank ? (
              <Text
                style={{
                  color: onPlatformColor,
                  fontWeight: "600",
                  fontSize: 13,
                  letterSpacing: 0.5,
                  opacity: 0.8,
                  marginTop: 2,
                }}
              >
                {rank}
              </Text>
            ) : null}
          </View>

          {/* Footer: handle + stats */}
          <View style={styles.footer}>
            <Text
              style={{
                fontWeight: "500",
                color: onPlatformColor,
                opacity: 0.65,
                fontSize: 13,
              }}
            >
              @{handle}
            </Text>
            <View style={styles.statRow}>
              {maxRating !== undefined && maxRating > 0 && (
                <Text
                  style={{
                    color: onPlatformColor,
                    opacity: 0.5,
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  Peak {maxRating}
                </Text>
              )}
              {(profile.problemsSolved || 0) > 0 && (
                <Text
                  style={{
                    color: onPlatformColor,
                    opacity: 0.5,
                    fontSize: 11,
                    fontWeight: "600",
                    marginLeft: maxRating ? 12 : 0,
                  }}
                >
                  {profile.problemsSolved} solved
                </Text>
              )}
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
    borderRadius: 22,
    overflow: "hidden",
  },
  cardInner: {
    flex: 1,
    padding: 18,
    zIndex: 2,
    justifyContent: "space-between",
  },
  watermarkContainer: {
    position: "absolute",
    right: -15,
    bottom: -15,
    zIndex: 1,
    transform: [{ rotate: "-12deg" }],
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
