import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectPlatform("all");
          }}
          style={({ pressed }) => [
            styles.chip,
            {
              backgroundColor: selectedPlatform === "all" ? colors.primary : (dark ? colors.surfaceVariant : colors.surface),
              borderColor: selectedPlatform === "all" ? "transparent" : colors.outline,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
        >
          <MaterialCommunityIcons
            name="apps"
            size={16}
            color={selectedPlatform === "all" ? (dark ? "#0F172A" : "#FFFFFF") : colors.onSurfaceVariant}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              color: selectedPlatform === "all" ? (dark ? "#0F172A" : "#FFFFFF") : colors.onSurface,
              fontWeight: "700",
              fontSize: 13,
              letterSpacing: 0.1,
            }}
          >
            All
          </Text>
        </Pressable>
      )}
      {platforms.map((platform) => {
        const isSelected = selectedPlatform === platform.id;

        return (
          <Pressable
            key={platform.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectPlatform(platform.id);
            }}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isSelected ? colors.primary : (dark ? colors.surfaceVariant : colors.surface),
                borderColor: isSelected ? "transparent" : colors.outline,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isSelected ? (dark ? "#0F172A" : "#FFFFFF") : platform.color,
                },
              ]}
            />
            <Text
              style={{
                color: isSelected ? (dark ? "#0F172A" : "#FFFFFF") : colors.onSurface,
                fontWeight: "700",
                fontSize: 13,
                letterSpacing: 0.1,
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
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 2,
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 9,
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
});
