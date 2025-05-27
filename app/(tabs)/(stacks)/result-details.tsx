import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { mockResults } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Card from '@/components/ui/Card';
import SubjectGradeList from '@/components/results/SubjectGradeList';
import { getGradeColor, formatDate, getSubjectWithHighestMarks, getSubjectWithLowestMarks } from '@/utils/helpers';
import { Award, Calendar, FileText, Clock, School, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function ResultDetailsScreen() {
  const { resultId } = useLocalSearchParams<{ resultId: string }>();
  
  const result = mockResults.find(r => r.id === resultId);
  
  if (!result) {
    return (
      <View style={styles.container}>
        <Header title="Result Details" showBackButton />
        <View style={styles.notFoundContainer}>
          <AlertTriangle size={48} color={COLORS.error[500]} />
          <Text style={styles.notFoundText}>Result not found</Text>
        </View>
      </View>
    );
  }
  
  const bestSubject = getSubjectWithHighestMarks(result.subjects);
  const weakestSubject = getSubjectWithLowestMarks(result.subjects);
  
  return (
    <View style={styles.container}>
      <Header title="Result Details" showBackButton />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <Text style={styles.examName}>{result.examName}</Text>
          <Text style={styles.examTerm}>{result.term}</Text>
          
          <View style={styles.gradeContainer}>
            <View style={styles.gradeCircle}>
              <Text style={[styles.grade, { color: getGradeColor(result.grade) }]}>
                {result.grade}
              </Text>
            </View>
            <View style={styles.percentageContainer}>
              <Text style={styles.percentageValue}>{result.percentage}%</Text>
              <Text style={styles.percentageLabel}>Overall Score</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Calendar size={16} color={COLORS.gray[500]} />
              <Text style={styles.infoText}>
                Exam Date: {formatDate(result.examDate)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <FileText size={16} color={COLORS.gray[500]} />
              <Text style={styles.infoText}>
                Released: {formatDate(result.releaseDate)}
              </Text>
            </View>
          </View>
          
          {result.rank && (
            <View style={styles.rankContainer}>
              <Award size={20} color={COLORS.primary[500]} />
              <Text style={styles.rankText}>
                Class Rank: <Text style={styles.rankValue}>{result.rank}</Text>
              </Text>
            </View>
          )}
        </Card>
        
        <View style={styles.subjectSection}>
          <Text style={styles.sectionTitle}>Subject Breakdown</Text>
          <SubjectGradeList subjects={result.subjects} />
        </View>
        
        <Card style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Performance Analytics</Text>
          
          <View style={styles.analyticsItem}>
            <View style={styles.analyticsIcon}>
              <Award size={20} color={COLORS.accent[500]} />
            </View>
            <View style={styles.analyticsContent}>
              <Text style={styles.analyticsItemTitle}>Strongest Subject</Text>
              <Text style={styles.analyticsSubject}>{bestSubject.subjectName}</Text>
              <Text style={styles.analyticsScore}>
                Score: {bestSubject.percentage}% (Grade {bestSubject.grade})
              </Text>
            </View>
          </View>
          
          <View style={styles.analyticsItem}>
            <View style={styles.analyticsIcon}>
              <AlertTriangle size={20} color={COLORS.error[500]} />
            </View>
            <View style={styles.analyticsContent}>
              <Text style={styles.analyticsItemTitle}>Area for Improvement</Text>
              <Text style={styles.analyticsSubject}>{weakestSubject.subjectName}</Text>
              <Text style={styles.analyticsScore}>
                Score: {weakestSubject.percentage}% (Grade {weakestSubject.grade})
              </Text>
            </View>
          </View>
          
          <View style={styles.analyticsItem}>
            <View style={styles.analyticsIcon}>
              <School size={20} color={COLORS.primary[500]} />
            </View>
            <View style={styles.analyticsContent}>
              <Text style={styles.analyticsItemTitle}>Overall Performance</Text>
              <Text style={styles.analyticsDescription}>
                You scored {result.percentage}% overall with a grade of {result.grade}, 
                which is {result.percentage > 75 ? 'above' : 'below'} the average.
              </Text>
            </View>
          </View>
          
          <View style={styles.analyticsItem}>
            <View style={styles.analyticsIcon}>
              <Clock size={20} color={COLORS.primary[500]} />
            </View>
            <View style={styles.analyticsContent}>
              <Text style={styles.analyticsItemTitle}>Performance Over Time</Text>
              <Text style={styles.analyticsDescription}>
                Your performance has improved by 5% compared to the last examination.
              </Text>
            </View>
          </View>
        </Card>
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
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  headerCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  examName: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.gray[900],
    textAlign: 'center',
  },
  examTerm: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.md,
  },
  gradeCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  grade: {
    fontFamily: FONTS.bold,
    fontSize: 30,
  },
  percentageContainer: {
    alignItems: 'flex-start',
  },
  percentageValue: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.gray[900],
  },
  percentageLabel: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[600],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[700],
    marginLeft: SPACING.xs,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[50],
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 16,
    marginTop: SPACING.md,
  },
  rankText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.primary[700],
    marginLeft: SPACING.xs,
  },
  rankValue: {
    fontFamily: FONTS.bold,
  },
  subjectSection: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  analyticsCard: {
    marginVertical: SPACING.md,
  },
  analyticsTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  analyticsItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  analyticsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  analyticsContent: {
    flex: 1,
  },
  analyticsItemTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  analyticsSubject: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.gray[800],
    marginBottom: 2,
  },
  analyticsScore: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[600],
  },
  analyticsDescription: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[700],
    lineHeight: 20,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: COLORS.gray[800],
    marginTop: SPACING.md,
  },
});