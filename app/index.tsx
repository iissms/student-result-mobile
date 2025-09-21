import React, { useEffect } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import LoadingScreen from '@/components/shared/LoadingScreen';

export default function AuthScreen() {
  const { authState, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  if (authState.isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <LinearGradient
      colors={[COLORS.primary[900], COLORS.primary[800], COLORS.primary[50]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={styles.headerCard}>
              <Text style={styles.headerTitle}>Sign in to your account</Text>
              <Text style={styles.headerSubtitle}>
                Access detailed analytics, progress reports, and personalized recommendations in one place.
              </Text>
            </View>

            <LoginForm />

            <View style={styles.footerCard}>
              <Text style={styles.footerTitle}>Having trouble signing in?</Text>
              <Text style={styles.footerText}>
                Reach out to your institution administrator to reset your credentials or request access.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: COLORS.primary[900],
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  headerCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.gray[50],
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  footerCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  footerTitle: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.gray[800],
    textAlign: 'center',
    marginBottom: 4,
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
});