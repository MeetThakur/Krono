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
  const topThree = leaderboard.slice(0, 3);
  const remainingRivals = leaderboard.slice(3);

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
            <MaterialCommunityIcons name="trophy-award" size={11} color={colors.onSurfaceVariant} style={{ marginRight: 4 }} />
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              Google Play Style Leaderboard
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

      {/* Platform Selector */}
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
              Add friends or link your {currentPlatformConfig?.name} handle to climb the leaderboard!
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
            {/* Google Play Games 3D-Style Podium */}
            {topThree.length > 0 && (
              <View style={styles.podiumContainer}>
                {/* 2nd Place (Silver - Left) */}
                {topThree.length >= 2 ? (
                  <Surface style={[styles.podiumCard, styles.podiumCard2, { backgroundColor: isDarkMode ? colors.surfaceVariant : colors.surface, borderColor: "#94A3B8" + "40" }]}>
                    <View style={[styles.rankCircle, { backgroundColor: "#94A3B8" + "25" }]}>
                      <MaterialCommunityIcons name="medal" size={18} color="#94A3B8" />
                    </View>
                    <Text numberOfLines={1} style={[styles.podiumUsername, { color: colors.onSurface }]}>
                      @{topThree[1].username}
                    </Text>
                    {topThree[1].isMe && (
                      <View style={[styles.youPill, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)" }]}>
                        <Text style={[styles.youText, { color: colors.onSurface }]}>YOU</Text>
                      </View>
                    )}
                    <Text style={[styles.podiumRating, { color: colors.onSurface, fontFamily: "JetBrainsMono_700Bold" }]}>
                      {topThree[1].rating ?? "—"}
                    </Text>
                    <Text style={styles.placeLabel}>2ND</Text>
                  </Surface>
                ) : <View style={{ flex: 1 }} />}

                {/* 1st Place (Gold - Center Raised) */}
                <Surface style={[styles.podiumCard, styles.podiumCard1, { backgroundColor: isDarkMode ? colors.surfaceVariant : colors.surface, borderColor: "#F59E0B", borderWidth: 2 }]}>
                  <View style={[styles.rankCircle, { backgroundColor: "#F59E0B" + "30" }]}>
                    <MaterialCommunityIcons name="crown" size={22} color="#F59E0B" />
                  </View>
                  <Text numberOfLines={1} style={[styles.podiumUsername, { color: colors.onSurface, fontWeight: "900", fontSize: 13 }]}>
                    @{topThree[0].username}
                  </Text>
                  {topThree[0].isMe && (
                    <View style={[styles.youPill, { backgroundColor: "#F59E0B" + "25" }]}>
                      <Text style={[styles.youText, { color: "#F59E0B" }]}>YOU</Text>
                    </View>
                  )}
                  <Text style={[styles.podiumRating, { color: "#F59E0B", fontFamily: "JetBrainsMono_700Bold", fontSize: 22 }]}>
                    {topThree[0].rating ?? "—"}
                  </Text>
                  <Text style={[styles.placeLabel, { color: "#F59E0B" }]}>1ST CHAMPION</Text>
                </Surface>

                {/* 3rd Place (Bronze - Right) */}
                {topThree.length >= 3 ? (
                  <Surface style={[styles.podiumCard, styles.podiumCard3, { backgroundColor: isDarkMode ? colors.surfaceVariant : colors.surface, borderColor: "#B45309" + "40" }]}>
                    <View style={[styles.rankCircle, { backgroundColor: "#B45309" + "25" }]}>
                      <MaterialCommunityIcons name="shield-star" size={18} color="#B45309" />
                    </View>
                    <Text numberOfLines={1} style={[styles.podiumUsername, { color: colors.onSurface }]}>
                      @{topThree[2].username}
                    </Text>
                    {topThree[2].isMe && (
                      <View style={[styles.youPill, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)" }]}>
                        <Text style={[styles.youText, { color: colors.onSurface }]}>YOU</Text>
                      </View>
                    )}
                    <Text style={[styles.podiumRating, { color: colors.onSurface, fontFamily: "JetBrainsMono_700Bold" }]}>
                      {topThree[2].rating ?? "—"}
                    </Text>
                    <Text style={styles.placeLabel}>3RD</Text>
                  </Surface>
                ) : <View style={{ flex: 1 }} />}
              </View>
            )}

            {/* Runners Up List */}
            {remainingRivals.length > 0 && (
              <View style={styles.leaderboard}>
                <Text style={[styles.sectionHeading, { color: colors.onSurfaceVariant }]}>
                  RUNNERS UP
                </Text>
                {remainingRivals.map((user, index) => {
                  const actualRank = index + 4;
                  const isUserMe = user.isMe;

                  return (
                    <Surface 
                      key={user.rivalId} 
                      style={[
                        styles.leaderboardCard, 
                        { 
                          backgroundColor: isDarkMode ? colors.surfaceVariant : colors.surface,
                          borderColor: isUserMe ? colors.primary : colors.outline,
                          borderWidth: 1,
                        }
                      ]}
                      elevation={0}
                    >
                      <View style={[styles.rankBadgeCircle, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                        <Text style={[styles.rankNumber, { color: colors.onSurfaceVariant, fontFamily: "JetBrainsMono_700Bold" }]}>
                          #{actualRank}
                        </Text>
                      </View>
                      
                      <View style={styles.userInfo}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={[styles.username, { color: colors.onSurface }]} numberOfLines={1}>
                            @{user.username}
                          </Text>
                          {isUserMe && (
                            <View style={[styles.youPill, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)" }]}>
                              <Text style={[styles.youText, { color: colors.onSurface }]}>YOU</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.userRank, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                          {user.rank || "Active"} • {user.problemsSolved ?? 0} Solved
                        </Text>
                      </View>
                      
                      <Text style={[styles.ratingText, { color: colors.onSurface, fontFamily: "JetBrainsMono_700Bold" }]}>
                        {user.rating ?? "—"}
                      </Text>
                      
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
                    </Surface>
                  );
                })}
              </View>
            )}
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
              Add a Rival
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
  podiumContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 26,
    paddingTop: 14,
  },
  podiumCard: {
    flex: 1,
    borderRadius: 24, // Google M3 Podium squircle
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  podiumCard1: {
    minHeight: 155,
    justifyContent: "center",
  },
  podiumCard2: {
    minHeight: 130,
    justifyContent: "center",
  },
  podiumCard3: {
    minHeight: 118,
    justifyContent: "center",
  },
  rankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  podiumUsername: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  podiumRating: {
    fontSize: 17,
    fontWeight: "900",
  },
  placeLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginTop: 4,
    opacity: 0.7,
  },
  leaderboard: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  leaderboardCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 12,
  },
  rankBadgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: "800",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: "800",
  },
  userRank: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: "800",
  },
  youPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youText: {
    fontSize: 9,
    fontWeight: "900",
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 4,
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
