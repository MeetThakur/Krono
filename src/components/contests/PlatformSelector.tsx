import React from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Platform, PlatformId } from "../../types/platform";

interface PlatformSelectorProps {
  platforms: Platform[];
  selectedPlatform: PlatformId | "all";
  onSelectPlatform: (id: PlatformId | "all") => void;
  hideAllOption?: boolean;
}

export function PlatformSelector({
  platforms,
  selectedPlatform,
  onSelectPlatform,
  hideAllOption = false,
}: PlatformSelectorProps) {
  const { colors, dark } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {!hideAllOption && (
        <Pressable
          onPress={() => onSelectPlatform("all")}
          style={[
            styles.chip,
            {
              backgroundColor: selectedPlatform === "all" ? colors.onSurface : colors.surface,
            },
          ]}
        >
          <Text
            style={{
              color: selectedPlatform === "all" ? colors.background : colors.onSurfaceVariant,
              fontWeight: "700",
              fontSize: 12,
            }}
          >
            All
          </Text>
        </Pressable>
      )}
      {platforms.map((platform) => {
        let platformColor = platform.color;
        if (platform.id === "atcoder" && !dark) {
          platformColor = "#111111";
        }
        const isSelected = selectedPlatform === platform.id;
        const isLightBg = platformColor.toUpperCase() === "#FFFFFF";

        return (
          <Pressable
            key={platform.id}
            onPress={() => onSelectPlatform(platform.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? platformColor : colors.surface,
              },
            ]}
          >
            <Text
              style={{
                color: isSelected ? (isLightBg ? "#111111" : "#FFFFFF") : colors.onSurfaceVariant,
                fontWeight: "700",
                fontSize: 12,
              }}
            >
              {platform.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
});
