import { format, isSameDay, parseISO } from 'date-fns';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from '../../hooks/useTheme';
import { Contest } from '../../types/contest';
import { PLATFORMS } from '../../types/platform';

interface TimelineItemProps {
  contest: Contest;
  isLast?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ contest, isLast }) => {
  const { colors, isDarkMode } = useTheme();

  const handlePress = async () => {
    if (contest.url) {
      await WebBrowser.openBrowserAsync(contest.url);
    }
  };

  const getBrandColor = (platformId: string) => {
    switch (platformId) {
      case 'codeforces': return '#1877F2';
      case 'codechef': return '#8B4513';
      case 'leetcode': return '#FFA116';
      case 'atcoder': return isDarkMode ? '#FFFFFF' : '#181A20';
      case 'geeksforgeeks': return '#2F8D46';
      case 'codingninjas': return '#D04D28';
      case 'hackerrank': return '#00EA64';
      default: return colors.primary;
    }
  };

  const brandColor = getBrandColor(contest.platformId);
  const platformConfig = PLATFORMS[contest.platformId];
  
  const startTime = typeof contest.startTime === 'string' 
    ? parseISO(contest.startTime) 
    : contest.startTime;

  const formattedTime = format(startTime, 'h:mm a');
  const formattedDate = format(startTime, 'MMM d');
  const isToday = isSameDay(startTime, new Date());
  const durationHours = (contest.durationSeconds / 3600).toFixed(1);

  return (
    <View style={styles.container}>
      {/* Left: Time Column */}
      <View style={styles.timeColumn}>
        <Text style={[styles.timeText, { color: colors.text.primary, fontFamily: "JetBrainsMono_700Bold" }]}>
          {formattedTime}
        </Text>
        <View style={[styles.datePill, { backgroundColor: isToday ? colors.primaryContainer : "transparent" }]}>
          <Text style={[styles.dateText, { color: isToday ? colors.primary : colors.text.muted }]}>
            {isToday ? 'Today' : formattedDate}
          </Text>
        </View>
        {!isLast && <View style={[styles.timelineLine, { backgroundColor: colors.outline }]} />}
      </View>

      {/* Right: M3 Expressive Card */}
      <TouchableOpacity 
        style={[
          styles.cardContainer, 
          { 
            backgroundColor: isDarkMode ? colors.surfaceContainerHigh : colors.surface, 
            borderColor: colors.outline,
            shadowColor: brandColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDarkMode ? 0.2 : 0.06,
            shadowRadius: 12,
            elevation: 3,
          }
        ]} 
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <View style={[styles.platformPill, { backgroundColor: brandColor + "18" }]}>
              <MaterialCommunityIcons
                name={(platformConfig?.icon as any) || "code-tags"}
                size={12}
                color={brandColor}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.platformName, { color: brandColor }]}>
                {platformConfig?.name || contest.platformId}
              </Text>
            </View>
            <View style={[styles.durationBadge, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
              <Text style={[styles.durationText, { color: colors.text.secondary }]}>{durationHours}h</Text>
            </View>
          </View>
          
          <Text style={[styles.contestTitle, { color: colors.text.primary }]} numberOfLines={2}>
            {contest.name}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 0,
    minHeight: 90,
  },
  timeColumn: {
    width: 75,
    alignItems: 'flex-end',
    paddingRight: 14,
    paddingTop: 4,
  },
  timeText: {
    fontSize: 13,
    letterSpacing: -0.2,
  },
  datePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
    marginRight: 8,
    borderRadius: 1,
  },
  cardContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20, // M3 Expressive squircle
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  platformName: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  contestTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  durationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
