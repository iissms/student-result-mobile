import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { ShieldCheck, BarChart3, BellRing } from 'lucide-react-native';

const HIGHLIGHTS = [
  {
    key: 'secure',
    title: 'Secure Access',
    description: 'Enterprise-grade protection keeps student data safe and private.',
    icon: ShieldCheck,
  },
  {
    key: 'insights',
    title: 'Actionable Insights',
    description: 'Visualize performance trends to celebrate wins and close gaps.',
    icon: BarChart3,
  },
  {
    key: 'alerts',
    title: 'Smart Alerts',
    description: 'Get notified instantly about new scores and attendance updates.',
    icon: BellRing,
  },
];

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
      colors={[COLORS.primary[900], COLORS.primary[700]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
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
            <View style={styles.heroContainer}>
              <ImageBackground
                source={{
                  uri: 'https://images.pexels.com/photos/3059741/pexels-photo-3059741.jpeg?auto=compress&cs=tinysrgb&w=1600',
                }}
                style={styles.heroBackground}
                imageStyle={styles.heroImage}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={['rgba(12, 71, 161, 0.88)', 'rgba(28, 109, 208, 0.92)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroOverlay}
                >
                  <View style={styles.brandBadge}>
                    <Text style={styles.brandBadgeText}>Academic Insights</Text>
                  </View>
                  <Text style={styles.heroTitle}>Welcome Back!</Text>
                  <Text style={styles.heroSubtitle}>
                    Monitor results, celebrate achievements, and empower continuous growth with a modern academic dashboard.
                  </Text>

                  <View style={styles.highlightsGrid}>
                    {HIGHLIGHTS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <View key={item.key} style={styles.highlightCard}>
                          <View style={styles.highlightIconWrapper}>
                            <Icon size={18} color={COLORS.primary[50]} />
                          </View>
                          <View style={styles.highlightTextWrapper}>
                            <Text style={styles.highlightTitle}>{item.title}</Text>
                            <Text style={styles.highlightDescription}>{item.description}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </LinearGradient>
              </ImageBackground>
            </View>

            <View style={styles.formWrapper}>
              <Text style={styles.welcomeTitle}>Sign in to your account</Text>
              <Text style={styles.welcomeSubtitle}>
                Access detailed analytics, progress reports, and personalized recommendations.
              </Text>
              <LoginForm />
              <View style={styles.supportContainer}>
                <Text style={styles.supportHeading}>Need assistance?</Text>
                <Text style={styles.supportText}>
                  Contact your institution administrator if you don&apos;t remember your credentials.
                </Text>
              </View>
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
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  heroContainer: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: SPACING.xl,
  },
  heroBackground: {
    width: '100%',
    minHeight: 280,
    justifyContent: 'flex-end',
  },
  heroImage: {
    opacity: 0.45,
  },
  heroOverlay: {
    padding: SPACING.xl,
  },
  brandBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  brandBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    letterSpacing: 0.5,
    color: COLORS.gray[50],
  },
  heroTitle: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.86)',
    marginBottom: SPACING.lg,
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 16,
    padding: SPACING.sm,
    width: '48%',
    marginBottom: SPACING.sm,
  },
  highlightIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  highlightTextWrapper: {
    flex: 1,
  },
  highlightTitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[50],
    marginBottom: 2,
  },
  highlightDescription: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.72)',
  },
  formWrapper: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 28,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    ...Platform.select({
      ios: {
        shadowColor: '#0B2A5B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
      web: {
        shadowColor: '#0B2A5B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
    }),
  },
  welcomeTitle: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  supportContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: 16,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  supportHeading: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[800],
    marginBottom: 4,
  },
  supportText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: COLORS.gray[600],
  },
});