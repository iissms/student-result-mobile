import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChartBar as BarChart2, TrendingUp } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { Result } from '@/types';
import { getGradeColor } from '@/utils/helpers';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface ResultsSummaryProps {
  result: Result;
}

export default function ResultsSummary({ result }: ResultsSummaryProps) {
  const progressValue = useSharedValue(0);

  React.useEffect(() => {
    progressValue.value = withTiming(result.percentage / 100, { duration: 1000 });
  }, [result.percentage]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headingText}>
          <Text style={styles.title}>{result.examName}</Text>
          <Text style={styles.subtitle}>{result.term}</Text>
        </View>
        <View style={[styles.gradeBadge, { borderColor: getGradeColor(result.grade) }]}>
          <Text style={[styles.grade, { color: getGradeColor(result.grade) }]}>{result.grade}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Total marks</Text>
          <Text style={styles.metaValue}>
            {result.obtainedMarks}
            <Text style={styles.metaMax}>/{result.totalMarks}</Text>
          </Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Percentage</Text>
          <Text style={styles.metaValue}>{Math.round(result.percentage)}%</Text>
        </View>
        {result.rank ? (
          <>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Rank</Text>
              <Text style={styles.metaValue}>{result.rank}</Text>
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Overall performance</Text>
          <Text style={styles.progressValue}>{Math.round(result.percentage)}%</Text>
        </View>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressFill,
              progressStyle,
              { backgroundColor: getGradeColor(result.grade) },
            ]}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <View style={[styles.footerIcon, styles.analysisIcon]}>
            <BarChart2 size={16} color={COLORS.primary[500]} />
          </View>
          <Text style={styles.footerText}>Subject analysis</Text>
        </View>
        <View style={[styles.footerItem, styles.footerItemSpacing]}>
          <View style={[styles.footerIcon, styles.trendIcon]}>
            <TrendingUp size={16} color={COLORS.accent[500]} />
          </View>
          <Text style={styles.footerText}>Performance trend</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headingText: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[600],
  },
  gradeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  grade: {
    fontFamily: FONTS.bold,
    fontSize: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
  },
  metaItem: {
    flex: 1,
    paddingHorizontal: SPACING.xs,
    alignItems: 'flex-start',
  },
  metaLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[600],
  },
  metaValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  metaMax: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[500],
  },
  metaDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: COLORS.gray[200],
    marginHorizontal: SPACING.sm,
  },
  progressSection: {
    marginTop: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[600],
  },
  progressValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  progressBackground: {
    height: 10,
    backgroundColor: COLORS.gray[200],
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerItemSpacing: {
    marginLeft: SPACING.lg,
  },
  footerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray[100],
  },
  analysisIcon: {
    backgroundColor: COLORS.primary[50],
  },
  trendIcon: {
    backgroundColor: COLORS.accent[50],
  },
  footerText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.gray[700],
    marginLeft: SPACING.xs,
  },
});
