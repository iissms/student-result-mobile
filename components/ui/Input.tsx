import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TextInputProps,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native'; // Assuming you use lucide-react-native for icons
import { COLORS, FONTS, SPACING } from '@/utils/constants'; // Adjust path as needed

interface InputProps extends TextInputProps {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string | null;
  containerStyle?: object;
}

const Input: React.FC<InputProps> = ({
  label,
  leftIcon,
  rightIcon,
  error,
  secureTextEntry,
  containerStyle,
  ...rest
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const showSecureTextEntryToggle = secureTextEntry && !rightIcon;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        error && styles.inputWrapperError
      ]}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            showSecureTextEntryToggle && styles.inputWithRightIcon // Adjust if using internal toggle
          ]}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          placeholderTextColor={COLORS.gray[400]}
          {...rest}
        />
        {showSecureTextEntryToggle ? (
          <TouchableOpacity 
            onPress={togglePasswordVisibility} 
            style={styles.rightIconContainer}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={COLORS.gray[400]} />
            ) : (
              <Eye size={20} color={COLORS.gray[400]} />
            )}
          </TouchableOpacity>
        ) : (
          rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    paddingHorizontal: SPACING.sm,
    height: 50, // Standard height for input fields
  },
  inputWrapperError: {
    borderColor: COLORS.error[500],
  },
  leftIconContainer: {
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray[900],
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : 0, // Adjust padding for iOS
  },
  inputWithLeftIcon: {
    paddingLeft: 0, // Remove default padding if left icon is present
  },
  rightIconContainer: {
    marginLeft: SPACING.xs,
    padding: SPACING.xs, // Add padding to make the touch target larger for icons
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.error[500],
    marginTop: SPACING.xs,
  },
});

export default Input;