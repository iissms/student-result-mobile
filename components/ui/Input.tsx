import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  Platform,
  TouchableOpacity
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '@/utils/constants';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  helperText?: string;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
  autoCompleteType?: string;
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  helperText,
  disabled = false,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  multiline = false,
  numberOfLines = 1,
  autoCompleteType,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const renderPasswordToggle = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity 
          onPress={togglePasswordVisibility} 
          style={styles.iconRight}
        >
          {isPasswordVisible ? 
            <EyeOff size={20} color={COLORS.gray[500]} /> : 
            <Eye size={20} color={COLORS.gray[500]} />
          }
        </TouchableOpacity>
      );
    }
    return null;
  };
  
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        disabled && styles.inputContainerDisabled,
      ]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          placeholderTextColor={COLORS.gray[400]}
          autoComplete={
            Platform.OS === 'web' 
              ? autoCompleteType as any 
              : undefined
          }
          {...rest}
        />
        {renderPasswordToggle() || (rightIcon && <View style={styles.iconRight}>{rightIcon}</View>)}
      </View>
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    marginBottom: SPACING.xs,
    color: COLORS.gray[800],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#FFFFFF',
  },
  inputContainerFocused: {
    borderColor: COLORS.primary[500],
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainerError: {
    borderColor: COLORS.error[500],
  },
  inputContainerDisabled: {
    backgroundColor: COLORS.gray[100],
    borderColor: COLORS.gray[300],
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  inputWithLeftIcon: {
    paddingLeft: SPACING.xs,
  },
  inputWithRightIcon: {
    paddingRight: SPACING.xs,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  iconLeft: {
    paddingLeft: SPACING.sm,
  },
  iconRight: {
    paddingRight: SPACING.sm,
  },
  helperText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: SPACING.xs,
    color: COLORS.gray[600],
  },
  errorText: {
    color: COLORS.error[500],
  },
});