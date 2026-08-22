import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { UnifiedProfile } from "../../types/user";

interface CumulativeStatsProps {
  profiles: UnifiedProfile[];
}

export function CumulativeStats({ profiles }: CumulativeStatsProps) {
  const { colors, dark } = useTheme();

  if (!profiles || profiles.length === 0) return null;

  const totalSolved = profiles.reduce(
    (acc, p) => acc + (p.problemsSolved || 0),
    0
  );

  const totalSubmissions = profiles.reduce(
    (acc, p) => acc + (p.totalSubmissions || 0),
    0
  );

  const totalContests = profiles.reduce(
    (acc, p) => acc + (p.totalContests || 0),
    0
  );

  const stats = [
    { 
      value: totalSolved, 
      label: "Solved", 
      icon: "check-decagram-outline",
      iconColor: dark ? "#34D399" : "#059669",
      bgColor: dark ? "rgba(52, 211, 153, 0.15)" : "rgba(5, 150, 105, 0.12)",
    },
    { 
      value: totalSubmissions, 
      label: "Submissions", 
      icon: "code-tags",
      iconColor: dark ? "#60A5FA" : "#2563EB",
      bgColor: dark ? "rgba(96, 165, 250, 0.15)" : "rgba(37, 99, 235, 0.12)",
    },
    { 
      value: totalContests, 
      label: "Contests", 
      icon: "trophy-outline",
      iconColor: dark ? "#FBBF24" : "#D97706",
      bgColor: dark ? "rgba(251, 191, 36, 0.15)" : "rgba(217, 119, 6, 0.12)",
    },
  ];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: dark ? colors.surfaceVariant : colors.surface,
            borderColor: colors.outline,
          },
        ]}
      >
        {stats.map((stat, i) => (
          <React.Fragment key={stat.label}>
            {i > 0 && (
              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor: colors.outline,
                  },
                ]}
              />
            )}
            <View style={styles.statItem}>
              <View style={[styles.iconCircle, { backgroundColor: stat.bgColor }]}>
                <MaterialCommunityIcons name={stat.icon as any} size={18} color={stat.iconColor} />
              </View>
              <Text
                style={[
                  styles.value,
                  { color: colors.onSurface, fontFamily: "JetBrainsMono_700Bold" },
                ]}
              >
                {stat.value.toLocaleString()}
              </Text>
              <Text
                style={[
                  styles.label,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                {stat.label}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    lineHeight: 26,
    includeFontPadding: false,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  divider: {
    width: 1,
    height: 36,
  },
});
