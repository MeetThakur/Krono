// Common platform colors remain the same
const platformColors = {
  codeforces: "#1877F2", // Blue
  leetcode: "#FFBF00", // Bright amber-yellow
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
  background: "#F4F4F5", // Crisp off-white
  surface: "#FFFFFF",
  surfaceHighlight: "#F4F4F5",
  border: "rgba(0, 0, 0, 0.15)",

  primary: "#09090B", // High contrast black
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
  background: "#121212", // Soft, deep neutral grey (not pitch black)
  surface: "#1E1E1E", // Distinct lighter grey for cards
  surfaceHighlight: "#2C2C2C", // Hover/highlight state
  border: "rgba(255, 255, 255, 0.15)", // Clean border

  primary: "#FFFFFF",
  secondary: "#A3A3A3", // Neutral 400
  accent: "#FFFFFF", // Monochrome accent

  text: {
    primary: "#F5F5F5", // Neutral 50
    secondary: "#A3A3A3", // Neutral 400
    muted: "#737373", // Neutral 500
    disabled: "#525252", // Neutral 600
    inverse: "#121212", // Background color
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
