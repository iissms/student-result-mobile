import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  Award,
  Calendar,
  FileText,
  Clock,
  BookOpen,
  TrendingUp,
  School,
  TriangleAlert as AlertTriangle,
} from 'lucide-react-native';

import Header from '@/components/shared/Header';
import Card from '@/components/ui/Card';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import {
  calculatePercentage,
  formatDate,
  getGradeColor,
  getGradeFromPercentage,
  withAlpha,
} from '@/utils/helpers';

interface Subject {
  subject_id: number;
  subject_name: string;
  subject_code?: string;
  type?: string;
  marks_obtained: number;
  max_marks?: number;
  marks?: number;
}

interface Exam {
  exam_id: number;
  name: string;
  start_date?: string;
  end_date?: string;
  marks?: number;
  min_marks?: number;
  status?: string;
  class_id?: number;
  term?: string;
  subjects?: Subject[];
}

type SubjectStat = Subject & {
  maxMarks: number;
  percentage: number;
  grade: string;
};

const formatStatus = (status?: string) => {
  if (!status) {
    return 'Pending';
  }

  return status
    .toString()
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const formatNumberValue = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0';
  }

  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
};

const safeFormatDate = (value?: string) => {
  if (!value) {
    return 'Not available';
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return 'Not available';
  }

  return formatDate(value);
};

const getDurationLabel = (start?: string, end?: string) => {
  if (!start) {
    return '—';
  }

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : startDate;

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return '—';
  }

  if (endDate.getTime() <= startDate.getTime()) {
    return '1 day';
  }

  const diffMs = endDate.getTime() - startDate.getTime();
  const totalDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);

  return `${totalDays} day${totalDays > 1 ? 's' : ''}`;
};

