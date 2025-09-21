import { GRADE_SCALE } from './constants';
import { SubjectResult } from '@/types';

export const getGradeColor = (grade: string) => {
  const gradeKey = grade.replace('-', '') as keyof typeof GRADE_SCALE;
  return GRADE_SCALE[gradeKey]?.color || '#9E9E9E';
};

export const withAlpha = (hexColor: string, alpha: number): string => {
  const sanitized = hexColor.replace('#', '');

  if (sanitized.length !== 6) {
    return hexColor;
  }

  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  const alphaHex = Math.round(clampedAlpha * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

  return `#${sanitized}${alphaHex}`;
};

export const getGradeFromPercentage = (percentage: number): string => {
  if (percentage >= 95) return 'A+';
  if (percentage >= 90) return 'A';
  if (percentage >= 85) return 'A-';
  if (percentage >= 80) return 'B+';
  if (percentage >= 75) return 'B';
  if (percentage >= 70) return 'B-';
  if (percentage >= 65) return 'C+';
  if (percentage >= 60) return 'C';
  if (percentage >= 55) return 'C-';
  if (percentage >= 50) return 'D+';
  if (percentage >= 45) return 'D';
  return 'F';
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const calculatePercentage = (obtained: number, total: number): number => {
  return Math.round((obtained / total) * 100);
};

export const getSubjectWithHighestMarks = (subjects: SubjectResult[]): SubjectResult => {
  return subjects.reduce((prev, current) => 
    prev.percentage > current.percentage ? prev : current
  );
};

export const getSubjectWithLowestMarks = (subjects: SubjectResult[]): SubjectResult => {
  return subjects.reduce((prev, current) => 
    prev.percentage < current.percentage ? prev : current
  );
};

export const getPerformanceStatus = (current: number, previous: number): string => {
  const diff = current - previous;
  if (diff > 5) return 'significant-improvement';
  if (diff > 0) return 'improvement';
  if (diff < -5) return 'significant-decline';
  if (diff < 0) return 'decline';
  return 'stable';
};

export const getPerformanceEmoji = (status: string): string => {
  switch (status) {
    case 'significant-improvement':
      return '🚀';
    case 'improvement':
      return '📈';
    case 'stable':
      return '📊';
    case 'decline':
      return '📉';
    case 'significant-decline':
      return '⚠️';
    default:
      return '📊';
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};