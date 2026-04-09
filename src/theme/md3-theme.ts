import {
    MD3DarkTheme,
    MD3LightTheme,
    configureFonts,
} from "react-native-paper";
import { darkColors as customDark, lightColors as customLight } from "./colors";
import { typography } from "./typography";
import type { ThemeColor } from "../stores/useThemeStore";

// Light: Warm, clean
const lightColors = {
  ...MD3LightTheme.colors,
  primary: customLight.primary,
  onPrimary: "#FFFFFF",
  primaryContainer: "#F0F0F2",
  onPrimaryContainer: "#09090B",

  secondary: customLight.secondary,
  onSecondary: "#FFFFFF",
  secondaryContainer: "#F0F0F2",
  onSecondaryContainer: "#71717A",

  tertiary: customLight.accent,
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#E8E8EC",
  onTertiaryContainer: "#3F3F46",

  error: customLight.status.error,
  onError: "#FFFFFF",
  errorContainer: "#FEE2E2",
  onErrorContainer: "#991B1B",

  background: customLight.background,
  onBackground: customLight.text.primary,
  surface: customLight.surface,
  onSurface: customLight.text.primary,
  surfaceVariant: customLight.surfaceHighlight,
  onSurfaceVariant: customLight.text.secondary,

  outline: customLight.border,
  outlineVariant: "#E8E8EC",

  shadow: "transparent",
  scrim: "#000000",
  inverseSurface: "#18181B",
  inverseOnSurface: "#F5F5F7",
  inversePrimary: "#F5F5F7",

  elevation: {
    level0: "transparent",
    level1: "#F5F5F7",
    level2: "#F0F0F2",
    level3: "#E8E8EC",
    level4: "#E8E8EC",
    level5: "#D4D4D8",
  },
  surfaceDisabled: "rgba(0, 0, 0, 0.04)",
  onSurfaceDisabled: "rgba(0, 0, 0, 0.38)",
  backdrop: "rgba(0, 0, 0, 0.4)",
};

// Dark: Deep true black
const darkColors = {
  ...MD3DarkTheme.colors,
  primary: customDark.primary,
  onPrimary: "#141416",
  primaryContainer: "#252528",
  onPrimaryContainer: "#F0F0F2",

  secondary: customDark.secondary,
  onSecondary: "#141416",
  secondaryContainer: "#252528",
  onSecondaryContainer: "#98989D",

  tertiary: customDark.accent,
  onTertiary: "#141416",
  tertiaryContainer: "#323236",
  onTertiaryContainer: "#B0B0B5",

  error: customDark.status.error,
  onError: "#141416",
  errorContainer: "#7F1D1D",
  onErrorContainer: "#FECACA",

  background: customDark.background,
  onBackground: customDark.text.primary,
  surface: customDark.surface,
  onSurface: customDark.text.primary,
  surfaceVariant: customDark.surfaceHighlight,
  onSurfaceVariant: customDark.text.secondary,

  outline: customDark.border,
  outlineVariant: "#252528",

  shadow: "transparent",
  scrim: "#000000",
  inverseSurface: "#F0F0F2",
  inverseOnSurface: "#141416",
  inversePrimary: "#141416",

  elevation: {
    level0: "transparent",
    level1: "#191919",
    level2: "#1C1C1E",
    level3: "#222224",
    level4: "#222224",
    level5: "#2A2A2C",
  },
  surfaceDisabled: "rgba(255, 255, 255, 0.04)",
  onSurfaceDisabled: "rgba(255, 255, 255, 0.38)",
  backdrop: "rgba(0, 0, 0, 0.6)",
};

const themePalettes: Record<ThemeColor, { light: string; dark: string }> = {
  monochrome: { light: customLight.primary, dark: customDark.primary },
  blue: { light: "#3B82F6", dark: "#3B82F6" },
  emerald: { light: "#10B981", dark: "#10B981" },
  violet: { light: "#8B5CF6", dark: "#8B5CF6" },
  rose: { light: "#F43F5E", dark: "#F43F5E" },
  amber: { light: "#F59E0B", dark: "#F59E0B" },
};

export const getTheme = (isDark: boolean, colorType: ThemeColor = "monochrome") => {
  const baseColors = isDark ? darkColors : lightColors;
  const MD3Base = isDark ? MD3DarkTheme : MD3LightTheme;

  const hexColor = themePalettes[colorType][isDark ? "dark" : "light"];

  return {
    ...MD3Base,
    fonts: configureFonts({ config: typography.fonts }),
    colors: {
      ...baseColors,
      primary: hexColor,
    },
  };
};
