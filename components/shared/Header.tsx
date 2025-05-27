import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Settings } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showNotification?: boolean;
  showSettings?: boolean;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
}

export default function Header({
  title,
  showBackButton = false,
  showNotification = false,
  showSettings = false,
  onNotificationPress,
  onSettingsPress,
}: HeaderProps) {
  const router = useRouter();
  const { authState } = useAuth();
  
  const handleBackPress = () => {
    router.back();
  };
  
  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    }
  };
  
  const handleSettingsPress = () => {
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      router.push('/settings');
    }
  };
  
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
              <ArrowLeft size={24} color={COLORS.gray[800]} />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.rightContainer}>
          {showNotification && (
            <TouchableOpacity onPress={handleNotificationPress} style={styles.iconButton}>
              <Bell size={24} color={COLORS.gray[800]} />
            </TouchableOpacity>
          )}
          {showSettings && (
            <TouchableOpacity onPress={handleSettingsPress} style={styles.iconButton}>
              <Settings size={24} color={COLORS.gray[800]} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'ios' ? 44 : 56,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 80,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: COLORS.gray[900],
    textAlign: 'center',
  },
  iconButton: {
    padding: SPACING.xs,
  },
});