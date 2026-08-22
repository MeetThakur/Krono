import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/hooks/useTheme";

export default function TabLayout() {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? colors.surfaceContainerLow : colors.surface,
          position: "absolute",
          borderTopWidth: 1,
          borderTopColor: colors.outline,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDarkMode ? 0.3 : 0.05,
          shadowRadius: 16,
          height: 68 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 4,
          letterSpacing: 0.2,
        },
        tabBarHideOnKeyboard: true,
      }}
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: colors.primaryContainer }]}>
              <MaterialCommunityIcons
                name={focused ? "view-dashboard" : "view-dashboard-outline"}
                size={22}
                color={focused ? (isDarkMode ? colors.primary : colors.onPrimaryContainer) : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="contests"
        options={{
          title: "Contests",
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: colors.primaryContainer }]}>
              <MaterialCommunityIcons
                name={focused ? "trophy" : "trophy-outline"}
                size={22}
                color={focused ? (isDarkMode ? colors.primary : colors.onPrimaryContainer) : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="rivals"
        options={{
          title: "Rivals",
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: colors.primaryContainer }]}>
              <MaterialCommunityIcons
                name={focused ? "sword-cross" : "sword"}
                size={22}
                color={focused ? (isDarkMode ? colors.primary : colors.onPrimaryContainer) : color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          href: null,
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconWrapper, focused && { backgroundColor: colors.primaryContainer }]}>
              <MaterialCommunityIcons
                name={focused ? "cog" : "cog-outline"}
                size={22}
                color={focused ? (isDarkMode ? colors.primary : colors.onPrimaryContainer) : color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 56,
    height: 32,
    borderRadius: 16, // M3 Expressive Pill Indicator
    alignItems: "center",
    justifyContent: "center",
  },
});

