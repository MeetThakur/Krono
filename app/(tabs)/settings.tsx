import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
    Button,
    Card,
    Dialog,
    Divider,
    IconButton,
    List,
    Portal,
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

const ACCENT_COLORS = [
  { id: "monochrome" as const, label: "Mono" },
  { id: "blue" as const, label: "Blue", hex: "#3B82F6" },
  { id: "emerald" as const, label: "Green", hex: "#10B981" },
  { id: "violet" as const, label: "Violet", hex: "#8B5CF6" },
  { id: "rose" as const, label: "Rose", hex: "#F43F5E" },
  { id: "amber" as const, label: "Amber", hex: "#F59E0B" },
];

export default function SettingsScreen() {
  const { colors, dark } = useTheme();
  const router = useRouter();
  const { isDarkMode, themeColor, toggleTheme, setThemeColor } =
    useThemeStore();
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Appearance */}
        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
          >
            APPEARANCE
          </Text>
          <Card
            style={[
              styles.card,
              {
                borderColor: dark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)",
              },
            ]}
            mode="contained"
          >
            <List.Item
              title="Dark Mode"
              titleStyle={{ fontWeight: "600", fontSize: 15 }}
              left={(props) => (
                <List.Icon {...props} icon="moon-waning-crescent" />
              )}
              right={() => (
                <Switch value={isDarkMode} onValueChange={toggleTheme} />
              )}
            />
            <Divider style={{ opacity: 0.3 }} />
            <View style={styles.accentSection}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: colors.onSurfaceVariant,
                  marginBottom: 14,
                }}
              >
                Accent Color
              </Text>
              <View style={styles.accentRow}>
                {ACCENT_COLORS.map((color) => {
                  const hex =
                    color.hex ||
                    (isDarkMode ? "#FAFAFA" : "#18181B");
                  const isActive = themeColor === color.id;
                  return (
                    <Pressable
                      key={color.id}
                      onPress={() => setThemeColor(color.id)}
                      style={styles.accentItem}
                    >
                      <View
                        style={[
                          styles.accentCircle,
                          {
                            backgroundColor: hex,
                            borderWidth: isActive ? 2.5 : 0,
                            borderColor: colors.onSurface,
                          },
                        ]}
                      >
                        {isActive && (
                          <MaterialCommunityIcons
                            name="check"
                            size={16}
                            color={
                              color.id === "monochrome"
                                ? isDarkMode
                                  ? "#000"
                                  : "#FFF"
                                : "#FFF"
                            }
                          />
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: isActive ? "700" : "500",
                          color: isActive
                            ? colors.onSurface
                            : colors.onSurfaceVariant,
                          marginTop: 6,
                        }}
                      >
                        {color.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Card>
        </View>

        {/* Notifications */}
        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
          >
            NOTIFICATIONS
          </Text>
          <Card
            style={[
              styles.card,
              {
                borderColor: dark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)",
              },
            ]}
            mode="contained"
          >
            <List.Item
              title="Push Notifications"
              titleStyle={{ fontWeight: "600", fontSize: 15 }}
              left={(props) => (
                <List.Icon {...props} icon="bell-outline" />
              )}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                />
              )}
            />
            <Divider style={{ opacity: 0.3 }} />
            <List.Item
              title="Background Sync"
              description="Periodically fetch contests"
              titleStyle={{ fontWeight: "600", fontSize: 15 }}
              descriptionStyle={{ fontSize: 12, opacity: 0.6 }}
              left={(props) => <List.Icon {...props} icon="sync" />}
              right={() => (
                <Switch
                  value={backgroundSyncEnabled}
                  onValueChange={toggleBackgroundSync}
                />
              )}
            />
          </Card>
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
                fontStyle: "italic",
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
            <Card
              style={[
                styles.card,
                {
                  borderColor: dark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
                },
              ]}
              mode="contained"
            >
              {profiles.map((profile, i) => {
                const platformConfig = PLATFORMS[profile.platformId];
                let platformColor = platformConfig?.color || colors.primary;
                if (profile.platformId === "atcoder" && !isDarkMode) {
                  platformColor = "#000000";
                }

                return (
                  <React.Fragment key={profile.id}>
                    {i > 0 && <Divider style={{ opacity: 0.2 }} />}
                    <View style={styles.profileRow}>
                      <View
                        style={[
                          styles.platformDot,
                          { backgroundColor: platformColor },
                        ]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "600", fontSize: 14 }}>
                          {profile.username}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.onSurfaceVariant,
                            marginTop: 1,
                          }}
                        >
                          {platformConfig?.name} ·{" "}
                          <Text
                            style={{
                              fontWeight: "600",
                              color: platformColor,
                            }}
                          >
                            {profile.rating || "Unrated"}
                          </Text>
                        </Text>
                      </View>
                      <IconButton
                        icon="close"
                        size={16}
                        iconColor={colors.onSurfaceVariant}
                        onPress={() => removeProfile(profile.id)}
                        style={{ opacity: 0.5 }}
                      />
                    </View>
                  </React.Fragment>
                );
              })}
            </Card>
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
                  platformColor = "#000000";
                }
                return (
                  <Pressable
                    key={platform.id}
                    style={({ pressed }) => [
                      styles.platformTile,
                      {
                        backgroundColor: pressed
                          ? dark
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(0,0,0,0.03)"
                          : colors.surface,
                        borderColor: dark
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.04)",
                      },
                    ]}
                    onPress={() => openAddDialog(platform.id)}
                  >
                    <View
                      style={[
                        styles.tileDot,
                        { backgroundColor: platformColor },
                      ]}
                    />
                    <Text
                      style={{
                        fontWeight: "600",
                        fontSize: 13,
                        color: colors.onSurface,
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

        {/* About */}
        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
          >
            ABOUT
          </Text>
          <Card
            style={[
              styles.card,
              {
                borderColor: dark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)",
              },
            ]}
            mode="contained"
          >
            <List.Item
              title="Replay Walkthrough"
              titleStyle={{ fontWeight: "600", fontSize: 15 }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="book-open-page-variant-outline"
                />
              )}
              right={(props) => (
                <List.Icon {...props} icon="chevron-right" />
              )}
              onPress={async () => {
                await resetOnboarding();
                router.replace("/onboarding" as any);
              }}
            />
            <Divider style={{ opacity: 0.3 }} />
            <List.Item
              title="Test Notification"
              titleStyle={{ fontWeight: "600", fontSize: 15 }}
              left={(props) => (
                <List.Icon {...props} icon="bell-ring-outline" />
              )}
              right={(props) => (
                <List.Icon {...props} icon="chevron-right" />
              )}
              onPress={() => notificationService.sendTestNotification()}
            />
          </Card>
        </View>

        <View style={styles.footer}>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, opacity: 0.4 }}>
            v1.2.0 · Krono
          </Text>
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontSize: 12,
              opacity: 0.4,
              marginTop: 4,
            }}
          >
            Made with ❤️ by Meet
          </Text>
        </View>
      </ScrollView>

      {/* Add Profile Dialog */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={{ backgroundColor: colors.surface, borderRadius: 20 }}
        >
          <Dialog.Title style={{ fontWeight: "700" }}>
            Connect {selectedPlatform ? PLATFORMS[selectedPlatform].name : ""}
          </Dialog.Title>
          <Dialog.Content>
            <Text
              style={{ marginBottom: 12, color: colors.onSurfaceVariant }}
            >
              Enter your handle to sync stats.
            </Text>
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              autoCapitalize="none"
              style={{ backgroundColor: colors.surface }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleAddProfile}
              loading={isLoading}
              disabled={!username.trim()}
            >
              Connect
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
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 8,
  },
  title: {
    fontWeight: "900",
    fontSize: 28,
    letterSpacing: -1,
  },
  content: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontWeight: "600",
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  accentSection: {
    padding: 16,
  },
  accentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  accentItem: {
    alignItems: "center",
  },
  accentCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  platformDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  platformGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  platformTile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  tileDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },
});
