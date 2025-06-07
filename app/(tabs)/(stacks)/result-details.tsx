import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import Header from '@/components/shared/Header';
import Card from '@/components/ui/Card';
import { Award, Calendar, FileText, Clock, School, TriangleAlert as AlertTriangle } from 'lucide-react-native';

// Helper Functions
const getGradeFromPercentage = (percent: number): string => {
  if (percent >= 90) return 'A+';
  if (percent >= 80) return 'A';
  if (percent >= 70) return 'B+';
  if (percent >= 60) return 'B';
  if (percent >= 50) return 'C';
  if (percent >= 35) return 'D';
  return 'F';
};

const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'A+':
    case 'A':
      return COLORS.primary[500];
    case 'B+':
    case 'B':
      return COLORS.primary[500];
    case 'C':
      return COLORS.warning[500];
    case 'D':
      return COLORS.warning[500];
    default:
      return COLORS.error[500];
  }
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default function ResultDetailsScreen() {
  const { exam: examString } = useLocalSearchParams<{ exam: string }>();

  if (!examString) {
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

  // Parse the exam details
  const exam = JSON.parse(decodeURIComponent(examString));

  const obtainedMarks = exam.subjects.reduce((sum: number, sub: any) => sum + sub.marks_obtained, 0);
  const totalMarks = exam.marks || 100;
  const percentage = Math.round((obtainedMarks / totalMarks) * 100);
  const grade = getGradeFromPercentage(percentage);

  // Find strongest and weakest subject
  const bestSubject = exam.subjects.reduce((prev: any, current: any) => (prev.marks_obtained > current.marks_obtained ? prev : current));
  const weakestSubject = exam.subjects.reduce((prev: any, current: any) => (prev.marks_obtained < current.marks_obtained ? prev : current));

  return (
    <View style={styles.container}>
      <Header title="Result Details" showBackButton />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <Text style={styles.examName}>{exam.name}</Text>
          <Text style={styles.examTerm}>{exam.status}</Text>

          <View style={styles.gradeContainer}>
            <View style={styles.gradeCircle}>
              <Text style={[styles.grade, { color: getGradeColor(grade) }]}>
                {grade}
              </Text>
            </View>
            <View style={styles.percentageContainer}>
              <Text style={styles.percentageValue}>{percentage}%</Text>
              <Text style={styles.percentageLabel}>Overall Score</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Calendar size={16} color={COLORS.gray[500]} />
              <Text style={styles.infoText}>Exam Date: {formatDate(exam.start_date)}</Text>
            </View>
            <View style={styles.infoItem}>
              <FileText size={16} color={COLORS.gray[500]} />
              <Text style={styles.infoText}>End Date: {formatDate(exam.end_date)}</Text>
            </View>
          </View>
        </Card>

        {/* Subject Breakdown */}
        <View style={styles.subjectSection}>
          <Text style={styles.sectionTitle}>Subject Breakdown</Text>
          {exam.subjects.map((subject: any) => {
            const subjectPercentage = Math.round((subject.marks_obtained / exam.marks) * 100);
            const subjectGrade = getGradeFromPercentage(subjectPercentage);
            return (
              <View key={subject.subject_id} style={styles.subjectRow}>
                <View>
                  <Text style={styles.subjectName}>{subject.subject_name}</Text>
                  <Text style={styles.subjectType}>{subject.type}</Text>
                </View>
                <View style={styles.subjectMarksContainer}>
                  <Text style={styles.subjectMarks}>
                    {subject.marks_obtained} / {exam.marks}
                  </Text>
                  <Text style={[styles.subjectGrade, { color: getGradeColor(subjectGrade) }]}>{subjectGrade}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Analytics */}
        <Card style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Performance Analytics</Text>

          <View style={styles.analyticsItem}>
            <View style={styles.analyticsIcon}>
              <Award size={20} color={COLORS.accent[500]} />
            </View>
            <View style={styles.analyticsContent}>
              <Text style={styles.analyticsItemTitle}>Strongest Subject</Text>
              <Text style={styles.analyticsSubject}>{bestSubject.subject_name}</Text>
              <Text style={styles.analyticsScore}>
                Score: {bestSubject.marks_obtained}/{exam.marks} ({getGradeFromPercentage(Math.round((bestSubject.marks_obtained / exam.marks) * 100))})
              </Text>
            </View>
          </View>

          <View style={styles.analyticsItem}>
            <View style={styles.analyticsIcon}>
              <AlertTriangle size={20} color={COLORS.error[500]} />
            </View>
            <View style={styles.analyticsContent}>
              <Text style={styles.analyticsItemTitle}>Area for Improvement</Text>
              <Text style={styles.analyticsSubject}>{weakestSubject.subject_name}</Text>
              <Text style={styles.analyticsScore}>
                Score: {weakestSubject.marks_obtained}/{exam.marks} ({getGradeFromPercentage(Math.round((weakestSubject.marks_obtained / exam.marks) * 100))})
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
                You scored {percentage}% overall with a grade of {grade},
                which is {percentage > 75 ? 'above' : 'below'} the average.
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
                Your performance has improved compared to the last examination.
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
  subjectSection: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  subjectName: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  subjectType: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[600],
  },
  subjectMarksContainer: {
    alignItems: 'flex-end',
  },
  subjectMarks: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[800],
  },
  subjectGrade: {
    fontFamily: FONTS.bold,
    fontSize: 14,
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
