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
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlatformSelector } from "../../src/components/contests/PlatformSelector";
import { useProfileStore } from "../../src/stores/useProfileStore";
import { useRivalsStore } from "../../src/stores/useRivalsStore";
import { PlatformId, PLATFORMS } from "../../src/types/platform";

export default function RivalsScreen() {
  const { colors, dark: isDarkMode } = useTheme() as any;
  const insets = useSafeAreaInsets();

  const [activePlatform, setActivePlatform] = useState<PlatformId | "all">("codeforces");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newRivalHandle, setNewRivalHandle] = useState("");
  const [addingPlatform, setAddingPlatform] = useState<PlatformId>("codeforces");

  const { profiles: myProfiles } = useProfileStore();
  const { rivals, addRival, removeRival, refreshRivals, isLoading, error } = useRivalsStore();

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
      <View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Rivals</Text>
        <TouchableOpacity 
          onPress={() => setAddModalVisible(true)}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={24} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: colors.surface }}>
        <PlatformSelector
          platforms={Object.values(PLATFORMS)}
          selectedPlatform={activePlatform}
          onSelectPlatform={setActivePlatform}
          hideAllOption={true}
          hideAllOption={true}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshRivals} tintColor={colors.primary} />
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
              const platformColor = currentPlatformConfig?.color || colors.primary;
              return (
                <View 
                  key={user.rivalId} 
                  style={[
                    styles.leaderboardCard, 
                    { 
                      backgroundColor: user.isMe ? platformColor + '15' : colors.surfaceVariant,
                      borderColor: user.isMe ? platformColor + '50' : 'transparent',
                      borderWidth: 1
                    }
                  ]}
                >
                  <View style={styles.rankBadge}>
                    <Text style={[styles.rankText, { color: user.isMe ? platformColor : colors.onSurfaceVariant }]}>
                      #{index + 1}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.username, { color: colors.onSurface }]}>
                      {user.username} {user.isMe && " (You)"}
                    </Text>
                    <Text style={[styles.userRank, { color: colors.onSurfaceVariant }]}>
                      {user.rank || "Unrated"} • {user.problemsSolved} Solved
                    </Text>
                  </View>
                  <View style={styles.ratingInfo}>
                    <Text style={[styles.ratingText, { color: platformColor }]}>
                      {user.rating || "—"}
                    </Text>
                  </View>
                  {!user.isMe && (
                    <TouchableOpacity 
                      onPress={() => {
                        Alert.alert("Remove Rival", "Are you sure?", [
                          { text: "Cancel", style: "cancel" },
                          { text: "Remove", style: "destructive", onPress: () => removeRival(user.rivalId) }
                        ]);
                      }}
                      style={{ marginLeft: 12 }}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
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
            
            <View style={{ marginBottom: 16 }}>
               <PlatformSelector
                platforms={Object.values(PLATFORMS)}
                selectedPlatform={addingPlatform}
                onSelectPlatform={(p) => p !== 'all' && setAddingPlatform(p)}
                hideAllOption={true}
              />
            </View>

            <TextInput
              style={[styles.input, { color: colors.onSurface, borderColor: colors.outline }]}
              placeholder="Enter handle..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={newRivalHandle}
              onChangeText={setNewRivalHandle}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.modalBtn}>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 16, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleAddRival} 
                style={[styles.modalBtn, { backgroundColor: colors.primary, borderRadius: 8 }]}
              >
                <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: "600" }}>
                  {isLoading ? "Adding..." : "Add"}
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
  },
  leaderboard: {
    gap: 12,
  },
  leaderboardCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  rankBadge: {
    width: 32,
    alignItems: "flex-start",
  },
  rankText: {
    fontSize: 18,
    fontWeight: "800",
  },
  userInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  userRank: {
    fontSize: 12,
    fontWeight: "500",
  },
  ratingInfo: {
    alignItems: "flex-end",
  },
  ratingText: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginBottom: 24,
  },
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
