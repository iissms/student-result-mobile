import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, ChevronRight } from 'lucide-react-native';

import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { useAuth } from '@/contexts/AuthContext';
import { mockPerformanceTrends, classAverages, subjectPerformance } from '@/utils/mockData';
import ResultsSummary from '@/components/dashboard/ResultsSummary';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import SubjectPerformance from '@/components/dashboard/SubjectPerformance';
import Header from '@/components/shared/Header';
import Card from '@/components/ui/Card';

export interface Result {
  id: string;
  studentId: string;
  examName: string;
  examDate: string;
  term: string;
  academicYear: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  rank?: number;
  subjects: {
    subjectId: string;
    subjectName: string;
    maxMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string;
  }[];
  releaseDate: string;
}

export interface ApiSubjectDetail {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  type: string;
  marks_obtained: number;
}

export interface ApiExamResult {
  exam_id: number;
  name: string;
  start_date: string;
  end_date: string;
  marks: number;
  min_marks: number;
  status: string;
  class_id: number;
  subjects: ApiSubjectDetail[];
}

export interface StudentResultsApiResponse {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  results: ApiExamResult[];
}

const UPCOMING_EVENTS = [
  { id: 'finals', title: 'Final examinations', date: 'Starts May 15, 2024' },
  { id: 'ptm', title: 'Parent & teacher check-in', date: 'May 20, 2024' },
  { id: 'sports', title: 'Inter-house athletics day', date: 'June 02, 2024' },
];

