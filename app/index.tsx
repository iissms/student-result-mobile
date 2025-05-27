import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.container}>
          <View style={styles.topSection}>
            <Image
              source={{ 
                uri: 'https://images.pexels.com/photos/2173508/pexels-photo-2173508.jpeg?auto=compress&cs=tinysrgb&w=600' 
              }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <Text style={styles.logo}>Academic Insights</Text>
              <Text style={styles.tagline}>Track, Analyze, Improve</Text>
            </View>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <LoginForm />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    height: '35%',
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: '#FFFFFF',
  },
  contentSection: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    backgroundColor: '#FFFFFF',
  },
  welcomeTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.gray[900],
    marginBottom: SPACING.lg,
  },
});