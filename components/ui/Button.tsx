import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { COLORS, BORDER_RADIUS, FONTS, SPACING } from '@/utils/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  
  const getButtonStyles = (): ViewStyle => {
    let buttonStyle: ViewStyle = {};
    
    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyle = {
          backgroundColor: COLORS.primary[500],
        };
        break;
      case 'secondary':
        buttonStyle = {
          backgroundColor: COLORS.accent[500],
        };
        break;
      case 'outline':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: COLORS.primary[500],
        };
        break;
      case 'text':
        buttonStyle = {
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
        };
        break;
    }
    
    // Size styles
    switch (size) {
      case 'small':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: SPACING.xs,
          paddingHorizontal: SPACING.sm,
          borderRadius: BORDER_RADIUS.sm,
        };
        break;
      case 'medium':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
          borderRadius: BORDER_RADIUS.md,
        };
        break;
      case 'large':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          borderRadius: BORDER_RADIUS.md,
        };
        break;
    }
    
    // Disabled state
    if (disabled) {
      buttonStyle = {
        ...buttonStyle,
        opacity: 0.5,
      };
    }
    
    // Full width
    if (fullWidth) {
      buttonStyle = {
        ...buttonStyle,
        width: '100%',
      };
    }
    
    return buttonStyle;
  };
  
  const getTextStyles = (): TextStyle => {
    let styles: TextStyle = {
      fontFamily: FONTS.medium,
      textAlign: 'center',
    };
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        styles = {
          ...styles,
          color: '#FFFFFF',
        };
        break;
      case 'outline':
      case 'text':
        styles = {
          ...styles,
          color: COLORS.primary[500],
        };
        break;
    }
    
    switch (size) {
      case 'small':
        styles = {
          ...styles,
          fontSize: 14,
        };
        break;
      case 'medium':
        styles = {
          ...styles,
          fontSize: 16,
        };
        break;
      case 'large':
        styles = {
          ...styles,
          fontSize: 18,
        };
        break;
    }
    
    return styles;
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getButtonStyles(),
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'secondary' ? 'white' : COLORS.primary[500]} 
        />
      ) : (
        <>
          {leftIcon && <Text style={styles.iconLeft}>{leftIcon}</Text>}
          <Text style={[getTextStyles(), textStyle]}>{title}</Text>
          {rightIcon && <Text style={styles.iconRight}>{rightIcon}</Text>}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  iconLeft: {
    marginRight: SPACING.xs,
  },
  iconRight: {
    marginLeft: SPACING.xs,
  },
});