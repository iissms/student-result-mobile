import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CircleAlert as AlertCircle } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '@/utils/constants';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <AlertCircle size={48} color={COLORS.error[500]} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.error[50],
    borderRadius: 8,
    margin: SPACING.md,
  },
  message: {
    marginTop: SPACING.sm,
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[800],
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary[500],
    borderRadius: 8,
  },
  retryText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#FFFFFF',
  },
});