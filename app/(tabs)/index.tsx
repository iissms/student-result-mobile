// index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { useAuth } from '@/contexts/AuthContext';
import { mockPerformanceTrends, classAverages, subjectPerformance } from '@/utils/mockData';
import ResultsSummary from '@/components/dashboard/ResultsSummary';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import SubjectPerformance from '@/components/dashboard/SubjectPerformance';
import Header from '@/components/shared/Header';
import { ChevronRight, Calendar, Bell } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // 👈

// --- Type Definitions (Updated to include new fields) ---

// The 'Result' type that your ResultsSummary component expects as a prop
export interface Result {
  id: string;
  studentId: string;
  examName: string;
  examDate: string;
  term: string;
  academicYear: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  rank?: number; // Optional
  subjects: {
    subjectId: string;
    subjectName: string;
    maxMarks: number; // This remains a placeholder or derived value if not from API
    obtainedMarks: number;
    percentage: number;
    grade: string;
  }[];
  releaseDate: string; // Now always required
}

// Type for individual subject details nested within an exam from the API response
export interface ApiSubjectDetail {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  type: string;
  marks_obtained: number;
}

// Type for a single exam object in the API response array (UPDATED)
export interface ApiExamResult {
  exam_id: number;
  name: string;
  start_date: string;
  end_date: string;
  marks: number;       // NEW: Total maximum marks for the exam
  min_marks: number;   // NEW: Minimum passing marks for the exam
  status: string;      // NEW: Exam status (e.g., "Active")
  class_id: number;    // NEW: Class ID associated with the exam
  subjects: ApiSubjectDetail[]; // Array of subjects for this exam
}

// The overall type of the array returned by your API
export type StudentResultsApiResponse = ApiExamResult[];

// --- End Type Definitions ---


