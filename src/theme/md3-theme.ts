import {
  MD3DarkTheme,
  MD3LightTheme,
  configureFonts,
} from "react-native-paper";
import { darkColors as customDark, lightColors as customLight } from "./colors";
import { typography } from "./typography";
import type { ThemeColor } from "../stores/useThemeStore";

export const themePalettes: Record<ThemeColor, { light: string; dark: string; lightContainer: string; darkContainer: string; onLightContainer: string; onDarkContainer: string }> = {
  monochrome: {
    light: "#181A20",
    dark: "#F8FAFC",
    lightContainer: "#E6E8EF",
    darkContainer: "#20232E",
    onLightContainer: "#181A20",
    onDarkContainer: "#F1F5F9",
  },
  blue: {
    light: "#2563EB",
    dark: "#60A5FA",
    lightContainer: "#DBEAFE",
    darkContainer: "#1E3A8A",
    onLightContainer: "#1E40AF",
    onDarkContainer: "#DBEAFE",
  },
  emerald: {
    light: "#059669",
    dark: "#34D399",
    lightContainer: "#D1FAE5",
    darkContainer: "#064E3B",
    onLightContainer: "#065F46",
    onDarkContainer: "#D1FAE5",
  },
  violet: {
    light: "#7C3AED",
    dark: "#A78BFA",
    lightContainer: "#EDE9FE",
    darkContainer: "#4C1D95",
    onLightContainer: "#5B21B6",
    onDarkContainer: "#EDE9FE",
  },
  rose: {
    light: "#E11D48",
    dark: "#FB7185",
    lightContainer: "#FFE4E6",
    darkContainer: "#881337",
    onLightContainer: "#9F1239",
    onDarkContainer: "#FFE4E6",
  },
  amber: {
    light: "#D97706",
    dark: "#FBBF24",
    lightContainer: "#FEF3C7",
    darkContainer: "#78350F",
    onLightContainer: "#92400E",
    onDarkContainer: "#FEF3C7",
  },
};

export const getTheme = (isDark: boolean, colorType: ThemeColor = "monochrome") => {
  const palette = themePalettes[colorType] || themePalettes.monochrome;
  const primaryColor = isDark ? palette.dark : palette.light;
  const primaryContainerColor = isDark ? palette.darkContainer : palette.lightContainer;
  const onPrimaryContainerColor = isDark ? palette.onDarkContainer : palette.onLightContainer;

  const baseColors = isDark ? {
    ...MD3DarkTheme.colors,
    primary: primaryColor,
    onPrimary: "#0F172A",
    primaryContainer: primaryContainerColor,
    onPrimaryContainer: onPrimaryContainerColor,

    secondary: customDark.secondary,
    onSecondary: "#0F172A",
    secondaryContainer: customDark.secondaryContainer,
    onSecondaryContainer: customDark.onSecondaryContainer,

    tertiary: customDark.tertiary,
    onTertiary: "#0F172A",
    tertiaryContainer: customDark.tertiaryContainer,
    onTertiaryContainer: customDark.onTertiaryContainer,

    error: customDark.status.error,
    onError: "#0F172A",
    errorContainer: "#7F1D1D",
    onErrorContainer: "#FECACA",

    background: customDark.background,
    onBackground: customDark.text.primary,
    surface: customDark.surface,
    onSurface: customDark.text.primary,
    surfaceVariant: customDark.surfaceContainerHigh,
    onSurfaceVariant: customDark.text.secondary,

    outline: customDark.outline,
    outlineVariant: customDark.outlineVariant,

    elevation: {
      level0: "transparent",
      level1: customDark.surfaceContainerLow,
      level2: customDark.surfaceContainer,
      level3: customDark.surfaceContainerHigh,
      level4: customDark.surfaceContainerHighest,
      level5: "#2E3342",
    },
  } : {
    ...MD3LightTheme.colors,
    primary: primaryColor,
    onPrimary: "#FFFFFF",
    primaryContainer: primaryContainerColor,
    onPrimaryContainer: onPrimaryContainerColor,

    secondary: customLight.secondary,
    onSecondary: "#FFFFFF",
    secondaryContainer: customLight.secondaryContainer,
    onSecondaryContainer: customLight.onSecondaryContainer,

    tertiary: customLight.tertiary,
    onTertiary: "#FFFFFF",
    tertiaryContainer: customLight.tertiaryContainer,
    onTertiaryContainer: customLight.onTertiaryContainer,

    error: customLight.status.error,
    onError: "#FFFFFF",
    errorContainer: "#FEE2E2",
    onErrorContainer: "#991B1B",

    background: customLight.background,
    onBackground: customLight.text.primary,
    surface: customLight.surface,
    onSurface: customLight.text.primary,
    surfaceVariant: customLight.surfaceContainerHigh,
    onSurfaceVariant: customLight.text.secondary,

    outline: customLight.outline,
    outlineVariant: customLight.outlineVariant,

    elevation: {
      level0: "transparent",
      level1: customLight.surfaceContainerLow,
      level2: customLight.surfaceContainer,
      level3: customLight.surfaceContainerHigh,
      level4: customLight.surfaceContainerHighest,
      level5: "#D4D7E2",
    },
  };

  const MD3Base = isDark ? MD3DarkTheme : MD3LightTheme;

  return {
    ...MD3Base,
    roundness: 24, // Material Expressive roundedness
    fonts: configureFonts({ config: typography.fonts }),
    colors: baseColors,
  };
};

