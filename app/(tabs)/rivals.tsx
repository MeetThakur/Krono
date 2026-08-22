import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlatformSelector } from "../../src/components/contests/PlatformSelector";
import { useProfileStore } from "../../src/stores/useProfileStore";
import { useRivalsStore } from "../../src/stores/useRivalsStore";
import { Platform, PlatformId, PLATFORMS } from "../../src/types/platform";

export default function RivalsScreen() {
  const { colors, dark: isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { profiles } = useProfileStore();
  const { 
    rivals, 
    addRival, 
    removeRival, 
    refreshRivals, 
    loadRivals, 
    isLoading 
  } = useRivalsStore();

  const [activePlatform, setActivePlatform] = useState<PlatformId | "all">("codeforces");
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [selectedPlatformForAdd, setSelectedPlatformForAdd] = useState<PlatformId>("codeforces");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadRivals();
    refreshRivals();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshRivals();
    setIsRefreshing(false);
  };

  const handleAddRival = async () => {
    if (!newUsername.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    try {
      await addRival(selectedPlatformForAdd, newUsername.trim());
      setNewUsername("");
      setAddModalVisible(false);
    } catch (e: any) {
      Alert.alert("Failed", e.message || "Could not fetch user stats");
    }
  };

  const leaderboard = useMemo(() => {
    const list: Array<{
      rivalId: string;
      username: string;
      rating?: number;
      rank?: string;
      problemsSolved?: number;
      isMe: boolean;
    }> = [];

    const myProfile = profiles.find((p) => p.platformId === activePlatform);
    if (myProfile) {
      list.push({
        rivalId: myProfile.id,
        username: myProfile.username,
        rating: myProfile.rating,
        rank: myProfile.rank,
        problemsSolved: myProfile.problemsSolved,
        isMe: true,
      });
    }

    rivals
      .filter((r) => r.platformId === activePlatform && r.data)
      .forEach((r) => {
        if (r.data) {
          list.push({
            rivalId: r.id,
            username: r.username,
            rating: r.data.rating,
            rank: r.data.rank,
            problemsSolved: r.data.problemsSolved,
            isMe: false,
          });
        }
      });

    return list.sort((a, b) => (b.rating || b.problemsSolved || 0) - (a.rating || a.problemsSolved || 0));
  }, [profiles, rivals, activePlatform]);

  const currentPlatformConfig = PLATFORMS[activePlatform as PlatformId];
  const maxRating = leaderboard.length > 0 ? (leaderboard[0].rating || leaderboard[0].problemsSolved || 1) : 1;

  // Head to Head Matchup: You vs Top Rival (or Rival #1 vs Rival #2)
  const myUser = leaderboard.find((u) => u.isMe);
  const topOpponent = leaderboard.find((u) => !u.isMe);

  const availablePlatforms = useMemo(() => {
    return (Object.values(PLATFORMS) as Platform[]).filter(
      (p: Platform) => !["geeksforgeeks", "hackerrank"].includes(p.id)
    );
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 12 }]}>
        <View>
          <View style={[styles.rivalPill, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
            <MaterialCommunityIcons name="sword-cross" size={11} color={colors.onSurfaceVariant} style={{ marginRight: 4 }} />
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              STANDINGS & HEAD-TO-HEAD
            </Text>
          </View>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Rivals</Text>
        </View>

        <Pressable 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setAddModalVisible(true);
          }}
          style={({ pressed }) => [
            styles.addButton, 
            { 
              backgroundColor: colors.primary,
              transform: [{ scale: pressed ? 0.94 : 1 }]
            }
          ]}
        >
          <Ionicons name="add" size={24} color={isDarkMode ? "#0F172A" : "#FFFFFF"} />
        </Pressable>
      </View>

      {/* Platform Selector Chips */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 6 }}>
        <PlatformSelector
          platforms={availablePlatforms}
          selectedPlatform={activePlatform}
          onSelectPlatform={(p) => setActivePlatform(p)}
          hideAllOption={true}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-group-outline" size={54} color={colors.onSurfaceVariant} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Text style={[styles.emptyText, { color: colors.onSurface }]}>
              No competitors yet
            </Text>
            <Text style={[styles.emptySubText, { color: colors.onSurfaceVariant }]}>
              Add friends or link your {currentPlatformConfig?.name} handle to compare standings!
            </Text>
            <Pressable
              onPress={() => setAddModalVisible(true)}
              style={({ pressed }) => [
                styles.addFirstBtn,
                { 
                  backgroundColor: colors.primary,
                  transform: [{ scale: pressed ? 0.96 : 1 }]
                }
              ]}
            >
              <Ionicons name="add" size={18} color={isDarkMode ? "#0F172A" : "#FFFFFF"} style={{ marginRight: 6 }} />
              <Text style={{ color: isDarkMode ? "#0F172A" : "#FFFFFF", fontWeight: "800", fontSize: 13 }}>
                Add a Rival
              </Text>
            </Pressable>
          </View>
        ) : (
          <View>
            {/* Head to Head Matchup Arena Card */}
            {myUser && topOpponent && (
              <Surface
                style={[
                  styles.matchupCard,
                  {
                    backgroundColor: isDarkMode ? colors.surfaceVariant : colors.surface,
                    borderColor: colors.outline,
                  },
                ]}
                elevation={0}
              >
                <View style={styles.matchupHeader}>
                  <Text style={[styles.matchupTag, { color: colors.onSurfaceVariant }]}>
                    HEAD-TO-HEAD MATCHUP
                  </Text>
                  <View style={[styles.platformPill, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                    <View style={[styles.dot, { backgroundColor: currentPlatformConfig?.color || colors.primary }]} />
                    <Text style={[styles.platformText, { color: colors.onSurfaceVariant }]}>
                      {currentPlatformConfig?.name}
                    </Text>
                  </View>
                </View>

                <View style={styles.matchupRow}>
                  {/* Left: You */}
                  <View style={styles.matchupSide}>
                    <View style={[styles.matchupAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={{ color: isDarkMode ? "#0F172A" : "#FFFFFF", fontWeight: "900", fontSize: 16 }}>
                        {myUser.username.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <Text numberOfLines={1} style={[styles.matchupHandle, { color: colors.onSurface }]}>
                      @{myUser.username}
                    </Text>
                    <Text style={[styles.matchupRating, { color: colors.onSurface, fontFamily: "JetBrainsMono_700Bold" }]}>
                      {myUser.rating ?? myUser.problemsSolved ?? "—"}
                    </Text>
                    <Text style={[styles.matchupRole, { color: colors.primary }]}>YOU</Text>
                  </View>

                  {/* Center: VS Badge */}
                  <View style={styles.vsContainer}>
                    <View style={[styles.vsBadge, { backgroundColor: isDarkMode ? "#282A36" : "#E2E8F0" }]}>
                      <Text style={[styles.vsText, { color: colors.onSurface }]}>VS</Text>
                    </View>
                    {myUser.rating && topOpponent.rating && (
                      <Text
                        style={[
                          styles.deltaText,
                          {
                            color: myUser.rating >= topOpponent.rating ? "#10B981" : "#EF4444",
                            fontFamily: "JetBrainsMono_700Bold",
                          },
                        ]}
                      >
                        {myUser.rating >= topOpponent.rating
                          ? `+${myUser.rating - topOpponent.rating}`
                          : `-${topOpponent.rating - myUser.rating}`}
                      </Text>
                    )}
                  </View>

                  {/* Right: Top Opponent */}
                  <View style={styles.matchupSide}>
                    <View style={[styles.matchupAvatar, { backgroundColor: isDarkMode ? "#333544" : "#CBD5E1" }]}>
                      <Text style={{ color: colors.onSurface, fontWeight: "900", fontSize: 16 }}>
                        {topOpponent.username.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <Text numberOfLines={1} style={[styles.matchupHandle, { color: colors.onSurface }]}>
                      @{topOpponent.username}
                    </Text>
                    <Text style={[styles.matchupRating, { color: colors.onSurface, fontFamily: "JetBrainsMono_700Bold" }]}>
                      {topOpponent.rating ?? topOpponent.problemsSolved ?? "—"}
                    </Text>
                    <Text style={[styles.matchupRole, { color: colors.onSurfaceVariant }]}>RIVAL #1</Text>
                  </View>
                </View>
              </Surface>
            )}

            {/* Standings List */}
            <View style={styles.leaderboardSection}>
              <Text style={[styles.sectionHeading, { color: colors.onSurfaceVariant }]}>
                ALL STANDINGS
              </Text>

              {leaderboard.map((user, index) => {
                const rankNum = index + 1;
                const isUserMe = user.isMe;
                const userRating = user.rating ?? user.problemsSolved ?? 0;
                const progressPercent = Math.min(100, Math.max(15, (userRating / maxRating) * 100));

                let rankBadgeColor = colors.onSurfaceVariant;
                if (rankNum === 1) rankBadgeColor = "#F59E0B";
                else if (rankNum === 2) rankBadgeColor = "#94A3B8";
                else if (rankNum === 3) rankBadgeColor = "#B45309";

                return (
                  <Surface 
                    key={user.rivalId} 
                    style={[
                      styles.standingCard, 
                      { 
                        backgroundColor: isDarkMode ? colors.surfaceVariant : colors.surface,
                        borderColor: isUserMe ? colors.primary : colors.outline,
                        borderWidth: isUserMe ? 1.5 : 1,
                      }
                    ]}
                    elevation={0}
                  >
                    {/* Top Row: Rank Number + Avatar + Handle + Score */}
                    <View style={styles.standingTopRow}>
                      <View style={[styles.rankBox, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                        <Text style={[styles.rankNumberText, { color: rankBadgeColor, fontFamily: "JetBrainsMono_700Bold" }]}>
                          {rankNum < 10 ? `0${rankNum}` : rankNum}
                        </Text>
                      </View>

                      <View style={styles.userInfoCol}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={[styles.usernameText, { color: colors.onSurface }]} numberOfLines={1}>
                            @{user.username}
                          </Text>
                          {isUserMe && (
                            <View style={[styles.youTag, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)" }]}>
                              <Text style={[styles.youTagText, { color: colors.onSurface }]}>YOU</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.rankSubtitle, { color: colors.onSurfaceVariant }]}>
                          {user.rank || "Active"} • {user.problemsSolved ?? 0} Solved
                        </Text>
                      </View>

                      <View style={styles.scoreCol}>
                        <Text style={[styles.ratingBig, { color: colors.onSurface, fontFamily: "JetBrainsMono_700Bold" }]}>
                          {user.rating ?? user.problemsSolved ?? "—"}
                        </Text>
                      </View>

                      {!isUserMe && (
                        <Pressable 
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            Alert.alert("Remove Rival", `Remove @${user.username} from rivals?`, [
                              { text: "Cancel", style: "cancel" },
                              { text: "Remove", style: "destructive", onPress: () => removeRival(user.rivalId) }
                            ]);
                          }}
                          style={({ pressed }) => [
                            styles.deleteBtn,
                            { opacity: pressed ? 0.6 : 1 }
                          ]}
                        >
                          <Ionicons name="trash-outline" size={16} color={colors.error} />
                        </Pressable>
                      )}
                    </View>

                    {/* Progress Bar relative to Top Leader */}
                    <View style={[styles.progressBarBg, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { 
                            width: `${progressPercent}%`,
                            backgroundColor: isUserMe ? colors.primary : (rankNum === 1 ? "#F59E0B" : colors.onSurfaceVariant),
                          }
                        ]} 
                      />
                    </View>
                  </Surface>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Rival Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface 
            style={[
              styles.modalCard, 
              { 
                backgroundColor: isDarkMode ? colors.surfaceVariant : colors.surface,
                borderColor: colors.outline,
              }
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
              Add a Competitor
            </Text>
            
            <View style={{ marginBottom: 14 }}>
              <PlatformSelector 
                platforms={availablePlatforms}
                selectedPlatform={selectedPlatformForAdd}
                onSelectPlatform={(p) => setSelectedPlatformForAdd(p as PlatformId)}
                hideAllOption={true}
              />
            </View>

            <TextInput
              style={[
                styles.modalInput, 
                { 
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  borderColor: colors.outline,
                  color: colors.onSurface 
                }
              ]}
              placeholder={`Enter ${PLATFORMS[selectedPlatformForAdd]?.name} handle...`}
              placeholderTextColor={colors.onSurfaceVariant}
              value={newUsername}
              onChangeText={setNewUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setAddModalVisible(false)}
                style={({ pressed }) => [
                  styles.cancelBtn,
                  { 
                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    opacity: pressed ? 0.8 : 1 
                  }
                ]}
              >
                <Text style={{ color: colors.onSurface, fontWeight: "700" }}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleAddRival}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.submitBtn,
                  { 
                    backgroundColor: colors.primary,
                    opacity: pressed || isLoading ? 0.8 : 1 
                  }
                ]}
              >
                <Text style={{ color: isDarkMode ? "#0F172A" : "#FFFFFF", fontWeight: "800" }}>
                  {isLoading ? "Adding..." : "Add Rival"}
                </Text>
              </Pressable>
            </View>
          </Surface>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  rivalPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 13,
    textAlign: "center",
    maxWidth: 240,
    marginBottom: 20,
  },
  addFirstBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  matchupCard: {
    borderRadius: 28, // Head to Head M3 Squircle
    padding: 18,
    borderWidth: 1,
    marginBottom: 24,
  },
  matchupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  matchupTag: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  platformPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  platformText: {
    fontSize: 10,
    fontWeight: "800",
  },
  matchupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  matchupSide: {
    alignItems: "center",
    flex: 1,
  },
  matchupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  matchupHandle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 2,
    maxWidth: 90,
  },
  matchupRating: {
    fontSize: 18,
    fontWeight: "900",
  },
  matchupRole: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  vsContainer: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  vsBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  vsText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  deltaText: {
    fontSize: 11,
    fontWeight: "900",
  },
  leaderboardSection: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  standingCard: {
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
  },
  standingTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  rankBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumberText: {
    fontSize: 13,
    fontWeight: "900",
  },
  userInfoCol: {
    flex: 1,
  },
  usernameText: {
    fontSize: 14,
    fontWeight: "800",
  },
  youTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youTagText: {
    fontSize: 9,
    fontWeight: "900",
  },
  rankSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 1,
  },
  scoreCol: {
    alignItems: "flex-end",
  },
  ratingBig: {
    fontSize: 16,
    fontWeight: "900",
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 2,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  submitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
});
