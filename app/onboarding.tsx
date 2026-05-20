import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    View,
    ViewToken
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboardingStore } from "../src/stores/useOnboardingStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  accent: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    icon: "rocket-launch-outline",
    title: "Welcome to Krono",
    subtitle:
      "Your competitive programming companion.\nTrack contests, sync profiles, and never miss a round.",
    accent: "#3B82F6",
  },
  {
    id: "2",
    icon: "trophy-variant-outline",
    title: "All Contests, One Place",
    subtitle:
      "Upcoming contests from Codeforces, LeetCode, AtCoder, and CodeChef — all in a single timeline.",
    accent: "#EF4444",
  },
  {
    id: "3",
    icon: "chart-timeline-variant-shimmer",
    title: "Track Your Progress",
    subtitle:
      "Connect your profiles to see live ratings, rating graphs, contest history, and detailed analytics.",
    accent: "#10B981",
  },
  {
    id: "4",
    icon: "bell-ring-outline",
    title: "Never Miss a Contest",
    subtitle:
      "Get smart notifications before contests start. Set your preferred reminder timing in Settings.",
    accent: "#F59E0B",
  },
];

export default function OnboardingScreen() {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useOnboardingStore(
    (s: any) => s.completeOnboarding,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLast = currentIndex === SLIDES.length - 1;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (isLast) {
      completeOnboarding();
      router.replace("/(tabs)");
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace("/(tabs)");
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide, index: number }) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [40, 0, 40],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });

    return (
      <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
        <Animated.View style={{ alignItems: "center", transform: [{ translateY }], opacity }}>
          {/* Icon */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: item.accent + "1A",
              },
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={56}
              color={item.accent}
            />
          </View>

          {/* Title */}
          <Text
            style={[styles.title, { color: colors.onBackground }]}
          >
            {item.title}
          </Text>

          {/* Subtitle */}
          <Text
            style={[styles.subtitle, { color: colors.onSurfaceVariant }]}
          >
            {item.subtitle}
          </Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      {/* Skip button */}
      {!isLast && (
        <Pressable
          onPress={handleSkip}
          style={[styles.skipButton, { top: insets.top + 16 }]}
          hitSlop={12}
        >
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontWeight: "700",
              fontSize: 15,
            }}
          >
            Skip
          </Text>
        </Pressable>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
        style={styles.flatList}
      />

      {/* Bottom area: dots + button */}
      <View style={styles.bottomArea}>
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {SLIDES.map((slide, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [6, 24, 6],
              extrapolate: "clamp",
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.25, 1, 0.25],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={slide.id}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: colors.onSurface,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Next / Get Started button */}
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextButton,
            {
              backgroundColor: colors.onSurface,
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          {isLast ? (
            <Text style={[styles.buttonText, { color: colors.background }]}>
              Get Started
            </Text>
          ) : (
            <View style={styles.nextButtonInner}>
              <Text style={[styles.buttonText, { color: colors.background }]}>
                Next
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={colors.background}
              />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    right: 24,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -1,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
    opacity: 0.7,
  },
  bottomArea: {
    paddingHorizontal: 32,
    gap: 32,
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  nextButton: {
    width: "100%",
    height: 56,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "800",
  },
});
