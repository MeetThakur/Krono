// Common platform colors remain the same
const platformColors = {
  codeforces: "#1877F2", // Blue
  leetcode: "#FFA116", // Orange
  codechef: "#8B4513", // Brown
  atcoder: "#1C1917", // Black (Light Mode default)
  codingninjas: "#D04D28", // Orange-Red
  geeksforgeeks: "#2F8D46", // Green
};

// Override specifically for Dark Mode
const darkPlatformColors = {
  ...platformColors,
  atcoder: "#FFFFFF", // White for high contrast in dark mode
};

const commonStatus = {
  success: "#166534", // Green 800
  error: "#DC2626", // Red 600
  warning: "#D97706", // Amber 600
  info: "#0284C7", // Sky 600
};

export const lightColors = {
  background: "#F8F9FA", // Warm neutral off-white
  surface: "#FFFFFF",
  surfaceHighlight: "#F1F3F5",
  border: "rgba(0, 0, 0, 0.08)",

  primary: "#1A1A1A", // Near-black
  secondary: "#6B7280",
  accent: "#3B82F6", // Calm blue

  text: {
    primary: "#1A1A1A",
    secondary: "#6B7280",
    muted: "#9CA3AF",
    disabled: "#D1D5DB",
    inverse: "#FFFFFF",
  },

  status: commonStatus,
  platforms: platformColors,

  isDark: false,
};

export const darkColors = {
  background: "#111111", // True dark charcoal
  surface: "#1A1A1A", // Neutral dark surface
  surfaceHighlight: "#222222",
  border: "rgba(255, 255, 255, 0.08)",

  primary: "#F5F5F5", // Clean white primary
  secondary: "#9CA3AF",
  accent: "#60A5FA", // Soft blue accent

  text: {
    primary: "#F5F5F5",
    secondary: "#9CA3AF",
    muted: "#6B7280",
    disabled: "#4B5563",
    inverse: "#111111",
  },

  status: {
    ...commonStatus,
    error: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",
    info: "#3B82F6",
  },
  platforms: darkPlatformColors,

  isDark: true,
};

export const colors = lightColors;
