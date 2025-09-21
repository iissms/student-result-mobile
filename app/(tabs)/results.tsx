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
  withAlpha,
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
        <View style={[styles.sectionCard, styles.sectionMessage]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Class</Text>
          </View>
          <Text style={styles.errorText}>{classesError}</Text>
        </View>
      );
    }

    if (!classes.length) {
      return (
        <View style={[styles.sectionCard, styles.sectionMessage]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Class</Text>
          </View>
          <Text style={styles.messageText}>No classes available</Text>
        </View>
      );
    }

    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Class</Text>
          {!!activeClass?.academic_year && (
            <Text style={styles.sectionSubtitle}>{activeClass.academic_year}</Text>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {classes.map(classItem => {
            const isSelected = classItem.class_id === selectedClassId;

            return (
              <TouchableOpacity
                key={classItem.class_id}
                style={[styles.chip, isSelected && styles.chipActive]}
                activeOpacity={0.8}
                onPress={() => {
                  if (classItem.class_id !== selectedClassId) {
                    setSelectedClassId(classItem.class_id);
                  }
                }}
              >
                <Text style={[styles.chipLabel, isSelected && styles.chipLabelActive]}>
                  {classItem.class_name}
                </Text>
                {!!classItem.academic_year && (
                  <Text
                    style={[styles.chipCaption, isSelected && styles.chipCaptionActive]}
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
    const averageColor = getGradeColor(averageGrade);
    const bestGrade = getGradeFromPercentage(bestExam?.percentage ?? 0);
    const latestExamDate = latestExam?.start_date ? formatDate(latestExam.start_date) : null;

    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeaderRow}>
          <View style={styles.summaryTitleGroup}>
            <Text style={styles.summaryEyebrow}>Performance overview</Text>
            <Text style={styles.summaryTitle}>
              {activeClass?.class_name ?? 'Results overview'}
            </Text>
            {!!activeClass?.academic_year && (
              <Text style={styles.summarySubtitle}>{activeClass.academic_year}</Text>
            )}
          </View>
          <View
            style={[
              styles.summaryAverage,
              {
                borderColor: withAlpha(averageColor, 0.24),
                backgroundColor: withAlpha(averageColor, 0.12),
              },
            ]}
          >
            <Text style={styles.summaryAverageLabel}>Average</Text>
            <Text style={[styles.summaryAverageValue, { color: averageColor }]}>
              {averagePercentage}%
            </Text>
            <Text style={[styles.summaryAverageGrade, { color: averageColor }]}>
              {averageGrade}
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatLabel}>Exams</Text>
            <Text style={styles.summaryStatValue}>{exams.length}</Text>
            <Text style={styles.summaryStatHelper}>Completed assessments</Text>
          </View>
          <View style={[styles.summaryStat, styles.summaryStatDivider]}>
            <Text style={styles.summaryStatLabel}>Best grade</Text>
            <Text style={[styles.summaryStatValue, { color: getGradeColor(bestGrade) }]}>
              {bestGrade}
            </Text>
            {!!bestExam?.exam?.name && (
              <Text style={styles.summaryStatHelper}>{bestExam.exam.name}</Text>
            )}
          </View>
          <View style={[styles.summaryStat, styles.summaryStatDivider]}>
            <Text style={styles.summaryStatLabel}>Subjects</Text>
            <Text style={styles.summaryStatValue}>{totalSubjects}</Text>
            {!!latestExamDate && (
              <Text style={styles.summaryStatHelper}>Latest on {latestExamDate}</Text>
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
          <Text style={styles.errorText}>{resultsError}</Text>
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
    paddingBottom: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
  emptyLoadingText: {
    marginTop: SPACING.sm,
    color: COLORS.gray[500],
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray[800],
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.gray[500],
  },
  sectionMessage: {
    paddingVertical: SPACING.sm,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  chipRow: {
    paddingVertical: 2,
    paddingRight: SPACING.md,
  },
  chip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    marginRight: SPACING.sm,
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-start',
  },
  chipActive: {
    borderColor: COLORS.primary[400],
    backgroundColor: COLORS.primary[50],
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[700],
  },
  chipLabelActive: {
    color: COLORS.primary[700],
  },
  chipCaption: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.gray[500],
  },
  chipCaptionActive: {
    color: COLORS.primary[600],
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryHeaderRow: {
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
  summaryAverage: {
    alignItems: 'flex-end',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 14,
    borderWidth: 1,
  },
  summaryAverageLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
    textTransform: 'uppercase',
  },
  summaryAverageValue: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '700',
  },
  summaryAverageGrade: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
  },
  summaryStat: {
    flex: 1,
  },
  summaryStatDivider: {
    paddingLeft: SPACING.md,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: COLORS.gray[200],
  },
  summaryStatLabel: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginBottom: SPACING.xs,
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  summaryStatHelper: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.gray[500],
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error[500],
  },
});

