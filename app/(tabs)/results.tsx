import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, TERMS, ACADEMIC_YEARS } from '@/utils/constants';
import { mockResults } from '@/utils/mockData';
import ResultCard from '@/components/results/ResultCard';
import Header from '@/components/shared/Header';
import { Filter } from 'lucide-react-native';

export default function ResultsScreen() {
  const [selectedTerm, setSelectedTerm] = React.useState<string | null>(null);
  const [selectedYear, setSelectedYear] = React.useState<string | null>(null);
  
  const filteredResults = React.useMemo(() => {
    let results = [...mockResults];
    
    if (selectedTerm) {
      results = results.filter(result => result.term === selectedTerm);
    }
    
    if (selectedYear) {
      results = results.filter(result => result.academicYear === selectedYear);
    }
    
    return results.sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
  }, [selectedTerm, selectedYear]);
  
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
      style={[
        styles.filterPill,
        isActive && styles.activeFilterPill,
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterPillText,
        isActive && styles.activeFilterPillText,
      ]}>
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
        renderItem={({ item }) => renderFilterPill(
          item,
          selectedTerm === item,
          () => setSelectedTerm(prev => prev === item ? null : item)
        )}
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
        renderItem={({ item }) => renderFilterPill(
          item,
          selectedYear === item,
          () => setSelectedYear(prev => prev === item ? null : item)
        )}
        keyExtractor={item => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
      />
    </View>
  );
  
  const [showFilters, setShowFilters] = React.useState(false);
  
  return (
    <View style={styles.container}>
      <Header 
        title="Results" 
        showSettings
      />
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={COLORS.gray[700]} />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
        
        {(selectedTerm || selectedYear) && (
          <TouchableOpacity 
            style={styles.clearAllButton}
            onPress={clearFilters}
          >
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
      
      <FlatList
        data={filteredResults}
        renderItem={({ item }) => <ResultCard result={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.resultsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  filterList: {
    marginBottom: SPACING.sm,
  },
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
  activeFilterPillText: {
    color: '#FFFFFF',
  },
  resultsList: {
    padding: SPACING.md,
  },
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