import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { getTodayKey, useStreakStore } from "../../stores/useStreakStore";

interface DailyGoalCardProps {
  onTapPotd?: () => void;
}

const GOAL_OPTIONS = [1, 2, 3, 5];

export function DailyGoalCard({ onTapPotd }: DailyGoalCardProps) {
  const { colors, dark } = useTheme();
  const {
    currentStreak,
    bestStreak,
    dailyGoal,
    dailyHistory,
    setDailyGoal,
    recordManualSolve,
  } = useStreakStore();

  const [isGoalModalVisible, setGoalModalVisible] = useState(false);

  const todayKey = getTodayKey();
  const todaySolved = dailyHistory[todayKey] || 0;
  const progressRatio = Math.min(1, todaySolved / Math.max(1, dailyGoal));
  const progressPercent = Math.round(progressRatio * 100);
  const isGoalCompleted = todaySolved >= dailyGoal;

  return (
    <View style={styles.wrapper}>
      <Surface
        style={[
          styles.container,
          {
            backgroundColor: dark ? colors.surfaceVariant : colors.surface,
            borderColor: isGoalCompleted
              ? "rgba(245, 158, 11, 0.4)"
              : colors.outline,
          },
        ]}
        elevation={0}
      >
        {/* Top Header: Streak Count & Flame Badge */}
        <View style={styles.topRow}>
          <View style={styles.streakInfo}>
            <View
              style={[
                styles.flameIconContainer,
                {
                  backgroundColor: currentStreak > 0
                    ? (dark ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7")
                    : (dark ? "rgba(255, 255, 255, 0.06)" : "#F1F5F9"),
                },
              ]}
            >
              <MaterialCommunityIcons
                name="fire"
                size={22}
                color={currentStreak > 0 ? "#F59E0B" : colors.onSurfaceVariant}
              />
            </View>

            <View style={{ marginLeft: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text
                  style={[
                    styles.streakNumber,
                    {
                      color: currentStreak > 0 ? (dark ? "#FBBF24" : "#D97706") : colors.onSurface,
                      fontFamily: "JetBrainsMono_700Bold",
                    },
                  ]}
                >
                  {currentStreak}
                </Text>
                <Text
                  style={[
                    styles.streakUnit,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {currentStreak === 1 ? "day streak" : "days streak"}
                </Text>
              </View>

              <Text style={[styles.bestStreakText, { color: colors.onSurfaceVariant }]}>
                Best: {bestStreak} {bestStreak === 1 ? "day" : "days"}
              </Text>
            </View>
          </View>

          {/* Target Button */}
          <Pressable
            style={({ pressed }) => [
              styles.goalPill,
              {
                backgroundColor: dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
                borderColor: colors.outline,
                transform: [{ scale: pressed ? 0.94 : 1 }],
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setGoalModalVisible(true);
            }}
          >
            <MaterialCommunityIcons
              name="target"
              size={14}
              color={colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.goalPillText,
                { color: colors.onSurface },
              ]}
            >
              Goal: {dailyGoal}/day
            </Text>
          </Pressable>
        </View>

        {/* Progress Bar & Solves Counter */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={[styles.todayText, { color: colors.onSurface }]}>
              Today:{" "}
              <Text
                style={{
                  fontWeight: "800",
                  fontFamily: "JetBrainsMono_700Bold",
                  color: isGoalCompleted ? "#10B981" : colors.primary,
                }}
              >
                {todaySolved}
              </Text>{" "}
              / {dailyGoal} solved
            </Text>

            {isGoalCompleted ? (
              <View style={styles.completedBadge}>
                <MaterialCommunityIcons name="check-circle" size={14} color="#10B981" />
                <Text style={styles.completedText}>Goal Met!</Text>
              </View>
            ) : (
              <Text style={[styles.remainingText, { color: colors.onSurfaceVariant }]}>
                {dailyGoal - todaySolved} left
              </Text>
            )}
          </View>

          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)" },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: isGoalCompleted ? "#10B981" : (currentStreak > 0 ? "#F59E0B" : colors.primary),
                },
              ]}
            />
          </View>
        </View>

        {/* Bottom Quick Action: 1-Tap Log Solve */}
        <View style={[styles.footerRow, { borderTopColor: dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)" }]}>
          <Pressable
            style={({ pressed }) => [
              styles.quickLogBtn,
              {
                backgroundColor: dark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              recordManualSolve();
            }}
          >
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={15}
              color={colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.quickLogText, { color: colors.primary }]}>
              +1 Log Practice Solve
            </Text>
          </Pressable>
        </View>
      </Surface>

      {/* Daily Goal Settings Modal */}
      <Modal
        visible={isGoalModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface
            style={[
              styles.modalCard,
              {
                backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                borderColor: colors.outline,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
              Set Daily Practice Target
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.onSurfaceVariant }]}>
              Choose how many problems you aim to solve each day across all platforms.
            </Text>

            <View style={styles.optionsRow}>
              {GOAL_OPTIONS.map((num) => {
                const isSelected = dailyGoal === num;
                return (
                  <Pressable
                    key={num}
                    style={({ pressed }) => [
                      styles.goalOptionBtn,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : dark
                          ? "rgba(255, 255, 255, 0.06)"
                          : "rgba(0, 0, 0, 0.04)",
                        borderColor: isSelected ? colors.primary : colors.outline,
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setDailyGoal(num);
                      setGoalModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.goalOptionNumber,
                        {
                          color: isSelected
                            ? (dark ? "#0F172A" : "#FFFFFF")
                            : colors.onSurface,
                          fontFamily: "JetBrainsMono_700Bold",
                        },
                      ]}
                    >
                      {num}
                    </Text>
                    <Text
                      style={[
                        styles.goalOptionLabel,
                        {
                          color: isSelected
                            ? (dark ? "#0F172A" : "#FFFFFF")
                            : colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {num === 1 ? "problem" : "problems"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.closeModalBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => setGoalModalVisible(false)}
            >
              <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 14 }}>
                Done
              </Text>
            </Pressable>
          </Surface>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  streakInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  flameIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: "900",
  },
  streakUnit: {
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 5,
  },
  bestStreakText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 1,
  },
  goalPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  goalPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  progressSection: {
    marginTop: 12,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  todayText: {
    fontSize: 12,
    fontWeight: "600",
  },
  remainingText: {
    fontSize: 11,
    fontWeight: "600",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  completedText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 3,
  },
  progressBarTrack: {
    height: 7,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  footerRow: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  quickLogBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quickLogText: {
    fontSize: 11,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 18,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  goalOptionBtn: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  goalOptionNumber: {
    fontSize: 18,
    fontWeight: "900",
  },
  goalOptionLabel: {
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
    textTransform: "uppercase",
  },
  closeModalBtn: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
});
