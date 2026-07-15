import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface SleekCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'outlined' | 'flat';
  customShadowColor?: string;
}

export const SleekCard: React.FC<SleekCardProps> = ({ 
    children, 
    style, 
    variant = 'default',
    customShadowColor 
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {/* Hard Shadow Layer - Neo Brutalist Style */}
      {variant !== 'flat' && (
        <View style={[
          styles.shadowLayer, 
          { 
            backgroundColor: customShadowColor || colors.primary,
            borderColor: colors.border // Match border color
          }
        ]} />
      )}
      
      {/* Content Layer */}
      <View style={[
        styles.cardContent,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        variant === 'outlined' && { backgroundColor: 'transparent' }
      ]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginRight: 4,
  },
  shadowLayer: {
    ...StyleSheet.absoluteFill,
    borderRadius: 16, // Squircle-like
    top: 4,
    left: 4,
    borderWidth: 2,
  },
  cardContent: {
    borderWidth: 2,
    padding: 16,
    borderRadius: 16, // Match shadow layer
    minHeight: 50, 
  }
});
