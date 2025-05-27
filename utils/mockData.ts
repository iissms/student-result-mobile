import { User, Result, Subject, Student, PerformanceTrend } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'student@example.com',
    role: 'student',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=256',
    class: '10A',
    studentId: 'STU2023001',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'parent@example.com',
    role: 'parent',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=256',
    children: [
      {
        id: '1',
        name: 'John Smith',
        class: '10A',
        section: 'A',
        rollNumber: 'STU2023001',
      },
      {
        id: '3',
        name: 'Emily Johnson',
        class: '8B',
        section: 'B',
        rollNumber: 'STU2023045',
      }
    ],
  }
];

export const mockSubjects: Subject[] = [
  { id: 'sub1', name: 'Mathematics', teacher: 'Dr. Robert Wilson', code: 'MATH101' },
  { id: 'sub2', name: 'Science', teacher: 'Ms. Jennifer Lee', code: 'SCI101' },
  { id: 'sub3', name: 'English', teacher: 'Mr. James Brown', code: 'ENG101' },
  { id: 'sub4', name: 'History', teacher: 'Mrs. Emily Davis', code: 'HIST101' },
  { id: 'sub5', name: 'Computer Science', teacher: 'Mr. Michael Chen', code: 'CS101' },
];

export const mockResults: Result[] = [
  {
    id: 'res1',
    studentId: '1',
    examName: 'Midterm Examination',
    examDate: '2023-10-15',
    term: 'Fall 2023',
    academicYear: '2023-2024',
    totalMarks: 500,
    obtainedMarks: 425,
    percentage: 85,
    grade: 'A',
    rank: 3,
    subjects: [
      { subjectId: 'sub1', subjectName: 'Mathematics', maxMarks: 100, obtainedMarks: 92, percentage: 92, grade: 'A' },
      { subjectId: 'sub2', subjectName: 'Science', maxMarks: 100, obtainedMarks: 88, percentage: 88, grade: 'B+' },
      { subjectId: 'sub3', subjectName: 'English', maxMarks: 100, obtainedMarks: 78, percentage: 78, grade: 'B' },
      { subjectId: 'sub4', subjectName: 'History', maxMarks: 100, obtainedMarks: 85, percentage: 85, grade: 'B+' },
      { subjectId: 'sub5', subjectName: 'Computer Science', maxMarks: 100, obtainedMarks: 95, percentage: 95, grade: 'A+' },
    ],
    releaseDate: '2023-10-25',
  },
  {
    id: 'res2',
    studentId: '1',
    examName: 'Final Examination',
    examDate: '2023-12-10',
    term: 'Fall 2023',
    academicYear: '2023-2024',
    totalMarks: 500,
    obtainedMarks: 450,
    percentage: 90,
    grade: 'A+',
    rank: 2,
    subjects: [
      { subjectId: 'sub1', subjectName: 'Mathematics', maxMarks: 100, obtainedMarks: 95, percentage: 95, grade: 'A+' },
      { subjectId: 'sub2', subjectName: 'Science', maxMarks: 100, obtainedMarks: 92, percentage: 92, grade: 'A' },
      { subjectId: 'sub3', subjectName: 'English', maxMarks: 100, obtainedMarks: 85, percentage: 85, grade: 'B+' },
      { subjectId: 'sub4', subjectName: 'History', maxMarks: 100, obtainedMarks: 88, percentage: 88, grade: 'B+' },
      { subjectId: 'sub5', subjectName: 'Computer Science', maxMarks: 100, obtainedMarks: 90, percentage: 90, grade: 'A' },
    ],
    releaseDate: '2023-12-20',
  },
  {
    id: 'res3',
    studentId: '1',
    examName: 'Midterm Examination',
    examDate: '2024-03-15',
    term: 'Spring 2024',
    academicYear: '2023-2024',
    totalMarks: 500,
    obtainedMarks: 430,
    percentage: 86,
    grade: 'A',
    rank: 5,
    subjects: [
      { subjectId: 'sub1', subjectName: 'Mathematics', maxMarks: 100, obtainedMarks: 88, percentage: 88, grade: 'B+' },
      { subjectId: 'sub2', subjectName: 'Science', maxMarks: 100, obtainedMarks: 90, percentage: 90, grade: 'A' },
      { subjectId: 'sub3', subjectName: 'English', maxMarks: 100, obtainedMarks: 82, percentage: 82, grade: 'B' },
      { subjectId: 'sub4', subjectName: 'History', maxMarks: 100, obtainedMarks: 80, percentage: 80, grade: 'B' },
      { subjectId: 'sub5', subjectName: 'Computer Science', maxMarks: 100, obtainedMarks: 90, percentage: 90, grade: 'A' },
    ],
    releaseDate: '2024-03-25',
  }
];

export const mockPerformanceTrends: PerformanceTrend[] = [
  { term: 'Spring 2023', percentage: 82, rank: 8 },
  { term: 'Fall 2023 Midterm', percentage: 85, rank: 3 },
  { term: 'Fall 2023 Final', percentage: 90, rank: 2 },
  { term: 'Spring 2024 Midterm', percentage: 86, rank: 5 },
];

export const classAverages = {
  'Fall 2023 Midterm': 78,
  'Fall 2023 Final': 80,
  'Spring 2024 Midterm': 79,
};

export const subjectPerformance = [
  { subject: 'Mathematics', current: 88, previous: 92, change: -4 },
  { subject: 'Science', current: 90, previous: 88, change: 2 },
  { subject: 'English', current: 82, previous: 78, change: 4 },
  { subject: 'History', current: 80, previous: 85, change: -5 },
  { subject: 'Computer Science', current: 90, previous: 95, change: -5 },
];

export const attendanceData = {
  present: 85,
  absent: 5,
  late: 10,
  total: 100,
};