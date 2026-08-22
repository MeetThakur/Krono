import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Surface, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { PlatformSelector } from "../../src/components/contests/PlatformSelector";
import { useProfileStore } from "../../src/stores/useProfileStore";
import { useRivalsStore } from "../../src/stores/useRivalsStore";
import { useToastStore } from "../../src/stores/useToastStore";
import { PlatformId, PLATFORMS } from "../../src/types/platform";

export default function RivalsScreen() {
  const { colors, dark: isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  const [activePlatform, setActivePlatform] = useState<PlatformId | "all">("codeforces");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newRivalHandle, setNewRivalHandle] = useState("");
  const [addingPlatform, setAddingPlatform] = useState<PlatformId>("codeforces");

  const { profiles: myProfiles } = useProfileStore();
  const { rivals, loadRivals, addRival, removeRival, refreshRivals, isLoading, error } = useRivalsStore();
  const { showToast } = useToastStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshRivals();
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadRivals();
  }, []);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
    }
  }, [error]);

  const handleAddRival = async () => {
    if (!newRivalHandle.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addRival(addingPlatform, newRivalHandle.trim());
    if (!useRivalsStore.getState().error) {
      setAddModalVisible(false);
      setNewRivalHandle("");
      showToast(`Added @${newRivalHandle.trim()}`, "success");
    }
  };

  // Combine My Profile and Rivals for the selected platform
  const getLeaderboard = () => {
    if (activePlatform === "all") return [];
    
    const myProfile = myProfiles.find((p) => p.platformId === activePlatform);
    const platformRivals = rivals
      .filter((r) => r.platformId === activePlatform && r.data)
      .map((r) => ({ ...r.data!, isMe: false, rivalId: r.id }));

    const leaderboard = [...platformRivals];
    if (myProfile) {
      leaderboard.push({ ...myProfile, isMe: true, rivalId: "me" });
    }

    return leaderboard.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  };

  const leaderboard = getLeaderboard();
  const currentPlatformConfig = activePlatform !== "all" ? PLATFORMS[activePlatform] : undefined;

  const getRankBadgeColor = (index: number) => {
    if (index === 0) return "#F59E0B"; // Gold
    if (index === 1) return "#94A3B8"; // Silver
    if (index === 2) return "#B45309"; // Bronze
    return colors.onSurfaceVariant;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Expressive Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
        <View>
          <View style={[styles.rivalPill, { backgroundColor: colors.primaryContainer }]}>
            <MaterialCommunityIcons name="sword-cross" size={12} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.subtitle, { color: colors.primary }]}>
              Competitive Leaderboard
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

      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 }}>
        <PlatformSelector
          platforms={Object.values(PLATFORMS)}
          selectedPlatform={activePlatform}
          onSelectPlatform={setActivePlatform}
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
        {activePlatform === "all" ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="trophy-outline" size={64} color={colors.onSurfaceVariant} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
              Please select a specific platform to view the leaderboard.
            </Text>
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-group-outline" size={64} color={colors.onSurfaceVariant} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Text style={[styles.emptyText, { color: colors.onSurface }]}>
              No competitors yet
            </Text>
            <Text style={[styles.emptySubText, { color: colors.onSurfaceVariant }]}>
              Link your {currentPlatformConfig?.name} profile or add friends to compare ratings!
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
          <View style={styles.leaderboard}>
            {leaderboard.map((user, index) => {
              let platformColor = currentPlatformConfig?.color || colors.primary;
              if (activePlatform === "atcoder") {
                platformColor = isDarkMode ? "#FFFFFF" : "#181A20";
              }
              const isUserMe = user.isMe;
              const rankColor = getRankBadgeColor(index);

              return (
                <Surface 
                  key={user.rivalId} 
                  style={[
                    styles.leaderboardCard, 
                    { 
                      backgroundColor: isDarkMode ? colors.surfaceVariant : colors.surface,
                      borderColor: isUserMe ? colors.primary : colors.outline,
                      borderWidth: isUserMe ? 1.5 : 1,
                      shadowColor: isUserMe ? colors.primary : "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isUserMe ? (isDarkMode ? 0.25 : 0.1) : (isDarkMode ? 0.15 : 0.03),
                      shadowRadius: 12,
                      elevation: isUserMe ? 4 : 2,
                    }
                  ]}
                  elevation={0}
                >
                  {/* Rank Badge */}
                  <View style={[
                    styles.rankBadge, 
                    { 
                      backgroundColor: index < 3 ? rankColor + "18" : (isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                      borderColor: index < 3 ? rankColor + "40" : "transparent",
                      borderWidth: index < 3 ? 1 : 0,
                    }
                  ]}>
                    {index < 3 ? (
                      <MaterialCommunityIcons 
                        name={index === 0 ? "crown" : index === 1 ? "medal" : "shield-star"} 
                        size={14} 
                        color={rankColor} 
                        style={{ marginRight: 2 }}
                      />
                    ) : null}
                    <Text style={[
                      styles.rankText, 
                      { color: rankColor, fontFamily: "JetBrainsMono_700Bold" }
                    ]}>
                      #{index + 1}
                    </Text>
                  </View>
                  
                  {/* User info */}
                  <View style={styles.userInfo}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={[styles.username, { color: colors.onSurface }]} numberOfLines={1}>
                        @{user.username}
                      </Text>
                      {isUserMe && (
                        <View style={[styles.youPill, { backgroundColor: colors.primaryContainer }]}>
                          <Text style={[styles.youText, { color: colors.primary }]}>YOU</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.userRank, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                      {user.rank || "Active"} • {user.problemsSolved ?? 0} Solved
                    </Text>
                  </View>
                  
                  {/* Rating figure */}
                  <View style={styles.ratingInfo}>
                    <Text style={[styles.ratingText, { color: platformColor, fontFamily: "JetBrainsMono_700Bold" }]}>
                      {user.rating ?? "—"}
                    </Text>
                  </View>
                  
                  {/* Remove Rival */}
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
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </Pressable>
                  )}
                </Surface>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Rival Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? colors.surfaceVariant : colors.surface }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Add a Rival</Text>
            
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>SELECT PLATFORM</Text>
              <PlatformSelector
                platforms={Object.values(PLATFORMS)}
                selectedPlatform={addingPlatform}
                onSelectPlatform={(p) => p !== 'all' && setAddingPlatform(p)}
                hideAllOption={true}
              />
            </View>

            <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>HANDLE / USERNAME</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  color: colors.onSurface, 
                  backgroundColor: colors.background,
                  borderColor: colors.outline,
                }
              ]}
              placeholder="e.g. tourist, neal, ecnerwala"
              placeholderTextColor={colors.onSurfaceVariant}
              value={newRivalHandle}
              onChangeText={setNewRivalHandle}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <Pressable onPress={() => setAddModalVisible(false)} style={styles.cancelBtn}>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontWeight: "700" }}>Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={handleAddRival} 
                style={({ pressed }) => [
                  styles.confirmBtn, 
                  { 
                    backgroundColor: colors.primary,
                    transform: [{ scale: pressed ? 0.96 : 1 }]
                  }
                ]}
              >
                <Text style={{ color: isDarkMode ? "#0F172A" : "#FFFFFF", fontSize: 14, fontWeight: "800" }}>
                  {isLoading ? "Adding..." : "Add Rival"}
                </Text>
              </Pressable>
            </View>
          </View>
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
    paddingBottom: 12,
  },
  rivalPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
  },
  leaderboard: {
    gap: 12,
  },
  leaderboardCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 24, // M3 Expressive squircle
  },
  rankBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 14,
    minWidth: 44,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "800",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  youPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  userRank: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: "500",
  },
  ratingInfo: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 10,
  },
  ratingText: {
    fontSize: 22,
    letterSpacing: -0.5,
  },
  deleteBtn: {
    marginLeft: 12,
    padding: 6,
  },
  emptyContainer: {
    paddingTop: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "800",
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  addFirstBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    padding: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 32, // M3 Bottom Sheet corner radius
    borderTopRightRadius: 32,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(127,127,127,0.4)",
    alignSelf: "center",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  confirmBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
  },
});

