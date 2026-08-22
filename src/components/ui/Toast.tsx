import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore } from "../../stores/useToastStore";

export const Toast = React.memo(() => {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const { visible, message, type } = useToastStore();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: insets.top > 0 ? insets.top + 12 : 44,
          useNativeDriver: true,
          tension: 90,
          friction: 9,
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
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, insets.top]);

  let iconName: any = "information-outline";
  let iconColor = colors.primary;
  let iconBg = colors.primaryContainer;

  if (type === "success") {
    iconName = "check-circle";
    iconColor = "#10B981";
    iconBg = dark ? "rgba(16, 185, 129, 0.2)" : "#D1FAE5";
  } else if (type === "error") {
    iconName = "alert-circle";
    iconColor = "#EF4444";
    iconBg = dark ? "rgba(239, 68, 68, 0.2)" : "#FEE2E2";
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: dark ? "#1E222D" : "#FFFFFF",
          borderColor: colors.outline,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: dark ? 0.35 : 0.08,
          shadowRadius: 20,
          elevation: 10,
        },
      ]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
      </View>
      <Text
        style={[styles.message, { color: colors.onSurface }]}
        numberOfLines={2}
      >
        {message}
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
});

