import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { Result } from '@/types';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { formatDate, getGradeColor } from '@/utils/helpers';

interface ResultCardProps {
  result: Result;
  compact?: boolean;
}

export default function ResultCard({ result, compact = false }: ResultCardProps) {
  const router = useRouter();
  
  const handlePress = () => {
    router.push({
      pathname: '/(tabs)/(stacks)/result-details',
      params: { resultId: result.id }
    });
  };
  
  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactCard} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle}>{result.examName}</Text>
          <Text style={styles.compactSubtitle}>{result.term}</Text>
        </View>
        <View style={styles.compactRight}>
          <Text style={[styles.grade, { color: getGradeColor(result.grade) }]}>
            {result.grade}
          </Text>
          <ChevronRight size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.examName}>{result.examName}</Text>
          <Text style={styles.date}>{formatDate(result.examDate)}</Text>
        </View>
        <Text style={[styles.grade, { color: getGradeColor(result.grade) }]}>
          {result.grade}
        </Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Marks</Text>
          <Text style={styles.detailValue}>
            {result.obtainedMarks}/{result.totalMarks}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Percentage</Text>
          <Text style={styles.detailValue}>{result.percentage}%</Text>
        </View>
        {result.rank && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Rank</Text>
            <Text style={styles.detailValue}>{result.rank}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.term}>{result.term}</Text>
        <View style={styles.viewDetails}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <ChevronRight size={16} color={COLORS.primary[500]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  examName: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  date: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  grade: {
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray[200],
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  term: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[700],
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary[500],
    marginRight: 4,
  },
  // Compact styles
  compactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.gray[900],
  },
  compactSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[600],
  },
  compactRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});