import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChartBar as BarChart2, TrendingUp } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { Result } from '@/types';
import Card from '@/components/ui/Card';
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
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{result.examName}</Text>
          <Text style={styles.subtitle}>{result.term}</Text>
        </View>
        <View style={styles.gradeContainer}>
          <Text style={[styles.grade, { color: getGradeColor(result.grade) }]}>
            {result.grade}
          </Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Marks</Text>
          <Text style={styles.statValue}>
            {result.obtainedMarks}/{result.totalMarks}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Percentage</Text>
          <Text style={styles.statValue}>{result.percentage}%</Text>
        </View>
        {result.rank && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rank</Text>
            <Text style={styles.statValue}>{result.rank}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.progressContainer}>
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
        <View style={styles.iconContainer}>
          <BarChart2 size={20} color={COLORS.primary[500]} />
          <Text style={styles.footerText}>Subject Analysis</Text>
        </View>
        <View style={styles.iconContainer}>
          <TrendingUp size={20} color={COLORS.accent[500]} />
          <Text style={styles.footerText}>Performance Trend</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[600],
  },
  gradeContainer: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.xs,
  },
  grade: {
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[600],
    marginBottom: 2,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  progressContainer: {
    marginVertical: SPACING.sm,
  },
  progressBackground: {
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[700],
    marginLeft: SPACING.xs,
  },
});