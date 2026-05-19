import {
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
    useFonts,
} from "@expo-google-fonts/inter";
import {
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import * as NavigationBar from "expo-navigation-bar";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { PaperProvider } from "react-native-paper";
import { registerBackgroundTask } from "../src/services/backgroundTask";
import {
    notificationService,
    setupNotificationHandler,
} from "../src/services/notificationService";
import { useOnboardingStore } from "../src/stores/useOnboardingStore";
import { useThemeStore } from "../src/stores/useThemeStore";
import { getTheme } from "../src/theme/md3-theme";

setupNotificationHandler();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isDarkMode, themeColor } = useThemeStore();
  const router = useRouter();

  const { hasCompleted, isLoading, checkOnboarding } = useOnboardingStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  // Check onboarding status on mount
  useEffect(() => {
    checkOnboarding();
  }, []);

  // Hide splash and navigate once fonts + onboarding check are ready
  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();

      if (hasCompleted === false) {
        // First time user — show onboarding
        router.replace("/onboarding" as any);
      }
    }
  }, [fontsLoaded, isLoading, hasCompleted]);

  // One-time service initialisation
  useEffect(() => {
    registerBackgroundTask();
    notificationService.requestPermissions();
  }, []);

  const activeTheme = getTheme(isDarkMode, themeColor);

  useEffect(() => {
    // Make sure the bottom navigation bar and root background matches the theme
    SystemUI.setBackgroundColorAsync(activeTheme.colors.background);
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(activeTheme.colors.background);
      NavigationBar.setButtonStyleAsync(isDarkMode ? "light" : "dark");
    }
  }, [activeTheme, isDarkMode]);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <PaperProvider theme={activeTheme}>
      <StatusBar
        style={isDarkMode ? "light" : "dark"}
        backgroundColor={activeTheme.colors.background}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </PaperProvider>
  );
}
