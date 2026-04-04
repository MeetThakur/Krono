import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
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

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View
          style={[styles.indicator, { backgroundColor: colors.secondary }]}
        />
        <Text
          variant="labelMedium"
          style={[styles.headerText, { color: colors.onSurfaceVariant }]}
        >
          TOTAL STATS
        </Text>
      </View>

      <Surface
        style={[
          styles.surface,
          {
            backgroundColor: dark
              ? "rgba(255,255,255,0.03)"
              : "rgba(0,0,0,0.02)",
            borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
          },
        ]}
        elevation={0}
      >
        <View style={styles.statGroup}>
          <View style={styles.statItem}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: "rgba(34, 197, 94, 0.12)" }, // Green
              ]}
            >
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={22}
                color="#22C55E"
              />
            </View>
            <View style={styles.textContainer}>
              <Text variant="titleMedium" style={styles.valueText}>
                {totalSolved}
              </Text>
              <Text
                variant="labelSmall"
                style={[styles.labelText, { color: colors.onSurfaceVariant }]}
              >
                Total Solved
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: "rgba(168, 85, 247, 0.12)" }, // Purple
              ]}
            >
              <MaterialCommunityIcons
                name="code-tags"
                size={22}
                color="#A855F7"
              />
            </View>
            <View style={styles.textContainer}>
              <Text variant="titleMedium" style={styles.valueText}>
                {totalSubmissions}
              </Text>
              <Text
                variant="labelSmall"
                style={[styles.labelText, { color: colors.onSurfaceVariant }]}
              >
                Submissions
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: "rgba(59, 130, 246, 0.12)" }, // Blue
              ]}
            >
              <MaterialCommunityIcons
                name="medal-outline"
                size={22}
                color="#3B82F6"
              />
            </View>
            <View style={styles.textContainer}>
              <Text variant="titleMedium" style={styles.valueText}>
                {totalContests}
              </Text>
              <Text
                variant="labelSmall"
                style={[styles.labelText, { color: colors.onSurfaceVariant }]}
              >
                Contests
              </Text>
            </View>
          </View>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerText: {
    fontWeight: "700",
    letterSpacing: 0.8,
    fontSize: 11,
  },
  surface: {
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    alignItems: "center",
  },
  valueText: {
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: -0.5,
  },
  labelText: {
    marginTop: 2,
    fontWeight: "600",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(150,150,150,0.2)",
  },
});
