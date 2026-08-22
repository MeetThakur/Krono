import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Surface, useTheme } from "react-native-paper";
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
      <Text style={[styles.sectionHeading, { color: colors.onSurfaceVariant }]}>
        ACTIVITY HUB
      </Text>

      {/* Google M3 Bento Grid */}
      <View style={styles.bentoRow}>
        {/* Left Big Bento Tile - Solved */}
        <Surface
          style={[
            styles.bigTile,
            {
              backgroundColor: dark ? "#132D20" : "#E8F5E9",
              borderColor: dark ? "rgba(52, 211, 153, 0.2)" : "rgba(5, 150, 105, 0.15)",
            },
          ]}
          elevation={0}
        >
          <View style={[styles.iconCircle, { backgroundColor: dark ? "#064E3B" : "#C8E6C9" }]}>
            <MaterialCommunityIcons
              name="check-decagram"
              size={22}
              color={dark ? "#34D399" : "#059669"}
            />
          </View>
          <View style={{ marginTop: "auto" }}>
            <Text
              style={[
                styles.bigValue,
                { color: dark ? "#ECFDF5" : "#064E3B", fontFamily: "JetBrainsMono_700Bold" },
              ]}
            >
              {totalSolved.toLocaleString()}
            </Text>
            <Text
              style={[
                styles.tileLabel,
                { color: dark ? "#6EE7B7" : "#047857" },
              ]}
            >
              Problems Solved
            </Text>
          </View>
        </Surface>

        {/* Right Stacked Bento Column */}
        <View style={styles.smallTilesColumn}>
          {/* Contests Tile */}
          <Surface
            style={[
              styles.smallTile,
              {
                backgroundColor: dark ? "#2E2108" : "#FEF3C7",
                borderColor: dark ? "rgba(251, 191, 36, 0.2)" : "rgba(217, 119, 6, 0.15)",
              },
            ]}
            elevation={0}
          >
            <View style={[styles.smallIconCircle, { backgroundColor: dark ? "#451A03" : "#FDE68A" }]}>
              <MaterialCommunityIcons
                name="trophy"
                size={16}
                color={dark ? "#FBBF24" : "#D97706"}
              />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={[
                  styles.smallValue,
                  { color: dark ? "#FFFBEB" : "#78350F", fontFamily: "JetBrainsMono_700Bold" },
                ]}
              >
                {totalContests.toLocaleString()}
              </Text>
              <Text
                style={[
                  styles.smallTileLabel,
                  { color: dark ? "#FCD34D" : "#B45309" },
                ]}
              >
                Contests
              </Text>
            </View>
          </Surface>

          {/* Submissions Tile */}
          <Surface
            style={[
              styles.smallTile,
              {
                backgroundColor: dark ? "#112240" : "#DBEAFE",
                borderColor: dark ? "rgba(96, 165, 250, 0.2)" : "rgba(37, 99, 235, 0.15)",
              },
            ]}
            elevation={0}
          >
            <View style={[styles.smallIconCircle, { backgroundColor: dark ? "#1E3A8A" : "#BFDBFE" }]}>
              <MaterialCommunityIcons
                name="code-tags"
                size={16}
                color={dark ? "#60A5FA" : "#2563EB"}
              />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={[
                  styles.smallValue,
                  { color: dark ? "#EFF6FF" : "#1E3A8A", fontFamily: "JetBrainsMono_700Bold" },
                ]}
              >
                {totalSubmissions.toLocaleString()}
              </Text>
              <Text
                style={[
                  styles.smallTileLabel,
                  { color: dark ? "#93C5FD" : "#1D4ED8" },
                ]}
              >
                Submissions
              </Text>
            </View>
          </Surface>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 26,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  bentoRow: {
    flexDirection: "row",
    gap: 12,
    height: 155,
  },
  bigTile: {
    flex: 1.1,
    borderRadius: 28, // Google M3 Bento Squircle
    padding: 16,
    borderWidth: 1,
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  bigValue: {
    fontSize: 32,
    lineHeight: 38,
    includeFontPadding: false,
    letterSpacing: -1,
  },
  tileLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  smallTilesColumn: {
    flex: 1,
    gap: 10,
    justifyContent: "space-between",
  },
  smallTile: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  smallIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  smallValue: {
    fontSize: 18,
    lineHeight: 22,
    includeFontPadding: false,
  },
  smallTileLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 1,
  },
});
