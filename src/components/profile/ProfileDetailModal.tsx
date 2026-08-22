import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Surface, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
    effectivePlatformColor = dark ? "#FFFFFF" : "#181A20";
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
          <View style={{ width: 40 }} /> 
          
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
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={colors.onSurface}
            />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          <View style={{ backgroundColor: colors.background }}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={[styles.platformIconContainer, { backgroundColor: effectivePlatformColor + "18" }]}>
                <MaterialCommunityIcons
                  name={(platformConfig?.icon as any) || "code-tags"}
                  size={42}
                  color={effectivePlatformColor}
                />
              </View>

              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: effectivePlatformColor,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginTop: 16,
                  marginBottom: 6,
                }}
              >
                {platformConfig?.name}
              </Text>

              <Text
                style={{
                  fontSize: 32,
                  lineHeight: 38,
                  includeFontPadding: false,
                  fontWeight: "900",
                  color: colors.onSurface,
                  letterSpacing: -0.5,
                  textAlign: "center",
                }}
                numberOfLines={1}
              >
                @{profile.username}
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
                  <View style={[styles.tag, { backgroundColor: dark ? colors.surfaceVariant : colors.surface, borderColor: colors.outline, borderWidth: 1 }]}>
                    <MaterialCommunityIcons name="earth" size={14} color={colors.onSurfaceVariant} />
                    <Text style={{ color: colors.onSurfaceVariant, fontWeight: "700", fontSize: 12, marginLeft: 4, fontFamily: "JetBrainsMono_700Bold" }}>
                      #{profile.globalRank.toLocaleString()}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {/* Primary Stat Card */}
              <Surface 
                style={[
                  styles.statCard, 
                  { 
                    backgroundColor: dark ? colors.surfaceVariant : colors.surface, 
                    borderColor: colors.outline,
                    width: "100%", 
                    paddingVertical: 24,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: dark ? 0.2 : 0.04,
                    shadowRadius: 16,
                    elevation: 3,
                  }
                ]} 
                elevation={0}
              >
                <Text style={{ fontSize: 12, fontWeight: "800", color: colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 1 }}>
                  Current Rating
                </Text>
                <Text style={{ fontSize: 52, lineHeight: 60, includeFontPadding: false, fontWeight: "900", color: effectivePlatformColor, marginTop: 4, letterSpacing: -1, fontFamily: "JetBrainsMono_700Bold" }}>
                  {profile.rating ?? "—"}
                </Text>
                {profile.maxRating ? (
                  <View style={[styles.peakPill, { backgroundColor: effectivePlatformColor + "14" }]}>
                    <Text style={{ color: effectivePlatformColor, fontSize: 11, fontWeight: "700", fontFamily: "JetBrainsMono_700Bold" }}>
                      Peak {profile.maxRating}
                    </Text>
                  </View>
                ) : null}
              </Surface>

              {/* Secondary Stats Row */}
              <View style={styles.statsRow}>
                {profile.platformId !== "topcoder" && (
                  <Surface 
                    style={[
                      styles.statCard, 
                      { 
                        backgroundColor: dark ? colors.surfaceVariant : colors.surface, 
                        borderColor: colors.outline,
                        flex: 1,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: dark ? 0.15 : 0.03,
                        shadowRadius: 12,
                        elevation: 2,
                      }
                    ]} 
                    elevation={0}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "700", color: colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Solved
                    </Text>
                    <Text style={{ fontSize: 26, lineHeight: 32, includeFontPadding: false, fontWeight: "800", color: colors.onSurface, marginTop: 6, fontFamily: "JetBrainsMono_700Bold" }}>
                      {profile.problemsSolved ?? 0}
                    </Text>
                  </Surface>
                )}
                {profile.platformId !== "geeksforgeeks" && profile.platformId !== "hackerrank" && (
                  <Surface 
                    style={[
                      styles.statCard, 
                      { 
                        backgroundColor: dark ? colors.surfaceVariant : colors.surface, 
                        borderColor: colors.outline,
                        flex: 1,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: dark ? 0.15 : 0.03,
                        shadowRadius: 12,
                        elevation: 2,
                      }
                    ]} 
                    elevation={0}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "700", color: colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Contests
                    </Text>
                    <Text style={{ fontSize: 26, lineHeight: 32, includeFontPadding: false, fontWeight: "800", color: colors.onSurface, marginTop: 6, fontFamily: "JetBrainsMono_700Bold" }}>
                      {profile.totalContests ?? contestCount ?? "—"}
                    </Text>
                  </Surface>
                )}
              </View>
            </View>

            {/* Charts Section */}
            {profile.platformId !== "geeksforgeeks" && profile.platformId !== "hackerrank" && (
              <View style={styles.chartSection}>
                <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>
                  RATING HISTORY
                </Text>
                <Surface 
                  style={[
                    styles.chartContainer, 
                    { 
                      backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                      borderColor: colors.outline,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: dark ? 0.2 : 0.04,
                      shadowRadius: 16,
                      elevation: 3,
                    }
                  ]} 
                  elevation={0}
                >
                  <RatingChart profiles={[profile]} />
                </Surface>
              </View>
            )}
          </View>

          {profile.platformId !== "geeksforgeeks" && profile.platformId !== "hackerrank" && (
            <View style={styles.chartSection}>
              <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>
                PAST CONTESTS
              </Text>
              <Surface 
                style={[
                  styles.chartContainer, 
                  { 
                    backgroundColor: dark ? colors.surfaceVariant : colors.surface,
                    borderColor: colors.outline,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: dark ? 0.2 : 0.04,
                    shadowRadius: 16,
                    elevation: 3,
                  }
                ]} 
                elevation={0}
              >
                <ContestHistory profiles={[profile]} />
              </Surface>
            </View>
          )}

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
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  platformIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    gap: 8,
    flexWrap: "wrap",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  peakPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
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
    padding: 18,
    borderRadius: 24, // M3 Expressive squircle
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chartSection: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontWeight: "800",
    letterSpacing: 1.2,
    fontSize: 11,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  chartContainer: {
    borderRadius: 24, // M3 Expressive squircle
    borderWidth: 1,
    paddingVertical: 18,
    overflow: "hidden",
  },
});

