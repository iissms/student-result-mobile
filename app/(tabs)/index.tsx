import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { useAuth } from '@/contexts/AuthContext';
import { mockResults, mockPerformanceTrends, classAverages, subjectPerformance } from '@/utils/mockData';
import ResultsSummary from '@/components/dashboard/ResultsSummary';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import SubjectPerformance from '@/components/dashboard/SubjectPerformance';
import Header from '@/components/shared/Header';
import { ChevronRight, Calendar, Bell } from 'lucide-react-native';

export default function Dashboard() {
  const router = useRouter();
  const { authState } = useAuth();
  
  useEffect(() => {
    if (!authState.user) {
      router.replace('/');
    }
  }, [authState.user, router]);

  if (!authState.user) {
    return null;
  }

  const latestResult = mockResults[mockResults.length - 1];
  
  return (
    <View style={styles.container}>
      <Header 
        title="Dashboard" 
        showNotification 
        showSettings
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greeting}>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.userName}>{authState.user.name}</Text>
          </View>
          <Image 
            source={{ uri: authState.user.avatar }} 
            style={styles.avatar} 
          />
        </View>
        
        <View style={styles.cardSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Result</Text>
            <TouchableOpacity 
              style={styles.viewAll}
              onPress={() => router.push('/(tabs)/results')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={COLORS.primary[500]} />
            </TouchableOpacity>
          </View>
          
          <ResultsSummary result={latestResult} />
        </View>
        
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Performance Trends</Text>
          <PerformanceChart 
            data={mockPerformanceTrends} 
            classAverages={classAverages}
          />
        </View>
        
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Subject Performance</Text>
          <SubjectPerformance data={subjectPerformance} />
        </View>
        
        <View style={styles.announcements}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
          </View>
          
          <TouchableOpacity style={styles.eventCard}>
            <Calendar size={24} color={COLORS.primary[500]} />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>Final Examination</Text>
              <Text style={styles.eventDate}>Starts on May 15, 2024</Text>
            </View>
            <Bell size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.eventCard}>
            <Calendar size={24} color={COLORS.primary[500]} />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>Parent-Teacher Meeting</Text>
              <Text style={styles.eventDate}>May 20, 2024</Text>
            </View>
            <Bell size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  welcome: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray[600],
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.gray[900],
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.primary[500],
  },
  cardSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary[500],
  },
  announcements: {
    marginBottom: SPACING.lg,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  eventInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  eventTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  eventDate: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[600],
    marginTop: 2,
  },
});