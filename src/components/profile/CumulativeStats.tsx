import React from "react";
import { StyleSheet, Text, View } from "react-native";
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
    { value: totalSolved, label: "Solved" },
    { value: totalSubmissions, label: "Submissions" },
    { value: totalContests, label: "Contests" },
  ];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
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
              <Text
                style={[
                  styles.value,
                  { color: colors.onSurface },
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
    marginBottom: 36,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  value: {
    fontSize: 24,
    lineHeight: 30,
    includeFontPadding: false,
    fontWeight: "800",
    letterSpacing: -1,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  divider: {
    width: 1,
    height: 32,
  },
});
