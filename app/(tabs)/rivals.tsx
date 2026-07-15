import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
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
import { PlatformSelector } from "../../src/components/contests/PlatformSelector";
import { useProfileStore } from "../../src/stores/useProfileStore";
import { useRivalsStore } from "../../src/stores/useRivalsStore";
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
      Alert.alert("Error", error);
    }
  }, [error]);

  const handleAddRival = async () => {
    if (!newRivalHandle.trim()) return;
    await addRival(addingPlatform, newRivalHandle.trim());
    if (!useRivalsStore.getState().error) {
      setAddModalVisible(false);
      setNewRivalHandle("");
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Rivals</Text>
        <TouchableOpacity 
          onPress={() => setAddModalVisible(true)}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={24} color={isDarkMode ? "#111111" : "#FFFFFF"} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <PlatformSelector
          platforms={Object.values(PLATFORMS)}
          selectedPlatform={activePlatform}
          onSelectPlatform={setActivePlatform}
          hideAllOption={true}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {activePlatform === "all" ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
              Please select a specific platform to view the leaderboard.
            </Text>
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
              No profiles found for {currentPlatformConfig?.name}. Add yourself or a rival!
            </Text>
          </View>
        ) : (
          <View style={styles.leaderboard}>
            {leaderboard.map((user, index) => {
              let platformColor = currentPlatformConfig?.color || colors.primary;
              if (activePlatform === "atcoder" && !isDarkMode) {
                platformColor = "#111111";
              }
              const isUserMe = user.isMe;
              const isFirst = index === 0;

              return (
                <Surface 
                  key={user.rivalId} 
                  style={[
                    styles.leaderboardCard, 
                    { 
                      backgroundColor: colors.surface,
                      borderWidth: isUserMe ? 2 : 0,
                      borderColor: isUserMe ? platformColor : "transparent"
                    }
                  ]}
                  elevation={0}
                >
                  <View style={[
                    styles.rankBadge, 
                    { backgroundColor: isFirst ? platformColor + "20" : colors.background }
                  ]}>
                    <Text style={[
                      styles.rankText, 
                      { color: isFirst ? platformColor : colors.onSurfaceVariant, fontSize: isFirst ? 14 : 13 }
                    ]}>
                      #{index + 1}
                    </Text>
                  </View>
                  
                  <View style={styles.userInfo}>
                    <Text style={[styles.username, { color: colors.onSurface }]} numberOfLines={1}>
                      {user.username} {isUserMe && " (You)"}
                    </Text>
                    <Text style={[styles.userRank, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                      {user.rank || "Unrated"} • {user.problemsSolved} Solved
                    </Text>
                  </View>
                  
                  <View style={styles.ratingInfo}>
                    <Text style={[styles.ratingText, { color: platformColor }]}>
                      {user.rating || "—"}
                    </Text>
                  </View>
                  
                  {!isUserMe && (
                    <TouchableOpacity 
                      onPress={() => {
                        Alert.alert("Remove Rival", "Are you sure?", [
                          { text: "Cancel", style: "cancel" },
                          { text: "Remove", style: "destructive", onPress: () => removeRival(user.rivalId) }
                        ]);
                      }}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </Surface>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Rival Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Add Rival</Text>
            
            <View style={{ marginBottom: 24 }}>
               <PlatformSelector
                platforms={Object.values(PLATFORMS)}
                selectedPlatform={addingPlatform}
                onSelectPlatform={(p) => p !== 'all' && setAddingPlatform(p)}
                hideAllOption={true}
              />
            </View>

            <TextInput
              style={[
                styles.input, 
                { 
                  color: colors.onSurface, 
                  backgroundColor: colors.background,
                }
              ]}
              placeholder="Enter handle..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={newRivalHandle}
              onChangeText={setNewRivalHandle}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.modalBtn}>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 16, fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleAddRival} 
                style={[styles.modalBtn, { backgroundColor: colors.primary, borderRadius: 100 }]}
              >
                <Text style={{ color: isDarkMode ? "#111111" : "#FFFFFF", fontSize: 16, fontWeight: "800" }}>
                  {isLoading ? "Adding..." : "Add Rival"}
                </Text>
              </TouchableOpacity>
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
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
    gap: 16,
  },
  leaderboardCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 24,
  },
  rankBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
  },
  rankText: {
    fontWeight: "800",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  userRank: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  ratingInfo: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 12,
  },
  ratingText: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -1,
  },
  deleteBtn: {
    marginLeft: 16,
    padding: 8,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    fontWeight: "600",
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    padding: 24,
    paddingBottom: 48,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  input: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 32,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  modalBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
