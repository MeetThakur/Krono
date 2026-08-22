import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
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
      "Upcoming contests from Codeforces, LeetCode, AtCoder, CodeChef, and more — all in a single timeline.",
    accent: "#EF4444",
  },
  {
    id: "3",
    icon: "chart-timeline-variant-shimmer",
    title: "Track Your Progress",
    subtitle:
      "Connect your profiles to see live ratings, rating graphs, contest history, and rival leaderboards.",
    accent: "#10B981",
  },
  {
    id: "4",
    icon: "bell-ring-outline",
    title: "Never Miss a Contest",
    subtitle:
      "Get smart notifications before contests start. Customize reminders and background sync in Settings.",
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          {/* M3 Expressive Icon Squircle */}
          <View
            style={[
              styles.iconSquircle,
              {
                backgroundColor: item.accent + "18",
                borderColor: item.accent + "35",
                shadowColor: item.accent,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={60}
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
          style={({ pressed }) => [
            styles.skipButton, 
            { 
              top: insets.top + 16,
              opacity: pressed ? 0.6 : 1,
            }
          ]}
          hitSlop={12}
        >
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontWeight: "800",
              fontSize: 14,
              letterSpacing: 0.5,
              textTransform: "uppercase",
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
        {/* M3 Pagination pills */}
        <View style={styles.pagination}>
          {SLIDES.map((slide, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
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
                    backgroundColor: colors.primary,
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
              backgroundColor: colors.primary,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          {isLast ? (
            <Text style={[styles.buttonText, { color: dark ? "#0F172A" : "#FFFFFF" }]}>
              Get Started
            </Text>
          ) : (
            <View style={styles.nextButtonInner}>
              <Text style={[styles.buttonText, { color: dark ? "#0F172A" : "#FFFFFF" }]}>
                Next
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={dark ? "#0F172A" : "#FFFFFF"}
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
    paddingHorizontal: 36,
  },
  iconSquircle: {
    width: 124,
    height: 124,
    borderRadius: 36, // M3 Expressive squircle
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.8,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },
  bottomArea: {
    paddingHorizontal: 28,
    gap: 28,
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    width: "100%",
    height: 56,
    borderRadius: 999, // M3 Expressive pill
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "800",
  },
});

