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
      <TouchableOpacity style={styles.compactCard} onPress={handlePress} activeOpacity={0.75}>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle}>{exam.name}</Text>
          <Text style={styles.compactSubtitle}>{examDateRange}</Text>
        </View>
        <View style={styles.compactRight}>
          <Text style={[styles.compactGrade, { color: getGradeColor(grade) }]}>{grade}</Text>
          <ChevronRight size={18} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.examName}>{exam.name}</Text>
          <Text style={styles.date}>{examDateRange}</Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scorePillLabel}>Score</Text>
          <Text
            style={[
              styles.scorePillValue,
              {
                color: getGradeColor(grade),
              },
            ]}
          >
            {percentage}%
          </Text>
          <Text style={styles.scorePillHelper}>{grade}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Grade</Text>
          <Text style={[styles.metricValue, { color: getGradeColor(grade) }]}>{grade}</Text>
        </View>
        <View style={[styles.metric, styles.metricDivider]}>
          <Text style={styles.metricLabel}>Marks</Text>
          <Text style={styles.metricValue}>
            {formatNumberValue(obtainedMarks)}/{formatNumberValue(fallbackTotal)}
          </Text>
        </View>
        <View style={[styles.metric, styles.metricDivider]}>
          <Text style={styles.metricLabel}>Subjects</Text>
          <Text style={styles.metricValue}>{exam.subjects?.length ?? 0}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
        <View style={styles.link}>
          <Text style={styles.linkText}>View details</Text>
          <ChevronRight size={16} color={COLORS.primary[500]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
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
    color: COLORS.gray[900],
  },
  date: {
    marginTop: 4,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[600],
  },
  scorePill: {
    alignItems: 'flex-end',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary[50],
    borderRadius: 14,
  },
  scorePillLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[600],
    textTransform: 'uppercase',
  },
  scorePillValue: {
    marginTop: 4,
    fontFamily: FONTS.bold,
    fontSize: 22,
  },
  scorePillHelper: {
    marginTop: 2,
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.gray[500],
  },
  metricsRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray[200],
  },
  metric: {
    flex: 1,
  },
  metricDivider: {
    paddingLeft: SPACING.md,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.gray[100],
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
    color: COLORS.gray[900],
  },
  footer: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: 999,
    backgroundColor: COLORS.gray[100],
  },
  statusText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.gray[700],
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
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
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
    color: COLORS.gray[900],
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
