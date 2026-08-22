import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfileStore } from "../../src/stores/useProfileStore";
import { useSettingsStore } from "../../src/stores/useSettingsStore";
import { useThemeStore, ThemeColor } from "../../src/stores/useThemeStore";
import { themePalettes } from "../../src/theme/md3-theme";
import { PLATFORMS, PlatformId } from "../../src/types/platform";

const THEME_OPTIONS: { id: ThemeColor; name: string; color: string }[] = [
  { id: "monochrome", name: "Default", color: "#181A20" },
  { id: "blue", name: "Cobalt", color: "#2563EB" },
  { id: "emerald", name: "Emerald", color: "#059669" },
  { id: "violet", name: "Violet", color: "#7C3AED" },
  { id: "rose", name: "Rose", color: "#E11D48" },
  { id: "amber", name: "Amber", color: "#D97706" },
];

export default function SettingsScreen() {
  const { colors, dark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleTheme, themeColor, setThemeColor } = useThemeStore();
  const { profiles, addProfile, removeProfile, isLoading } = useProfileStore();
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addProfile(selectedPlatform, username.trim());
    setDialogVisible(false);
    setUsername("");
    setSelectedPlatform(null);
  };

  const openAddDialog = (platform: PlatformId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlatform(platform);
    setDialogVisible(true);
  };

  const availablePlatforms = Object.values(PLATFORMS).filter(
    (platform) => !profiles.some((p) => p.platformId === platform.id),
  );

  const SettingRow = ({ icon, title, description, control }: any) => (
    <View style={styles.settingRow}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text style={{ fontWeight: "800", fontSize: 15, color: colors.onSurface }}>{title}</Text>
        {description && (
          <Text style={{ fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2, fontWeight: "500" }}>{description}</Text>
        )}
      </View>
      {control}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Expressive Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={({ pressed }) => [
              styles.backBtn,
              { 
                backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                borderColor: colors.outline,
                transform: [{ scale: pressed ? 0.92 : 1 }]
              }
            ]}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={colors.onSurface} />
          </Pressable>
          <Text style={[styles.title, { color: colors.onSurface, marginLeft: 12 }]}>
            Settings
          </Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance & Theming */}
        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
          >
            APPEARANCE & THEME
          </Text>
          <Surface 
            style={[
              styles.surfaceCard, 
              { 
                backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                borderColor: colors.outline,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: dark ? 0.15 : 0.03,
                shadowRadius: 12,
                elevation: 2,
              }
            ]} 
            elevation={0}
          >
            <SettingRow
              icon="moon-waning-crescent"
              title="Dark Theme"
              description="High contrast OLED-friendly surfaces"
              control={
                <Switch 
                  value={isDarkMode} 
                  onValueChange={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleTheme();
                  }} 
                  color={colors.primary} 
                />
              }
            />

            <Divider style={{ opacity: 0.3, marginVertical: 14 }} />

            <View style={{ paddingTop: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: colors.onSurface, marginBottom: 12 }}>
                Accent Color Palette
              </Text>
              <View style={styles.paletteRow}>
                {THEME_OPTIONS.map((themeOpt) => {
                  const isSelected = themeColor === themeOpt.id;
                  const palette = themePalettes[themeOpt.id];
                  const swatchColor = dark ? palette.dark : palette.light;

                  return (
                    <Pressable
                      key={themeOpt.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setThemeColor(themeOpt.id);
                      }}
                      style={({ pressed }) => [
                        styles.paletteItem,
                        { transform: [{ scale: pressed ? 0.92 : 1 }] }
                      ]}
                    >
                      <View 
                        style={[
                          styles.colorCircle, 
                          { 
                            backgroundColor: swatchColor,
                            borderColor: isSelected ? colors.onSurface : "transparent",
                            borderWidth: isSelected ? 3 : 0,
                          }
                        ]}
                      >
                        {isSelected && (
                          <MaterialCommunityIcons 
                            name="check" 
                            size={16} 
                            color={themeOpt.id === "monochrome" && !dark ? "#FFFFFF" : (dark ? "#0F172A" : "#FFFFFF")} 
                          />
                        )}
                      </View>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: isSelected ? colors.primary : colors.onSurfaceVariant, marginTop: 4 }}>
                        {themeOpt.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Surface>
        </View>

        {/* Notifications & Sync */}
        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
          >
            NOTIFICATIONS & BACKGROUND
          </Text>
          <Surface 
            style={[
              styles.surfaceCard, 
              { 
                backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                borderColor: colors.outline,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: dark ? 0.15 : 0.03,
                shadowRadius: 12,
                elevation: 2,
              }
            ]} 
            elevation={0}
          >
            <SettingRow
              icon="bell-outline"
              title="Contest Alerts"
              description="Push notifications before contest start"
              control={
                <Switch 
                  value={notificationsEnabled} 
                  onValueChange={(val) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleNotifications(val);
                  }} 
                  color={colors.primary} 
                />
              }
            />
            <Divider style={{ opacity: 0.3, marginVertical: 14 }} />
            <SettingRow
              icon="sync"
              title="Background Sync"
              description="Keep contests and ratings refreshed automatically"
              control={
                <Switch 
                  value={backgroundSyncEnabled} 
                  onValueChange={(val) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleBackgroundSync(val);
                  }} 
                  color={colors.primary} 
                />
              }
            />
          </Surface>
        </View>

        {/* Connected Profiles */}
        <View style={styles.sectionContainer}>
          <Text
            style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
          >
            CONNECTED ACCOUNTS
          </Text>
          {profiles.length === 0 ? (
            <Surface 
              style={[
                styles.surfaceCard, 
                { 
                  backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                  borderColor: colors.outline,
                  alignItems: "center",
                  paddingVertical: 24,
                }
              ]} 
              elevation={0}
            >
              <MaterialCommunityIcons name="account-off-outline" size={32} color={colors.onSurfaceVariant} style={{ opacity: 0.4, marginBottom: 8 }} />
              <Text
                style={{
                  fontWeight: "700",
                  color: colors.onSurfaceVariant,
                  fontSize: 14,
                }}
              >
                No profiles connected yet.
              </Text>
            </Surface>
          ) : (
            <Surface 
              style={[
                styles.surfaceCard, 
                { 
                  backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                  borderColor: colors.outline,
                  paddingVertical: 6,
                }
              ]} 
              elevation={0}
            >
              {profiles.map((profile, i) => {
                const platformConfig = PLATFORMS[profile.platformId];
                let platformColor = platformConfig?.color || colors.primary;
                if (profile.platformId === "atcoder") {
                  platformColor = dark ? "#FFFFFF" : "#181A20";
                }

                return (
                  <React.Fragment key={profile.id}>
                    {i > 0 && <Divider style={{ opacity: 0.3, marginVertical: 4 }} />}
                    <View style={styles.profileRow}>
                      <View
                        style={[
                          styles.platformIconCircle,
                          { backgroundColor: platformColor + "18" },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={(platformConfig?.icon as any) || "code-tags"}
                          size={18}
                          color={platformColor}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ fontWeight: "800", fontSize: 15, color: colors.onSurface }}>
                          @{profile.username}
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
                              fontFamily: "JetBrainsMono_700Bold",
                            }}
                          >
                            {profile.rating ?? "Active"}
                          </Text>
                        </Text>
                      </View>
                      <IconButton
                        icon="trash-can-outline"
                        size={20}
                        iconColor={colors.error}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          removeProfile(profile.id);
                        }}
                      />
                    </View>
                  </React.Fragment>
                );
              })}
            </Surface>
          )}
        </View>

        {/* Add Platform */}
        {availablePlatforms.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text
              style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
            >
              LINK NEW PLATFORM
            </Text>
            <View style={styles.platformGrid}>
              {availablePlatforms.map((platform) => {
                let platformColor = platform.color;
                if (platform.id === "atcoder") {
                  platformColor = dark ? "#FFFFFF" : "#181A20";
                }

                return (
                  <Pressable
                    key={platform.id}
                    style={({ pressed }) => [
                      styles.platformTile,
                      {
                        backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                        borderColor: colors.outline,
                        opacity: pressed ? 0.85 : 1,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      },
                    ]}
                    onPress={() => openAddDialog(platform.id)}
                  >
                    <View
                      style={[
                        styles.platformIconBg,
                        { backgroundColor: platformColor + "18" },
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
                        fontWeight: "800",
                        color: colors.onSurface,
                        marginTop: 10,
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
      </ScrollView>

      {/* Add Profile Dialog */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={{ backgroundColor: dark ? colors.surfaceVariant : colors.surface, borderRadius: 28 }}
        >
          <Dialog.Title style={{ fontWeight: "900", color: colors.onSurface, fontSize: 20 }}>
            Add {PLATFORMS[selectedPlatform as PlatformId]?.name}
          </Dialog.Title>
          <Dialog.Content>
            <Text
              style={{
                marginBottom: 16,
                color: colors.onSurfaceVariant,
                fontWeight: "500",
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              Enter your competitive programming handle to pull ratings and contest submissions.
            </Text>
            <TextInput
              mode="outlined"
              label="Username / Handle"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
              style={{ backgroundColor: dark ? colors.background : colors.surface }}
            />
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 20, paddingBottom: 16, gap: 8 }}>
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
              style={{ borderRadius: 999, paddingHorizontal: 14 }}
              labelStyle={{ fontWeight: "800", color: dark ? "#0F172A" : "#FFFFFF" }}
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
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  title: {
    fontWeight: "900",
    fontSize: 28,
    letterSpacing: -0.8,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 6,
    textTransform: "uppercase",
  },
  surfaceCard: {
    borderRadius: 24, // M3 Expressive squircle
    padding: 16,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  paletteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paletteItem: {
    alignItems: "center",
  },
  colorCircle: {
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
    paddingHorizontal: 4,
  },
  platformIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  platformGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  platformTile: {
    flex: 1,
    minWidth: "46%",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 24, // M3 Expressive squircle
    borderWidth: 1,
  },
  platformIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});

