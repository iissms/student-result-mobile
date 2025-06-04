import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING, TERMS, ACADEMIC_YEARS } from '@/utils/constants';
import ResultCard from '@/components/results/ResultCard';
import Header from '@/components/shared/Header';
import { Filter } from 'lucide-react-native';

type Exam = {
  exam_id: number;
  name: string;
  start_date: string;
  end_date: string;
  marks: number;
  min_marks: number;
  status: string;
  class_id: number;
  subjects: any[]; // Replace 'any' with the actual subject type if available
  // Add any other properties required by ResultCard
};

export default function ResultsScreen() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch('http://194.238.23.60:5007/api/results/student/11');
        const data = await response.json();
        setExams(data);
      } catch (error) {
        console.error('Error fetching student results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const filteredResults = useMemo(() => {
    let results = [...exams];

    if (selectedTerm) {
      results = results.filter(exam => exam.name === selectedTerm);
    }

    if (selectedYear) {
      results = results.filter(exam => {
        const year = new Date(exam.start_date).getFullYear().toString();
        return year === selectedYear;
      });
    }

    return results;
  }, [exams, selectedTerm, selectedYear]);

  const clearFilters = () => {
    setSelectedTerm(null);
    setSelectedYear(null);
  };

  const renderFilterPill = (
    title: string,
    isActive: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[styles.filterPill, isActive && styles.activeFilterPill]}
      onPress={onPress}
    >
      <Text style={[styles.filterPillText, isActive && styles.activeFilterPillText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderTermFilters = () => (
    <View>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>Term</Text>
        {selectedTerm && (
          <TouchableOpacity onPress={() => setSelectedTerm(null)}>
            <Text style={styles.clearFilter}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={TERMS}
        renderItem={({ item }) =>
          renderFilterPill(item, selectedTerm === item, () =>
            setSelectedTerm(prev => (prev === item ? null : item))
          )
        }
        keyExtractor={item => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
      />
    </View>
  );

  const renderYearFilters = () => (
    <View>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>Academic Year</Text>
        {selectedYear && (
          <TouchableOpacity onPress={() => setSelectedYear(null)}>
            <Text style={styles.clearFilter}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={ACADEMIC_YEARS}
        renderItem={({ item }) =>
          renderFilterPill(item, selectedYear === item, () =>
            setSelectedYear(prev => (prev === item ? null : item))
          )
        }
        keyExtractor={item => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Results" showSettings />

      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
          <Filter size={20} color={COLORS.gray[700]} />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>

        {(selectedTerm || selectedYear) && (
          <TouchableOpacity style={styles.clearAllButton} onPress={clearFilters}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {showFilters && (
        <View style={styles.filtersSection}>
          {renderTermFilters()}
          {renderYearFilters()}
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={filteredResults}
          renderItem={({ item }) => <ResultCard exam={item} />}
          keyExtractor={item => item.exam_id.toString()}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  filterButton: { flexDirection: 'row', alignItems: 'center' },
  filterButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[700],
    marginLeft: SPACING.xs,
  },
  clearAllButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  clearAllText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary[500],
  },
  filtersSection: {
    padding: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  filterTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[800],
  },
  clearFilter: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.primary[500],
  },
  filterList: { marginBottom: SPACING.sm },
  filterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.gray[100],
    borderRadius: 20,
    marginRight: SPACING.xs,
  },
  activeFilterPill: {
    backgroundColor: COLORS.primary[500],
  },
  filterPillText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[700],
  },
  activeFilterPillText: { color: '#FFFFFF' },
  resultsList: { padding: SPACING.md },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
});