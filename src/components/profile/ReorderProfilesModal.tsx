import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, IconButton, Surface, Text, useTheme } from "react-native-paper";
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
  const { colors } = useTheme();
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
              { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.onSurface }}>
            Reorder Banners
          </Text>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <MaterialCommunityIcons name="check" size={24} color={colors.onPrimary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.listContent}>
          {localProfiles.map((profile, index) => {
            const platform = PLATFORMS[profile.platformId];
            return (
              <Surface
                key={profile.id}
                style={[styles.itemCard, { backgroundColor: colors.surface }]}
                elevation={0}
              >
                <View style={styles.itemInfo}>
                  {profile.avatar ? (
                    <Avatar.Image source={{ uri: profile.avatar }} size={40} />
                  ) : (
                    <Avatar.Icon
                      size={40}
                      icon={(platform?.icon as any) || "account"}
                      style={{ backgroundColor: platform?.color || colors.primary }}
                    />
                  )}
                  <View style={styles.textContainer}>
                    <Text style={[styles.platformName, { color: colors.onSurface }]}>
                      {platform?.name || profile.platformId}
                    </Text>
                    <Text style={[styles.handle, { color: colors.onSurfaceVariant }]}>
                      @{profile.username}
                    </Text>
                  </View>
                </View>

                <View style={styles.controls}>
                  <IconButton
                    icon="chevron-up"
                    size={24}
                    iconColor={colors.onSurface}
                    disabled={index === 0}
                    onPress={() => moveUp(index)}
                    style={styles.controlBtn}
                  />
                  <IconButton
                    icon="chevron-down"
                    size={24}
                    iconColor={colors.onSurface}
                    disabled={index === localProfiles.length - 1}
                    onPress={() => moveDown(index)}
                    style={styles.controlBtn}
                  />
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(127,127,127,0.2)",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    padding: 16,
    borderRadius: 16,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: "700",
  },
  handle: {
    fontSize: 14,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlBtn: {
    margin: 0,
  }
});
