import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { SubjectResult } from '@/types';
import { getGradeColor } from '@/utils/helpers';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface SubjectGradeListProps {
  subjects: SubjectResult[];
}

export default function SubjectGradeList({ subjects }: SubjectGradeListProps) {
  // Create an array of shared values for each subject's progress animation
  const progressValues = subjects.map(() => useSharedValue(0));
  
  React.useEffect(() => {
    // Animate the progress bars
    subjects.forEach((subject, index) => {
      progressValues[index].value = withTiming(subject.percentage / 100, { duration: 1000 });
    });
  }, [subjects]);
  
  const renderSubjectItem = ({ item, index }: { item: SubjectResult, index: number }) => {
    // Create animated style for this subject's progress bar
    const animatedStyle = useAnimatedStyle(() => {
      return {
        width: `${progressValues[index].value * 100}%`,
      };
    });
    
    return (
      <View style={styles.subjectItem}>
        <View style={styles.subjectHeader}>
          <Text style={styles.subjectName}>{item.subjectName}</Text>
          <View style={styles.gradeContainer}>
            <Text style={[styles.grade, { color: getGradeColor(item.grade) }]}>
              {item.grade}
            </Text>
          </View>
        </View>
        
        <View style={styles.marksRow}>
          <Text style={styles.marks}>
            {item.obtainedMarks}/{item.maxMarks}
          </Text>
          <Text style={styles.percentage}>{item.percentage}%</Text>
        </View>
        
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressFill,
              animatedStyle,
              { backgroundColor: getGradeColor(item.grade) }
            ]}
          />
        </View>
      </View>
    );
  };
  
  return (
    <FlatList
      data={subjects}
      renderItem={renderSubjectItem}
      keyExtractor={item => item.subjectId}
      contentContainerStyle={styles.container}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  subjectItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    marginVertical: SPACING.xs,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  subjectName: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  gradeContainer: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: SPACING.xs,
    backgroundColor: COLORS.gray[100],
  },
  grade: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  marksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  marks: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[700],
  },
  percentage: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[800],
  },
  progressBackground: {
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: 4,
    marginTop: SPACING.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});