export default function Dashboard() {
  const router = useRouter();
  const { authState } = useAuth();
  
  const [latestResult, setLatestResult] = useState<Result | null>(null);
  const [loadingResults, setLoadingResults] = useState(true);
  const [errorResults, setErrorResults] = useState<string | null>(null);

  // Hardcoding studentId to '8' for demonstration purposes.
  // In a real application, this should dynamically come from authState.user.studentId.
  const studentId = '11'; 

  // Helper function to calculate grade based on percentage
  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F'; // Fail
  };

  const fetchAndProcessStudentResults = useCallback(async () => {
    setLoadingResults(true);
    setErrorResults(null);
    try {
      const response = await fetch(`http://194.238.23.60:5007/api/results/student/${studentId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Correctly type the incoming data as an array of ApiExamResult
      const data: StudentResultsApiResponse = await response.json();

      console.log("Fetched results data:", data); 

      if (data.length === 0) {
        setLatestResult(null);
        return;
      }

      // Find the latest exam by sorting the array by exam_id (descending).
      const sortedExams = [...data].sort((a, b) => b.exam_id - a.exam_id);
      const latestExam: ApiExamResult = sortedExams[0]; // The latest exam object

      // --- Transform the latest ApiExamResult into your 'Result' type ---
      let totalObtainedMarks = 0;
      // Use the 'marks' field from the exam object for totalMaxMarks
      const totalMaxMarks = latestExam.marks; 
      
      const subjectsForSummary = latestExam.subjects.map(subjectApiData => {
        totalObtainedMarks += subjectApiData.marks_obtained;

        // IMPORTANT: The API's `marks` field is for the *entire exam*.
        // It does NOT indicate the max marks for *each individual subject*.
        // If subject max marks are always, for example, 10, then use that.
        // If they are derived (e.g., total_exam_marks / num_subjects), calculate that.
        // For consistency with your earlier subject data example (5,6,7,8 marks obtained),
        // I'm keeping a placeholder for `maxMarks` for each subject.
        const maxMarksPerSubjectForDisplay = 10; // This is a placeholder for `Result.subjects[].maxMarks`

        // Calculate subject percentage based on subject's own max marks assumption
        const subjectPercentage = (subjectApiData.marks_obtained / maxMarksPerSubjectForDisplay) * 100;

        return {
          subjectId: String(subjectApiData.subject_id),
          subjectName: subjectApiData.subject_name,
          maxMarks: maxMarksPerSubjectForDisplay, // This is for internal consistency of your `Result` type
          obtainedMarks: subjectApiData.marks_obtained,
          percentage: subjectPercentage,
          grade: calculateGrade(subjectPercentage),
        };
      });

      // Calculate overall percentage based on total obtained marks and total exam marks
      const overallPercentage = totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0;

      const transformedResult: Result = {
        id: `exam-${latestExam.exam_id}-${studentId}`, // Unique ID for this specific exam result
        studentId: studentId,
        examName: latestExam.name,           
        examDate: latestExam.start_date,     
        term: "Latest Term",                 // Placeholder: API doesn't provide term directly
        academicYear: "2024-2025",           // Placeholder: API doesn't provide academic year
        totalMarks: totalMaxMarks,           // Now using `latestExam.marks`
        obtainedMarks: totalObtainedMarks,
        percentage: overallPercentage,
        grade: calculateGrade(overallPercentage),
        rank: undefined,                     // Not available from this API endpoint
        subjects: subjectsForSummary,
        releaseDate: latestExam.end_date ?? '',    
      };
      
      setLatestResult(transformedResult);

    } catch (error) {
      console.error("Failed to fetch student results:", error);
      setErrorResults("Failed to load results. Please check your network connection or try again.");
    } finally {
      setLoadingResults(false);
    }
  }, []); 

  useEffect(() => {
    if (!authState.user) {
      router.replace('/'); 
    } else {
      fetchAndProcessStudentResults(); 
    }
  }, [authState.user, router, fetchAndProcessStudentResults]);

  if (!authState.user) {
    return null;
  }

  return (
<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
<Header 
        title="Dashboard" 
        showNotification 
        showSettings
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greeting}>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.userName}>{authState.user.name}</Text>
          </View>
          <Image 
            source={{ uri: authState.user.avatar }} 
            style={styles.avatar} 
          />
        </View>
        
        <View style={styles.cardSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Result</Text>
            <TouchableOpacity 
              style={styles.viewAll}
              onPress={() => router.push('/(tabs)/results')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={COLORS.primary[500]} />
            </TouchableOpacity>
          </View>
          
          {loadingResults ? (
            <ActivityIndicator size="large" color={COLORS.primary[500]} style={styles.loadingIndicator} />
          ) : errorResults ? (
            <Text style={styles.errorText}>{errorResults}</Text>
          ) : latestResult ? (
            <ResultsSummary result={latestResult} />
          ) : (
            <Text style={styles.noResultsText}>No results available yet for student ID {studentId}.</Text>
          )}
        </View>
        
        {/* These sections still use mock data as they are not tied to the results API */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Performance Trends</Text>
          <PerformanceChart 
            data={mockPerformanceTrends}
            classAverages={classAverages}
          />
        </View>
        
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Subject Performance</Text>
          <SubjectPerformance data={subjectPerformance} />
        </View>
        
        <View style={styles.announcements}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
          </View>
          
          <TouchableOpacity style={styles.eventCard}>
            <Calendar size={24} color={COLORS.primary[500]} />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>Final Examination</Text>
              <Text style={styles.eventDate}>Starts on May 15, 2024</Text>
            </View>
            <Bell size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.eventCard}>
            <Calendar size={24} color={COLORS.primary[500]} />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>Parent-Teacher Meeting</Text>
              <Text style={styles.eventDate}>May 20, 2024</Text>
            </View>
            <Bell size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>
        </View>
      </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  welcome: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray[600],
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.gray[900],
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.primary[500],
  },
  cardSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary[500],
  },
  announcements: {
    marginBottom: SPACING.lg,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  eventInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  eventTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  eventDate: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  loadingIndicator: {
    marginTop: SPACING.lg,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.error[500],
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  noResultsText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});