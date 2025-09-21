import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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
import {
  calculatePercentage,
  formatDate,
  getGradeColor,
  getGradeFromPercentage,
} from '@/utils/helpers';

type Subject = {
  subject_id: number;
  subject_name: string;
  subject_code?: string;
  type?: string;
  marks_obtained: number;
  max_marks?: number;
};

type Exam = {
  exam_id: number;
  name: string;
  start_date: string;
  end_date: string;
  marks: number;
  min_marks: number;
  status: string;
  class_id: number;
  subjects: Subject[];
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
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchResults = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!authState.user?.token) {
        return;
      }

      if (!selectedClassId) {
        setExams([]);
        setResultsError(null);
        setResultsLoading(false);
        return;
      }

      const isSilent = options?.silent ?? false;

      try {
        if (!isSilent) {
          setResultsLoading(true);
          setExams([]);
        }
        setResultsError(null);

        const response = await fetch(`${API_BASE_URL}/api/results/student`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authState.user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: 1,
            limit: 10,
            class_id: selectedClassId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to load results (${response.status})`);
        }

        const data = await response.json();
        setExams(data.results || []);
      } catch (error) {
        console.error('Error fetching student results:', error);
        setResultsError(
          error instanceof Error
            ? error.message
            : 'Something went wrong while loading results.',
        );

        if (!isSilent) {
          setExams([]);
        }
      } finally {
        if (!isSilent) {
          setResultsLoading(false);
        }
      }
    },
    [authState.user?.token, selectedClassId],
  );

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleRefresh = useCallback(async () => {
    if (!authState.user?.token || !selectedClassId) {
      return;
    }

    setRefreshing(true);
    try {
      await fetchResults({ silent: true });
    } finally {
      setRefreshing(false);
    }
  }, [authState.user?.token, fetchResults, selectedClassId]);

  const activeClass = useMemo(
    () => classes.find(classItem => classItem.class_id === selectedClassId) ?? null,
    [classes, selectedClassId],
  );

  const classFilter = useMemo<React.ReactElement>(() => {
    if (classesError) {
      return (
        <View style={styles.filterCard}>
          <Text style={styles.filterLabel}>Class</Text>
          <Text style={styles.errorText}>{classesError}</Text>
        </View>
      );
    }

    if (!classes.length) {
      return (
        <View style={styles.filterCard}>
          <Text style={styles.filterLabel}>Class</Text>
          <Text style={styles.emptyHelperText}>No classes available</Text>
        </View>
      );
    }

    return (
      <View style={styles.filterCard}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterLabel}>Class</Text>
          {!!activeClass?.academic_year && (
            <Text style={styles.filterHelperText}>
              Academic Year {activeClass.academic_year}
            </Text>
          )}
        </View>
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
  }, [activeClass?.academic_year, classes, classesError, selectedClassId]);

  const resultsSummary = useMemo<React.ReactElement | null>(() => {
    if (!exams.length) {
      return null;
    }

    let totalObtained = 0;
    let totalPossible = 0;
    let totalSubjects = 0;
    let bestExam: { exam: Exam; percentage: number } | null = null;
    let latestExam: Exam | null = null;
    let latestExamTimestamp = -Infinity;

    exams.forEach(exam => {
      const obtained = (exam.subjects || []).reduce((sum, subject) => {
        const marks =
          typeof subject.marks_obtained === 'number'
            ? subject.marks_obtained
            : Number(subject.marks_obtained ?? 0);
        return sum + (Number.isFinite(marks) ? marks : 0);
      }, 0);

      const declaredTotal =
        typeof exam.marks === 'number' ? exam.marks : Number(exam.marks ?? 0);
      const fallbackTotal =
        declaredTotal > 0
          ? declaredTotal
          : Math.max(exam.subjects?.length ?? 0, 1) * 100;
      const percentage = fallbackTotal > 0 ? calculatePercentage(obtained, fallbackTotal) : 0;

      totalObtained += obtained;
      totalPossible += fallbackTotal;
      totalSubjects += exam.subjects?.length ?? 0;

      if (!bestExam || percentage > bestExam.percentage) {
        bestExam = { exam, percentage };
      }

      if (exam.start_date) {
        const timestamp = new Date(exam.start_date).getTime();
        if (!Number.isNaN(timestamp) && timestamp > latestExamTimestamp) {
          latestExam = exam;
          latestExamTimestamp = timestamp;
        }
      }
    });

    const averagePercentage =
      totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : 0;
    const averageGrade = getGradeFromPercentage(averagePercentage);
    const bestGrade = getGradeFromPercentage(bestExam?.percentage ?? 0);
    const latestExamDate = latestExam?.start_date ? formatDate(latestExam.start_date) : null;

    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryTitleGroup}>
            <Text style={styles.summaryEyebrow}>Selected Class</Text>
            <Text style={styles.summaryTitle}>
              {activeClass?.class_name ?? 'Results Overview'}
            </Text>
            {!!activeClass?.academic_year && (
              <Text style={styles.summarySubtitle}>{activeClass.academic_year}</Text>
            )}
          </View>
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryBadgeLabel}>Average</Text>
            <Text
              style={[
                styles.summaryBadgeValue,
                { color: getGradeColor(averageGrade) },
              ]}
            >
              {averagePercentage}%
            </Text>
            <Text style={styles.summaryBadgeHelper}>{averageGrade}</Text>
          </View>
        </View>

        <View style={styles.summaryMetricsRow}>
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryMetricLabel}>Exams</Text>
            <Text style={styles.summaryMetricValue}>{exams.length}</Text>
            <Text style={styles.summaryMetricHelper}>Completed assessments</Text>
          </View>
          <View style={[styles.summaryMetric, styles.summaryMetricDivider]}>
            <Text style={styles.summaryMetricLabel}>Best Grade</Text>
            <Text
              style={[
                styles.summaryMetricValue,
                { color: getGradeColor(bestGrade) },
              ]}
            >
              {bestGrade}
            </Text>
            {!!bestExam?.exam?.name && (
              <Text style={styles.summaryMetricHelper}>{bestExam.exam.name}</Text>
            )}
          </View>
          <View style={[styles.summaryMetric, styles.summaryMetricDivider]}>
            <Text style={styles.summaryMetricLabel}>Subjects</Text>
            <Text style={styles.summaryMetricValue}>{totalSubjects}</Text>
            {!!latestExamDate && (
              <Text style={styles.summaryMetricHelper}>Latest on {latestExamDate}</Text>
            )}
          </View>
        </View>
      </View>
    );
  }, [activeClass?.academic_year, activeClass?.class_name, exams]);

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

  const listHeader = useMemo<React.ReactElement | null>(() => {
    if (!resultsSummary && !classFilter) {
      return null;
    }

    return (
      <View style={styles.listHeader}>
        {resultsSummary}
        {classFilter}
      </View>
    );
  }, [classFilter, resultsSummary]);

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
          ListHeaderComponent={listHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary[500]}
              colors={[COLORS.primary[500]]}
            />
          }
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  listHeader: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  emptyLoadingText: {
    marginTop: SPACING.sm,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: SPACING.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryTitleGroup: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  summaryEyebrow: {
    fontSize: 12,
    color: COLORS.gray[500],
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  summarySubtitle: {
    marginTop: SPACING.xs,
    fontSize: 14,
    color: COLORS.gray[600],
  },
  summaryBadge: {
    alignItems: 'flex-end',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary[50],
    borderRadius: 14,
  },
  summaryBadgeLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
    textTransform: 'uppercase',
  },
  summaryBadgeValue: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '700',
  },
  summaryBadgeHelper: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.gray[500],
  },
  summaryMetricsRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
  },
  summaryMetric: {
    flex: 1,
  },
  summaryMetricDivider: {
    paddingLeft: SPACING.lg,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.gray[100],
  },
  summaryMetricLabel: {
    fontSize: 13,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  summaryMetricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  summaryMetricHelper: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.gray[500],
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    marginBottom: SPACING.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  filterHelperText: {
    fontSize: 13,
    color: COLORS.gray[500],
  },
  filterChips: {
    paddingRight: SPACING.md,
  },
  filterChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    marginRight: SPACING.sm,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[400],
    shadowOpacity: 0.12,
    elevation: 4,
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
