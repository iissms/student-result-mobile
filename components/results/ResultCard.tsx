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
        style={[styles.compactCard, { borderColor: withAlpha(gradeColor, 0.28) }]}
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
      <View style={[styles.card, { borderColor: withAlpha(gradeColor, 0.25) }]}>
        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.examName}>{exam.name}</Text>
            <Text style={styles.date}>{examDateRange}</Text>
          </View>
          <View
            style={[
              styles.scorePill,
              {
                backgroundColor: withAlpha(gradeColor, 0.12),
                borderColor: withAlpha(gradeColor, 0.28),
              },
            ]}
          >
            <Text style={[styles.scoreValue, { color: gradeColor }]}>{percentage}%</Text>
            <Text style={[styles.scoreGrade, { color: gradeColor }]}>Grade {grade}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Marks</Text>
            <Text style={styles.metaValue}>
              {formatNumberValue(obtainedMarks)} / {formatNumberValue(fallbackTotal)}
            </Text>
          </View>
          <View style={[styles.metaItem, styles.metaDivider]}>
            <Text style={styles.metaLabel}>Subjects</Text>
            <Text style={styles.metaValue}>{exam.subjects?.length ?? 0}</Text>
          </View>
          <View style={[styles.metaItem, styles.metaDivider]}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={[styles.metaValue, { color: gradeColor }]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.linkLabel}>View result details</Text>
          <ChevronRight size={18} color={COLORS.gray[400]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  examName: {
    fontFamily: FONTS.medium,
    fontSize: 17,
    color: COLORS.gray[900],
  },
  date: {
    marginTop: 4,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[500],
  },
  scorePill: {
    alignItems: 'flex-end',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  scoreValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  scoreGrade: {
    marginTop: 2,
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  metaItem: {
    flex: 1,
  },
  metaDivider: {
    paddingLeft: SPACING.md,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: COLORS.gray[200],
  },
  metaLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[500],
  },
  metaValue: {
    marginTop: 6,
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[800],
  },
  footerRow: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.primary[500],
  },
  compactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  compactContent: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  compactTitle: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.gray[900],
  },
  compactSubtitle: {
    marginTop: 2,
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[500],
  },
  compactRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactGrade: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginRight: 6,
  },
});
