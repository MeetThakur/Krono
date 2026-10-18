import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Surface, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfileStore } from "../../stores/useProfileStore";
import { PLATFORMS } from "../../types/platform";
import { UnifiedProfile } from "../../types/user";

interface ReorderProfilesModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export const ReorderProfilesModal: React.FC<ReorderProfilesModalProps> = ({
  visible,
  onDismiss,
}) => {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const { profiles, reorderProfiles } = useProfileStore();
  const [localProfiles, setLocalProfiles] = useState<UnifiedProfile[]>([]);

  useEffect(() => {
    if (visible) {
      setLocalProfiles([...profiles]);
    }
  }, [visible, profiles]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newProfiles = [...localProfiles];
    const temp = newProfiles[index];
    newProfiles[index] = newProfiles[index - 1];
    newProfiles[index - 1] = temp;
    setLocalProfiles(newProfiles);
  };

  const moveDown = (index: number) => {
    if (index === localProfiles.length - 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newProfiles = [...localProfiles];
    const temp = newProfiles[index];
    newProfiles[index] = newProfiles[index + 1];
    newProfiles[index + 1] = temp;
    setLocalProfiles(newProfiles);
  };

  const handleSave = () => {
    reorderProfiles(localProfiles.map(p => p.id));
    onDismiss();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.iconBtn,
              { 
                backgroundColor: dark ? colors.surfaceVariant : colors.surface, 
                borderColor: colors.outline,
                transform: [{ scale: pressed ? 0.94 : 1 }]
              },
            ]}
          >
            <MaterialCommunityIcons name="close" size={20} color={colors.onSurface} />
          </Pressable>
          <Text style={{ fontSize: 17, fontWeight: "800", color: colors.onSurface, letterSpacing: -0.2 }}>
            Reorder Cards
          </Text>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveBtn,
              { 
                backgroundColor: colors.primary, 
                transform: [{ scale: pressed ? 0.94 : 1 }]
              },
            ]}
          >
            <Text style={{ color: dark ? "#0F172A" : "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
              Done
            </Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {localProfiles.map((profile, index) => {
            const platform = PLATFORMS[profile.platformId];
            return (
              <Surface
                key={profile.id}
                style={[
                  styles.itemCard, 
                  { 
                    backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                    borderColor: colors.outline,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: dark ? 0.15 : 0.03,
                    shadowRadius: 10,
                    elevation: 2,
                  }
                ]}
                elevation={0}
              >
                <View style={styles.itemInfo}>
                  <View style={[styles.platformIconCircle, { backgroundColor: (platform?.color || colors.primary) + "18" }]}>
                    <MaterialCommunityIcons
                      name={(platform?.icon as any) || "code-tags"}
                      size={20}
                      color={platform?.color || colors.primary}
                    />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.onSurface }}>
                      @{profile.username}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.onSurfaceVariant, fontWeight: "600", textTransform: "capitalize", marginTop: 2 }}>
                      {platform?.name}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    disabled={index === 0}
                    onPress={() => moveUp(index)}
                    style={({ pressed }) => [
                      styles.arrowBtn,
                      {
                        backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                        opacity: index === 0 ? 0.2 : pressed ? 0.6 : 1,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name="chevron-up" size={22} color={colors.onSurface} />
                  </Pressable>
                  <Pressable
                    disabled={index === localProfiles.length - 1}
                    onPress={() => moveDown(index)}
                    style={({ pressed }) => [
                      styles.arrowBtn,
                      {
                        backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                        opacity: index === localProfiles.length - 1 ? 0.2 : pressed ? 0.6 : 1,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name="chevron-down" size={22} color={colors.onSurface} />
                  </Pressable>
                </View>
              </Surface>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
};

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
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  platformIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  handle: {
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlBtn: {
    margin: 0,
  }
});
