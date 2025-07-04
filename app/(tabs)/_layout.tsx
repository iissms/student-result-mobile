import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { COLORS, FONTS } from '@/utils/constants';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutGrid as LayoutGroup, Chrome as Home, ChartLine as LineChart, User } from 'lucide-react-native';

export default function TabLayout() {
  const { authState } = useAuth();

  if (!authState.user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary[500],
        tabBarInactiveTintColor: COLORS.gray[500],
        tabBarStyle: {
          borderTopWidth: 1,
          borderColor: COLORS.gray[200],
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: 12,
          marginBottom: Platform.OS === 'ios' ? 0 : 10,
        },
        headerShown: false, // ✅ Enable header if needed
        headerTitleStyle: {
          fontFamily: FONTS.medium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          tabBarIcon: ({ color, size }) => (
            <LayoutGroup size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
          tabBarIcon: ({ color, size }) => (
            <LineChart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
