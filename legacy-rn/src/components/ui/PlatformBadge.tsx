import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlatformId, PLATFORMS } from '../../types/platform';

interface PlatformBadgeProps {
  platformId: PlatformId;
  size?: 'sm' | 'md';
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({ platformId, size = 'md' }) => {
  const platform = PLATFORMS[platformId];
  const color = platform.color;
  
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}15` }]}>
      <Text style={[styles.text, { color: color, fontSize: size === 'sm' ? 10 : 12 }]}>
        {platform.name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});
