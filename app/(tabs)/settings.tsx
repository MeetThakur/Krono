import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
    Button,
    Dialog,
    Divider,
    IconButton,
    Portal,
    Surface,
    Switch,
    Text,
    TextInput,
    useTheme,
} from "react-native-paper";
import { notificationService } from "../../src/services/notificationService";
import { useOnboardingStore } from "../../src/stores/useOnboardingStore";
import { useProfileStore } from "../../src/stores/useProfileStore";
import { useSettingsStore } from "../../src/stores/useSettingsStore";
import { useThemeStore } from "../../src/stores/useThemeStore";
import { PLATFORMS, PlatformId } from "../../src/types/platform";

export default function SettingsScreen() {
  const { colors, dark } = useTheme();
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { profiles, addProfile, removeProfile, isLoading } = useProfileStore();
  const { resetOnboarding } = useOnboardingStore();
  const {
    notificationsEnabled,
    backgroundSyncEnabled,
    toggleNotifications,
    toggleBackgroundSync,
  } = useSettingsStore();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | null>(
    null,
  );
  const [username, setUsername] = useState("");

  const handleAddProfile = async () => {
    if (!selectedPlatform || !username.trim()) return;
    await addProfile(selectedPlatform, username.trim());
    setDialogVisible(false);
    setUsername("");
    setSelectedPlatform(null);
  };

  const openAddDialog = (platform: PlatformId) => {
    setSelectedPlatform(platform);
    setDialogVisible(true);
  };

  const availablePlatforms = Object.values(PLATFORMS).filter(
    (platform) => !profiles.some((p) => p.platformId === platform.id),
  );

  const SettingRow = ({ icon, title, description, control }: any) => (
    <View style={styles.settingRow}>
      <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text style={{ fontWeight: "700", fontSize: 15, color: colors.onSurface }}>{title}</Text>
        {description && (
          <Text style={{ fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2, fontWeight: "500" }}>{description}</Text>
        )}
      </View>
      {control}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
          >
            APPEARANCE
          </Text>
          <Surface style={[styles.surfaceCard, { backgroundColor: colors.surface }]} elevation={0}>
            <SettingRow
              icon="moon-waning-crescent"
              title="Dark Mode"
              control={<Switch value={isDarkMode} onValueChange={toggleTheme} color={colors.primary} />}
            />
          </Surface>
        </View>

        {/* Notifications */}
        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
          >
            NOTIFICATIONS
          </Text>
          <Surface style={[styles.surfaceCard, { backgroundColor: colors.surface }]} elevation={0}>
            <SettingRow
              icon="bell-outline"
              title="Push Notifications"
              control={<Switch value={notificationsEnabled} onValueChange={toggleNotifications} color={colors.primary} />}
            />
            <Divider style={{ opacity: 0.3, marginVertical: 12 }} />
            <SettingRow
              icon="sync"
              title="Background Sync"
              description="Periodically fetch contests"
              control={<Switch value={backgroundSyncEnabled} onValueChange={toggleBackgroundSync} color={colors.primary} />}
            />
          </Surface>
        </View>

        {/* Connected Profiles */}
        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
          >
            CONNECTED PROFILES
          </Text>
          {profiles.length === 0 ? (
            <Text
              style={{
                fontWeight: "600",
                color: colors.onSurfaceVariant,
                opacity: 0.5,
                textAlign: "center",
                marginVertical: 12,
                fontSize: 13,
              }}
            >
              No profiles connected yet.
            </Text>
          ) : (
            <Surface style={[styles.surfaceCard, { backgroundColor: colors.surface, paddingVertical: 8 }]} elevation={0}>
              {profiles.map((profile, i) => {
                const platformConfig = PLATFORMS[profile.platformId];
                let platformColor = platformConfig?.color || colors.primary;
                if (profile.platformId === "atcoder" && !isDarkMode) {
                  platformColor = "#111111";
                }

                return (
                  <React.Fragment key={profile.id}>
                    {i > 0 && <Divider style={{ opacity: 0.2, marginVertical: 8 }} />}
                    <View style={styles.profileRow}>
                      <View
                        style={[
                          styles.platformDot,
                          { backgroundColor: platformColor },
                        ]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "700", fontSize: 15, color: colors.onSurface }}>
                          {profile.username}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.onSurfaceVariant,
                            fontWeight: "600",
                            marginTop: 2,
                          }}
                        >
                          {platformConfig?.name} ·{" "}
                          <Text
                            style={{
                              fontWeight: "700",
                              color: platformColor,
                            }}
                          >
                            {profile.rating || "Unrated"}
                          </Text>
                        </Text>
                      </View>
                      <IconButton
                        icon="close"
                        size={20}
                        iconColor={colors.onSurfaceVariant}
                        onPress={() => removeProfile(profile.id)}
                        style={{ opacity: 0.7 }}
                      />
                    </View>
                  </React.Fragment>
                );
              })}
            </Surface>
          )}
        </View>

        {/* Add Profile */}
        {availablePlatforms.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text
              style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
            >
              ADD PLATFORM
            </Text>
            <View style={styles.platformGrid}>
              {availablePlatforms.map((platform) => {
                let platformColor = platform.color;
                if (platform.id === "atcoder" && !isDarkMode) {
                  platformColor = "#111111";
                }

                return (
                  <Pressable
                    key={platform.id}
                    style={({ pressed }) => [
                      styles.platformTile,
                      {
                        backgroundColor: colors.surface,
                        opacity: pressed ? 0.8 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}
                    onPress={() => openAddDialog(platform.id)}
                  >
                    <View
                      style={[
                        styles.platformIconBg,
                        { backgroundColor: platformColor + "15" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={platform.icon as any}
                        size={24}
                        color={platformColor}
                      />
                    </View>
                    <Text
                      style={{
                        fontWeight: "700",
                        color: colors.onSurface,
                        marginTop: 12,
                        fontSize: 13,
                      }}
                    >
                      {platform.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}



        <View style={{ height: 60 }} />
      </ScrollView>

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={{ backgroundColor: colors.surface, borderRadius: 24 }}
        >
          <Dialog.Title style={{ fontWeight: "800", color: colors.onSurface }}>
            Add {PLATFORMS[selectedPlatform as PlatformId]?.name}
          </Dialog.Title>
          <Dialog.Content>
            <Text
              style={{
                marginBottom: 16,
                color: colors.onSurfaceVariant,
                fontWeight: "500",
              }}
            >
              Enter your handle to track your profile and ratings.
            </Text>
            <TextInput
              mode="outlined"
              label="Username / Handle"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              style={{ backgroundColor: colors.surface }}
            />
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
            <Button
              onPress={() => setDialogVisible(false)}
              textColor={colors.onSurfaceVariant}
              labelStyle={{ fontWeight: "700" }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddProfile}
              loading={isLoading}
              disabled={isLoading || !username.trim()}
              style={{ borderRadius: 100, paddingHorizontal: 12 }}
              labelStyle={{ fontWeight: "800", color: dark ? "#111111" : "#FFFFFF" }}
            >
              Add Profile
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontWeight: "900",
    fontSize: 32,
    letterSpacing: -1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 8,
  },
  surfaceCard: {
    borderRadius: 24,
    padding: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  platformDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  platformGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  platformTile: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 24,
  },
  platformIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
