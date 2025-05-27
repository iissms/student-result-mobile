import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/utils/constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export default function Card({
  children,
  style,
  variant = 'elevated',
  padding = 'medium',
}: CardProps) {
  const getCardStyles = (): ViewStyle => {
    let cardStyle: ViewStyle = {
      borderRadius: BORDER_RADIUS.md,
    };
    
    // Variant styles
    switch (variant) {
      case 'elevated':
        cardStyle = {
          ...cardStyle,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
        break;
      case 'outlined':
        cardStyle = {
          ...cardStyle,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: COLORS.gray[300],
        };
        break;
      case 'filled':
        cardStyle = {
          ...cardStyle,
          backgroundColor: COLORS.gray[100],
        };
        break;
    }
    
    // Padding styles
    switch (padding) {
      case 'none':
        break;
      case 'small':
        cardStyle = {
          ...cardStyle,
          padding: SPACING.sm,
        };
        break;
      case 'medium':
        cardStyle = {
          ...cardStyle,
          padding: SPACING.md,
        };
        break;
      case 'large':
        cardStyle = {
          ...cardStyle,
          padding: SPACING.lg,
        };
        break;
    }
    
    return cardStyle;
  };
  
  return (
    <View style={[getCardStyles(), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#FFFFFF',
  },
});