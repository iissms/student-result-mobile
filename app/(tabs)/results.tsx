import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '@/utils/constants';
import ResultCard from '@/components/results/ResultCard';
import Header from '@/components/shared/Header';
import { useAuth } from '@/contexts/AuthContext'; // Import your auth context

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

export default function ResultsScreen() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const { authState } = useAuth(); // Get token

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!authState.user?.token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://194.238.23.60:5007/api/results/student', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: 1,
            limit: 10, // You can make this dynamic for future infinite scroll
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Paginated fetched results:", data);

        setExams(data.results || []); // Now exams are inside `results`
      } catch (error) {
        console.error('Error fetching student results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Results" showSettings />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={exams}
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
    padding: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
});
