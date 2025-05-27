import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { PerformanceTrend } from '@/types';
import Card from '@/components/ui/Card';

interface PerformanceChartProps {
  data: PerformanceTrend[];
  classAverages?: { [key: string]: number };
}

export default function PerformanceChart({ data, classAverages }: PerformanceChartProps) {
  const screenWidth = Dimensions.get('window').width - 32; // accounting for margins
  
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
  
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Performance Trends</Text>
      
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
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: () => COLORS.primary[500],
            labelColor: () => COLORS.gray[700],
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
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statTitle}>Current</Text>
          <Text style={styles.statValue}>{data[data.length - 1]?.percentage}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statTitle}>Average</Text>
          <Text style={styles.statValue}>
            {Math.round(chartData.reduce((a, b) => a + b, 0) / chartData.length)}%
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statTitle}>Change</Text>
          <Text style={[
            styles.statValue,
            improvement > 0 ? styles.positiveChange : 
            improvement < 0 ? styles.negativeChange : null
          ]}>
            {improvement > 0 ? '+' : ''}{improvement}%
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  chart: {
    borderRadius: 16,
    marginVertical: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
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
});