export default function Dashboard() {
  const router = useRouter();
  const { authState } = useAuth();

  const [latestResult, setLatestResult] = useState<Result | null>(null);
  const [loadingResults, setLoadingResults] = useState(true);
  const [errorResults, setErrorResults] = useState<string | null>(null);

  const studentId = authState.user?.studentId ?? '11';

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  const fetchAndProcessStudentResults = useCallback(async () => {
    setLoadingResults(true);
    setErrorResults(null);

    try {
      if (!authState.user?.token) {
        throw new Error('No authentication token found');
      }

      const page = 1;
      const limit = 1;

      const response = await fetch(
        `http://194.238.23.60:5007/api/results/student?page=${page}&limit=${limit}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authState.user.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StudentResultsApiResponse = await response.json();

      if (data.results.length === 0) {
        setLatestResult(null);
        return;
      }

      const sortedExams = [...data.results].sort((a, b) => b.exam_id - a.exam_id);
      const latestExam = sortedExams[0];

      let totalObtainedMarks = 0;
      const totalMaxMarks = latestExam.marks;
      const assumedMaxPerSubject =
        latestExam.subjects.length > 0 ? latestExam.marks / latestExam.subjects.length : 100;

      const subjectsForSummary = latestExam.subjects.map(subjectApiData => {
        totalObtainedMarks += subjectApiData.marks_obtained;
        const maxMarksForDisplay = Math.max(
          assumedMaxPerSubject,
          subjectApiData.marks_obtained,
        );
        const subjectPercentage = maxMarksForDisplay
          ? (subjectApiData.marks_obtained / maxMarksForDisplay) * 100
          : 0;

        return {
          subjectId: String(subjectApiData.subject_id),
          subjectName: subjectApiData.subject_name,
          maxMarks: maxMarksForDisplay,
          obtainedMarks: subjectApiData.marks_obtained,
          percentage: subjectPercentage,
          grade: calculateGrade(subjectPercentage),
        };
      });

      const overallPercentage = totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0;

      const transformedResult: Result = {
        id: `exam-${latestExam.exam_id}-${studentId}`,
        studentId,
        examName: latestExam.name,
        examDate: latestExam.start_date,
        term: 'Latest Term',
        academicYear: '2024-2025',
        totalMarks: totalMaxMarks,
        obtainedMarks: totalObtainedMarks,
        percentage: overallPercentage,
        grade: calculateGrade(overallPercentage),
        subjects: subjectsForSummary,
        releaseDate: latestExam.end_date ?? '',
      };

      setLatestResult(transformedResult);
    } catch (error) {
      console.error('Failed to fetch student results:', error);
      setErrorResults('Failed to load results. Please try again later.');
    } finally {
      setLoadingResults(false);
    }
  }, [authState.user?.token, studentId]);

  useEffect(() => {
    if (!authState.user) {
      router.replace('/');
      return;
    }

    fetchAndProcessStudentResults();
  }, [authState.user, fetchAndProcessStudentResults, router]);

  const firstName = authState.user?.name?.split(' ')[0] ?? 'there';
  const avatarUrl = authState.user?.avatar;
  const avatarInitials = useMemo(() => {
    if (!authState.user?.name) {
      return 'ST';
    }

    return authState.user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('');
  }, [authState.user?.name]);

  const quickStats = useMemo(
    () => [
      {
        label: 'Overall score',
        value: latestResult ? `${Math.round(latestResult.percentage)}%` : '--',
      },
      {
        label: 'Grade',
        value: latestResult ? latestResult.grade : '--',
      },
      {
        label: 'Subjects tracked',
        value: latestResult ? `${latestResult.subjects.length}` : '--',
      },
    ],
    [latestResult],
  );

  if (!authState.user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Dashboard" showNotification showSettings />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[COLORS.primary[600], COLORS.primary[500], COLORS.primary[400]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <View style={styles.heroTextGroup}>
              <Text style={styles.heroGreeting}>Welcome back,</Text>
              <Text style={styles.heroName}>{firstName}</Text>
              <Text style={styles.heroSubtitle}>
                Here’s a quick overview of your current academic performance.
              </Text>
            </View>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.heroAvatar} />
            ) : (
              <View style={styles.heroAvatarFallback}>
                <Text style={styles.heroAvatarFallbackText}>{avatarInitials}</Text>
              </View>
            )}
          </View>

          <View style={styles.statRow}>
            {quickStats.map((stat, index) => (
              <View
                key={stat.label}
                style={[styles.statCard, index !== quickStats.length - 1 && styles.statCardSpacing]}
              >
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest result</Text>
            <TouchableOpacity
              style={styles.sectionAction}
              onPress={() => router.push('/(tabs)/results')}
            >
              <Text style={styles.sectionActionText}>See all</Text>
              <ChevronRight size={16} color={COLORS.primary[500]} style={styles.sectionActionIcon} />
            </TouchableOpacity>
          </View>

          <Card padding="large" style={styles.sectionCard}>
            {loadingResults ? (
              <ActivityIndicator size="large" color={COLORS.primary[500]} style={styles.loader} />
            ) : errorResults ? (
              <Text style={styles.stateText}>{errorResults}</Text>
            ) : latestResult ? (
              <ResultsSummary result={latestResult} />
            ) : (
              <Text style={styles.stateText}>No results available just yet.</Text>
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance overview</Text>
          <Card padding="large" style={styles.sectionCard}>
            <PerformanceChart
              data={mockPerformanceTrends}
              classAverages={classAverages}
              title=""
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject performance</Text>
          <Card padding="large" style={styles.sectionCard}>
            <SubjectPerformance data={subjectPerformance} showTitle={false} />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming events</Text>
          <Card padding="large" style={styles.sectionCard}>
            {UPCOMING_EVENTS.map((event, index) => (
              <View
                key={event.id}
                style={[styles.eventRow, index !== UPCOMING_EVENTS.length - 1 && styles.eventRowDivider]}
              >
                <View style={styles.eventContent}>
                  <View style={styles.eventIcon}>
                    <Calendar size={18} color={COLORS.primary[500]} />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>{event.date}</Text>
                  </View>
                </View>
                <ChevronRight size={16} color={COLORS.gray[400]} />
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.md,
  },
  heroCard: {
    borderRadius: 24,
    padding: SPACING.lg,
    shadowColor: '#1D1C1D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: SPACING.xl,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  heroTextGroup: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  heroGreeting: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  heroName: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.gray[50],
  },
  heroSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.82)',
    marginTop: SPACING.xs,
  },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  heroAvatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
  },
  heroAvatarFallbackText: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.gray[50],
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 96,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  statCardSpacing: {
    marginRight: SPACING.sm,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[50],
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 4,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary[500],
  },
  sectionActionIcon: {
    marginLeft: SPACING.xs,
  },
  sectionCard: {
    marginTop: SPACING.md,
  },
  loader: {
    alignSelf: 'center',
    marginVertical: SPACING.sm,
  },
  stateText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  eventRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.gray[900],
  },
  eventDate: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[600],
    marginTop: 2,
  },
});
