import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
    accent: "#6C63FF",
  },
  {
    id: "2",
    icon: "trophy-variant-outline",
    title: "All Contests, One Place",
    subtitle:
      "Upcoming contests from Codeforces, LeetCode, AtCoder, and CodeChef — all in a single timeline.",
    accent: "#FF6B6B",
  },
  {
    id: "3",
    icon: "chart-timeline-variant-shimmer",
    title: "Track Your Progress",
    subtitle:
      "Connect your profiles to see live ratings, rating graphs, contest history, and detailed analytics.",
    accent: "#22C55E",
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

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <LinearGradient
        colors={[item.accent + "1A", item.accent + "00"]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      {/* Icon circle */}
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: item.accent + "15",
            borderColor: item.accent + "30",
            shadowColor: item.accent,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 10,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={item.icon as any}
          size={64}
          color={item.accent}
        />
      </View>

      {/* Title */}
      <Text
        variant="headlineMedium"
        style={[styles.title, { color: colors.onBackground, fontFamily: "Inter_900Black" }]}
      >
        {item.title}
      </Text>

      {/* Subtitle */}
      <Text
        variant="bodyLarge"
        style={[styles.subtitle, { color: colors.onSurfaceVariant, fontFamily: "Inter_400Regular" }]}
      >
        {item.subtitle}
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      {/* Skip button */}
      {!isLast && (
        <Pressable
          onPress={handleSkip}
          style={[styles.skipButton, { top: insets.top + 12 }]}
          hitSlop={12}
        >
          <Text
            variant="labelLarge"
            style={{
              color: colors.onSurfaceVariant,
              fontWeight: "600",
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
              outputRange: [8, 28, 8],
              extrapolate: "clamp",
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
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
                    backgroundColor: SLIDES[currentIndex].accent,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Next / Get Started button */}
        <Pressable
          onPress={handleNext}
          style={[
            styles.nextButton,
            {
              backgroundColor: SLIDES[currentIndex].accent,
            },
          ]}
        >
          {isLast ? (
            <Text variant="titleMedium" style={styles.buttonText}>
              Get Started
            </Text>
          ) : (
            <View style={styles.nextButtonInner}>
              <Text variant="titleMedium" style={styles.buttonText}>
                Next
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="#FFFFFF"
              />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
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
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginBottom: 40,
  },
  title: {
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
  },
  bottomArea: {
    paddingHorizontal: 32,
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
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
