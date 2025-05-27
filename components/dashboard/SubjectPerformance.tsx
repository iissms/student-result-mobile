import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import Card from '@/components/ui/Card';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface SubjectData {
  subject: string;
  current: number;
  previous: number;
  change: number;
}

interface SubjectPerformanceProps {
  data: SubjectData[];
}

export default function SubjectPerformance({ data }: SubjectPerformanceProps) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const barWidthValues = data.map(() => useSharedValue(0));
  
  React.useEffect(() => {
    // Animate bars
    data.forEach((_, index) => {
      barWidthValues[index].value = withTiming(data[index].current / 100, { duration: 1000 });
    });
  }, [data]);
  
  // Create animated styles for each bar
  const barStyles = barWidthValues.map(value => 
    useAnimatedStyle(() => ({
      width: `${value.value * 100}%`,
    }))
  );
  
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Subject Performance</Text>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {data.map((item, index) => (
          <View 
            key={item.subject} 
            style={[
              styles.subjectItem,
              activeSubject === item.subject && styles.activeSubject
            ]}
            onTouchStart={() => setActiveSubject(item.subject)}
            onTouchEnd={() => setActiveSubject(null)}
          >
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectName}>{item.subject}</Text>
              <View style={styles.changeContainer}>
                <Text style={[
                  styles.changeValue,
                  item.change > 0 ? styles.positiveChange : 
                  item.change < 0 ? styles.negativeChange : styles.neutralChange
                ]}>
                  {item.change > 0 ? '+' : ''}{item.change}%
                </Text>
                {item.change > 0 ? (
                  <TrendingUp size={16} color={COLORS.accent[500]} />
                ) : item.change < 0 ? (
                  <TrendingDown size={16} color={COLORS.error[500]} />
                ) : (
                  <Minus size={16} color={COLORS.gray[500]} />
                )}
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    barStyles[index],
                    { backgroundColor: getBarColor(item.current) }
                  ]} 
                />
              </View>
              <View style={styles.marksContainer}>
                <Text style={styles.currentMarks}>{item.current}%</Text>
                <Text style={styles.previousMarks}>Previous: {item.previous}%</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </Card>
  );
}

const getBarColor = (percentage: number) => {
  if (percentage >= 90) return COLORS.accent[500];
  if (percentage >= 80) return COLORS.primary[500];
  if (percentage >= 70) return COLORS.warning[300];
  if (percentage >= 60) return COLORS.warning[500];
  return COLORS.error[500];
};

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
  scrollView: {
    maxHeight: 350,
  },
  subjectItem: {
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: 8,
  },
  activeSubject: {
    backgroundColor: COLORS.gray[50],
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  subjectName: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeValue: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  positiveChange: {
    color: COLORS.accent[500],
  },
  negativeChange: {
    color: COLORS.error[500],
  },
  neutralChange: {
    color: COLORS.gray[500],
  },
  progressContainer: {
    marginTop: SPACING.xs,
  },
  progressBackground: {
    height: 10,
    backgroundColor: COLORS.gray[200],
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  marksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  currentMarks: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[900],
  },
  previousMarks: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[500],
  },
});