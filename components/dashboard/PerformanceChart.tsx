import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { PerformanceTrend } from '@/types';

interface PerformanceChartProps {
  data: PerformanceTrend[];
  classAverages?: { [key: string]: number };
  title?: string;
}

export default function PerformanceChart({ data, classAverages, title }: PerformanceChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth - SPACING.lg * 3, 260);

  const chartLabels = data.map(item => item.term.split(' ')[0]);
  const chartData = data.map(item => item.percentage);
  const classAvgData = classAverages
    ? Object.values(classAverages)
    : Array(data.length).fill(0);

  // Find the improvement trend
  const getImprovement = () => {
    if (data.length < 2) return 0;
    const lastExam = data[data.length - 1].percentage;
    const prevExam = data[data.length - 2].percentage;
    return lastExam - prevExam;
  };

  const improvement = getImprovement();
  const average = chartData.length
    ? Math.round(chartData.reduce((a, b) => a + b, 0) / chartData.length)
    : 0;
  const latestScore = chartData[chartData.length - 1] ?? 0;
  const showClassAverage = Boolean(classAverages);
  const headerTitle = title === undefined ? 'Performance trends' : title;
  const showHeaderTitle = Boolean(headerTitle && headerTitle.trim().length > 0);

  return (
    <View style={styles.container}>
      <View style={[styles.headerRow, !showHeaderTitle && styles.headerRowNoTitle]}>
        {showHeaderTitle ? (
          <Text style={styles.title}>{headerTitle}</Text>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}
        <View
          style={[
            styles.trendChip,
            improvement > 0
              ? styles.positiveTrend
              : improvement < 0
              ? styles.negativeTrend
              : styles.neutralTrend,
          ]}
        >
          {improvement >= 0 ? (
            <TrendingUp
              size={14}
              color={improvement > 0 ? COLORS.accent[600] : COLORS.gray[600]}
              style={styles.trendIcon}
            />
          ) : (
            <TrendingDown size={14} color={COLORS.error[500]} style={styles.trendIcon} />
          )}
          <Text
            style={[
              styles.trendChipText,
              improvement > 0
                ? styles.positiveTrendText
                : improvement < 0
                ? styles.negativeTrendText
                : styles.neutralTrendText,
            ]}
          >
            {improvement > 0 ? '+' : ''}
            {improvement}%
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: chartLabels,
            datasets: [
              {
                data: chartData,
                color: () => COLORS.primary[500],
                strokeWidth: 2,
              },
              classAverages ? {
                data: classAvgData,
                color: () => COLORS.gray[400],
                strokeWidth: 2,
              } : undefined,
            ].filter(Boolean) as any,
          }}
          width={chartWidth}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: () => COLORS.primary[500],
            labelColor: () => COLORS.gray[500],
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: COLORS.primary[500],
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.primarySwatch]} />
          <Text style={styles.legendLabel}>Your score</Text>
        </View>
        {showClassAverage ? (
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.neutralSwatch]} />
            <Text style={styles.legendLabel}>Class average</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statTitle}>Latest score</Text>
          <Text style={styles.statValue}>{latestScore}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statTitle}>Average</Text>
          <Text style={styles.statValue}>{average}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statTitle}>Change</Text>
          <Text
            style={[
              styles.statValue,
              improvement > 0
                ? styles.positiveChange
                : improvement < 0
                ? styles.negativeChange
                : styles.neutralChange,
            ]}
          >
            {improvement > 0 ? '+' : ''}
            {improvement}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerRowNoTitle: {
    justifyContent: 'flex-end',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
  },
  headerPlaceholder: {
    flex: 1,
  },
  trendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  trendIcon: {
    marginRight: 6,
  },
  trendChipText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
  },
  positiveTrend: {
    backgroundColor: COLORS.accent[50],
  },
  positiveTrendText: {
    color: COLORS.accent[600],
  },
  negativeTrend: {
    backgroundColor: COLORS.error[50],
  },
  negativeTrendText: {
    color: COLORS.error[500],
  },
  neutralTrend: {
    backgroundColor: COLORS.gray[100],
  },
  neutralTrendText: {
    color: COLORS.gray[600],
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  chart: {
    borderRadius: 16,
    marginVertical: SPACING.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  primarySwatch: {
    backgroundColor: COLORS.primary[500],
  },
  neutralSwatch: {
    backgroundColor: COLORS.gray[400],
  },
  legendLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[600],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: SPACING.xs,
  },
  statTitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
  },
  positiveChange: {
    color: COLORS.accent[500],
  },
  negativeChange: {
    color: COLORS.error[500],
  },
  neutralChange: {
    color: COLORS.gray[600],
  },
});
