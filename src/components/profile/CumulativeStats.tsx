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
    { value: totalSolved, label: "Solved", icon: "check-decagram-outline", color: "#10B981" },
    { value: totalSubmissions, label: "Submissions", icon: "code-tags", color: "#3B82F6" },
    { value: totalContests, label: "Contests", icon: "trophy-outline", color: "#F59E0B" },
  ];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: dark ? colors.surfaceVariant : colors.surface,
            borderColor: colors.outline,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: dark ? 0.2 : 0.04,
            shadowRadius: 16,
            elevation: 3,
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
              <View style={[styles.iconCircle, { backgroundColor: stat.color + "18" }]}>
                <MaterialCommunityIcons name={stat.icon as any} size={18} color={stat.color} />
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
    marginBottom: 28,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderRadius: 24, // M3 Expressive squircle
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  divider: {
    width: 1,
    height: 36,
  },
});

