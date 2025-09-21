import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, SPACING } from '@/utils/constants';
import ResultCard from '@/components/results/ResultCard';
import Header from '@/components/shared/Header';
import { useAuth } from '@/contexts/AuthContext';

type Exam = {
  exam_id: number;
  name: string;
  start_date: string;
  end_date: string;
  marks: number;
  min_marks: number;
  status: string;
  class_id: number;
  subjects: any[];
};

type ClassItem = {
  class_id: number;
  class_name: string;
  academic_year: string | null;
  is_current?: boolean;
};

type ClassesResponse = {
  current_class?: ClassItem | null;
  classes: ClassItem[];
};

const API_BASE_URL = 'http://194.238.23.60:5007';

export default function ResultsScreen() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState<string | null>(null);
  const { authState } = useAuth();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if (!authState.user?.token || !authState.user?.id) {
          throw new Error('Unable to load classes without authentication');
        }

        setClassesLoading(true);
        setClassesError(null);

        const response = await fetch(
          `${API_BASE_URL}/api/students/${authState.user.id}/classes`,
          {
            headers: {
              Authorization: `Bearer ${authState.user.token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to load classes (${response.status})`);
        }

        const data: ClassesResponse = await response.json();
        const classList = data.classes || [];
        setClasses(classList);

        const defaultClassId =
          data.current_class?.class_id ?? classList[0]?.class_id ?? null;
        setSelectedClassId(defaultClassId ?? null);
      } catch (error) {
        console.error('Error fetching student classes:', error);
        setClassesError(
          error instanceof Error
            ? error.message
            : 'Something went wrong while loading classes.',
        );
        setClasses([]);
        setSelectedClassId(null);
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, [authState.user?.id, authState.user?.token]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!authState.user?.token) {
        return;
      }

      if (!selectedClassId) {
        setExams([]);
        setResultsLoading(false);
        return;
      }

      try {
        setResultsLoading(true);
        setResultsError(null);
        setExams([]);

        const response = await fetch(`${API_BASE_URL}/api/results/student`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authState.user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: 1,
            limit: 10, // You can make this dynamic for future infinite scroll
            class_id: selectedClassId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to load results (${response.status})`);
        }

        const data = await response.json();
        console.log('Paginated fetched results:', data);

        setExams(data.results || []);
      } catch (error) {
        console.error('Error fetching student results:', error);
        setResultsError(
          error instanceof Error
            ? error.message
            : 'Something went wrong while loading results.',
        );
        setExams([]);
      } finally {
        setResultsLoading(false);
      }
    };

    fetchResults();
  }, [authState.user?.token, selectedClassId]);

  const classFilter = useMemo(() => {
    if (classesError) {
      return (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Class</Text>
          <Text style={styles.errorText}>{classesError}</Text>
        </View>
      );
    }

    if (!classes.length) {
      return (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Class</Text>
          <Text style={styles.emptyHelperText}>No classes available</Text>
        </View>
      );
    }

    return (
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Class</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {classes.map(classItem => {
            const isSelected = classItem.class_id === selectedClassId;

            return (
              <TouchableOpacity
                key={classItem.class_id}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  if (classItem.class_id !== selectedClassId) {
                    setSelectedClassId(classItem.class_id);
                  }
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {classItem.class_name}
                </Text>
                {!!classItem.academic_year && (
                  <Text
                    style={[
                      styles.filterChipSubText,
                      isSelected && styles.filterChipSubTextActive,
                    ]}
                  >
                    {classItem.academic_year}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }, [classes, classesError, selectedClassId]);

  const renderEmptyState = () => {
    if (resultsLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color={COLORS.primary[500]} />
          <Text style={[styles.emptyText, styles.emptyLoadingText]}>
            Loading results…
          </Text>
        </View>
      );
    }

    if (resultsError) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{resultsError}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No results found</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Results" showSettings />
      {classesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={exams}
          renderItem={({ item }) => <ResultCard exam={item} />}
          keyExtractor={item => item.exam_id.toString()}
          contentContainerStyle={styles.resultsList}
          ListHeaderComponent={classFilter}
          ListEmptyComponent={() => renderEmptyState()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  emptyLoadingText: {
    marginTop: SPACING.sm,
  },
  filterContainer: {
    marginBottom: SPACING.lg,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  filterChips: {
    paddingRight: SPACING.md,
  },
  filterChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    marginRight: SPACING.sm,
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[400],
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.gray[800],
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: COLORS.primary[600],
  },
  filterChipSubText: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.gray[500],
  },
  filterChipSubTextActive: {
    color: COLORS.primary[500],
  },
  emptyHelperText: {
    fontSize: 14,
    color: COLORS.gray[500],
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error[500],
  },
});
