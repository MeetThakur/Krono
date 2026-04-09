import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * A single shimmer bar. Animates opacity in a loop.
 * Automatically adapts to light/dark theme.
 */
export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const { colors, dark } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Pre-built skeleton for a profile card.
 */
export function ProfileCardSkeleton() {
  const { dark } = useTheme();
  return (
    <View
      style={[
        skeletonStyles.profileCard,
        {
          backgroundColor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
        },
      ]}
    >
      <Skeleton width={80} height={18} borderRadius={10} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Skeleton width="90%" height={40} borderRadius={8} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Skeleton width={100} height={16} />
        <Skeleton width={70} height={16} />
      </View>
    </View>
  );
}

/**
 * Pre-built skeleton for a contest timeline item.
 */
export function ContestItemSkeleton() {
  const { dark } = useTheme();
  return (
    <View
      style={[
        skeletonStyles.contestItem,
        {
          backgroundColor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
        },
      ]}
    >
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Skeleton width={8} height={8} borderRadius={4} />
        <Skeleton width="60%" height={16} borderRadius={6} />
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Skeleton width={40} height={14} borderRadius={6} />
        </View>
      </View>
    </View>
  );
}

/**
 * Pre-built skeleton for the dashboard loading state.
 */
export function DashboardSkeleton() {
  return (
    <View style={skeletonStyles.dashboard}>
      {/* Section title */}
      <Skeleton width={120} height={14} style={{ marginLeft: 24 }} borderRadius={4} />
      <View style={{ height: 16 }} />

      {/* Profile cards row */}
      <View style={{ flexDirection: "row", paddingHorizontal: 24, gap: 16 }}>
        <ProfileCardSkeleton />
        <ProfileCardSkeleton />
      </View>

      <View style={{ height: 40 }} />

      {/* Section title */}
      <Skeleton width={140} height={14} style={{ marginLeft: 24 }} borderRadius={4} />
      <View style={{ height: 16 }} />

      {/* POTD item */}
      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ borderRadius: 14, overflow: "hidden" }}>
          <Skeleton width="100%" height={70} borderRadius={14} />
        </View>
      </View>

      <View style={{ height: 40 }} />

      {/* Section title */}
      <Skeleton width={100} height={14} style={{ marginLeft: 24 }} borderRadius={4} />
      <View style={{ height: 16 }} />

      {/* Contest items */}
      <View style={{ paddingHorizontal: 20 }}>
        <ContestItemSkeleton />
        <ContestItemSkeleton />
      </View>
    </View>
  );
}

/**
 * Pre-built skeleton for the contests screen loading state.
 */
export function ContestsSkeleton() {
  return (
    <View style={skeletonStyles.dashboard}>
      {/* Filter chips */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          gap: 8,
          paddingVertical: 12,
        }}
      >
        <Skeleton width={50} height={32} borderRadius={16} />
        <Skeleton width={80} height={32} borderRadius={16} />
        <Skeleton width={70} height={32} borderRadius={16} />
        <Skeleton width={65} height={32} borderRadius={16} />
      </View>

      {/* Section header */}
      <Skeleton
        width={60}
        height={14}
        style={{ marginLeft: 16, marginTop: 8 }}
      />
      <View style={{ height: 12 }} />

      {/* Contest items */}
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <ContestItemSkeleton key={i} />
        ))}
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  profileCard: {
    width: 260,
    height: 165,
    padding: 18,
    borderRadius: 22,
  },
  contestItem: {
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  dashboard: {
    paddingTop: 10,
  },
});
