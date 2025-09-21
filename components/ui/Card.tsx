import React from 'react';
import { View, ViewStyle } from 'react-native';
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
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: '#FFFFFF',
    };

    // Variant styles
    switch (variant) {
      case 'elevated':
        cardStyle = {
          ...cardStyle,
          borderWidth: 1,
          borderColor: 'rgba(15, 23, 42, 0.06)',
          shadowColor: '#101828',
          shadowOffset: {
            width: 0,
            height: 12,
          },
          shadowOpacity: 0.08,
          shadowRadius: 20,
          elevation: 4,
        };
        break;
      case 'outlined':
        cardStyle = {
          ...cardStyle,
          borderWidth: 1,
          borderColor: COLORS.gray[200],
        };
        break;
      case 'filled':
        cardStyle = {
          ...cardStyle,
          backgroundColor: COLORS.gray[50],
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
