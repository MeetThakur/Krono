import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";
import { leetcodeApi } from "../../api/leetcode";
import { PLATFORMS } from "../../types/platform";
import { UnifiedProfile } from "../../types/user";
import { ContestHistory } from "../charts/ContestHistory";
import { RatingChart } from "../charts/RatingChart";

const { width } = Dimensions.get("window");

interface ProfileDetailModalProps {
  profile: UnifiedProfile | null;
  visible: boolean;
  onDismiss: () => void;
}

export function ProfileDetailModal({
  profile,
  visible,
  onDismiss,
}: ProfileDetailModalProps) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const [contestCount, setContestCount] = useState<number | null>(null);
  const viewRef = useRef<ViewShot>(null);

  const shareProfile = async () => {
    try {
      if (viewRef.current && viewRef.current.capture) {
        const uri = await viewRef.current.capture();
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            dialogTitle: `Share ${profile?.username}'s Profile`,
            mimeType: "image/png",
          });
        }
      }
    } catch (e) {
      console.warn("Failed to share profile", e);
    }
  };

  useEffect(() => {
    if (profile && visible) {
      setContestCount(null);

      if (profile.platformId === "leetcode") {
        leetcodeApi
          .getUserContestRanking(profile.username)
          .then((data) => {
            if (data?.ranking?.attendedContestsCount != null) {
              setContestCount(data.ranking.attendedContestsCount);
            }
          })
          .catch(() => {});
      }
    }
  }, [profile?.id, visible]);

  if (!profile) return null;

  const platformConfig = PLATFORMS[profile.platformId];
  
  let effectivePlatformColor = platformConfig?.color || colors.primary;
  if (profile.platformId === "atcoder") {
    effectivePlatformColor = dark ? "#FFFFFF" : "#18181B";
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
      >
        {/* Header Navigation */}
        <View style={[styles.header, { paddingTop: 16 }]}>
          {/* Empty view for flex balancing */}
          <View style={{ width: 64 }} /> 
          
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={shareProfile}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.surface },
              ]}
            >
              <MaterialCommunityIcons
                name="export-variant"
                size={20}
                color={colors.onSurface}
              />
            </Pressable>
            <Pressable
              onPress={onDismiss}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.surface },
              ]}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={colors.onSurface}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          <ViewShot
            ref={viewRef}
            options={{ format: "png", quality: 0.9 }}
            style={{ backgroundColor: colors.background }}
          >
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={[styles.platformIconContainer, { backgroundColor: effectivePlatformColor + "15" }]}>
                <MaterialCommunityIcons
                  name={(platformConfig?.icon as any) || "code-tags"}
                  size={42}
                  color={effectivePlatformColor}
                />
              </View>

              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: effectivePlatformColor,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                {platformConfig?.name}
              </Text>

              <Text
                style={{
                  fontSize: 36,
                  fontWeight: "900",
                  color: colors.onSurface,
                  letterSpacing: -1,
                  textAlign: "center",
                }}
                numberOfLines={1}
              >
                {profile.username}
              </Text>

              <View style={styles.tagsContainer}>
                {profile.rank ? (
                  <View style={[styles.tag, { backgroundColor: effectivePlatformColor + "1A" }]}>
                    <Text style={{ color: effectivePlatformColor, fontWeight: "700", fontSize: 12 }}>
                      {profile.rank}
                    </Text>
                  </View>
                ) : null}

                {profile.globalRank ? (
                  <View style={[styles.tag, { backgroundColor: colors.surface }]}>
                    <MaterialCommunityIcons name="earth" size={14} color={colors.onSurfaceVariant} />
                    <Text style={{ color: colors.onSurfaceVariant, fontWeight: "600", fontSize: 12, marginLeft: 4 }}>
                      #{profile.globalRank.toLocaleString()}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {/* Primary Stat */}
              <Surface style={[styles.statCard, { backgroundColor: colors.surface, width: "100%", paddingVertical: 24 }]} elevation={0}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 1 }}>
                  Current Rating
                </Text>
                <Text style={{ fontSize: 56, fontWeight: "900", color: effectivePlatformColor, marginTop: 4, letterSpacing: -2 }}>
                  {profile.rating ?? "—"}
                </Text>
              </Surface>

              {/* Secondary Stats Row */}
              <View style={styles.statsRow}>
                <Surface style={[styles.statCard, { backgroundColor: colors.surface, flex: 1 }]} elevation={0}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Problems Solved
                  </Text>
                  <Text style={{ fontSize: 28, fontWeight: "800", color: colors.onSurface, marginTop: 8 }}>
                    {profile.problemsSolved ?? 0}
                  </Text>
                </Surface>
                <Surface style={[styles.statCard, { backgroundColor: colors.surface, flex: 1 }]} elevation={0}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Contests
                  </Text>
                  <Text style={{ fontSize: 28, fontWeight: "800", color: colors.onSurface, marginTop: 8 }}>
                    {profile.totalContests ?? contestCount ?? "—"}
                  </Text>
                </Surface>
              </View>
            </View>

            {/* Charts Section */}
            <View style={styles.chartSection}>
              <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>
                RATING HISTORY
              </Text>
              <Surface style={[styles.chartContainer, { backgroundColor: colors.surface }]} elevation={0}>
                <RatingChart profiles={[profile]} />
              </Surface>
            </View>
          </ViewShot>

          <View style={styles.chartSection}>
            <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>
              RECENT ACTIVITY
            </Text>
            <Surface style={[styles.chartContainer, { backgroundColor: colors.surface }]} elevation={0}>
              <ContestHistory profiles={[profile]} />
            </Surface>
          </View>

        </ScrollView>
      </View>
    </Modal>
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
    paddingBottom: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroSection: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  platformIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
    flexWrap: "wrap",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  statsGrid: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  chartSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontWeight: "700",
    letterSpacing: 1,
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  chartContainer: {
    borderRadius: 20,
    paddingVertical: 20,
    overflow: "hidden",
  },
});
