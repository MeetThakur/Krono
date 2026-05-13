import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Chip, useTheme } from "react-native-paper";
import { Platform, PlatformId } from "../../types/platform";

interface PlatformSelectorProps {
  platforms: Platform[];
  selectedPlatform: PlatformId | "all";
  onSelectPlatform: (id: PlatformId | "all") => void;
}

export function PlatformSelector({
  platforms,
  selectedPlatform,
  onSelectPlatform,
}: PlatformSelectorProps) {
  const { colors, dark } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Chip
        selected={selectedPlatform === "all"}
        onPress={() => onSelectPlatform("all")}
        style={[
          styles.chip,
          selectedPlatform === "all"
            ? { backgroundColor: colors.onSurface }
            : {
                backgroundColor: dark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)",
              },
        ]}
        textStyle={{
          color: selectedPlatform === "all" ? colors.surface : colors.onSurfaceVariant,
          fontWeight: "600",
          fontSize: 12,
        }}
        showSelectedOverlay
      >
        All
      </Chip>
      {platforms.map((platform) => {
        let platformColor = platform.color;
        if (platform.id === "atcoder" && !dark) {
          platformColor = "#000000";
        }
        const isSelected = selectedPlatform === platform.id;
        return (
          <Chip
            key={platform.id}
            selected={isSelected}
            onPress={() => onSelectPlatform(platform.id)}
            style={[
              styles.chip,
              isSelected
                ? { backgroundColor: platformColor }
                : {
                    backgroundColor: dark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                  },
            ]}
            textStyle={{
              color: isSelected ? "#FFFFFF" : colors.onSurfaceVariant,
              fontWeight: "600",
              fontSize: 12,
            }}
            showSelectedOverlay
          >
            {platform.name}
          </Chip>
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
    borderRadius: 20,
    borderWidth: 0,
  },
});
