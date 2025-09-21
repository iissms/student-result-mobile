import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

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
}

interface Exam {
  exam_id: number;
  name: string;
  start_date: string;
  end_date: string;
  marks: number;
  min_marks: number;
  status: string;
  class_id: number;
  subjects: Subject[];
}

interface ResultCardProps {
  exam: Exam;
  compact?: boolean;
}

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

export default function ResultCard({ exam, compact = false }: ResultCardProps) {
  const router = useRouter();

  const obtainedMarks = (exam.subjects || []).reduce((sum, subject) => {
    const marks =
      typeof subject.marks_obtained === 'number'
        ? subject.marks_obtained
        : Number(subject.marks_obtained ?? 0);
    return sum + (Number.isFinite(marks) ? marks : 0);
  }, 0);

  const declaredTotal =
    typeof exam.marks === 'number' ? exam.marks : Number(exam.marks ?? 0);
  const fallbackTotal =
    declaredTotal > 0
      ? declaredTotal
      : Math.max(exam.subjects?.length ?? 0, 1) * 100;
  const percentage = fallbackTotal > 0 ? calculatePercentage(obtainedMarks, fallbackTotal) : 0;
  const grade = getGradeFromPercentage(percentage);
  const gradeColor = getGradeColor(grade);
  const statusLabel = formatStatus(exam.status);
  const examDateRange =
    exam.end_date && exam.end_date !== exam.start_date
      ? `${formatDate(exam.start_date)} – ${formatDate(exam.end_date)}`
      : formatDate(exam.start_date);

  const handlePress = () => {
    router.push({
      pathname: '/(tabs)/(stacks)/result-details',
      params: {
        exam: encodeURIComponent(JSON.stringify(exam)),
        studentId: '8',
      },
    });
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactCard,
          {
            backgroundColor: withAlpha(COLORS.primary[500], 0.08),
            borderColor: withAlpha(COLORS.primary[500], 0.2),
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.75}
      >
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle}>{exam.name}</Text>
          <Text style={styles.compactSubtitle}>{examDateRange}</Text>
        </View>
        <View style={styles.compactRight}>
          <Text style={[styles.compactGrade, { color: gradeColor }]}>{grade}</Text>
          <ChevronRight size={18} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={handlePress} activeOpacity={0.85}>
      <View
        style={[
          styles.card,
          {
            borderColor: withAlpha(gradeColor, 0.22),
            shadowColor: withAlpha(gradeColor, 0.35),
          },
        ]}
      >
        <View style={[styles.accentRail, { backgroundColor: gradeColor }]} />

        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.examName}>{exam.name}</Text>
              <Text style={styles.date}>{examDateRange}</Text>
            </View>

            <View
              style={[
                styles.scoreBadge,
                {
                  backgroundColor: withAlpha(gradeColor, 0.1),
                  borderColor: withAlpha(gradeColor, 0.3),
                },
              ]}
            >
              <Text style={[styles.scoreBadgeGrade, { color: gradeColor }]}>{grade}</Text>
              <Text style={styles.scoreBadgeLabel}>Overall score</Text>
              <Text style={[styles.scoreBadgeValue, { color: gradeColor }]}>{percentage}%</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Marks scored</Text>
              <Text style={styles.metricValue}>
                {formatNumberValue(obtainedMarks)}/{formatNumberValue(fallbackTotal)}
              </Text>
            </View>

            <View style={[styles.metric, styles.metricDivider]}>
              <Text style={styles.metricLabel}>Subjects</Text>
              <Text style={styles.metricValue}>{exam.subjects?.length ?? 0}</Text>
            </View>

            <View style={[styles.metric, styles.metricDivider]}>
              <Text style={styles.metricLabel}>Status</Text>
              <Text style={[styles.metricValue, { color: gradeColor }]}>{statusLabel}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.helperTextWrap}>
              <Text style={styles.helperText}>Tap to view subject-wise performance</Text>
            </View>

            <View style={styles.link}>
              <Text style={styles.linkText}>View details</Text>
              <ChevronRight size={16} color={COLORS.primary[500]} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: SPACING.lg,
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  accentRail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  examName: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: COLORS.primary[900],
  },
  date: {
    marginTop: 4,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[600],
  },
  scoreBadge: {
    alignItems: 'flex-end',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 112,
  },
  scoreBadgeGrade: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  scoreBadgeLabel: {
    marginTop: 4,
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[600],
  },
  scoreBadgeValue: {
    marginTop: 2,
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  divider: {
    marginTop: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray[200],
  },
  metricsRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
  },
  metric: {
    flex: 1,
  },
  metricDivider: {
    paddingLeft: SPACING.md,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.gray[200],
  },
  metricLabel: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[600],
  },
  metricValue: {
    marginTop: 6,
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.primary[900],
  },
  footer: {
    marginTop: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helperTextWrap: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  helperText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[500],
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary[500],
    marginRight: 6,
  },
  compactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.gray[200],
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  compactContent: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  compactTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.primary[900],
  },
  compactSubtitle: {
    marginTop: 2,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[600],
  },
  compactRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactGrade: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    marginRight: 6,
  },
});