export default function ResultDetailsScreen() {
  const params = useLocalSearchParams<{ exam?: string | string[] }>();
  const examParamRaw = params.exam;
  const examParam = Array.isArray(examParamRaw) ? examParamRaw[0] : examParamRaw;

  if (!examParam) {
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

  let exam: Exam | null = null;

  try {
    exam = JSON.parse(decodeURIComponent(examParam));
  } catch (error) {
    exam = null;
  }

  if (!exam) {
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

  const subjects = Array.isArray(exam.subjects) ? exam.subjects : [];

  const declaredTotal = Number(exam.marks ?? 0);
  const fallbackTotal = declaredTotal > 0 ? declaredTotal : Math.max(subjects.length, 1) * 100;
  const totalMarks = fallbackTotal > 0 ? fallbackTotal : 0;

  const obtainedMarks = subjects.reduce((sum, subject) => {
    const marks = Number(subject.marks_obtained ?? 0);
    return sum + (Number.isFinite(marks) ? marks : 0);
  }, 0);

  const percentage = totalMarks > 0 ? calculatePercentage(obtainedMarks, totalMarks) : 0;
  const grade = getGradeFromPercentage(percentage);
  const gradeColor = getGradeColor(grade);
  const statusLabel = formatStatus(exam.status);

  const subjectStats: SubjectStat[] = useMemo(
    () =>
      subjects.map(subject => {
        const candidates = [subject.max_marks, subject.marks, 100];
        const maxCandidate = candidates.find(candidate => {
          const numericValue = Number(candidate);
          return Number.isFinite(numericValue) && numericValue > 0;
        });
        const maxMarks = maxCandidate ? Number(maxCandidate) : 100;
        const obtained = Math.max(0, Number(subject.marks_obtained ?? 0));
        const percentageValue = maxMarks > 0 ? calculatePercentage(obtained, maxMarks) : 0;
        const gradeValue = getGradeFromPercentage(percentageValue);

        return {
          ...subject,
          marks_obtained: obtained,
          maxMarks,
          percentage: percentageValue,
          grade: gradeValue,
        };
      }),
    [subjects],
  );

  const bestSubject = subjectStats.length
    ? subjectStats.reduce((prev, current) => (current.percentage > prev.percentage ? current : prev))
    : null;
  const weakestSubject = subjectStats.length
    ? subjectStats.reduce((prev, current) => (current.percentage < prev.percentage ? current : prev))
    : null;

  const averageSubjectPercentage = subjectStats.length
    ? Math.round(
        subjectStats.reduce((sum, subject) => sum + subject.percentage, 0) / subjectStats.length,
      )
    : 0;

  const passMarkRaw = Number(exam.min_marks ?? 0);
  const hasPassMark = Number.isFinite(passMarkRaw) && passMarkRaw > 0;
  const passMark = hasPassMark ? passMarkRaw : 0;
  const hasPassed = hasPassMark ? obtainedMarks >= passMark : percentage >= 35;

  const metrics = [
    {
      key: 'score',
      icon: Award,
      color: gradeColor,
      label: 'Score achieved',
      value:
        totalMarks > 0
          ? `${formatNumberValue(obtainedMarks)} / ${formatNumberValue(totalMarks)}`
          : `${formatNumberValue(obtainedMarks)} marks`,
      helper: totalMarks > 0 ? `${percentage}% overall` : 'Awaiting total marks',
    },
    {
      key: 'subjects',
      icon: BookOpen,
      color: COLORS.primary[500],
      label: 'Subjects assessed',
      value: subjects.length ? subjects.length.toString() : '—',
      helper: bestSubject ? `Top: ${bestSubject.subject_name}` : 'Waiting for subject data',
    },
    {
      key: 'average',
      icon: TrendingUp,
      color: COLORS.accent[500],
      label: 'Average per subject',
      value: subjectStats.length ? `${averageSubjectPercentage}%` : '—',
      helper: subjectStats.length ? 'Across all subjects' : 'No breakdown shared yet',
    },
    {
      key: 'pass-mark',
      icon: School,
      color: hasPassMark ? (hasPassed ? COLORS.accent[500] : COLORS.warning[500]) : COLORS.gray[500],
      label: 'Pass mark',
      value: hasPassMark ? `${formatNumberValue(passMark)} marks` : 'Not provided',
      helper: hasPassMark
        ? hasPassed
          ? 'Requirement met'
          : 'Below requirement'
        : 'Check with faculty',
    },
  ];

  const durationLabel = getDurationLabel(exam.start_date, exam.end_date);

  return (
    <View style={styles.container}>
      <Header title="Result Details" showBackButton />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card padding="large" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTitleBlock}>
              <Text style={styles.examName}>{exam.name}</Text>
              {exam.term ? <Text style={styles.examTerm}>{exam.term}</Text> : null}
            </View>
            {statusLabel ? (
              <View
                style={[
                  styles.statusPill,
                  {
                    borderColor: withAlpha(gradeColor, 0.35),
                    backgroundColor: withAlpha(gradeColor, 0.12),
                  },
                ]}
              >
                <Text style={[styles.statusText, { color: gradeColor }]}>{statusLabel}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.scoreRow}>
            <View
              style={[
                styles.gradeBadge,
                {
                  borderColor: withAlpha(gradeColor, 0.3),
                  backgroundColor: withAlpha(gradeColor, 0.1),
                },
              ]}
            >
              <Text style={[styles.gradeText, { color: gradeColor }]}>{grade}</Text>
              <Text style={[styles.gradeLabel, { color: gradeColor }]}>Grade</Text>
            </View>
            <View style={styles.scoreSummary}>
              <Text style={styles.scoreValue}>{percentage}%</Text>
              <Text style={styles.scoreCaption}>Overall score</Text>
              <Text style={styles.scoreMarks}>
                {formatNumberValue(obtainedMarks)} of {formatNumberValue(totalMarks)} marks
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <View style={[styles.metaIcon, { backgroundColor: withAlpha(COLORS.primary[500], 0.1) }]}>
                <Calendar size={16} color={COLORS.primary[500]} />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Exam start</Text>
                <Text style={styles.metaValue}>{safeFormatDate(exam.start_date)}</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <View style={[styles.metaIcon, { backgroundColor: withAlpha(COLORS.accent[500], 0.1) }]}>
                <FileText size={16} color={COLORS.accent[500]} />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Result released</Text>
                <Text style={styles.metaValue}>{safeFormatDate(exam.end_date)}</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <View style={[styles.metaIcon, { backgroundColor: withAlpha(COLORS.warning[500], 0.1) }]}>
                <Clock size={16} color={COLORS.warning[500]} />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>{durationLabel}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card padding="large" variant="filled" style={styles.metricsCard}>
          <Text style={styles.sectionTitle}>Quick metrics</Text>
          <Text style={styles.sectionSubtitle}>Key numbers for this exam</Text>

          <View style={styles.metricsGrid}>
            {metrics.map(metric => (
              <View
                key={metric.key}
                style={[
                  styles.metricItem,
                  {
                    borderColor: withAlpha(metric.color, 0.2),
                    backgroundColor: '#FFFFFF',
                  },
                ]}
              >
                <View style={[styles.metricIcon, { backgroundColor: withAlpha(metric.color, 0.12) }]}>
                  <metric.icon size={16} color={metric.color} />
                </View>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={[styles.metricValue, { color: metric.color }]}>{metric.value}</Text>
                <Text style={styles.metricHelper}>{metric.helper}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card padding="large" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Subject performance</Text>
          <Text style={styles.sectionSubtitle}>
            Detailed breakdown of marks secured in each subject
          </Text>

          {subjectStats.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Subject wise marks will appear once shared by your faculty.
              </Text>
            </View>
          ) : (
            <View style={styles.subjectList}>
              {subjectStats.map((subject, index) => {
                const subjectGradeColor = getGradeColor(subject.grade);

                return (
                  <View
                    key={subject.subject_id ?? `${subject.subject_name}-${index}`}
                    style={[
                      styles.subjectItem,
                      index !== subjectStats.length - 1 && styles.subjectDivider,
                    ]}
                  >
                    <View style={styles.subjectHeader}>
                      <View style={styles.subjectTitleBlock}>
                        <Text style={styles.subjectName}>{subject.subject_name}</Text>
                        <View style={styles.subjectMetaRow}>
                          {subject.type ? (
                            <Text style={styles.subjectTag}>{subject.type}</Text>
                          ) : null}
                          <Text style={[styles.subjectPercentage, { color: subjectGradeColor }]}>
                            {subject.percentage}%
                          </Text>
                        </View>
                      </View>
                      <View style={styles.subjectScoreBlock}>
                        <Text style={styles.subjectMarks}>
                          {formatNumberValue(subject.marks_obtained)} / {formatNumberValue(subject.maxMarks)}
                        </Text>
                        <Text style={[styles.subjectGrade, { color: subjectGradeColor }]}>Grade {subject.grade}</Text>
                      </View>
                    </View>

                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(subject.percentage, 100)}%`,
                            backgroundColor: subjectGradeColor,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        <Card padding="large" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Performance highlights</Text>
          <Text style={styles.sectionSubtitle}>Quick takeaways from this result</Text>

          <View style={styles.insightList}>
            {bestSubject ? (
              <View style={styles.insightItem}>
                <View style={[styles.insightIcon, { backgroundColor: withAlpha(COLORS.accent[500], 0.12) }]}>
                  <Award size={18} color={COLORS.accent[500]} />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightLabel}>Strongest subject</Text>
                  <Text style={styles.insightValue}>{bestSubject.subject_name}</Text>
                  <Text style={styles.insightHelper}>
                    Scored {formatNumberValue(bestSubject.marks_obtained)} / {formatNumberValue(bestSubject.maxMarks)} ({bestSubject.percentage}%).
                  </Text>
                </View>
              </View>
            ) : null}

            {weakestSubject ? (
              <View style={styles.insightItem}>
                <View style={[styles.insightIcon, { backgroundColor: withAlpha(COLORS.warning[500], 0.12) }]}>
                  <AlertTriangle size={18} color={COLORS.warning[500]} />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightLabel}>Focus area</Text>
                  <Text style={styles.insightValue}>{weakestSubject.subject_name}</Text>
                  <Text style={styles.insightHelper}>
                    {weakestSubject.percentage}% • Grade {weakestSubject.grade}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.insightItem}>
              <View
                style={[
                  styles.insightIcon,
                  {
                    backgroundColor: withAlpha(
                      hasPassed ? COLORS.accent[500] : COLORS.warning[500],
                      0.12,
                    ),
                  },
                ]}
              >
                <School
                  size={18}
                  color={hasPassed ? COLORS.accent[500] : COLORS.warning[500]}
                />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Result status</Text>
                <Text style={styles.insightValue}>
                  {hasPassMark ? (hasPassed ? 'Passed' : 'Needs attention') : statusLabel}
                </Text>
                <Text style={styles.insightHelper}>
                  {hasPassMark
                    ? hasPassed
                      ? `Cleared the pass mark by ${formatNumberValue(obtainedMarks - passMark)} marks.`
                      : `Requires ${formatNumberValue(passMark - obtainedMarks)} more marks to pass.`
                    : 'Official status will update once results are confirmed.'}
                </Text>
              </View>
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.md,
  },
  summaryCard: {
    marginBottom: SPACING.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTitleBlock: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  examName: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.gray[900],
  },
  examTerm: {
    marginTop: 4,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[600],
  },
  statusPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  gradeBadge: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  gradeText: {
    fontFamily: FONTS.bold,
    fontSize: 32,
  },
  gradeLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.4,
  },
  scoreSummary: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  scoreValue: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: COLORS.gray[900],
  },
  scoreCaption: {
    marginTop: 4,
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[600],
  },
  scoreMarks: {
    marginTop: 6,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[500],
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.lg,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: SPACING.sm,
  },
  metaIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  metaLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[500],
  },
  metaValue: {
    marginTop: 2,
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[900],
  },
  metricsCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
  },
  sectionSubtitle: {
    marginTop: 4,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[600],
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
    marginHorizontal: -SPACING.sm,
  },
  metricItem: {
    flexGrow: 1,
    flexShrink: 0,
    minWidth: 160,
    borderRadius: 16,
    borderWidth: 1,
    padding: SPACING.md,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  metricLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.gray[600],
  },
  metricValue: {
    marginTop: 6,
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  metricHelper: {
    marginTop: 4,
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[500],
  },
  sectionCard: {
    marginBottom: SPACING.lg,
  },
  emptyState: {
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: COLORS.gray[100],
  },
  emptyStateText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  subjectList: {
    marginTop: SPACING.md,
  },
  subjectItem: {
    paddingVertical: SPACING.md,
  },
  subjectDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  subjectTitleBlock: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  subjectName: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  subjectMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  subjectTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.gray[100],
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.gray[600],
    marginRight: SPACING.sm,
  },
  subjectPercentage: {
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  subjectScoreBlock: {
    alignItems: 'flex-end',
  },
  subjectMarks: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[800],
  },
  subjectGrade: {
    marginTop: 4,
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  progressTrack: {
    height: 6,
    borderRadius: 6,
    backgroundColor: COLORS.gray[200],
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  insightList: {
    marginTop: SPACING.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  insightLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.gray[600],
  },
  insightValue: {
    marginTop: 2,
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  insightHelper: {
    marginTop: 4,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[500],
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  notFoundText: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: COLORS.gray[800],
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});
