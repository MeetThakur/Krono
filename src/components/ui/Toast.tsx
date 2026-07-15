import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore } from "../../stores/useToastStore";

export const Toast = () => {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const { visible, message, type, hideToast } = useToastStore();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: insets.top > 0 ? insets.top + 10 : 40,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, insets.top]);

  let iconName: any = "information-outline";
  let iconColor = colors.primary;

  if (type === "success") {
    iconName = "check-circle-outline";
    iconColor = "#10B981"; // Emerald
  } else if (type === "error") {
    iconName = "alert-circle-outline";
    iconColor = "#EF4444"; // Red
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: dark ? "#2A2A2A" : "#FFFFFF",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: dark ? 0.4 : 0.1,
          shadowRadius: 24,
          elevation: 8,
        },
      ]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + "20" }]}>
        <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
      </View>
      <Text
        style={[styles.message, { color: dark ? "#FFFFFF" : "#111111" }]}
        numberOfLines={2}
      >
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 100,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
});
