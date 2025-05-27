export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'parent';
  avatar?: string;
  class?: string;
  studentId?: string; // For students
  children?: Student[]; // For parents
}

export interface Student {
  id: string;
  name: string;
  class: string;
  section?: string;
  rollNumber?: string;
}

export interface Subject {
  id: string;
  name: string;
  teacher?: string;
  code?: string;
}

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
  rank?: number;
  subjects: SubjectResult[];
  releaseDate: string;
}

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  maxMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
}

export interface PerformanceTrend {
  term: string;
  percentage: number;
  rank?: number;
}

export type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
};

export type ThemeType = 'light' | 'dark' | 'system';