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
  background: "#F5F5F7", // Warm off-white
  surface: "#FFFFFF", // White
  surfaceHighlight: "#F0F0F2", // Subtle highlight
  border: "#E8E8EC", // Softer border

  primary: "#18181B", // Black accent in light mode
  secondary: "#71717A", // Zinc 500 — softer than 600
  accent: "#3F3F46", // Zinc 700

  text: {
    primary: "#09090B", // Zinc 950
    secondary: "#71717A", // Zinc 500
    muted: "#A1A1AA", // Zinc 400
    disabled: "#D4D4D8", // Zinc 300
    inverse: "#FFFFFF", // White text
  },

  status: commonStatus,
  platforms: platformColors,

  isDark: false,
};

export const darkColors = {
  background: "#141416", // Softer dark, not pure black
  surface: "#1C1C1E", // Card surface
  surfaceHighlight: "#252528",
  border: "#323236", // Visible but subtle

  primary: "#FAFAFA", // White accent
  secondary: "#8E8E93", // iOS gray
  accent: "#B0B0B5", // Lighter neutral

  text: {
    primary: "#F0F0F2", // Warm white
    secondary: "#98989D", // Softer gray
    muted: "#6C6C70", // Mid gray
    disabled: "#48484A", // Dim
    inverse: "#141416",
  },

  status: {
    ...commonStatus,
    error: "#EF4444",
    success: "#30D158", // iOS green
    warning: "#FFD60A", // iOS yellow
    info: "#0A84FF", // iOS blue
  },
  platforms: darkPlatformColors,

  isDark: true,
};

export const colors = lightColors;
