import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { COLORS, FONTS, SPACING } from '@/utils/constants';

interface SubjectData {
  subject: string;
  current: number;
  previous: number;
  change: number;
}

interface SubjectPerformanceProps {
  data: SubjectData[];
  showTitle?: boolean;
  title?: string;
}

export default function SubjectPerformance({
  data,
  showTitle = true,
  title,
}: SubjectPerformanceProps) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const barWidthValues = data.map(() => useSharedValue(0));

  React.useEffect(() => {
    data.forEach((_, index) => {
      barWidthValues[index].value = withTiming(data[index].current / 100, { duration: 1000 });
    });
  }, [data]);

  const barStyles = barWidthValues.map(value =>
    useAnimatedStyle(() => ({
      width: `${value.value * 100}%`,
    }))
  );

  return (
    <View style={styles.container}>
      {showTitle ? <Text style={styles.title}>{title ?? 'Subject performance'}</Text> : null}

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {data.map((item, index) => {
          const changePositive = item.change > 0;
          const changeNegative = item.change < 0;

          return (
            <View
              key={item.subject}
              style={[
                styles.subjectItem,
                activeSubject === item.subject && styles.activeSubject,
              ]}
              onTouchStart={() => setActiveSubject(item.subject)}
              onTouchEnd={() => setActiveSubject(null)}
            >
              <View style={styles.subjectHeader}>
                <View>
                  <Text style={styles.subjectName}>{item.subject}</Text>
                  <Text style={styles.subjectHint}>Previous {item.previous}%</Text>
                </View>

                <View
                  style={[
                    styles.changeBadge,
                    changePositive
                      ? styles.positiveChangeBadge
                      : changeNegative
                      ? styles.negativeChangeBadge
                      : styles.neutralChangeBadge,
                  ]}
                >
                  {changePositive ? (
                    <TrendingUp size={14} color={COLORS.accent[600]} style={styles.changeIcon} />
                  ) : changeNegative ? (
                    <TrendingDown size={14} color={COLORS.error[500]} style={styles.changeIcon} />
                  ) : (
                    <Minus size={14} color={COLORS.gray[600]} style={styles.changeIcon} />
                  )}
                  <Text
                    style={[
                      styles.changeValue,
                      changePositive
                        ? styles.positiveChangeText
                        : changeNegative
                        ? styles.negativeChangeText
                        : styles.neutralChangeText,
                    ]}
                  >
                    {item.change > 0 ? '+' : ''}
                    {item.change}%
                  </Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      barStyles[index],
                      { backgroundColor: getBarColor(item.current) },
                    ]}
                  />
                </View>
                <View style={styles.marksContainer}>
                  <Text style={styles.currentMarks}>{item.current}%</Text>
                  <Text style={styles.previousMarks}>Previous {item.previous}%</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
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
  container: {
    width: '100%',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  scrollView: {
    maxHeight: 340,
  },
  subjectItem: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    backgroundColor: '#FFFFFF',
  },
  activeSubject: {
    borderColor: COLORS.primary[200],
    backgroundColor: COLORS.primary[50],
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  subjectHint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  changeIcon: {
    marginRight: 6,
  },
  changeValue: {
    fontFamily: FONTS.medium,
    fontSize: 13,
  },
  positiveChangeBadge: {
    backgroundColor: COLORS.accent[50],
  },
  positiveChangeText: {
    color: COLORS.accent[600],
  },
  negativeChangeBadge: {
    backgroundColor: COLORS.error[50],
  },
  negativeChangeText: {
    color: COLORS.error[500],
  },
  neutralChangeBadge: {
    backgroundColor: COLORS.gray[100],
  },
  neutralChangeText: {
    color: COLORS.gray[600],
  },
  progressContainer: {
    marginTop: SPACING.md,
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
  marksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  currentMarks: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  previousMarks: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[500],
  },
});
