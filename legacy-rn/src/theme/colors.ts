// Platform brand colors
const platformColors = {
  codeforces: "#1877F2", // Blue
  leetcode: "#FFA116", // Amber-yellow
  codechef: "#8B4513", // Warm Brown
  atcoder: "#1C1917", // Jet Black
  codingninjas: "#D04D28", // Vermilion
  geeksforgeeks: "#2F8D46", // Forest Green
  hackerrank: "#00EA64", // Neon Green
  topcoder: "#29A8DF", // Sky Blue
};

// Dark Mode overrides for platform contrast
const darkPlatformColors = {
  ...platformColors,
  atcoder: "#FFFFFF",
  leetcode: "#FFB84D",
  hackerrank: "#00EA64",
};

const commonStatus = {
  success: "#10B981", // Emerald 500
  error: "#EF4444", // Rose 500
  warning: "#F59E0B", // Amber 500
  info: "#3B82F6", // Blue 500
};

export const lightColors = {
  // Material 3 Expressive Tonal Surfaces (Light)
  background: "#F8F9FC", // Soft neutral background
  surface: "#FFFFFF",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F3F4F8",
  surfaceContainer: "#ECEEF4",
  surfaceContainerHigh: "#E6E8EF",
  surfaceContainerHighest: "#DFE2EA",
  surfaceHighlight: "#F0F2F8",
  border: "rgba(0, 0, 0, 0.08)",
  outline: "rgba(0, 0, 0, 0.12)",
  outlineVariant: "rgba(0, 0, 0, 0.05)",

  primary: "#181A20", // Deep expressive slate black
  onPrimary: "#FFFFFF",
  primaryContainer: "#E6E8EF",
  onPrimaryContainer: "#181A20",

  secondary: "#475569",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#E2E8F0",
  onSecondaryContainer: "#1E293B",

  tertiary: "#3B82F6",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#DBEAFE",
  onTertiaryContainer: "#1E40AF",

  accent: "#3B82F6",

  text: {
    primary: "#0F172A",
    secondary: "#475569",
    muted: "#94A3B8",
    disabled: "#CBD5E1",
    inverse: "#FFFFFF",
  },

  status: commonStatus,
  platforms: platformColors,

  isDark: false,
};

export const darkColors = {
  // Material 3 Expressive Tonal Surfaces (Dark)
  background: "#0D0E12", // Deep OLED-friendly dark tone
  surface: "#16181F",
  surfaceContainerLowest: "#0A0B0E",
  surfaceContainerLow: "#12141A",
  surfaceContainer: "#181B23",
  surfaceContainerHigh: "#20232E",
  surfaceContainerHighest: "#282C3A",
  surfaceHighlight: "#222530",
  border: "rgba(255, 255, 255, 0.08)",
  outline: "rgba(255, 255, 255, 0.14)",
  outlineVariant: "rgba(255, 255, 255, 0.05)",

  primary: "#F8FAFC", // Crisp pure white/slate
  onPrimary: "#0F172A",
  primaryContainer: "#20232E",
  onPrimaryContainer: "#F1F5F9",

  secondary: "#94A3B8",
  onSecondary: "#0F172A",
  secondaryContainer: "#1E293B",
  onSecondaryContainer: "#E2E8F0",

  tertiary: "#60A5FA",
  onTertiary: "#0F172A",
  tertiaryContainer: "#1E3A8A",
  onTertiaryContainer: "#BFDBFE",

  accent: "#60A5FA",

  text: {
    primary: "#F8FAFC",
    secondary: "#94A3B8",
    muted: "#64748B",
    disabled: "#334155",
    inverse: "#0F172A",
  },

  status: {
    ...commonStatus,
    error: "#F87171",
    success: "#34D399",
    warning: "#FBBF24",
    info: "#60A5FA",
  },
  platforms: darkPlatformColors,

  isDark: true,
};

export const colors = lightColors;

