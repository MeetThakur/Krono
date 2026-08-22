const fontConfig = {
  displayLarge: {
    fontFamily: "Inter_900Black",
    fontSize: 57,
    fontWeight: "900",
    letterSpacing: -0.25,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: "Inter_900Black",
    fontSize: 45,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: "Inter_900Black",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 44,
  },

  headlineLarge: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.25,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 32,
  },

  titleLarge: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
    lineHeight: 20,
  },

  labelLarge: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    lineHeight: 16,
  },

  bodyLarge: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.4,
    lineHeight: 16,
  },
} as const;

export const monoFonts = {
  monoRegular: "JetBrainsMono_400Regular",
  monoBold: "JetBrainsMono_700Bold",
};

export const typography = {
  fonts: fontConfig,
  mono: monoFonts,
};

